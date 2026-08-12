import { NextResponse } from "next/server";
import { fetchHotNews } from "@/lib/data/hot-news-provider";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || undefined;

    const result = await fetchHotNews(query);

    return NextResponse.json({
      success: true,
      data: result.items,
      meta: {
        provider: result.provider,
        fetchedAt: new Date().toISOString(),
        query: query || "default",
        isFallback: result.isFallback,
        message: result.message,
      },
    });
  } catch (error) {
    console.error("[/api/hot-news] Error:", error);
    return NextResponse.json(
      {
        success: true,
        data: [],
        meta: {
          provider: "none",
          fetchedAt: new Date().toISOString(),
          query: "",
          isFallback: true,
          message: "暂无实时新闻数据，请稍后重试",
        },
      },
      { status: 200 }
    );
  }
}
