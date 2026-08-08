'use client';

import type { ChangeLog as ChangeLogType } from '@/lib/types';

interface Props {
  data: ChangeLogType;
}

export function ChangeLogSection({ data }: Props) {
  return (
    <div className="bg-white rounded-lg border border-[#e7e5e4] p-4 shadow-xs">
      <h3 className="text-sm font-semibold text-[#1c1917] mb-3">相对上一版变化</h3>
      <ul className="space-y-1.5">
        <li className="text-xs text-[#44403c] flex items-start gap-1.5">
          <span className="text-[#78716c] shrink-0">·</span>
          宏观快照已从 <span className="font-data text-[#78716c]">{data.macroUpdateFrom}</span> 更新到 <span className="font-data text-[#1c1917] font-medium">{data.macroUpdateTo}</span>
        </li>
        {data.newConsensusStocks.length > 0 && (
          <li className="text-xs text-[#44403c] flex items-start gap-1.5">
            <span className="text-[#dc2626] shrink-0">·</span>
            基本面新增共识股: <span className="font-medium">{data.newConsensusStocks.join('、')}</span>
          </li>
        )}
        {data.removedConsensusStocks.length > 0 && (
          <li className="text-xs text-[#44403c] flex items-start gap-1.5">
            <span className="text-[#0d9488] shrink-0">·</span>
            基本面移出共识股: <span className="font-medium">{data.removedConsensusStocks.join('、')}</span>
          </li>
        )}
        {data.newSectors.length > 0 && (
          <li className="text-xs text-[#44403c] flex items-start gap-1.5">
            <span className="text-[#dc2626] shrink-0">·</span>
            板块总表新增: <span className="font-medium">{data.newSectors.join('、')}</span>
          </li>
        )}
        {data.removedSectors.length > 0 && (
          <li className="text-xs text-[#44403c] flex items-start gap-1.5">
            <span className="text-[#0d9488] shrink-0">·</span>
            板块总表移出: <span className="font-medium">{data.removedSectors.join('、')}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
