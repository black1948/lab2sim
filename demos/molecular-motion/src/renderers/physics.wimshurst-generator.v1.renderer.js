import {add, shadow, svg} from './svg.js'

//  -  感应起电机(韦氏起电机, kind=electrostatic_generator) - 
// 证据帧: frame-005/006(全景: 蓝色板式底座 + 左右两只莱顿瓶(银筒+白盖+蓝座杯)+ 墨绿
//          中央 A 形立柱 + 两片对转透明圆盘(盘缘一圈放射状金属扇形片)+ 斜杆顶端两颗
//          铬/黄铜放电球 + 白色绝缘手柄 + 传动带与带轮); frame-007/032(摇柄与带轮近景, 
//          讲师摇动时人手在机后).
// 复用否决理由: 四域注册表无 generator/dynamo 类条目; physics.metronome(梯形盒体节拍器), 
//          physics.test-table(试验台)形状语义均不符; 可信源发现命中 barrettotte/wimshurst-machine
//          仓库但无评分通过的矢量文件(discover_apparatus.py "no scored vector file matched", 
//          trace assets/discover-electrostatic_generator), 故代码原生生成.
// 风格基础: physics.js 既有 code-native 画法 - renderWallBracket/renderPulley 的金属件
//          (class metal/metal-bracket/screw), renderConvexLens 的玻璃透明填充, 
//          physics.demo-track.v1/renderer 通用约定: apparatus-shadow 接地阴影 + 白高光线 +
//          内联配色不新增 styles.css class.配色取帧采样低照度归一化: 底座蓝 (48,65,117)
//          → #2e56a8/#1d3a78(与 horseshoe-magnet 蓝同族), 立柱绿 (84,102,88) → #4e6b52, 
//          莱顿瓶银筒 (172,184,180) → class metal, 扇形片 (96,96,84) → #55524a, 放电球铬色
//          → #c9cfd5(先例 physics.pendulum-bob 钢球配色).
// 状态语义: state.charge ∈ 0..1 → 两盘对转角 ±charge - 80°(前盘 +, 后盘 −, 扇形片随之转动); 
//          charge ≥ 1 → 两放电球间画微弱电弧(3 段折线, 坐标确定性推导)+ 淡蓝辉光晕.
//          缺省 charge=0(静止盘 + 无电弧).
// 关键尺寸(局部原点=底座底面中心=台面接触点, y 向下为正, 本体向 −y 生长): 
//   蓝色底座 x∈[-88,88], y∈[-12,0]; 莱顿瓶中心 x=±60(筒身 y∈[-84,-20], 白盖 y∈[-98,-84], 
//   蓝座杯 y∈[-20,-12], 盖顶接线端子 y≈-100); 墨绿立柱 x∈[-9,9], y∈[-108,-8], 摇柄轴座
//   (0,-30); 两盘圆心 (0,-104), 半径 56(前/后两片, 各 14 条扇形片, 环带 r 34..52); 放电球
//   r=7 于 (±26,-154)(绝缘手柄自枢轴 (±14,-110) 指向外下方 (±40,-92)); 传动带轮 (14,-26)
//   r=10.总高约 168px(放电球顶 -161)落在台面立式器材 100~170 约定内.IR anchors.terminal
//   声明为实体位 + (0.105,-0.03)(局部约 +105px/+15px 屏幕系), 落在右放电球/右莱顿瓶外侧
//    - 渲染器不读 anchors, 接线由场景处理, 请构建方核对落位与放电球间距.
// 证据不清处: 扇形片数量在原始分辨率不可逐一计数(目测 16~20, 取 14 等分示意); 摇柄本体
//   由独立实体 physics.crank-handle.v1 渲染(IR crank-handle), 本渲染器只画轴座不画柄; 
//   电弧为 IR 状态语义要求的示意(原视频放电球间未见持续电弧).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/wimshurst-generator'
//   (import {renderWimshurstGenerator} from './physics.wimshurst-generator.v1.renderer.js').

