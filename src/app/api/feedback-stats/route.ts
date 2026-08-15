import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const FEEDBACK_FILE = path.join(CACHE_DIR, "user-feedback.jsonl");

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabase();
  let records: any[] = [];
  let source: "supabase" | "file" | "none" = "none";

  if (sb) {
    try {
      const { data, error } = await sb
        .from("user_feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        records = data;
        source = "supabase";
      } else if (error) {
        console.error("[FeedbackStats] Supabase query error:", error.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[FeedbackStats] Supabase exception:", message);
    }
  }

  // Fallback: read from JSONL file
  if (records.length === 0 && fs.existsSync(FEEDBACK_FILE)) {
    const lines = fs.readFileSync(FEEDBACK_FILE, "utf-8").trim().split("\n");
    records = lines.map((line) => JSON.parse(line)).reverse();
    source = "file";
  }

  // Calculate statistics
  const total = records.length;
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const dimensionAverages: Record<string, { sum: number; count: number }> = {
    timeliness: { sum: 0, count: 0 },
    recommendation: { sum: 0, count: 0 },
    ai_clarity: { sum: 0, count: 0 },
    risk_warning: { sum: 0, count: 0 },
    ux_smooth: { sum: 0, count: 0 },
    retention: { sum: 0, count: 0 },
  };

  records.forEach((r) => {
    // Rating distribution
    if (r.rating && r.rating >= 1 && r.rating <= 5) {
      ratingDistribution[r.rating]++;
    }

    // Dimension scores
    if (r.dimension_scores && typeof r.dimension_scores === "object") {
      Object.entries(r.dimension_scores).forEach(([key, value]) => {
        if (dimensionAverages[key] && typeof value === "number") {
          dimensionAverages[key].sum += value;
          dimensionAverages[key].count++;
        }
      });
    }
  });

  const dimensionStats = Object.entries(dimensionAverages).map(([key, data]) => ({
    key,
    average: data.count > 0 ? (data.sum / data.count).toFixed(2) : "0",
    count: data.count,
  }));

  return NextResponse.json({
    success: true,
    data: {
      source,
      total,
      ratingDistribution,
      dimensionStats,
      recentFeedback: records.slice(0, 50),
    },
  });
}
