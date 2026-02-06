/**
 * LLM Agent – drives the OpenAI tool-calling loop.
 *
 * 1. Send system prompt + user message to GPT-4o
 * 2. If model returns tool_calls, execute them and send results back
 * 3. Repeat until the model returns a final text response
 * 4. Parse + validate the JSON output against OutputSchema
 */
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import { SYSTEM_PROMPT } from "./systemPrompt.js";
import { toolDefinitions } from "./toolDefs.js";
import { executeTool } from "./tools.js";
import { OutputSchema, type CopilotOutput } from "./outputSchema.js";

const MAX_TOOL_ROUNDS = 8; // safety: prevent infinite loops

export async function runAgent(
  userMessage: string,
  neighborhoodContextEnabled: boolean
): Promise<CopilotOutput> {
  const openai = new OpenAI(); // reads OPENAI_API_KEY from env

  const model = process.env.OPENAI_MODEL || "gpt-4o";

  // Filter tools: hide getNeighborhoodContext if flag is off
  const tools = neighborhoodContextEnabled
    ? toolDefinitions
    : toolDefinitions.filter(
        (t) => t.function.name !== "getNeighborhoodContext"
      );

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `neighborhood_context_enabled: ${neighborhoodContextEnabled}\n\n${userMessage}`,
    },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await openai.chat.completions.create({
      model,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
    });

    const choice = response.choices[0];
    if (!choice) throw new Error("Empty response from LLM");

    const assistantMsg = choice.message;
    messages.push(assistantMsg as ChatCompletionMessageParam);

    // If no tool calls, this is the final answer
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      const raw = assistantMsg.content || "";
      return parseAndValidate(raw);
    }

    // Execute each tool call and append results
    for (const tc of assistantMsg.tool_calls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments);
      } catch {
        args = {};
      }

      console.log(`  🔧 Tool call: ${tc.function.name}(${JSON.stringify(args)})`);

      const result = executeTool(tc.function.name, args);

      const toolMsg: ChatCompletionToolMessageParam = {
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      };
      messages.push(toolMsg);
    }
  }

  throw new Error("Agent exceeded maximum tool-calling rounds");
}

/** Parse the raw LLM output as JSON and validate against the Zod schema. */
function parseAndValidate(raw: string): CopilotOutput {
  // Strip markdown fences if the model wraps them despite instructions
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e: any) {
    throw new Error(
      `LLM output is not valid JSON: ${e.message}\n\nRaw output:\n${raw.slice(0, 500)}`
    );
  }

  const result = OutputSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`LLM output failed schema validation: ${issues}`);
  }

  return result.data;
}