const BASE_BLUE = '#2e56a8'        // 底座蓝(frame-005 采样归一化)
const BASE_BLUE_EDGE = '#1d3a78'
const BASE_BLUE_TOP = '#3f6ac2'
const COLUMN_GREEN = '#4e6b52'     // 立柱墨绿(frame-005 采样归一化)
const COLUMN_GREEN_EDGE = '#2f4a3c'
const SECTOR = '#55524a'           // 盘面金属扇形片
const DISC_FILL = 'rgb(221 245 249 / 20%)'
const DISC_RIM = '#b9c2c7'
const BALL_FILL = '#c9cfd5'        // 放电球铬色(pendulum-bob 钢球族)
const BALL_EDGE = '#5a626a'
const CAP_WHITE = '#ecebe3'        // 莱顿瓶白盖/绝缘手柄
const CAP_EDGE = '#b9b3a4'
const SECTORS = 14                 // 每盘扇形片数(目测 16~20, 等分示意)
const MAX_SPIN_DEG = 80            // charge=1 时两盘各转过的角度

function discSectors(offsetDeg) {
  // 单盘的放射状金属扇形片(环带 r 34..52), offsetDeg 供前后盘错位
  const group = svg('g')
  for (let k = 0; k < SECTORS; k += 1) {
    const a = ((360 / SECTORS) * k + offsetDeg) * Math.PI / 180
    const cos = Math.cos(a)
    const sin = Math.sin(a)
    // 扇形片为沿半径放置的窄梯形(内窄外宽), 与 frame-005 盘缘放射条一致
    const w0 = 3.1
    const w1 = 5.4
    const r0 = 34
    const r1 = 52
    const px = -sin
    const py = cos
    const d = [
      `M${(r0 * cos + w0 * px).toFixed(2)} ${(r0 * sin + w0 * py).toFixed(2)}`,
      `L${(r1 * cos + w1 * px).toFixed(2)} ${(r1 * sin + w1 * py).toFixed(2)}`,
      `L${(r1 * cos - w1 * px).toFixed(2)} ${(r1 * sin - w1 * py).toFixed(2)}`,
      `L${(r0 * cos - w0 * px).toFixed(2)} ${(r0 * sin - w0 * py).toFixed(2)}`,
      'Z',
    ].join('')
    group.append(svg('path', {d, fill: SECTOR, opacity: .88}))
  }
  return group
}

function wimshurstDisc(spinDeg, offsetDeg) {
  const group = svg('g', {transform: `rotate(${spinDeg.toFixed(2)} 0 -104)`})
  add(group,
    svg('circle', {cx: 0, cy: -104, r: 56, fill: DISC_FILL, stroke: DISC_RIM, 'stroke-width': 1.6}),
  )
  // 扇形片以盘心 (0,-104) 为圆心(discSectors 生成于原点, 平移到盘心; 
  // 外层 rotate(... 0 -104) 随之绕盘心旋转)
  const sectors = discSectors(offsetDeg)
  sectors.setAttribute('transform', 'translate(0 -104)')
  group.append(sectors)
  return group
}

function dischargeRod(side) {
  // side=-1 左 / +1 右: 斜杆 + 铬放电球 + 白色绝缘手柄(frame-005/032)
  const x = side
  return add(svg('g'),
    svg('line', {x1: 14 * x, y1: -110, x2: 26 * x, y2: -154, stroke: '#8a929a', 'stroke-width': 3, 'stroke-linecap': 'round'}),
    svg('circle', {cx: 26 * x, cy: -154, r: 7, fill: BALL_FILL, stroke: BALL_EDGE, 'stroke-width': 1.6}),
    svg('circle', {cx: 23.5 * x, cy: -156.5, r: 1.9, fill: '#ffffff', opacity: .9}),
    svg('line', {x1: 14 * x, y1: -110, x2: 40 * x, y2: -92, stroke: CAP_WHITE, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: .95}),
    svg('line', {x1: 14 * x, y1: -110, x2: 40 * x, y2: -92, stroke: CAP_EDGE, 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: .6}),
    svg('circle', {cx: 14 * x, cy: -110, r: 2.4, class: 'screw'}),
  )
}

