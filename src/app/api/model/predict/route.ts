/**
 * POST /api/model/predict
 *
 * Multi-factor stock prediction with 10-day walk-forward backtesting.
 * Uses real Tushare data. Never exposes server-side keys.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildStockPrediction } from "@/lib/data/prediction-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, selectedFactors, horizonDays } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { success: false, error: "请提供股票名称或代码" },
        { status: 400 },
      );
    }

    if (!process.env.TUSHARE_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "当前未配置真实行情数据源（TUSHARE_TOKEN），无法进行真实预测。请先配置环境变量后重试。",
        },
        { status: 503 },
      );
    }

    const factors = Array.isArray(selectedFactors) ? selectedFactors : [];
    const horizon = typeof horizonDays === "number" && horizonDays > 0 ? horizonDays : 10;

    const result = await buildStockPrediction(query.trim(), factors, horizon);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "预测服务异常";

    // Check for specific error types
    if (message.includes("无法识别")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 },
      );
    }

    if (message.includes("数据不足") || message.includes("历史数据不足")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 422 },
      );
    }

    console.error("[/api/model/predict] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
