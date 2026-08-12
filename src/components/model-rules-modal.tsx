"use client";

interface ModelRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModelRulesModal({ isOpen, onClose }: ModelRulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">规则说明</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Section 1 */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-1.5">这个模型做什么</h3>
            <ul className="text-[10px] text-slate-600 space-y-1 leading-relaxed">
              <li>• 基于真实行情、估值、技术指标、市场环境等多因子数据</li>
              <li>• 输出未来短周期上涨/下跌倾向判断</li>
              <li>• 展示预测曲线与真实走势的对比</li>
              <li>• 通过近10日回测展示模型准确性指标</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-1.5">用户怎么用</h3>
            <ol className="text-[10px] text-slate-600 space-y-1 leading-relaxed list-decimal list-inside">
              <li>输入股票名称或代码（如"贵州茅台"或"600519"）</li>
              <li>选择你认为有效的因子（或使用推荐因子）</li>
              <li>点击"开始预测与回测"</li>
              <li>查看涨跌方向、概率、置信度、风险提示</li>
              <li>查看近10日真实价格与模型预测曲线对比</li>
            </ol>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-1.5">模型指标解释</h3>
            <div className="text-[10px] text-slate-600 space-y-1.5 leading-relaxed">
              <div className="flex gap-2">
                <span className="text-blue-600 font-medium whitespace-nowrap">方向准确率</span>
                <span>预测涨跌方向与真实方向一致的比例</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-medium whitespace-nowrap">区间命中率</span>
                <span>真实价格落入预测区间的比例</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-medium whitespace-nowrap">MAE</span>
                <span>平均绝对误差，越小越好</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-medium whitespace-nowrap">RMSE</span>
                <span>均方根误差，对大误差更敏感</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-medium whitespace-nowrap">R²</span>
                <span>拟合优度，越接近1越好</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-medium whitespace-nowrap">MAPE</span>
                <span>平均绝对百分比误差，越小越好</span>
              </div>
            </div>
          </div>

          {/* Section 4 - Risk */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <h3 className="text-xs font-bold text-amber-700 mb-1.5">风险说明</h3>
            <ul className="text-[10px] text-amber-700 space-y-1 leading-relaxed">
              <li>• 模型只提供概率判断，不保证预测准确</li>
              <li>• 历史拟合不代表未来表现</li>
              <li>• 结果不构成投资建议</li>
              <li>• 突发政策、财报、黑天鹅事件可能导致预测失效</li>
              <li>• 用户需结合基本面、市场环境和风险承受能力独立判断</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full text-xs py-2.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
