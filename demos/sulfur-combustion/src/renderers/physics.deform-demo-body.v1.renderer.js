import {add, label, shadow, svg} from './svg.js'

//  -  形变演示器主机(kind=deformation_demonstrator, 116-用形变演示器演示形变产生弹力)
//      [2026-09-20 构建方复核证据后全量重画]自站立桌架式演示器, 无柜体, 无圆表盘  - 
//      frame-021/025 实证: 浅灰桌架 + 白色背板 + 导孔座 + 黑色连杆拨杆机构 + 长红箭头
//      指针沿对角刻度梯读数(指针静止近水平指左, 挂码/手拉后尖端沿弧上翘小幅偏转).
// 视觉依据: frame-021/025 单帧原图; 全程指针角重测 rest≈1.6°, 挂码/手拉≈5.3°, 
//           刻度梯 1.3°..21°.frame-021 低照度采样背板 (218,214,203)→象牙白 #ece9df, 
//           桌架浅灰 (214,217,221)→#d7dade, 刻度/指针红 (155,42,34)→域红族 #c23a2a/#8f2a22.
// 风格依据: physics.js renderSpringScale 的指针/刻度画法, renderWallBracket/renderWeight
//           的金属件与体块画法 + apparatus-shadow 接地阴影; 配色 inline 不新增 class.
// 局部原点 = 桌脚落地底线中点((0,0), +y 向下); 整机宽 236 高 332.
// 几何: 两桌腿 x±(72..95) y -96..0(#d7dade+暗缘)→ 桌板 x±118 y -112..-96(顶面
//       #e6e8ec/前缘 #c6cad1)→ 白色背板 x±112 y -332..-112(#ece9df 细边框 #b9b4a8); 
//       导孔座 x±9 y -126..-112(桌板上深色金属块, 顶面孔口暗椭圆: 演示杆穿此悬挂); 
//       黑色连杆拨杆机构: 铰接圆头 (0,-168) r7(#b9bfc6)→ 水平黑杆 7px 厚 #1d1f22 右行至
//       (78,-168) → 右端竖支架上行至支点盘 (76,-208) r6.5.
// 长红箭头指针: 基向 -x(向左指), 总长 128(杆至 r98 + 箭头头部 30x16 至 tip r128), 
//       尾部 10px 配重, 红 #c23a2a; 方向角 = rest_slope_deg + deflection_deg, 
//       SVG rotate 原点=支点(rotate 正角=顺时针=指尖上翘, 与 frame 一致).
// 对角刻度梯: 11 个红刻度(k=0..10, 角度 = rest_slope_deg + k*deg_per_unit/2, 画在
//       半径 130 处, 长 16 垂直于半径方向, 宽 3.4), "0" 标注在 k=0 刻度外侧(r146).
// 指针角状态推导(任务契约公式, 渲染器内实现并导出 pointerDeflectionDeg 供验证): 
//   REST_Y = 0.45(常量, 与 IR loading-rod 悬挂位 y=0.45 对应)
//   pull_disp = max(0, REST_Y - world[rod_ref].y)        // 杆被下拉量(scene 单位)
//   load      = world[weight_ref].attached_to === rod_ref ? load_deg : 0
//   deflection_deg = min(max_units*deg_per_unit, pull_gain_deg_per_unit*pull_disp + load)
//   方向角      = rest_slope_deg + deflection_deg
//   全部参数读 visual.pointer(IR/scene 下发; 缺省回退构建方标定值 rest_slope_deg=1.3 /
//   deg_per_unit=3.94 / max_units=5 / pull_gain_deg_per_unit=78.8(满程 25px=1.0 格)/
//   load_deg=3.94(挂码=1.0 格, 力等效)); rod_ref/weight_ref 可覆盖, 缺省
//   'loading-rod'/'weight-1'.
// 与 IR anchors 配合: 本机 snap_anchor pull=(0,-0.28) → 杆顶下拉吸附点=本机位+(0,-140px
//   本机局部), 即杆顶 home -165 拉满至 -140(桌板顶 -112 之上 28px, 不穿桌; pull_disp=
//   0.05=25px=1.0 格).杆顶 home -165 ≈ 铰接圆头 -168(静止时杆顶没入圆头); 
//   拉满后杆顶与圆头间距 21px(连杆随动未建模, 属简化, 见 design_notes).
// 导出签名与模板一致: renderDeformDemoBody(entity, state, context).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/deform-demo-body'
//   (import {renderDeformDemoBody} from './physics.deform-demo-body.v1.renderer.js').

