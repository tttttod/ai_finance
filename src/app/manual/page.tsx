export default function ManualPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-white shadow-lg">
          <h1 className="text-2xl font-bold sm:text-3xl">金融华尔界</h1>
          <p className="mt-2 text-sm text-blue-100 sm:text-base">作品使用手册</p>
          <p className="mt-4 text-xs text-blue-200">
            一款「交易员成长地图 + 金融 Agent 解锁 + 投研工作流训练」的游戏化金融学习产品。
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">1. 赛事评审快速信息</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-600 whitespace-nowrap">作品名称</td>
                    <td className="py-2 text-slate-800">金融华尔界</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-600 whitespace-nowrap">一句话介绍</td>
                    <td className="py-2 text-slate-800">一款「交易员成长地图 + 金融 Agent 解锁 + 投研工作流训练」的游戏化金融学习产品。</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium text-slate-600 whitespace-nowrap">作品访问 URL</td>
                    <td className="py-2"><a href="https://tradeland.coze.site" className="text-blue-600 underline">https://tradeland.coze.site</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">2. 评委快速体验路径</h2>
            <p className="mb-3 text-sm text-slate-600">建议评委按以下路径体验核心闭环：</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>打开作品访问 URL。</li>
              <li>完成 <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-blue-700">tradeTI</code> 交易人格测试，进入主界面。</li>
              <li>阅读首次弹出的游戏化新手引导。</li>
              <li>在"冒险"页点击"查看玩法指引"，确认教程可以重复打开。</li>
              <li>点击"金融华尔界"地图入口。</li>
              <li>体验第 1 关"开户日"，完成剧情选择并解锁 Lead Agent。</li>
              <li>返回主界面，查看 Agent 研究天团中 Lead Agent 是否点亮。</li>
              <li>点击已解锁 Agent，查看人物立绘、展示动画和能力介绍。</li>
              <li>继续体验第 2 关"数据黑市"和第 3 关"市场风暴"，理解数据校验与市场环境判断玩法。</li>
              <li>进入"任务"页，输入股票或板块，体验 Agent 投研分析链路。</li>
              <li>进入"工坊"页，查看通用股票预测模型与因子分析。</li>
              <li>进入"档案"页，查看交易人格、关注列表、历史记录和重测入口。</li>
            </ol>
            <p className="mt-4 text-xs text-slate-500">
              如需重新触发新手引导，可访问：<code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">/?onboarding=1</code>
            </p>
          </section>

          {/* Section 3 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">3. 产品简介</h2>
            <p className="text-sm leading-relaxed text-slate-700">
              <strong>金融华尔界</strong>是一款交易员成长游戏。玩家通过 <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-blue-700">tradeTI</code> 交易人格测试进入游戏，在地图关卡中学习金融知识、修正交易误区，并逐步解锁 12 位投研 Agent。所有 Agent 解锁后，会组成一条完整的投研分析链路，帮助用户从"凭感觉交易"走向"按流程研究"。
            </p>
            <p className="mt-3 text-sm text-slate-500">
              本产品用于金融学习、投研训练和信息整理，不提供自动交易服务，所有内容不构成投资建议。
            </p>
          </section>

          {/* Section 4 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">4. 适用场景</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2 px-3 text-left font-medium text-slate-600">场景</th>
                    <th className="py-2 px-3 text-left font-medium text-slate-600">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["金融知识学习", "用剧情关卡和选择题降低金融知识学习门槛。"],
                    ["交易行为训练", "通过 tradeTI 测试和关卡选择暴露常见交易误区。"],
                    ["投研流程训练", "用 Agent 链路训练「先问问题、再找证据、最后做结论」的研究习惯。"],
                    ["投研助手演示", "展示多 Agent 如何分工完成市场、数据、行业、估值、风险和复盘分析。"],
                    ["金融产品原型展示", "适合向评委、投资人或内部团队演示游戏化金融 Agent 产品形态。"],
                  ].map(([scene, desc]) => (
                    <tr key={scene} className="border-b border-slate-100">
                      <td className="py-2 px-3 font-medium text-slate-700 whitespace-nowrap">{scene}</td>
                      <td className="py-2 px-3 text-slate-600">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">5. 核心功能概览</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2 px-3 text-left font-medium text-slate-600">功能</th>
                    <th className="py-2 px-3 text-left font-medium text-slate-600">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["tradeTI 交易人格测试", "识别用户交易行为倾向，并作为游戏入口。"],
                    ["新手引导弹窗", "以游戏化入职邀请函介绍玩法、地图和 Agent 解锁机制。"],
                    ["金融华尔界地图", "9:16 移动端地图，包含世界地图、区域地图和 10 个主线关卡。"],
                    ["剧情关卡", "通过视觉小说式对话，让玩家在交易情境中做选择。"],
                    ["知识学习与答题", "通过知识卡片、选择题和小游戏学习金融概念。"],
                    ["Agent 解锁动画", "通关后播放 Agent 解锁动画，强化养成反馈。"],
                    ["Agent 研究天团", "12 位 Agent 逐步点亮，组成完整投研团队。"],
                    ["Agent 人物展示", "点击已解锁角色，可查看人物立绘和能力说明。"],
                    ["Agent 投研链路", "输入股票或板块后，按 16 步生成结构化投研分析。"],
                    ["模型工坊", "展示通用股票预测模型、因子选择、拟合测试和误差分析。"],
                    ["个人档案", "查看交易人格、关注标的、历史记录和重新测试入口。"],
                    ["本地进度保存", "使用浏览器 localStorage 保存关卡、Agent、测试结果和关注列表。"],
                  ].map(([feat, desc]) => (
                    <tr key={feat} className="border-b border-slate-100">
                      <td className="py-2 px-3 font-medium text-slate-700 whitespace-nowrap">{feat}</td>
                      <td className="py-2 px-3 text-slate-600">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">6. 第一次使用</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>打开应用。</li>
              <li>完成 <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-blue-700">tradeTI</code> 交易人格测试。</li>
              <li>进入主界面后阅读新手引导弹窗。</li>
              <li>点击"开始冒险"或进入"冒险"页。</li>
              <li>打开"金融华尔界"地图，从第 1 关开始挑战。</li>
            </ol>
            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-800">玩家的核心目标：</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-blue-700">
                <li>通过关卡。</li>
                <li>解锁 Agent。</li>
                <li>点亮研究天团。</li>
                <li>使用 Agent 完成股票或板块研究。</li>
                <li>形成结论、风险检查和复盘计划。</li>
              </ol>
            </div>
          </section>

          {/* Section 7 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">7. 主界面导航</h2>
            <p className="mb-3 text-sm text-slate-600">底部导航包含 4 个主要入口：</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2 px-3 text-left font-medium text-slate-600">页面</th>
                    <th className="py-2 px-3 text-left font-medium text-slate-600">作用</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["冒险", "查看市场状态、进入金融华尔界地图、完成每日任务"],
                    ["任务", "输入股票或板块，启动 Agent 投研流程"],
                    ["工坊", "查看通用股票预测模型、因子分析和拟合结果"],
                    ["档案", "查看交易人格、关注列表、历史记录和重测入口"],
                  ].map(([page, desc]) => (
                    <tr key={page} className="border-b border-slate-100">
                      <td className="py-2 px-3 font-medium text-slate-700">{page}</td>
                      <td className="py-2 px-3 text-slate-600">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 8 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">8. 新手引导</h2>
            <p className="text-sm text-slate-700">首次进入主界面时，系统会弹出游戏化入职邀请函，说明当前产品的玩法：</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>进入金融华尔界地图；</li>
              <li>完成关卡试炼；</li>
              <li>解锁 Agent 研究天团；</li>
              <li>逐步补完整套投研链路。</li>
            </ul>
            <p className="mt-3 text-sm text-slate-500">如果后续忘记玩法，可以点击页面上的"查看玩法指引"按钮，重新打开新手引导。</p>
          </section>

          {/* Section 9 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">9. tradeTI 交易人格测试</h2>
            <p className="text-sm text-slate-700"><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-blue-700">tradeTI</code> 是进入游戏前的交易人格测试。它会通过一组选择题判断用户常见的交易行为倾向：</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>是否容易追涨；</li>
              <li>是否过度保守；</li>
              <li>是否迷信 K 线；</li>
              <li>是否喜欢直接要代码；</li>
              <li>是否缺少止盈止损；</li>
              <li>是否过度依赖模型。</li>
            </ul>
            <p className="mt-3 text-sm text-slate-500">测试结果会影响新手引导中的角色称呼和个性化提示。用户可以在"档案"页重新测试。</p>
          </section>

          {/* Section 10 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">10. 金融华尔界地图</h2>
            <p className="mb-3 text-sm text-slate-700">金融华尔界是产品的主线地图，采用 9:16 移动端游戏面板。地图分为三个区域：</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2 px-3 text-left font-medium text-slate-600">区域</th>
                    <th className="py-2 px-3 text-left font-medium text-slate-600">关卡</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100"><td className="py-2 px-3 font-medium text-slate-700">金融学院区</td><td className="py-2 px-3 text-slate-600">第 1-4 关</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-2 px-3 font-medium text-slate-700">交易所区</td><td className="py-2 px-3 text-slate-600">第 5-7 关</td></tr>
                  <tr><td className="py-2 px-3 font-medium text-slate-700">风险山谷</td><td className="py-2 px-3 text-slate-600">第 8-11 关</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-500">地图上会显示每个区域的完成进度。未完成前置关卡时，后续关卡会保持锁定状态。</p>
          </section>

          {/* Section 11 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">11. 关卡与解锁</h2>
            <p className="mb-3 text-sm text-slate-600">目前主线包含 10 个关卡，每个关卡对应一个或多个 Agent：</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2 px-3 text-left font-medium text-slate-600">关卡</th>
                    <th className="py-2 px-3 text-left font-medium text-slate-600">名称</th>
                    <th className="py-2 px-3 text-left font-medium text-slate-600">玩法</th>
                    <th className="py-2 px-3 text-left font-medium text-slate-600">解锁</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["第 1 关", "开户日", "剧情对话", "Data Agent"],
                    ["第 2 关", "数据黑市", "剧情对话", "Market Agent"],
                    ["第 3 关", "市场风暴", "剧情对话", "Industry Agent"],
                    ["第 4 关", "财报夜审", "剧情对话", "Fundamental Agent"],
                    ["第 5 关", "政策密函", "剧情对话", "Valuation Agent"],
                    ["第 6 关", "价格审判庭", "剧情对话", "Technical Agent"],
                    ["第 7 关", "K线神谕", "剧情对话", "Sentiment Agent"],
                    ["第 8 关", "多空议会", "答题闯关", "Bull Analyst"],
                    ["第 9 关", "舆论火场", "知识学习", "Bear Analyst"],
                    ["第 10 关", "回撤之门", "快速决策", "Risk Officer"],
                    ["第 11 关", "最终关", "快速决策", "Research Manager"],
                  ].map(([lv, name, play, unlock]) => (
                    <tr key={lv} className="border-b border-slate-100">
                      <td className="py-2 px-3 font-medium text-slate-700 whitespace-nowrap">{lv}</td>
                      <td className="py-2 px-3 text-slate-700">{name}</td>
                      <td className="py-2 px-3 text-slate-600">{play}</td>
                      <td className="py-2 px-3 text-blue-700 font-medium">{unlock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-500">通关后，系统会保存进度、解锁对应 Agent，并播放 Agent 解锁动画。</p>
          </section>

          {/* Section 12 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">12. 剧情关卡说明</h2>
            
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="font-bold text-slate-800">12.1 开户日</h3>
                <p className="mt-2 text-sm text-slate-700">玩家在废弃交易大厅遇到前明星基金经理顾明澈。他曾因过度自信失去团队，如今成为失意的 Lead Agent。玩家需要帮助他重新确认研究的第一原则：先问问题，再找答案。</p>
                <p className="mt-2 text-sm font-medium text-slate-600">通关重点：</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-slate-600">
                  <li>不急着下单；</li>
                  <li>不盲信热点；</li>
                  <li>先确认研究对象、周期、假设和风险。</li>
                </ul>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="font-bold text-slate-800">12.2 数据黑市</h3>
                <p className="mt-2 text-sm text-slate-700">玩家进入地下交易厅，面对三张看似矛盾的行情图。Data Agent 要求玩家检查公司记录、更新时间和数据缺口，从错误行情中找出可信数据。</p>
                <p className="mt-2 text-sm font-medium text-slate-600">通关重点：</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-slate-600">
                  <li>数据来源比图表刺激程度更重要；</li>
                  <li>更新时间必须完整；</li>
                  <li>缺失数据会制造假信号。</li>
                </ul>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="font-bold text-slate-800">12.3 市场风暴</h3>
                <p className="mt-2 text-sm text-slate-700">市场暴跌日，Lead Agent 看到一只逆势较强的股票，准备加仓。Market Agent 要求玩家使用市场观察仪，把视角从个股拉远到行业，再拉远到全市场，并通过三天观察计划控制仓位。</p>
                <p className="mt-2 text-sm font-medium text-slate-600">通关重点：</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-slate-600">
                  <li>个股强弱不能脱离市场环境；</li>
                  <li>逆势表现是信息，但不是无脑加仓理由；</li>
                  <li>市场风暴中优先控制仓位。</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 13 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">13. Agent 研究天团</h2>
            <p className="mb-3 text-sm text-slate-700">Agent 是玩家逐步解锁的投研队友。每位 Agent 负责一个研究环节：</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2 px-3 text-left font-medium text-slate-600">Agent</th>
                    <th className="py-2 px-3 text-left font-medium text-slate-600">职责</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Lead Agent", "确认研究问题、拆解任务、统筹流程"],
                    ["Data Agent", "检查数据来源、时间戳和缺失项"],
                    ["Market Agent", "判断市场环境和整体风险偏好"],
                    ["Industry Agent", "分析行业趋势、政策和产业逻辑"],
                    ["Fundamental Agent", "分析公司财务、盈利质量和基本面"],
                    ["Valuation Agent", "判断估值区间和安全边际"],
                    ["Technical Agent", "分析技术面、趋势和资金节奏"],
                    ["Sentiment Agent", "判断新闻、公告和舆论情绪"],
                    ["Bull Analyst", "提出看多逻辑和增长故事"],
                    ["Bear Analyst", "提出反证、风险和看空逻辑"],
                    ["Risk Officer", "检查估值、流动性、财务和仓位风险"],
                    ["Research Manager", "汇总争议，生成结论和复盘计划"],
                  ].map(([agent, role]) => (
                    <tr key={agent} className="border-b border-slate-100">
                      <td className="py-2 px-3 font-medium text-blue-700 whitespace-nowrap">{agent}</td>
                      <td className="py-2 px-3 text-slate-600">{role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 14 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">14. 发起一次研究</h2>
            <p className="mb-3 text-sm text-slate-700">在"任务"页，用户可以输入股票或板块，启动 Agent 投研流程。</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              <li>输入研究标的。</li>
              <li>选择投资风格和研究周期。</li>
              <li>点击开始研究。</li>
              <li>系统按 Agent 链路逐步生成分析。</li>
              <li>查看多因子评分、多空观点、风险检查、三情景预测和最终结论。</li>
            </ol>
            <p className="mt-3 text-sm text-slate-500">研究结果适合用于训练自己的分析框架，而不是直接作为买卖指令。</p>
          </section>

          {/* Section 15 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">15. Agent 投研链路</h2>
            <p className="mb-3 text-sm text-slate-600">完整链路包含 16 个步骤：</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2 px-3 text-left font-medium text-slate-600">步骤</th>
                    <th className="py-2 px-3 text-left font-medium text-slate-600">内容</th>
                    <th className="py-2 px-3 text-left font-medium text-slate-600">负责 Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1", "确认研究问题", "Lead"],
                    ["2", "确认投资风格和周期", "Lead"],
                    ["3", "数据收集与缺失检查", "Data"],
                    ["4", "市场环境分析", "Market"],
                    ["5", "行业与政策分析", "Industry"],
                    ["6", "公司基本面分析", "Fundamental"],
                    ["7", "估值分析", "Valuation"],
                    ["8", "技术与资金分析", "Technical"],
                    ["9", "新闻公告与情绪分析", "Sentiment"],
                    ["10", "多因子评分", "Lead"],
                    ["11", "看多观点", "Bull"],
                    ["12", "看空观点", "Bear"],
                    ["13", "风险官检查", "Risk"],
                    ["14", "三情景预测", "Lead"],
                    ["15", "最终结论", "Research Manager"],
                    ["16", "复盘任务生成", "Research Manager"],
                  ].map(([step, content, agent]) => (
                    <tr key={step} className="border-b border-slate-100">
                      <td className="py-2 px-3 font-medium text-slate-700 text-center">{step}</td>
                      <td className="py-2 px-3 text-slate-600">{content}</td>
                      <td className="py-2 px-3 text-blue-700 font-medium">{agent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 16-18 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">16. 冒险页功能</h2>
            <p className="mb-3 text-sm text-slate-700">"冒险"页是玩家日常进入产品的主入口，包含：</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>今日市场天气；</li>
              <li>指数快照；</li>
              <li>金融华尔界地图入口；</li>
              <li>今日任务；</li>
              <li>推荐研究标的；</li>
              <li>市场异动；</li>
              <li>研究总结。</li>
            </ul>
            <p className="mt-3 text-sm text-slate-500">部分内容采用折叠面板展示，用户点击后再展开详情，减少信息拥挤。</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">17. 工坊功能</h2>
            <p className="mb-3 text-sm text-slate-700">"工坊"页用于展示通用股票预测模型和因子分析能力。用户可以查看：</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>因子库；</li>
              <li>推荐因子组合；</li>
              <li>随机股票或指定股票测试；</li>
              <li>模型评分；</li>
              <li>方向准确率；</li>
              <li>区间命中率；</li>
              <li>误差分析；</li>
              <li>蒙特卡洛模拟结果。</li>
            </ul>
            <p className="mt-3 text-sm text-slate-500">该模块更适合理解模型如何工作，不适合单独作为交易依据。</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">18. 档案功能</h2>
            <p className="mb-3 text-sm text-slate-700">"档案"页用于查看个人状态和历史信息：</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>tradeTI 交易人格；</li>
              <li>关注股票列表；</li>
              <li>历史研究记录；</li>
              <li>重新测试入口；</li>
              <li>风险提示和免责声明。</li>
            </ul>
          </section>

          {/* Section 19 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">19. 进度保存</h2>
            <p className="mb-3 text-sm text-slate-700">产品会在浏览器本地保存部分进度，包括：</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>已完成关卡；</li>
              <li>已解锁 Agent；</li>
              <li>失败记录；</li>
              <li>炒币奖励；</li>
              <li>已学习卡片；</li>
              <li>已答对题目；</li>
              <li>关注列表；</li>
              <li>tradeTI 测试结果。</li>
            </ul>
            <p className="mt-3 text-sm text-slate-500">当前主要使用 <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">localStorage</code> 保存，因此同一浏览器可以保留进度。清空浏览器缓存或更换设备后，进度可能丢失。</p>
          </section>

          {/* Section 20 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">20. 常见问题</h2>
            <div className="space-y-4">
              {[
                { q: "这个产品会直接推荐股票吗？", a: "产品会展示研究标的和分析结果，但定位是研究辅助和学习训练，不是荐股软件。" },
                { q: "为什么要先做 tradeTI 测试？", a: "tradeTI 用来识别用户常见的交易误区，让后续新手引导和成长路径更有代入感。" },
                { q: "为什么要先通关再解锁 Agent？", a: "每个 Agent 代表一个投研能力。通过关卡学习对应能力后，再解锁角色，能让用户理解这个 Agent 在完整链路中的作用。" },
                { q: "失败后会怎样？", a: "失败不会解锁 Agent。玩家可以重新挑战关卡，直到选择出更合理的研究行为。" },
                { q: "Agent 解锁后有什么用？", a: "解锁后 Agent 会在研究天团中点亮。后续功能可逐步和 Agent 解锁状态绑定，例如限制特定研究步骤、点亮分析卡片或展示专属角色能力。" },
                { q: "数据是真实行情吗？", a: "当前版本包含演示数据和部分接口能力。用户应以页面标识为准，不要把演示数据当作实时交易依据。" },
                { q: "如果评审环境无法登录怎么办？", a: "请优先使用赛事提交材料中提供的测试账号。如果部署版本支持游客体验，可直接进入。" },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-800">Q：{q}</p>
                  <p className="mt-1 text-sm text-slate-600">A：{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 21 */}
          <section className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-red-800">21. 风险声明</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-red-700">
              <li>本产品仅用于金融学习、投研训练和信息整理。</li>
              <li>产品中的分析、评分、预测和剧情内容不构成任何投资建议。</li>
              <li>投资有风险，用户应独立判断并自行承担决策结果。</li>
              <li>模型结果基于输入数据和假设，不保证准确性。</li>
              <li>产品不承诺收益，不提供自动交易服务。</li>
            </ol>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 pb-8 text-center text-xs text-slate-400">
          <p>金融华尔界 &copy; 2025 &mdash; 仅供学习与研究使用</p>
        </div>
      </div>
    </div>
  );
}
