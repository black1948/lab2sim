import {add, label, shadow, svg} from './svg.js'

//  -  电磁打点计时器 - 复写纸圆盘变体(120-用打点计时器演示匀速直线运动: 4Hz 电磁打点
//      计时器, 黑底座平放视角) - 
// 与 physics.ticker-timer.v1(119 案例: 灰色机身立视, 正面小圆孔)观察角度与细节不同, 
// 不得互相顶替: 本片特写(frame-002/004/005/011)是黑色/深色底座平放, 后部铬色线圈圆筒
// 壳+顶面圆钮, 后角两根黑接线柱, 底座中部大复写纸圆盘(深色圆盘+铬色压圈), 白色纸带
// 横穿底座并被铬色 U 形压片夹住, 振动片自线圈壳伸到圆盘上方.
// 视觉依据: frame-011(28.5s 最清晰特写: 黑底座大顶面, 铬色 U 压片×2 夹白纸带横穿, 
//           深色复写纸圆盘+铬色中心压圈在盘位偏左, 铬色线圈壳在盘后右侧, 奶白色
//           "TICKER TIMER" 标签块在线圈壳后方, 振动片自壳体伸到盘上方); frame-002/004
//           (后角两根黑色蘑菇形接线柱, 机身左侧 C 形夹具把计时器夹在板上 - 夹具属台
//           装夹不属本资产); frame-005(打点态同构图).暗光采样归一化: 底座顶面
//           #232220 族, 正面更暗 #171614, 铬色件 #b9bcbf/#d7d9db 高光, 标签块 #ded9c8.
// 复用审查否决记录: physics.ticker-timer.v1 为 119 案例灰机身立视(正面打点圆孔, 绿色
//           标签, 耳板立式结构), 与本片黑底座平放+外露复写纸圆盘视角/结构不同物, 不得
//           顶替; galvanometer/dry-cell/knife-switch 等亦不同物.变体骨架按构建方契约
//           复用同域 physics.ticker-timer.v1 渲染器源码结构, 无需在线发现.
// 风格依据: physics.ticker-timer.v1.renderer.js 的状态契约写法(powered 指示点变红, 
//           stamping 振动片 ±4° 双残影 opacity 0.5/0.3 叠印, 纸带限位孔 ±14/-34 锚点), 
//           physics.ticker-board.v1.renderer.js 的平放体块+接地阴影, 铬色件高光画法取
//           physics.magnetic-cart-right.v1.renderer.js 的金属高光条.
// 锚点: 局部 (0,0)=底座中心(顶面中点, 贴板面).顶面 x∈[-78,78], y∈[-50,12], 正面
//           y∈[12,20], 总深约 70px.
// 纸带通道: 顶面中部留通槽(y∈[-37,-31], 槽底透空), 纸带(paper-tape 渲染器, z 低于
//           本件)从槽中穿过可见; 两端铬色 U 形压片画在槽上, 槽孔锚点=局部 (±14,-34)
//            - 沿 119 physics/paper-tape.v1 的 slot_dx=14/slot_dy=-34 契约偏移, +侧=近
//           车侧, 另一孔镜像.
// 状态契约(与 119 一致; scene visual.state_bindings 已声明 powered→power.on, 
//           stamping→reed.active, 渲染器直接读 state.powered / state.stamping): 
//   state.powered=true → 机身上小指示点变红 #c93030 + 小拨钮滑到通位; 
//   state.stamping=true → 振动片画 ±4° 两位置残影(绕枢轴两片, opacity 0.5/0.3 交替
//           叠印, 静态示意 50Hz 打点, 不新增 CSS 动画/class).
// 契约参数: 无外部参数.
// 证据不清处: ① 线圈壳顶圆钮的具体形制(frame-011 为铬色小圆台)按小圆台补形; ② 白色
//           标签块上文字仅 "TICKER TIMER" 部分可辨, 按此印制(字号缩小不必可读); 
//           ③ 复写纸盘面纹理不可辨, 按深色圆盘+铬色压圈示意; ④ 机身左侧 C 形夹具属
//           台装夹, 不画入本资产.
// 导出签名与模板一致: renderTickerTimerDisc(entity, state, context).
// 集成: renderer 键 physics/ticker-timer-disc(index.js 的 import/注册由构建方完成: 复制
//           本文件到 src/renderers/ 并在 index.js 注册 'physics/ticker-timer-disc').