function leydenJar(side) {
  const x = 60 * side
  return add(svg('g'),
    // 银质筒身(莱顿瓶电容体)+ 纵向高光
    svg('rect', {x: x - 12, y: -84, width: 24, height: 64, rx: 2, class: 'metal'}),
    svg('line', {x1: x - 6.5, y1: -80, x2: x - 6.5, y2: -26, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
    // 蓝色座杯(坐进底座)
    svg('rect', {x: x - 13.5, y: -20, width: 27, height: 8, rx: 1.5, fill: BASE_BLUE, stroke: BASE_BLUE_EDGE, 'stroke-width': 1.2}),
    // 白色顶盖 + 接线端子
    svg('rect', {x: x - 14, y: -98, width: 28, height: 14, rx: 2.5, fill: CAP_WHITE, stroke: CAP_EDGE, 'stroke-width': 1.2}),
    svg('circle', {cx: x, cy: -100, r: 3, fill: '#8f959c', stroke: '#5b6a6d', 'stroke-width': 1}),
  )
}

function sparkArc() {
  // charge≥1 的微弱电弧: 两球内侧之间的 3 段折线(坐标确定性推导, 无随机)
  const y = -154
  const d = `M-19 ${y}L-8 ${(y - 3).toFixed(1)}L3 ${(y + 2).toFixed(1)}L19 ${y}`
  return add(svg('g'),
    svg('ellipse', {cx: 0, cy: y, rx: 27, ry: 9, fill: '#9fc0ff', opacity: .16}),
    svg('path', {d, fill: 'none', stroke: '#cfe3ff', 'stroke-width': 1.8, 'stroke-linecap': 'round', opacity: .8}),
    svg('path', {d, fill: 'none', stroke: '#7fa8ff', 'stroke-width': 0.8, 'stroke-linecap': 'round', opacity: .55}),
  )
}

export function renderWimshurstGenerator(entity, state = {}, context = {}) {
  const group = svg('g')
  const charge = Math.max(0, Math.min(1, Number(state.charge || 0)))
  const spin = charge * MAX_SPIN_DEG
  add(group, shadow(0, 3, 92, 7))
  // 蓝色板式底座(frame-005 采样归一化)+ 顶面受光条
  add(group,
    svg('rect', {x: -88, y: -12, width: 176, height: 12, rx: 2.5, fill: BASE_BLUE, stroke: BASE_BLUE_EDGE, 'stroke-width': 1.6}),
    svg('rect', {x: -88, y: -12, width: 176, height: 4, rx: 2, fill: BASE_BLUE_TOP}),
    svg('line', {x1: -80, y1: -10.2, x2: 76, y2: -10.2, stroke: 'rgb(255 255 255 / 30%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
  )
  // 传动带 + 带轮(frame-007/032 摇柄经带轮驱动两盘)
  add(group,
    svg('path', {d: 'M-5 -100Q16 -66 14 -34', fill: 'none', stroke: '#23272b', 'stroke-width': 2.6, opacity: .8}),
    svg('circle', {cx: 14, cy: -26, r: 10, fill: '#2b3134', stroke: '#171b1e', 'stroke-width': 1.4}),
    svg('circle', {cx: 14, cy: -26, r: 2.6, fill: '#4a5257'}),
  )
  // 后盘(反转)→ 立柱 → 前盘(正转): 盘夹柱的遮挡关系
  group.append(wimshurstDisc(-spin, 360 / SECTORS / 2))
  add(group,
    svg('polygon', {points: '-9,-8 9,-8 7,-108 -7,-108', fill: COLUMN_GREEN, stroke: COLUMN_GREEN_EDGE, 'stroke-width': 1.6}),
    svg('line', {x1: -3.5, y1: -14, x2: -2.5, y2: -104, stroke: 'rgb(255 255 255 / 26%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    // 摇柄轴座(crank-handle 实体的对接位, 见 physics.crank-handle.v1)
    svg('circle', {cx: 0, cy: -30, r: 4.5, fill: '#2b3134', stroke: '#171b1e', 'stroke-width': 1.2}),
    svg('circle', {cx: 0, cy: -30, r: 1.5, fill: '#6a747a'}),
  )
  group.append(wimshurstDisc(spin, 0))
  // 盘毂: 两盘共轴金属毂盖在前面
  add(group,
    svg('circle', {cx: 0, cy: -104, r: 7, fill: '#8f959c', stroke: '#5b6a6d', 'stroke-width': 1.6}),
    svg('circle', {cx: 0, cy: -104, r: 2.2, class: 'screw'}),
  )
  add(group, leydenJar(-1), leydenJar(1))
  add(group, dischargeRod(-1), dischargeRod(1))
  if (charge >= 1) group.append(sparkArc())
  return group
}
