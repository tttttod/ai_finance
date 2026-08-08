/**
 * Server-side Tushare HTTP client.
 * ONLY imported from server-side code (API routes, build scripts).
 * Never expose TUSHARE_TOKEN to the browser.
 */

const TUSHARE_BASE_URL =
  process.env.TUSHARE_BASE_URL || "http://api.tushare.pro";

interface TushareRawResponse {
  code: number;
  msg: string;
  data: {
    fields: string[];
    items: unknown[][];
  } | null;
}

/**
 * Call a single Tushare API endpoint and return rows as objects.
 */
export async function callTushare<T>(
  apiName: string,
  params: Record<string, unknown>,
  fields: string,
): Promise<T[]> {
  const token = process.env.TUSHARE_TOKEN;
  if (!token) {
    throw new Error("TUSHARE_TOKEN is not configured");
  }

  const body = {
    api_name: apiName,
    token,
    params,
    fields,
  };

  const res = await fetch(TUSHARE_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(
      `Tushare HTTP error: ${res.status} ${res.statusText} (api=${apiName})`,
    );
  }

  const json: TushareRawResponse = await res.json();

  if (json.code !== 0) {
    throw new Error(
      `Tushare API error: code=${json.code}, msg=${json.msg} (api=${apiName})`,
    );
  }

  if (!json.data) return [];

  const { fields: cols, items } = json.data;
  return items.map((row) => {
    const obj: Record<string, unknown> = {};
    cols.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as T;
  });
}

// ---- Typed row helpers ----

export interface TushareStockBasic {
  ts_code: string;
  symbol: string;
  name: string;
  industry: string;
  market: string;
  list_date: string;
  is_hs: string;
}

export interface TushareDailyRow {
  ts_code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pre_close: number;
  change: number;
  pct_chg: number;
  vol: number;
  amount: number;
}

export interface TushareDailyBasicRow {
  ts_code: string;
  trade_date: string;
  pe: number;
  pe_ttm: number;
  pb: number;
  total_mv: number;
  circ_mv: number;
  turnover_rate: number;
  volume_ratio: number;
}

export interface TushareIndexDailyRow {
  ts_code: string;
  trade_date: string;
  close: number;
  change: number;
  pct_chg: number;
  vol: number;
  amount: number;
}