const BASE = '#232220'       // 底座顶面(frame-011 暗光采样归一化)
const BASE_FRONT = '#171614' // 底座正面(更暗)
const BASE_EDGE = '#0f0e0d'  // 描边
const SHEEN = '#2e2c29'      // 顶面反光带
const CHROME = '#b9bcbf'     // 铬色主体
const CHROME_LIT = '#d7d9db' // 铬色高光
const CHROME_DARK = '#8f9296'// 铬色暗部
const CHROME_EDGE = '#6f7276'
const LABEL_CREAM = '#ded9c8'// 标签块奶白
const LABEL_EDGE = '#8f8a78'
const DISC = '#2b2a28'       // 复写纸盘(深色)
const DISC_EDGE = '#141312'
const POST = '#26262a'       // 黑接线柱
const RED = '#c93030'        // 通电指示(与 119 同族)
const REED = '#a7aaad'       // 振动片(铬色薄簧片)

export function renderTickerTimerDisc(entity, state = {}, context = {}) {
  const group = svg('g')
  const powered = Boolean(state.powered)
  const stamping = Boolean(state.stamping)
  // 接地阴影(平放贴板)
  group.append(shadow(0, 16, 82, 6))
  // 底座正面(下沿厚度)+ 顶面前带(通道前方) - 通道槽留空, 纸带(z 较低)从中可见
  add(group,
    svg('rect', {x: -78, y: 12, width: 156, height: 8, rx: 2, fill: BASE_FRONT, stroke: BASE_EDGE, 'stroke-width': 1.4}),
    svg('rect', {x: -78, y: -31, width: 156, height: 43, rx: 3, fill: BASE, stroke: BASE_EDGE, 'stroke-width': 1.6}),
    // 顶面反光带(frame-011 前缘高光)
    svg('rect', {x: -72, y: 4, width: 138, height: 5, rx: 2, fill: SHEEN, opacity: 0.9}),
  )
  //  -  顶面后带(通道后方, y ≤ -37): 接线柱 / 标签块 / 线圈壳  - 
  // 后角两根黑色蘑菇形接线柱(frame-002/004)
  for (const px of [-72, 72]) {
    add(group,
      svg('rect', {x: px - 2.4, y: -46, width: 4.8, height: 7, rx: 1, fill: '#3a3a3e', stroke: BASE_EDGE, 'stroke-width': 0.9}),
      svg('circle', {cx: px, cy: -46, r: 4.6, fill: POST, stroke: BASE_EDGE, 'stroke-width': 1}),
      svg('path', {d: `M${px - 2.6} -47.4A2.6 2.6 0 0 1 ${px + 2.6} -47.4`, fill: 'none', stroke: '#4d4d52', 'stroke-width': 1, opacity: 0.9}),
    )
  }
  // 奶白标签块(frame-011 后部 TICKER TIMER)
  add(group,
    svg('rect', {x: 18, y: -50, width: 52, height: 13, rx: 2, fill: LABEL_CREAM, stroke: LABEL_EDGE, 'stroke-width': 1.2}),
    svg('rect', {x: 18, y: -50, width: 52, height: 3.4, rx: 1.6, fill: '#efe9d8', opacity: 0.9}),
  )
  const brand = svg('text', {x: 44, y: -41.2, 'text-anchor': 'middle', fill: '#6f6a58', 'font-size': 4.4, 'letter-spacing': 0.5})
  brand.textContent = 'TICKER TIMER'
  group.append(brand)
  // 铬色线圈圆筒壳(后左, 横置圆柱)+ 顶面圆钮(frame-011)
  add(group,
    svg('rect', {x: -72, y: -50, width: 58, height: 13.5, rx: 6.5, fill: CHROME, stroke: CHROME_EDGE, 'stroke-width': 1.3}),
    svg('rect', {x: -72, y: -42.5, width: 58, height: 6, rx: 3, fill: CHROME_DARK, opacity: 0.75}),
    svg('rect', {x: -68, y: -49, width: 46, height: 3, rx: 1.5, fill: CHROME_LIT, opacity: 0.95}),
    // 顶面圆钮
    svg('ellipse', {cx: -43, cy: -49.5, rx: 6.5, ry: 2.6, fill: CHROME_LIT, stroke: CHROME_EDGE, 'stroke-width': 1.1}),
    svg('ellipse', {cx: -43, cy: -50.2, rx: 3.4, ry: 1.3, fill: CHROME, stroke: CHROME_EDGE, 'stroke-width': 0.7}),
  )
  //  -  顶面前带: 复写纸圆盘(深色盘+铬色压圈, frame-011 中部偏左) - 
  add(group,
    svg('circle', {cx: -24, cy: -8, r: 14, fill: DISC, stroke: DISC_EDGE, 'stroke-width': 1.4}),
    svg('circle', {cx: -24, cy: -8, r: 11.5, fill: 'none', stroke: '#1c1b19', 'stroke-width': 1.2, opacity: 0.9}),
    svg('circle', {cx: -24, cy: -8, r: 5.2, fill: CHROME, stroke: CHROME_EDGE, 'stroke-width': 1.1}),
    svg('circle', {cx: -24, cy: -8, r: 1.5, fill: CHROME_DARK}),
    // 盘面斜光(frame-011 盘面左上弱反光)
    svg('path', {d: 'M-34 -16A11.5 11.5 0 0 1 -14 -15', fill: 'none', stroke: '#3c3a36', 'stroke-width': 1.4, opacity: 0.8}),
  )
  // 前带右侧小拨钮 + 通电指示点(powered 变红, 与 119 同族语义)
  add(group,
    svg('rect', {x: 46, y: -27, width: 16, height: 10, rx: 2, fill: '#2e2c29', stroke: BASE_EDGE, 'stroke-width': 1}),
    svg('rect', {x: powered ? 56 : 48, y: -25, width: 5, height: 6, rx: 1, fill: '#cfc9b8', stroke: BASE_EDGE, 'stroke-width': 0.7}),
  )
  group.append(svg('circle', {cx: 38, cy: -22, r: 2.4, fill: powered ? RED : '#3a3a38', stroke: BASE_EDGE, 'stroke-width': 0.9}))
  //  -  纸带通道: 槽内底色 + 两端铬色 U 形压片(槽孔锚点 (±14,-34)) - 
  group.append(svg('rect', {x: -78, y: -37, width: 156, height: 6, fill: '#141312', opacity: 0.85}))
  for (const side of [-1, 1]) {
    const cx = side * 14
    add(group,
      svg('path', {d: `M${cx - 6} -38L${cx - 6} -29.5Q${cx - 6} -27.5 ${cx - 4} -27.5L${cx + 4} -27.5Q${cx + 6} -27.5 ${cx + 6} -29.5L${cx + 6} -38`, fill: 'none', stroke: CHROME, 'stroke-width': 2.4}),
      svg('path', {d: `M${cx - 6} -38L${cx - 6} -29.5Q${cx - 6} -27.5 ${cx - 4} -27.5L${cx + 4} -27.5Q${cx + 6} -27.5 ${cx + 6} -29.5L${cx + 6} -38`, fill: 'none', stroke: CHROME_LIT, 'stroke-width': 0.9, opacity: 0.9, transform: 'translate(-0.6 0)'}),
    )
  }
  //  -  振动片: 枢轴在线圈壳右前缘(-14,-40), 静止单片伸到盘上方; stamping 时 ±4° 双残影
  //(opacity 0.5/0.3 交替叠印示意 50Hz 打点, 不新增 CSS 动画, 119 ticker-timer 写法) - 
  const reedLine = (angle, opacity) => {
    const holder = svg('g', {transform: `translate(-14 -40) rotate(${angle})`})
    holder.append(svg('line', {x1: 0, y1: 0, x2: -10, y2: 42, stroke: REED, 'stroke-width': 3.2, 'stroke-linecap': 'round', opacity}))
    holder.append(svg('rect', {x: -13.2, y: 39.7, width: 6.4, height: 4.6, rx: 1.4, fill: '#3a3a38', opacity}))
    return holder
  }
  if (stamping) {
    group.append(reedLine(-4, 0.5), reedLine(4, 0.3))
  } else {
    group.append(reedLine(2, 0.92))
  }
  group.append(label(entity.label, 0, 34))
  return group
}
