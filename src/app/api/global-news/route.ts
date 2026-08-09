import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 全球新闻雷达 - 真实数据 API
// 数据来源：通过 Web 搜索获取最新全球宏观新闻
// 如果没有配置搜索 API，返回结构化空数据

interface GlobalNewsEvent {
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
  importance: "高" | "中" | "低";
  sentiment: "positive" | "negative" | "mixed" | "neutral";
  time: string;
  summary: string;
  related_a_share_sectors: string[];
  impact_logic: string;
  risk_note: string;
  pulse_color: string;
  importance_score: number;
}

// 主要国家/地区坐标
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  US: { lat: 37.0902, lng: -95.7129 },
  CN: { lat: 35.8617, lng: 104.1954 },
  JP: { lat: 36.2048, lng: 138.2529 },
  DE: { lat: 51.1657, lng: 10.4515 },
  GB: { lat: 55.3781, lng: -3.4360 },
  FR: { lat: 46.2276, lng: 2.2137 },
  IN: { lat: 20.5937, lng: 78.9629 },
  SA: { lat: 23.8859, lng: 45.0792 },
  RU: { lat: 61.5240, lng: 105.3188 },
  BR: { lat: -14.2350, lng: -51.9253 },
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "美国",
  CN: "中国",
  JP: "日本",
  DE: "德国",
  GB: "英国",
  FR: "法国",
  IN: "印度",
  SA: "沙特阿拉伯",
  RU: "俄罗斯",
  BR: "巴西",
};

export async function GET() {
  try {
    // 尝试从环境变量获取新闻 API 配置
    const newsApiKey = process.env.NEWS_API_KEY;
    const newsApiUrl = process.env.NEWS_API_URL;

    let events: GlobalNewsEvent[] = [];

    if (newsApiKey && newsApiUrl) {
      // 调用真实新闻 API
      try {
        const response = await fetch(`${newsApiUrl}?apiKey=${newsApiKey}&language=zh&pageSize=10`, {
          next: { revalidate: 300 }, // 5 分钟缓存
        });
        if (response.ok) {
          const data = await response.json();
          // 解析 API 返回的数据，转换为 GlobalNewsEvent 格式
          events = parseNewsApiResponse(data);
        }
      } catch (err) {
        console.error("Failed to fetch news API:", err);
      }
    }

    // 如果没有配置新闻 API 或获取失败，返回空数组
    // 前端会显示"暂无数据"而不是 mock 数据
    return NextResponse.json({
      success: true,
      data: events,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

function parseNewsApiResponse(data: any): GlobalNewsEvent[] {
  // 根据实际 API 返回格式解析
  // 这里是一个示例解析逻辑，需要根据实际 API 调整
  const articles = data.articles || data.data || [];
  
  return articles.map((article: any, index: number) => {
    const country = detectCountry(article.title || article.description || "");
    const coords = COUNTRY_COORDS[country] || { lat: 0, lng: 0 };
    
    return {
      country: COUNTRY_NAMES[country] || country,
      country_code: country,
      lat: coords.lat,
      lng: coords.lng,
      title: article.title || "未知标题",
      category: article.category || "综合",
      importance: index < 3 ? "高" : index < 7 ? "中" : "低",
      sentiment: article.sentiment || "neutral",
      time: article.publishedAt || new Date().toISOString(),
      summary: article.description || article.content || "",
      related_a_share_sectors: article.sectors || [],
      impact_logic: article.impact || "",
      risk_note: article.risk || "",
      pulse_color: getImportanceColor(index < 3 ? "高" : index < 7 ? "中" : "低"),
      importance_score: index < 3 ? 90 : index < 7 ? 70 : 50,
    };
  });
}

function detectCountry(text: string): string {
  const keywords: Record<string, string[]> = {
    US: ["美国", "美联储", "Fed", "US", "USA", "华尔街", "纳斯达克", "标普"],
    CN: ["中国", "央行", "A 股", "沪深", "上证", "深证"],
    JP: ["日本", "日央行", "BOJ", "日元", "日经"],
    DE: ["德国", "欧洲央行", "ECB", "欧元"],
    GB: ["英国", "英央行", "BOE", "英镑"],
    FR: ["法国"],
    IN: ["印度", "卢比"],
    SA: ["沙特", "OPEC", "原油", "油价"],
    RU: ["俄罗斯", "卢布"],
    BR: ["巴西", "雷亚尔"],
  };

  for (const [country, words] of Object.entries(keywords)) {
    if (words.some((w) => text.includes(w))) {
      return country;
    }
  }
  return "US"; // 默认美国
}

function getImportanceColor(importance: string): string {
  const colorMap: Record<string, string> = {
    高: "red",
    中: "orange",
    低: "blue",
  };
  return colorMap[importance] || "blue";
}