const REST_Y = 0.45 // 与 IR loading-rod 悬挂位(position/initial y=0.45)对应
const PIVOT = {x: 76, y: -208}   // 支点盘(指针旋转中心)
const TICK_R = 130               // 刻度所在半径
const TICK_HALF = 8              // 刻度半长(总长 16, 垂直于半径方向)
const NEEDLE_TIP_R = 128         // 指针总长(杆至 r98 + 箭头头部 30 至 tip)
const RED = {main: '#c23a2a', deep: '#8f2a22', edge: '#7a1f16'}
const DARK_METAL = {fill: '#33393f', edge: '#4a525a', stroke: '#14181c'}

function pointerParams(entity, context) {
  const visual = (context && context.visual) || entity.visual || {}
  const p = (visual.pointer && typeof visual.pointer === 'object') ? visual.pointer : {}
  return {
    restSlope: Number(p.rest_slope_deg ?? 1.3),
    degPerUnit: Number(p.deg_per_unit ?? 3.94),
    maxUnits: Number(p.max_units ?? 5),
    gain: Number(p.pull_gain_deg_per_unit ?? 78.8),
    loadDeg: Number(p.load_deg ?? 3.94),
    rodRef: typeof p.rod_ref === 'string' && p.rod_ref ? p.rod_ref : 'loading-rod',
    weightRef: typeof p.weight_ref === 'string' && p.weight_ref ? p.weight_ref : 'weight-1',
  }
}

// 指针方向角(度)= rest_slope_deg + deflection_deg(由杆下拉量与是否挂码推导, 契约公式)
export function pointerDeflectionDeg(entity, state = {}, context = {}) {
  const world = context.world || {}
  const p = pointerParams(entity, context)
  const rodY = Number(world[p.rodRef]?.y ?? REST_Y)
  const pullDisp = Math.max(0, REST_Y - rodY)
  const load = world[p.weightRef]?.attached_to === p.rodRef ? p.loadDeg : 0
  const deflection = Math.min(p.maxUnits * p.degPerUnit, p.gain * pullDisp + load)
  return p.restSlope + deflection
}

// 对角刻度梯: k=0..10, 角度 = rest_slope + k*deg_per_unit/2, 画在半径 130, 长 16, 
// 垂直于半径方向; "0" 标注在 k=0 刻度外侧(半径 146)
function scaleLadder(entity, context) {
  const p = pointerParams(entity, context)
  const g = svg('g')
  const count = Math.round(p.maxUnits * 2)
  for (let k = 0; k <= count; k += 1) {
    const a = (p.restSlope + (k * p.degPerUnit) / 2) * Math.PI / 180
    const cx = PIVOT.x - TICK_R * Math.cos(a)
    const cy = PIVOT.y - TICK_R * Math.sin(a)
    const px = -Math.sin(a)
    const py = Math.cos(a)
    g.append(svg('line', {
      x1: (cx - TICK_HALF * px).toFixed(2), y1: (cy - TICK_HALF * py).toFixed(2),
      x2: (cx + TICK_HALF * px).toFixed(2), y2: (cy + TICK_HALF * py).toFixed(2),
      stroke: RED.main, 'stroke-width': 3.4, 'stroke-linecap': 'round',
    }))
  }
  const a0 = p.restSlope * Math.PI / 180
  const zero = svg('text', {
    x: (PIVOT.x - (TICK_R + 16) * Math.cos(a0)).toFixed(2), y: (PIVOT.y - (TICK_R + 16) * Math.sin(a0) + 2.5).toFixed(2),
    'text-anchor': 'middle', 'font-size': 7.5, 'font-weight': 650, fill: RED.deep,
  })
  zero.textContent = '0'
  g.append(zero)
  return g
}

