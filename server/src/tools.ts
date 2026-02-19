/**
 * Tool implementations – each reads from the stub JSON data files
 * and computes the requested metrics.
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "data");

// ─── Helpers ─────────────────────────────────────────────────────

function loadJSON<T>(file: string): T {
  return JSON.parse(readFileSync(join(DATA, file), "utf-8"));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Filter an array of records that have a `date` field by a date range. */
function filterByRange<T extends { date: string }>(
  data: T[],
  startDate: string,
  endDate: string
): T[] {
  return data.filter((d) => d.date >= startDate && d.date <= endDate);
}

// ─── Types for stub data ─────────────────────────────────────────

interface HourlyEntry {
  hour: number;
  revenue: number;
  orders: number;
}

interface ItemEntry {
  name: string;
  category: string;
  qty: number;
  revenue: number;
}

interface SalesDay {
  date: string;
  day_of_week: string;
  total_revenue: number;
  order_count: number;
  avg_order_value: number;
  hourly: HourlyEntry[];
  items: ItemEntry[];
}

interface InventoryItem {
  item: string;
  category: string;
  current_stock: number;
  unit: string;
  reorder_point: number;
  daily_usage: number;
  status: string;
}

interface StaffShift {
  shift: string;
  start: string;
  end: string;
  staff_count: number;
  roles: string[];
}

interface StaffingDay {
  date: string;
  day_of_week: string;
  shifts: StaffShift[];
  peak_hour: number;
  peak_hour_orders: number;
  total_labor_hours: number;
}

interface WeatherDay {
  date: string;
  high_f: number;
  low_f: number;
  condition: string;
  precip_pct: number;
}

interface EventEntry {
  date: string;
  name: string;
  type: string;
  expected_attendance: number;
  distance_miles: number;
}

interface ReviewEntry {
  date: string;
  source: string;
  rating: number;
  snippet: string;
  sentiment: string;
}

// ─── Tool functions ──────────────────────────────────────────────

export function getSalesSummary(args: {
  startDate: string;
  endDate: string;
}) {
  const sales = loadJSON<SalesDay[]>("sales.json");
  const range = filterByRange(sales, args.startDate, args.endDate);

  if (range.length === 0) {
    return {
      period: { start: args.startDate, end: args.endDate },
      days: 0,
      total_revenue: 0,
      order_count: 0,
      avg_order_value: 0,
      daily_avg_revenue: 0,
      note: "No data found for this date range.",
    };
  }

  const totalRevenue = round2(range.reduce((s, d) => s + d.total_revenue, 0));
  const orderCount = range.reduce((s, d) => s + d.order_count, 0);

  return {
    period: { start: args.startDate, end: args.endDate },
    days: range.length,
    total_revenue: totalRevenue,
    order_count: orderCount,
    avg_order_value: round2(totalRevenue / orderCount),
    daily_avg_revenue: round2(totalRevenue / range.length),
  };
}

export function getHourlySales(args: {
  startDate: string;
  endDate: string;
}) {
  const sales = loadJSON<SalesDay[]>("sales.json");
  const range = filterByRange(sales, args.startDate, args.endDate);

  // Aggregate across days into hourly buckets
  const buckets: Record<number, { revenue: number; orders: number }> = {};
  for (let h = 6; h <= 21; h++) {
    buckets[h] = { revenue: 0, orders: 0 };
  }

  for (const day of range) {
    for (const h of day.hourly) {
      if (buckets[h.hour]) {
        buckets[h.hour].revenue += h.revenue;
        buckets[h.hour].orders += h.orders;
      }
    }
  }

  const hourly = Object.entries(buckets)
    .map(([hour, data]) => ({
      hour: Number(hour),
      total_revenue: round2(data.revenue),
      total_orders: data.orders,
      avg_revenue: round2(data.revenue / Math.max(range.length, 1)),
      avg_orders: round2(data.orders / Math.max(range.length, 1)),
    }))
    .sort((a, b) => a.hour - b.hour);

  // Identify peak
  const peak = hourly.reduce((best, h) =>
    h.total_orders > best.total_orders ? h : best
  );

  return {
    period: { start: args.startDate, end: args.endDate },
    days: range.length,
    hourly,
    peak_hour: peak.hour,
    peak_avg_orders: peak.avg_orders,
    peak_avg_revenue: peak.avg_revenue,
  };
}

export function getTopItems(args: {
  startDate: string;
  endDate: string;
  limit?: number;
  sortBy?: "revenue" | "qty";
}) {
  const sales = loadJSON<SalesDay[]>("sales.json");
  const range = filterByRange(sales, args.startDate, args.endDate);
  const limit = args.limit ?? 5;
  const sortBy = args.sortBy ?? "revenue";

  // Aggregate items across days
  const agg: Record<string, { category: string; qty: number; revenue: number }> = {};
  for (const day of range) {
    for (const it of day.items) {
      if (!agg[it.name]) {
        agg[it.name] = { category: it.category, qty: 0, revenue: 0 };
      }
      agg[it.name].qty += it.qty;
      agg[it.name].revenue += it.revenue;
    }
  }

  const items = Object.entries(agg)
    .map(([name, d]) => ({
      name,
      category: d.category,
      qty: d.qty,
      revenue: round2(d.revenue),
    }))
    .sort((a, b) =>
      sortBy === "qty" ? b.qty - a.qty : b.revenue - a.revenue
    )
    .slice(0, limit);

  return {
    period: { start: args.startDate, end: args.endDate },
    days: range.length,
    sortedBy: sortBy,
    items,
  };
}

