import type { DailyReport, Sector, Stock, MarketOverview } from './types';

function makeStock(
  code: string,
  name: string,
  price: number,
  changePercent: number,
  marketCap: number,
  mainNetInflow: number,
  turnoverRate: number
): Stock {
  return { code, name, price, changePercent, marketCap, mainNetInflow, turnoverRate };
}

function makeSector(
  id: string,
  name: string,
  changePercent: number,
  mainNetInflow: number,
  day1: number,
  day2: number,
  up: number,
  down: number,
  flat: number,
  topGainers: Stock[],
  topMarketCap: Stock[]
): Sector {
  return {
    id,
    name,
    changePercent,
    mainNetInflow,
    mainNetInflowDay1: day1,
    mainNetInflowDay2: day2,
    upCount: up,
    downCount: down,
    flatCount: flat,
    totalStocks: up + down + flat,
    leaderStock: topGainers[0],
    topGainers,
    topMarketCap,
  };
}

const sectors: Sector[] = [
  makeSector(
    'electronics',
    '电子',
    3.25,
    28.6,
    12.3,
    16.3,
    186,
    52,
    18,
    [
      makeStock('002371', '北方华创', 285.60, 9.98, 1820, 52300, 4.2),
      makeStock('688981', '中芯国际', 78.35, 7.82, 4850, 88200, 3.1),
      makeStock('002049', '紫光国微', 142.80, 6.55, 865, 31200, 5.8),
      makeStock('603501', '韦尔股份', 118.45, 5.92, 1380, 27600, 3.9),
      makeStock('688012', '中微公司', 168.90, 5.41, 1050, 19800, 4.5),
    ],
    [
      makeStock('688981', '中芯国际', 78.35, 7.82, 4850, 88200, 3.1),
      makeStock('002371', '北方华创', 285.60, 9.98, 1820, 52300, 4.2),
      makeStock('603501', '韦尔股份', 118.45, 5.92, 1380, 27600, 3.9),
      makeStock('688012', '中微公司', 168.90, 5.41, 1050, 19800, 4.5),
      makeStock('002049', '紫光国微', 142.80, 6.55, 865, 31200, 5.8),
    ]
  ),
  makeSector(
    'ai-computing',
    'AI算力',
    4.12,
    35.2,
    18.5,
    16.7,
    95,
    22,
    8,
    [
      makeStock('002415', '海康威视', 38.90, 10.01, 3650, 125000, 2.8),
      makeStock('688111', '金山办公', 358.20, 8.75, 1650, 45600, 3.5),
      makeStock('300496', '中科创达', 86.50, 7.32, 420, 18900, 6.2),
      makeStock('688561', '奇安信', 62.30, 6.88, 920, 22300, 4.1),
      makeStock('300454', '深信服', 78.60, 6.15, 580, 15700, 5.3),
    ],
    [
      makeStock('002415', '海康威视', 38.90, 10.01, 3650, 125000, 2.8),
      makeStock('688111', '金山办公', 358.20, 8.75, 1650, 45600, 3.5),
      makeStock('688561', '奇安信', 62.30, 6.88, 920, 22300, 4.1),
      makeStock('300496', '中科创达', 86.50, 7.32, 420, 18900, 6.2),
      makeStock('300454', '深信服', 78.60, 6.15, 580, 15700, 5.3),
    ]
  ),
  makeSector(
    'new-energy',
    '新能源车',
    2.18,
    19.8,
    8.2,
    11.6,
    142,
    68,
    25,
    [
      makeStock('300750', '宁德时代', 218.50, 6.82, 9520, 186000, 1.8),
      makeStock('002594', '比亚迪', 285.30, 5.15, 8300, 142000, 2.1),
      makeStock('300014', '亿纬锂能', 52.80, 4.92, 1080, 35600, 3.8),
      makeStock('002460', '赣锋锂业', 48.60, 4.35, 780, 22800, 4.5),
      makeStock('300769', '德方纳米', 72.40, 3.88, 320, 12500, 5.2),
    ],
    [
      makeStock('300750', '宁德时代', 218.50, 6.82, 9520, 186000, 1.8),
      makeStock('002594', '比亚迪', 285.30, 5.15, 8300, 142000, 2.1),
      makeStock('300014', '亿纬锂能', 52.80, 4.92, 1080, 35600, 3.8),
      makeStock('002460', '赣锋锂业', 48.60, 4.35, 780, 22800, 4.5),
      makeStock('300769', '德方纳米', 72.40, 3.88, 320, 12500, 5.2),
    ]
  ),
  makeSector(
    'semiconductor',
    '半导体',
    2.86,
    22.4,
    10.1,
    12.3,
    165,
    58,
    22,
    [
      makeStock('688396', '华润微', 52.30, 8.15, 695, 28500, 4.8),
      makeStock('603986', '兆易创新', 108.60, 6.92, 720, 32100, 3.6),
      makeStock('688008', '澜起科技', 68.90, 6.28, 780, 25800, 3.2),
      makeStock('002185', '华天科技', 12.85, 5.75, 395, 15200, 5.1),
      makeStock('600584', '长电科技', 32.40, 5.12, 580, 18600, 4.3),
    ],
    [
      makeStock('688396', '华润微', 52.30, 8.15, 695, 28500, 4.8),
      makeStock('603986', '兆易创新', 108.60, 6.92, 720, 32100, 3.6),
      makeStock('688008', '澜起科技', 68.90, 6.28, 780, 25800, 3.2),
      makeStock('002185', '华天科技', 12.85, 5.75, 395, 15200, 5.1),
      makeStock('600584', '长电科技', 32.40, 5.12, 580, 18600, 4.3),
    ]
  ),
  makeSector(
    'pharma',
    '医药生物',
    1.52,
    15.6,
    6.8,
    8.8,
    198,
    85,
    32,
    [
      makeStock('300760', '迈瑞医疗', 298.50, 5.28, 3620, 95800, 1.5),
      makeStock('600276', '恒瑞医药', 48.90, 4.65, 3120, 72300, 2.1),
      makeStock('300347', '泰格医药', 62.40, 4.12, 420, 18500, 3.8),
      makeStock('000538', '云南白药', 58.20, 3.85, 920, 25600, 2.5),
      makeStock('300122', '智飞生物', 38.60, 3.52, 620, 15800, 3.2),
    ],
    [
      makeStock('300760', '迈瑞医疗', 298.50, 5.28, 3620, 95800, 1.5),
      makeStock('600276', '恒瑞医药', 48.90, 4.65, 3120, 72300, 2.1),
      makeStock('000538', '云南白药', 58.20, 3.85, 920, 25600, 2.5),
      makeStock('300347', '泰格医药', 62.40, 4.12, 420, 18500, 3.8),
      makeStock('300122', '智飞生物', 38.60, 3.52, 620, 15800, 3.2),
    ]
  ),
  makeSector(
    'military',
    '国防军工',
    1.88,
    12.3,
    5.2,
    7.1,
    112,
    45,
    15,
    [
      makeStock('600893', '航发动力', 42.80, 7.25, 1140, 38500, 3.2),
      makeStock('000768', '中航西飞', 28.60, 5.88, 790, 25200, 2.8),
      makeStock('600760', '中航沈飞', 52.30, 5.42, 1450, 42100, 2.5),
      makeStock('601989', '中国重工', 6.85, 4.95, 1520, 35800, 3.8),
      makeStock('002179', '中航光电', 48.90, 4.32, 820, 22600, 2.9),
    ],
    [
      makeStock('600760', '中航沈飞', 52.30, 5.42, 1450, 42100, 2.5),
      makeStock('601989', '中国重工', 6.85, 4.95, 1520, 35800, 3.8),
      makeStock('600893', '航发动力', 42.80, 7.25, 1140, 38500, 3.2),
      makeStock('000768', '中航西飞', 28.60, 5.88, 790, 25200, 2.8),
      makeStock('002179', '中航光电', 48.90, 4.32, 820, 22600, 2.9),
    ]
  ),
  makeSector(
    'consumer-liquor',
    '白酒',
    0.95,
    8.5,
    3.2,
    5.3,
    16,
    4,
    2,
    [
      makeStock('600519', '贵州茅台', 1528.00, 2.35, 19200, 285000, 0.8),
      makeStock('000858', '五粮液', 148.60, 1.92, 5760, 82300, 1.2),
      makeStock('000568', '泸州老窖', 178.50, 1.68, 2630, 45600, 1.5),
      makeStock('600809', '山西汾酒', 238.40, 1.45, 2910, 38200, 1.8),
      makeStock('002304', '洋河股份', 88.20, 1.12, 1330, 22500, 1.3),
    ],
    [
      makeStock('600519', '贵州茅台', 1528.00, 2.35, 19200, 285000, 0.8),
      makeStock('000858', '五粮液', 148.60, 1.92, 5760, 82300, 1.2),
      makeStock('600809', '山西汾酒', 238.40, 1.45, 2910, 38200, 1.8),
      makeStock('000568', '泸州老窖', 178.50, 1.68, 2630, 45600, 1.5),
      makeStock('002304', '洋河股份', 88.20, 1.12, 1330, 22500, 1.3),
    ]
  ),
  makeSector(
    'robotics',
    '机器人',
    3.68,
    25.1,
    11.8,
    13.3,
    78,
    18,
    6,
    [
      makeStock('300124', '汇川技术', 68.90, 8.52, 1850, 65200, 2.8),
      makeStock('002747', '埃斯顿', 22.80, 7.15, 320, 18500, 5.6),
      makeStock('688169', '石头科技', 298.50, 6.88, 420, 28600, 3.2),
      makeStock('300024', '机器人', 15.60, 6.25, 230, 12800, 6.8),
      makeStock('002698', '博实股份', 18.90, 5.62, 192, 8500, 4.5),
    ],
    [
      makeStock('300124', '汇川技术', 68.90, 8.52, 1850, 65200, 2.8),
      makeStock('688169', '石头科技', 298.50, 6.88, 420, 28600, 3.2),
      makeStock('002747', '埃斯顿', 22.80, 7.15, 320, 18500, 5.6),
      makeStock('300024', '机器人', 15.60, 6.25, 230, 12800, 6.8),
      makeStock('002698', '博实股份', 18.90, 5.62, 192, 8500, 4.5),
    ]
  ),
];

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const overview: MarketOverview = {
  date: getTodayStr(),
  shIndex: 3356.78,
  shChange: 1.12,
  szIndex: 10582.45,
  szChange: 1.58,
  totalVolume: 12856,
  upSectors: 42,
  downSectors: 18,
  hotSectorsCount: sectors.length,
};

export function getDailyReport(): DailyReport {
  return {
    overview,
    hotSectors: sectors,
    generatedAt: new Date().toISOString(),
  };
}

export function getSectorById(id: string): Sector | undefined {
  return sectors.find((s) => s.id === id);
}

export function getAllSectors(): Sector[] {
  return sectors;
}
