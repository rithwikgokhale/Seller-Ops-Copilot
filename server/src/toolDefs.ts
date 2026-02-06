import type { ChatCompletionTool } from "openai/resources/chat/completions";

/**
 * OpenAI function-calling tool definitions.
 * These map 1-to-1 with the tool implementations in tools.ts.
 */
export const toolDefinitions: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getSalesSummary",
      description:
        "Get total revenue, order count, and average order value for a date range.",
      parameters: {
        type: "object",
        properties: {
          startDate: {
            type: "string",
            description: "Start date inclusive (YYYY-MM-DD)",
          },
          endDate: {
            type: "string",
            description: "End date inclusive (YYYY-MM-DD)",
          },
        },
        required: ["startDate", "endDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getHourlySales",
      description:
        "Get revenue and order count bucketed by hour (6–21) across a date range. Useful for finding peak hours.",
      parameters: {
        type: "object",
        properties: {
          startDate: {
            type: "string",
            description: "Start date inclusive (YYYY-MM-DD)",
          },
          endDate: {
            type: "string",
            description: "End date inclusive (YYYY-MM-DD)",
          },
        },
        required: ["startDate", "endDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTopItems",
      description:
        "Get top-selling items by revenue or quantity for a date range.",
      parameters: {
        type: "object",
        properties: {
          startDate: {
            type: "string",
            description: "Start date inclusive (YYYY-MM-DD)",
          },
          endDate: {
            type: "string",
            description: "End date inclusive (YYYY-MM-DD)",
          },
          limit: {
            type: "number",
            description: "Number of items to return (default 5)",
          },
          sortBy: {
            type: "string",
            enum: ["revenue", "qty"],
            description: "Sort by revenue or quantity (default revenue)",
          },
        },
        required: ["startDate", "endDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getInventoryStatus",
      description:
        "Get current inventory levels for all tracked items, including low-stock alerts and days-until-stockout estimates.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getStaffingSignals",
      description:
        "Get staffing coverage vs. peak traffic signals for a date range. Identifies potential under- or over-staffing.",
      parameters: {
        type: "object",
        properties: {
          startDate: {
            type: "string",
            description: "Start date inclusive (YYYY-MM-DD)",
          },
          endDate: {
            type: "string",
            description: "End date inclusive (YYYY-MM-DD)",
          },
        },
        required: ["startDate", "endDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getNeighborhoodContext",
      description:
        "Get external neighborhood signals: weather forecasts, nearby events, and recent review sentiment for a date range. Only available when neighborhood context is enabled.",
      parameters: {
        type: "object",
        properties: {
          startDate: {
            type: "string",
            description: "Start date inclusive (YYYY-MM-DD)",
          },
          endDate: {
            type: "string",
            description: "End date inclusive (YYYY-MM-DD)",
          },
        },
        required: ["startDate", "endDate"],
      },
    },
  },
];
