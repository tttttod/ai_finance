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
 * Tushare 调用错误，附带错误码，方便上层分类处理（不泄露 token）。
 */
export class TushareError extends Error {
  code:
    | "TOKEN_MISSING"
    | "AUTH_FAILED"
    | "HTTP_ERROR"
    | "API_ERROR"
    | "NETWORK_ERROR";
  status?: number;
  tushareCode?: number;

  constructor(
    message: string,
    code: TushareError["code"],
    opts?: { status?: number; tushareCode?: number },
  ) {
    super(message);
    this.name = "TushareError";
    this.code = code;
    this.status = opts?.status;
    this.tushareCode = opts?.tushareCode;
  }
}

/**
 * Call a single Tushare API endpoint and return rows as objects.
 * @throws {TushareError}
 */
export async function callTushare<T>(
  apiName: string,
  params: Record<string, unknown>,
  fields: string,
): Promise<T[]> {
  const token = process.env.TUSHARE_TOKEN;
  if (!token) {
    throw new TushareError(
      "TUSHARE_TOKEN is not configured",
      "TOKEN_MISSING",
    );
  }

  const body = {
    api_name: apiName,
    token,
    params,
    fields,
  };

  let res: Response;
  try {
    res = await fetch(TUSHARE_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new TushareError(
      `Tushare network error (api=${apiName}): ${err instanceof Error ? err.message : "unknown"}`,
      "NETWORK_ERROR",
    );
  }

  if (!res.ok) {
    // 401/403 视为鉴权失败
    if (res.status === 401 || res.status === 403) {
      throw new TushareError(
        `Tushare auth failed: HTTP ${res.status} (api=${apiName})`,
        "AUTH_FAILED",
        { status: res.status },
      );
    }
    throw new TushareError(
      `Tushare HTTP error: ${res.status} ${res.statusText} (api=${apiName})`,
      "HTTP_ERROR",
      { status: res.status },
    );
  }

  const json: TushareRawResponse = await res.json();

  if (json.code !== 0) {
    const msg = json.msg || "unknown";
    // Tushare 常见 token 失效错误码：40001/40002/40003 等
    const authFailed =
      /token|权限|auth|permission|account/i.test(msg) ||
      [40001, 40002, 40003, 40200, 40201, 40202, 40203].includes(json.code);
    throw new TushareError(
      `Tushare API error: code=${json.code}, msg=${msg} (api=${apiName})`,
      authFailed ? "AUTH_FAILED" : "API_ERROR",
      { tushareCode: json.code },
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