export function getInventoryStatus() {
  const inventory = loadJSON<InventoryItem[]>("inventory.json");

  const items = inventory.map((inv) => {
    const daysUntilStockout =
      inv.daily_usage > 0
        ? round2(inv.current_stock / inv.daily_usage)
        : null;
    return {
      item: inv.item,
      category: inv.category,
      current_stock: inv.current_stock,
      unit: inv.unit,
      reorder_point: inv.reorder_point,
      daily_usage: inv.daily_usage,
      status: inv.current_stock <= inv.reorder_point ? "low" : "ok",
      days_until_stockout: daysUntilStockout,
    };
  });

  const lowStockItems = items.filter((i) => i.status === "low");

  return {
    total_items: items.length,
    low_stock_count: lowStockItems.length,
    items,
    low_stock_alerts: lowStockItems.map(
      (i) =>
        `${i.item}: ${i.current_stock} ${i.unit} remaining (~${i.days_until_stockout} days)`
    ),
  };
}

export function getStaffingSignals(args: {
  startDate: string;
  endDate: string;
}) {
  const staffing = loadJSON<StaffingDay[]>("staffing.json");
  const range = filterByRange(staffing, args.startDate, args.endDate);

  if (range.length === 0) {
    return {
      period: { start: args.startDate, end: args.endDate },
      days: 0,
      signals: [],
      note: "No staffing data found for this date range.",
    };
  }

  // Heuristic: if peak_hour_orders > 12 * staff_count for that shift, understaffed
  const signals = range.map((day) => {
    const peakShift = day.shifts.find((s) => {
      const start = parseInt(s.start);
      const end = parseInt(s.end);
      return day.peak_hour >= start && day.peak_hour < end;
    });

    const staffAtPeak = peakShift?.staff_count ?? 1;
    const ordersPerStaff = round2(day.peak_hour_orders / staffAtPeak);
    // Threshold: more than 10 orders per staff per hour = understaffed
    const assessment =
      ordersPerStaff > 10
        ? "understaffed"
        : ordersPerStaff < 5
          ? "overstaffed"
          : "adequate";

    return {
      date: day.date,
      day_of_week: day.day_of_week,
      peak_hour: day.peak_hour,
      peak_orders: day.peak_hour_orders,
      staff_at_peak: staffAtPeak,
      orders_per_staff: ordersPerStaff,
      assessment,
      total_labor_hours: day.total_labor_hours,
    };
  });

  const understaffedDays = signals.filter(
    (s) => s.assessment === "understaffed"
  ).length;

  return {
    period: { start: args.startDate, end: args.endDate },
    days: range.length,
    understaffed_days: understaffedDays,
    signals,
    summary:
      understaffedDays > 0
        ? `${understaffedDays} of ${range.length} days show potential understaffing during peak hours.`
        : "Staffing appears adequate for all peak periods.",
  };
}

export function getNeighborhoodContext(args: {
  startDate: string;
  endDate: string;
}) {
  const weather = loadJSON<WeatherDay[]>("weather.json");
  const events = loadJSON<EventEntry[]>("events.json");
  const reviews = loadJSON<ReviewEntry[]>("reviews.json");

  const weatherRange = filterByRange(weather, args.startDate, args.endDate);
  const eventsRange = filterByRange(events, args.startDate, args.endDate);
  const reviewsRange = filterByRange(reviews, args.startDate, args.endDate);

  // Summarize weather
  const rainyDays = weatherRange.filter(
    (w) => w.condition === "Rain" || w.condition === "Light Rain"
  ).length;
  const avgHigh = weatherRange.length
    ? round2(weatherRange.reduce((s, w) => s + w.high_f, 0) / weatherRange.length)
    : null;

  // Summarize reviews
  const avgRating = reviewsRange.length
    ? round2(
        reviewsRange.reduce((s, r) => s + r.rating, 0) / reviewsRange.length
      )
    : null;
  const sentimentBreakdown = {
    positive: reviewsRange.filter((r) => r.sentiment === "positive").length,
    neutral: reviewsRange.filter((r) => r.sentiment === "neutral").length,
    negative: reviewsRange.filter((r) => r.sentiment === "negative").length,
  };

  return {
    period: { start: args.startDate, end: args.endDate },
    weather: {
      days: weatherRange.length,
      rainy_days: rainyDays,
      avg_high_f: avgHigh,
      daily: weatherRange,
    },
    events: {
      count: eventsRange.length,
      events: eventsRange,
    },
    reviews: {
      count: reviewsRange.length,
      avg_rating: avgRating,
      sentiment: sentimentBreakdown,
      reviews: reviewsRange,
    },
  };
}

// ─── Dispatcher ──────────────────────────────────────────────────

type ToolHandler = (args: Record<string, unknown>) => unknown;

const TOOL_MAP: Record<string, ToolHandler> = {
  getSalesSummary: (a) => getSalesSummary(a as Parameters<typeof getSalesSummary>[0]),
  getHourlySales: (a) => getHourlySales(a as Parameters<typeof getHourlySales>[0]),
  getTopItems: (a) => getTopItems(a as Parameters<typeof getTopItems>[0]),
  getInventoryStatus: () => getInventoryStatus(),
  getStaffingSignals: (a) => getStaffingSignals(a as Parameters<typeof getStaffingSignals>[0]),
  getNeighborhoodContext: (a) => getNeighborhoodContext(a as Parameters<typeof getNeighborhoodContext>[0]),
};

export function executeTool(
  name: string,
  args: Record<string, unknown>
): unknown {
  const fn = TOOL_MAP[name];
  if (!fn) {
    return { error: `Unknown tool: ${name}` };
  }
  try {
    return fn(args);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Tool ${name} failed: ${message}` };
  }
}
