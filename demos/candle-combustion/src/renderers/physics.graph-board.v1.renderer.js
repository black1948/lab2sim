import {add, label, svg} from './svg.js'

//  -  x-y 轨迹记录板  - 
// 视觉依据: frame-017/018/019(影片叠加的 x-y 分析图: 浅色网格面板, 原点在左上, x 轴
// 向右, y 轴向下, 红色细线抛物线上等距红点序列, 终点蓝色球, 轴端箭头+x/y 字样), 
// frame-020(图与器材画面叠化).影片中为后期叠加动画, 模拟呈现为台面右侧的记录仪表板
// (IR assumptions 已声明).
// 复用审查否决记录: physics/screen 为光学案例白幕(无坐标/网格/数据语义); 
// physics/fringe-screen 为干涉条纹屏.坐标记录板无诚实复用, 生成.
// 风格依据: frame-019 原图版式(细网格, 黑轴线箭头, 红点红线, 蓝球); 网格密度参照
// physics.js GRID_PX 约定.
// 状态语义(数据驱动节拍, 与引擎延时批一致): 
//   state.dot_1..dot_5 → 第 k 个频闪红点: 位置 (OX+(k-1) - dx, OY+(k-1)² - step), 
//   dx=properties.dot_dx_px=40, step=drop_px/25=10(竖直按 1:3:5:7 递增, k=6 即终点); 
//   state.mode="Static record" → 所有红点 x 取 OX(竖直落体, Δx=0); 
//   world["ball-1"].landed=true → 终点画蓝球 (OX+5dx, OY+25step).
// 锚点: 局部 (0,0)=面板中心.
const OX = -115
const OY = -138
export function renderGraphBoard(entity, state = {}, context = {}) {
  const group = svg('g')
  const dx = Number(entity.properties?.dot_dx_px ?? 40)
  const step = Number(entity.properties?.drop_px ?? 250) / 25
  const still = state.mode === 'Static record'
  // 面板 + 细网格(frame-019 浅灰格)
  const board = svg('g')
  board.append(svg('rect', {x: -145, y: -168, width: 290, height: 336, rx: 4, fill: '#f4f4f0', stroke: '#b0b0a6', 'stroke-width': 1.8}))
  for (let gx = -131; gx <= 131; gx += 14) {
    board.append(svg('line', {x1: gx, y1: -154, x2: gx, y2: 154, stroke: '#e2e2da', 'stroke-width': 1}))
  }
  for (let gy = -154; gy <= 154; gy += 14) {
    board.append(svg('line', {x1: -131, y1: gy, x2: 131, y2: gy, stroke: '#e2e2da', 'stroke-width': 1}))
  }
  // 坐标轴: 原点左上, x→右, y↓向下(frame-019), 箭头 + 轴标
  add(board,
    svg('line', {x1: OX, y1: OY, x2: 125, y2: OY, stroke: '#22262a', 'stroke-width': 2.2}),
    svg('path', {d: 'M125 -138l-8 -4v8Z', fill: '#22262a'}),
    svg('line', {x1: OX, y1: OY, x2: OX, y2: 148, stroke: '#22262a', 'stroke-width': 2.2}),
    svg('path', {d: `M${OX} 148l-4 -8h8Z`, fill: '#22262a'}),
  )
  const xText = svg('text', {x: 133, y: -134, class: 'angle-label'})
  xText.textContent = 'x'
  const yText = svg('text', {x: OX + 8, y: 156, class: 'angle-label'})
  yText.textContent = 'y'
  add(board, xText, yText)
  group.append(board)
  // 频闪红点 + 红色轨迹细线(逐批点亮, 等Δx / Δy 1:3:5:7 递增)
  const dots = []
  for (let k = 1; k <= 5; k += 1) {
    if (!state[`dot_${k}`]) continue
    const px = OX + (still ? 0 : (k - 1) * dx)
    const py = OY + (k - 1) * (k - 1) * step
    dots.push([px, py])
  }
  if (dots.length) {
    const d = dots.map(([px, py], index) => `${index ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('')
    group.append(svg('path', {d, fill: 'none', stroke: '#d04030', 'stroke-width': 1.3, opacity: 0.7}))
    dots.forEach(([px, py]) => group.append(svg('circle', {cx: px.toFixed(1), cy: py.toFixed(1), r: 4.5, fill: '#d04030', stroke: '#8f2417', 'stroke-width': 1})))
  }
  // 终点蓝球(frame-019; 钢球落回漏斗后点亮)
  if (context.world?.['ball-1']?.landed) {
    const ex = OX + (still ? 0 : 5 * dx)
    const ey = OY + 25 * step
    group.append(
      svg('circle', {cx: ex, cy: ey, r: 9, fill: '#4a6cd4', stroke: '#2c48a0', 'stroke-width': 1.5}),
      svg('circle', {cx: ex - 3, cy: ey - 3, r: 2.4, fill: '#ffffff', opacity: 0.8}),
    )
  }
  group.append(label(entity.label, 0, 192))
  return group
}
