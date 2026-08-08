import { NextResponse } from "next/server";
import { mockNewsFeed } from "@/lib/analysis-data";
import type { NewsCategory, NewsFeedData, NewsItem } from "@/lib/analysis-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as NewsCategory | null;

  let data: NewsFeedData | NewsItem[];

  if (category) {
    const categoryMap: Record<NewsCategory, NewsItem[]> = {
      flash: mockNewsFeed.flashes,
      research: mockNewsFeed.research,
      macro: mockNewsFeed.macro,
      announcement: mockNewsFeed.announcements,
    };
    data = categoryMap[category] || [];
  } else {
    data = mockNewsFeed;
  }

  return NextResponse.json({ success: true, data });
}