// 长红箭头指针(基向 -x): 尾部配重 10px + 杆(至 r98)+ 箭头头部 30x16(tip r128); 
// 组内 SVG rotate(方向角) 原点=支点
function needle(entity, context) {
  const deg = pointerDeflectionDeg(entity, {}, context || {})
  const g = svg('g', {transform: `rotate(${deg.toFixed(2)} ${PIVOT.x} ${PIVOT.y})`})
  const tailX = PIVOT.x + 10
  const shaftEndX = PIVOT.x - (NEEDLE_TIP_R - 30)
  const tipX = PIVOT.x - NEEDLE_TIP_R
  g.append(svg('rect', {x: PIVOT.x, y: PIVOT.y - 3, width: 10, height: 6, rx: 1.5, fill: RED.deep}))
  g.append(svg('rect', {x: shaftEndX, y: PIVOT.y - 2.6, width: shaftEndX < tailX ? tailX - shaftEndX : 0, height: 5.2, fill: RED.main}))
  g.append(svg('path', {
    d: `M${shaftEndX} ${PIVOT.y - 8}L${shaftEndX} ${PIVOT.y + 8}L${tipX} ${PIVOT.y}Z`,
    fill: RED.main, stroke: RED.edge, 'stroke-width': .8, 'stroke-linejoin': 'round',
  }))
  return g
}

export function renderDeformDemoBody(entity, state = {}, context = {}) {
  const group = svg('g')
  add(group,
    // 落地阴影(宽椭圆 + 两桌脚局部加深)
    shadow(0, 2, 118, 6),
    shadow(-83.5, 1.2, 15, 3.6),
    shadow(83.5, 1.2, 15, 3.6),
    // 两桌腿(x±(72..95), y -96..0, 浅灰 + 右侧暗缘)
    svg('rect', {x: -95, y: -96, width: 23, height: 96, fill: '#d7dade', stroke: '#8f959d', 'stroke-width': 1.4}),
    svg('rect', {x: -78, y: -96, width: 6, height: 96, fill: '#b3b9c1', opacity: .8}),
    svg('rect', {x: 72, y: -96, width: 23, height: 96, fill: '#d7dade', stroke: '#8f959d', 'stroke-width': 1.4}),
    svg('rect', {x: 89, y: -96, width: 6, height: 96, fill: '#b3b9c1', opacity: .8}),
    // 白色背板(x±112, y -332..-112, 象牙白 + 细边框, frame-021 采样色)
    svg('rect', {x: -112, y: -332, width: 224, height: 220, fill: '#ece9df', stroke: '#b9b4a8', 'stroke-width': 1.6}),
    // 桌板(x±118, y -112..-96: 前缘 #c6cad1 + 顶面受光条 #e6e8ec)
    svg('rect', {x: -118, y: -112, width: 236, height: 16, fill: '#c6cad1', stroke: '#9aa0a8', 'stroke-width': 1.4}),
    svg('rect', {x: -118, y: -112, width: 236, height: 5, fill: '#e6e8ec'}),
    // 导孔座(桌板上 x±9, y -126..-112 深色金属块 + 顶面孔口暗椭圆: 演示杆穿此悬挂)
    svg('rect', {x: -9, y: -126, width: 18, height: 14, fill: DARK_METAL.fill, stroke: DARK_METAL.stroke, 'stroke-width': 1.6}),
    svg('ellipse', {cx: 0, cy: -126, rx: 6.5, ry: 2.3, fill: DARK_METAL.stroke}),
    svg('ellipse', {cx: 0, cy: -126, rx: 3.2, ry: 1.1, fill: '#2e353a'}),
    // 黑色连杆拨杆机构: 水平黑杆(7px 厚)右行 + 右端竖支架上行至支点盘
    svg('rect', {x: 0, y: -171.5, width: 78, height: 7, fill: '#1d1f22'}),
    svg('path', {d: `M72 -164.5L80 -164.5L79 -204L73 -204Z`, fill: '#1d1f22'}),
    // 铰接圆头(杆顶 home -165 没入此圆头)与支点盘(金属)
    svg('circle', {cx: 0, cy: -168, r: 7, fill: '#b9bfc6', stroke: '#5b6a6d', 'stroke-width': 1.6}),
    svg('circle', {cx: -2.2, cy: -170.2, r: 1.8, fill: '#dde2e7', opacity: .9}),
  )
  // 刻度梯与指针(指针画在支点盘之下, 支点盘最后盖上)
  group.append(scaleLadder(entity, context))
  group.append(needle(entity, context))
  group.append(svg('circle', {cx: PIVOT.x, cy: PIVOT.y, r: 6.5, fill: '#b9bfc6', stroke: '#5b6a6d', 'stroke-width': 1.6}))
  group.append(svg('circle', {cx: PIVOT.x, cy: PIVOT.y, r: 2.2, fill: '#5b6a6d'}))
  group.append(label(entity.label, 0, 20))
  return group
}
