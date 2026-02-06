#!/usr/bin/env node
/**
 * seed.js – Generates realistic stub data for Sunrise Café.
 * Run: node server/src/data/seed.js
 * No dependencies required (plain Node.js).
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = __dirname;

// ─── Deterministic RNG (mulberry32) ──────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260205);

function rand(min, max) {
  return min + rng() * (max - min);
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function round2(n) {
  return Math.round(n * 100) / 100;
}

// ─── Menu ────────────────────────────────────────────────────────
const MENU = [
  { name: "Latte", category: "Drinks", price: 5.0 },
  { name: "Drip Coffee", category: "Drinks", price: 2.5 },
  { name: "Espresso", category: "Drinks", price: 3.5 },
  { name: "Cappuccino", category: "Drinks", price: 4.75 },
  { name: "Cold Brew", category: "Drinks", price: 4.5 },
  { name: "Mocha", category: "Drinks", price: 5.5 },
  { name: "Matcha Latte", category: "Drinks", price: 5.5 },
  { name: "Green Smoothie", category: "Drinks", price: 6.0 },
  { name: "Croissant", category: "Pastries", price: 3.75 },
  { name: "Blueberry Muffin", category: "Pastries", price: 3.5 },
  { name: "Banana Bread", category: "Pastries", price: 4.0 },
  { name: "Avocado Toast", category: "Food", price: 8.5 },
  { name: "Breakfast Burrito", category: "Food", price: 9.0 },
  { name: "Bagel & Cream Cheese", category: "Food", price: 4.5 },
  { name: "Seasonal Soup", category: "Food", price: 6.5 },
];

// Base popularity weights (sum ~1.0)
const POP = {
  Latte: 0.17,
  "Drip Coffee": 0.14,
  Espresso: 0.08,
  Cappuccino: 0.07,
  "Cold Brew": 0.06,
  Mocha: 0.05,
  "Matcha Latte": 0.04,
  "Green Smoothie": 0.03,
  Croissant: 0.1,
  "Blueberry Muffin": 0.06,
  "Banana Bread": 0.04,
  "Avocado Toast": 0.05,
  "Breakfast Burrito": 0.05,
  "Bagel & Cream Cheese": 0.03,
  "Seasonal Soup": 0.03,
};

// Hourly traffic weights (6–21)
const HOUR_W = [
  0.02, 0.07, 0.14, 0.11, 0.07, 0.08, 0.1, 0.08, 0.06, 0.06, 0.05, 0.05,
  0.04, 0.04, 0.02, 0.01,
];

// ─── Date helpers ────────────────────────────────────────────────
function fmtDate(d) {
  return d.toISOString().split("T")[0];
}
const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 30 days: Jan 7 – Feb 5, 2026
const START = new Date("2026-01-07T00:00:00");
const END = new Date("2026-02-05T00:00:00");

// ─── Weather patterns ────────────────────────────────────────────
const CONDITIONS = [
  "Sunny",
  "Partly Cloudy",
  "Cloudy",
  "Overcast",
  "Light Rain",
  "Rain",
  "Foggy",
];

function genWeatherForDate(_dateStr) {
  const r = rng();
  let condition, precipPct;
  if (r < 0.25) {
    condition = "Sunny";
    precipPct = randInt(0, 5);
  } else if (r < 0.45) {
    condition = "Partly Cloudy";
    precipPct = randInt(5, 20);
  } else if (r < 0.6) {
    condition = "Cloudy";
    precipPct = randInt(15, 40);
  } else if (r < 0.7) {
    condition = "Overcast";
    precipPct = randInt(30, 60);
  } else if (r < 0.82) {
    condition = "Light Rain";
    precipPct = randInt(60, 80);
  } else if (r < 0.92) {
    condition = "Rain";
    precipPct = randInt(75, 100);
  } else {
    condition = "Foggy";
    precipPct = randInt(10, 30);
  }
  return {
    high_f: randInt(48, 62),
    low_f: randInt(36, 48),
    condition,
    precip_pct: precipPct,
  };
}

// ─── Events (hand-picked for realism) ────────────────────────────
const EVENTS_RAW = [
  {
    date: "2026-01-10",
    name: "Downtown Farmers Market",
    type: "market",
    expected_attendance: 500,
    distance_miles: 0.3,
  },
  {
    date: "2026-01-17",
    name: "Downtown Farmers Market",
    type: "market",
    expected_attendance: 450,
    distance_miles: 0.3,
  },
  {
    date: "2026-01-18",
    name: "Neighborhood Art Walk",
    type: "festival",
    expected_attendance: 1200,
    distance_miles: 0.1,
  },
  {
    date: "2026-01-24",
    name: "Downtown Farmers Market",
    type: "market",
    expected_attendance: 480,
    distance_miles: 0.3,
  },
  {
    date: "2026-01-25",
    name: "Live Jazz @ The Alley",
    type: "concert",
    expected_attendance: 300,
    distance_miles: 0.2,
  },
  {
    date: "2026-01-31",
    name: "Downtown Farmers Market",
    type: "market",
    expected_attendance: 520,
    distance_miles: 0.3,
  },
  {
    date: "2026-02-01",
    name: "Lakeside Half-Marathon",
    type: "sports",
    expected_attendance: 2000,
    distance_miles: 0.5,
  },
  {
    date: "2026-02-05",
    name: "Valentine's Pop-Up Market",
    type: "market",
    expected_attendance: 700,
    distance_miles: 0.15,
  },
];

// ─── Reviews (hand-picked) ──────────────────────────────────────
const REVIEWS_RAW = [
  {
    date: "2026-01-08",
    source: "Google",
    rating: 5,
    snippet: "Best latte in the neighborhood! Cozy atmosphere.",
    sentiment: "positive",
  },
  {
    date: "2026-01-10",
    source: "Yelp",
    rating: 4,
    snippet: "Great pastries, friendly staff. A bit crowded on weekends.",
    sentiment: "positive",
  },
  {
    date: "2026-01-13",
    source: "Google",
    rating: 3,
    snippet: "Coffee is decent but the wait was too long during morning rush.",
    sentiment: "neutral",
  },
  {
    date: "2026-01-15",
    source: "Yelp",
    rating: 5,
    snippet: "The avocado toast is amazing. Will definitely come back!",
    sentiment: "positive",
  },
  {
    date: "2026-01-18",
    source: "Google",
    rating: 4,
    snippet: "Nice spot for remote work. Good WiFi and outlets.",
    sentiment: "positive",
  },
  {
    date: "2026-01-20",
    source: "Google",
    rating: 2,
    snippet:
      "Waited 15 minutes for a drip coffee. They need more staff in the morning.",
    sentiment: "negative",
  },
  {
    date: "2026-01-23",
    source: "Yelp",
    rating: 4,
    snippet: "Solid breakfast burrito. Wish they had more lunch options.",
    sentiment: "positive",
  },
  {
    date: "2026-01-26",
    source: "Google",
    rating: 5,
    snippet: "My go-to coffee shop. The matcha latte is perfection.",
    sentiment: "positive",
  },
  {
    date: "2026-01-29",
    source: "Yelp",
    rating: 4,
    snippet: "Consistently good quality. Fair prices for the area.",
    sentiment: "positive",
  },
  {
    date: "2026-02-01",
    source: "Google",
    rating: 5,
    snippet: "Stopped by after the half-marathon — hit the spot!",
    sentiment: "positive",
  },
  {
    date: "2026-02-03",
    source: "Yelp",
    rating: 3,
    snippet: "Ran out of croissants by 9 AM. Please stock more!",
    sentiment: "neutral",
  },
  {
    date: "2026-02-05",
    source: "Google",
    rating: 4,
    snippet: "Love the seasonal soup. Perfect for chilly days.",
    sentiment: "positive",
  },
];

// ─── Generate sales data ─────────────────────────────────────────
function generateSales() {
  const days = [];
  const d = new Date(START);

  while (d <= END) {
    const dateStr = fmtDate(d);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;

    // Check for nearby events (boost traffic)
    const dayEvents = EVENTS_RAW.filter((e) => e.date === dateStr);
    const eventBoost = dayEvents.reduce((acc, e) => {
      const boost = Math.min(0.3, e.expected_attendance / 5000);
      return acc + boost;
    }, 0);

    // Check weather (rain reduces traffic)
    const weather = genWeatherForDate(dateStr);
    const rainPenalty =
      weather.condition === "Rain"
        ? 0.82
        : weather.condition === "Light Rain"
          ? 0.9
          : 1.0;

    // Base daily orders
    const baseOrders = isWeekend ? randInt(115, 155) : randInt(85, 125);
    const adjustedOrders = Math.round(
      baseOrders * (1 + eventBoost) * rainPenalty
    );

    // Hourly breakdown
    const hourly = [];
    let totalOrders = 0;
    let totalRevenue = 0;

    for (let h = 6; h <= 21; h++) {
      let w = HOUR_W[h - 6];
      if (isWeekend) {
        if (h <= 7) w *= 0.5;
        if (h >= 10 && h <= 14) w *= 1.3;
      }
      // Add some noise
      w *= 0.8 + rng() * 0.4;

      const orders = Math.max(1, Math.round(adjustedOrders * w));
      // Avg ticket varies by hour (morning = more coffee, lunch = higher tickets)
      const avgTicket =
        h >= 11 && h <= 13
          ? rand(6.0, 8.5)
          : h >= 7 && h <= 9
            ? rand(4.5, 6.5)
            : rand(3.5, 5.5);
      const revenue = round2(orders * avgTicket);

      hourly.push({ hour: h, revenue, orders });
      totalOrders += orders;
      totalRevenue += revenue;
    }

    // Item breakdown
    const items = MENU.map((item) => {
      const base = POP[item.name] || 0.03;
      const noise = 0.7 + rng() * 0.6;
      // Seasonal soup more popular in cold/rainy weather
      const weatherMod =
        item.name === "Seasonal Soup" && weather.high_f < 52
          ? 1.5
          : item.name === "Cold Brew" && weather.high_f > 58
            ? 1.4
            : 1.0;
      const qty = Math.max(1, Math.round(totalOrders * base * noise * weatherMod));
      return {
        name: item.name,
        category: item.category,
        qty,
        revenue: round2(qty * item.price),
      };
    });

    days.push({
      date: dateStr,
      day_of_week: DOW_NAMES[dow],
      total_revenue: round2(totalRevenue),
      order_count: totalOrders,
      avg_order_value: round2(totalRevenue / totalOrders),
      hourly,
      items,
    });

    d.setDate(d.getDate() + 1);
  }
  return days;
}

// ─── Generate inventory snapshot ─────────────────────────────────
function generateInventory() {
  return [
    {
      item: "Espresso Beans",
      category: "Coffee",
      current_stock: 8,
      unit: "lbs",
      reorder_point: 10,
      daily_usage: 3.5,
      status: "low",
    },
    {
      item: "Whole Milk",
      category: "Dairy",
      current_stock: 12,
      unit: "gallons",
      reorder_point: 8,
      daily_usage: 5,
      status: "ok",
    },
    {
      item: "Oat Milk",
      category: "Dairy",
      current_stock: 3,
      unit: "gallons",
      reorder_point: 4,
      daily_usage: 2,
      status: "low",
    },
    {
      item: "Vanilla Syrup",
      category: "Syrups",
      current_stock: 2,
      unit: "bottles",
      reorder_point: 3,
      daily_usage: 0.5,
      status: "low",
    },
    {
      item: "Chocolate Syrup",
      category: "Syrups",
      current_stock: 4,
      unit: "bottles",
      reorder_point: 3,
      daily_usage: 0.3,
      status: "ok",
    },
    {
      item: "Matcha Powder",
      category: "Tea",
      current_stock: 1,
      unit: "lbs",
      reorder_point: 2,
      daily_usage: 0.3,
      status: "low",
    },
    {
      item: "Flour (AP)",
      category: "Baking",
      current_stock: 20,
      unit: "lbs",
      reorder_point: 15,
      daily_usage: 4,
      status: "ok",
    },
    {
      item: "Butter",
      category: "Dairy",
      current_stock: 8,
      unit: "lbs",
      reorder_point: 5,
      daily_usage: 2,
      status: "ok",
    },
    {
      item: "Eggs",
      category: "Baking",
      current_stock: 36,
      unit: "count",
      reorder_point: 24,
      daily_usage: 12,
      status: "ok",
    },
    {
      item: "Cream Cheese",
      category: "Dairy",
      current_stock: 5,
      unit: "lbs",
      reorder_point: 3,
      daily_usage: 1.5,
      status: "ok",
    },
    {
      item: "Avocados",
      category: "Produce",
      current_stock: 10,
      unit: "count",
      reorder_point: 8,
      daily_usage: 4,
      status: "ok",
    },
    {
      item: "Tortillas (10-in)",
      category: "Bread",
      current_stock: 25,
      unit: "count",
      reorder_point: 20,
      daily_usage: 8,
      status: "ok",
    },
    {
      item: "Sourdough Loaves",
      category: "Bread",
      current_stock: 6,
      unit: "loaves",
      reorder_point: 5,
      daily_usage: 3,
      status: "ok",
    },
    {
      item: "Paper Cups (12 oz)",
      category: "Supplies",
      current_stock: 150,
      unit: "count",
      reorder_point: 100,
      daily_usage: 60,
      status: "ok",
    },
    {
      item: "Paper Cups (16 oz)",
      category: "Supplies",
      current_stock: 80,
      unit: "count",
      reorder_point: 100,
      daily_usage: 45,
      status: "low",
    },
  ];
}

// ─── Generate staffing data ──────────────────────────────────────
function generateStaffing() {
  const days = [];
  const d = new Date(START);

  while (d <= END) {
    const dateStr = fmtDate(d);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;

    const shifts = [
      {
        shift: "morning",
        start: "06:00",
        end: "12:00",
        staff_count: isWeekend ? 4 : 3,
        roles: isWeekend
          ? ["barista", "barista", "barista", "cashier"]
          : ["barista", "barista", "cashier"],
      },
      {
        shift: "afternoon",
        start: "12:00",
        end: "18:00",
        staff_count: 2,
        roles: ["barista", "cashier"],
      },
      {
        shift: "evening",
        start: "18:00",
        end: "21:00",
        staff_count: 1,
        roles: ["barista"],
      },
    ];

    // Simulate peak data
    const peakHour = isWeekend ? randInt(9, 11) : randInt(7, 9);
    const peakOrders = isWeekend ? randInt(18, 28) : randInt(20, 35);

    days.push({
      date: dateStr,
      day_of_week: DOW_NAMES[dow],
      shifts,
      peak_hour: peakHour,
      peak_hour_orders: peakOrders,
      total_labor_hours: shifts.reduce(
        (a, s) => a + s.staff_count * (parseInt(s.end) - parseInt(s.start)),
        0
      ),
    });

    d.setDate(d.getDate() + 1);
  }
  return days;
}

// ─── Generate weather data ───────────────────────────────────────
// Re-seed RNG for weather so it matches the sales generation
const rng2 = mulberry32(99999);
function generateWeather() {
  const days = [];
  const d = new Date(START);
  while (d <= END) {
    const dateStr = fmtDate(d);
    const r = rng2();
    let condition, precipPct;
    if (r < 0.25) {
      condition = "Sunny";
      precipPct = Math.floor(rng2() * 5);
    } else if (r < 0.45) {
      condition = "Partly Cloudy";
      precipPct = 5 + Math.floor(rng2() * 15);
    } else if (r < 0.6) {
      condition = "Cloudy";
      precipPct = 15 + Math.floor(rng2() * 25);
    } else if (r < 0.72) {
      condition = "Overcast";
      precipPct = 30 + Math.floor(rng2() * 30);
    } else if (r < 0.84) {
      condition = "Light Rain";
      precipPct = 60 + Math.floor(rng2() * 20);
    } else if (r < 0.93) {
      condition = "Rain";
      precipPct = 75 + Math.floor(rng2() * 25);
    } else {
      condition = "Foggy";
      precipPct = 10 + Math.floor(rng2() * 20);
    }
    days.push({
      date: dateStr,
      high_f: 48 + Math.floor(rng2() * 14),
      low_f: 36 + Math.floor(rng2() * 12),
      condition,
      precip_pct: precipPct,
    });
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// ─── Write files ─────────────────────────────────────────────────
function write(name, data) {
  const fp = path.join(DATA_DIR, name);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
  console.log(`  ✓ ${name} (${data.length} records)`);
}

console.log("🌱 Seeding Sunrise Café data …");
write("sales.json", generateSales());
write("inventory.json", generateInventory());
write("staffing.json", generateStaffing());
write("weather.json", generateWeather());
write("events.json", EVENTS_RAW);
write("reviews.json", REVIEWS_RAW);
console.log("✅ Done! Data written to server/src/data/");
