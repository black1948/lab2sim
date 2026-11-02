import {add, label, shadow, svg} from './svg.js'

//  -  打点小车 - 匀速变体(120-用打点计时器演示匀速直线运动: 深炭色低矮滑块, 匀速直线) - 
// 视觉依据: frame-006(17.5s 释放前停板左端), frame-009/012/014(23.5-33.3s 板上向右
//           匀速滑行: 深炭色低矮矩形滑块压在板面上, 暗光采样车身 #3c3f44 族).外形与
//           119 案例同族, 车身/轮子/接地阴影分层画法直接沿用
//           physics.ticker-cart.v1.renderer.js.
// 复用审查否决记录: physics.ticker-cart.v1(119)外形可复用但其滑跑映射是匀加速平方律
//           (s_px = release + span - p²), 与本片匀速直线运动(位移-时间线性律)矛盾, 
//           不得直接复用条目 - 按构建方契约生成线性映射变体; physics.cart.v1(24 案例
//           红壳双轮小车), magnetic-cart-left/right(106 银色磁铁车)亦不同物.
// 风格依据: physics.ticker-cart.v1.renderer.js 的车身分层+先轮后车身层序+2.5D 顶面斜折/
//           白高光/远近侧车轮画法(逐层沿用); 接地阴影同域约定.配色 inline, 不新增
//           styles.css class.
// 锚点: 局部 (0,0)=车轮接触线中点(落地线).车身 64×18(x∈[-32,32], y∈[-26,-8]), 总高
//           约 26px 含轮.
// 滑跑状态(匀速契约重点, 与 physics/paper-tape-uniform.v1, physics/ticker-drive-string.v1
//           的映射公式逐字一致, 三处必须同步修改): 
//   state.above === 'board-1' 时一律按映射定位: 
//     p    = clamp01(Number(state.run_progress ?? 0))    -  context.preview 时强制 0
//            (库房缩略图冻结在静止位, case-24 renderCart 先例)
//     s_px = release_offset_px + run_span_px  -  p         -  匀速位移-时间线性律(引擎对
//            run_progress 线性插值, 渲染端不再取平方; 不得用 p²)
//     屏幕位置 = 板顶端板面点 + (cosθ,+sinθ) - s_px; 板几何从 context.world['board-1'] 实时
//     位置 + 板 properties(length_px 缺省 620, angle_deg 缺省 0=本片水平板, 
//     thickness_px=12 仅记录不参与映射)推导, 屏幕系 x=board.x*1000, y=560-board.y*500.
//   state.above !== 'board-1'(在家/被拖动)→ 画在自身 world 位置.
//   缺省: release_offset_px=110, run_span_px=470(终点 580, 板长 620 留 40px 端部余量给
//   板端滑轮; 构建方 IR visual 已带同名参数).
// 车身朝向: 不随板旋转(水平板; 平绘 2.5D 先例).
// 契约参数(context.visual, 全带缺省): release_offset_px=110, run_span_px=470, 
//           board_length_px=620, board_angle_deg=0.
// 证据不清处: ① 车轮在帧内几乎不可辨(车底阴影里), 沿用 119"前后各 2, 远侧半遮"示意; 
//           ② 车尾系绳柱被纸带遮挡, 依纸带/细绳走向补形为左侧小柱+环(系点同 119
//           paper-tape tail 契约).
// 导出签名与模板一致: renderTickerCartUniform(entity, state, context).
// 集成: renderer 键 physics/ticker-cart-uniform(index.js 的 import/注册由构建方完成: 
//           复制本文件到 src/renderers/ 并在 index.js 注册 'physics/ticker-cart-uniform').

const BODY = '#3c3f44'      // 车身(frame-009/012 暗光采样, 同 119 车族)
const BODY_TOP = '#565a60'  // 车顶受光条
const EDGE = '#1e2023'      // 描边
const WHEEL_FAR = '#232527' // 远侧轮(半遮)
const WHEEL = '#2c2e32'     // 近侧轮
const HUB = '#565a60'       // 轮毂
const METAL = '#7d8288'     // 系绳柱

//  -  板面基准与滑跑映射(physics/paper-tape-uniform.v1, physics/ticker-drive-string.v1
//    内有逐字相同的副本, 改一处必须同步另两处) - 
function boardBasis(world, visual) {
  const board = (world && world['board-1']) || {}
  const props = board.properties || {}
  const origin = {x: Number(board.x ?? 0.18) * 1000, y: 560 - Number(board.y ?? 0.42) * 500}
  const lengthPx = Number(visual.board_length_px ?? props.length_px ?? 620)
  const rad = (Number(visual.board_angle_deg ?? props.angle_deg ?? 0) * Math.PI) / 180
  return {origin, lengthPx, ux: Math.cos(rad), uy: Math.sin(rad)}
}

// 小车有效渲染位: above/run_progress 取小车自身 state(契约), 板几何取 world['board-1'].
// paper-tape-uniform / ticker-drive-string 为绳带端拷贝了同一映射(那边 above/run_progress
// 取 world[cart_ref], 运行时 world['cart-1'] 即小车 state, 两式等价); 改公式/缺省必须同步.
function cartRunScreen(world, visual, runState, preview) {
  if ((runState && runState.above) !== 'board-1') return null
  const basis = boardBasis(world, visual)
  const p = preview ? 0 : Math.max(0, Math.min(1, Number(runState.run_progress ?? 0)))
  const s = Number(visual.release_offset_px ?? 110) + Number(visual.run_span_px ?? 470) * p
  return {x: basis.origin.x + basis.ux * s, y: basis.origin.y + basis.uy * s}
}

export function renderTickerCartUniform(entity, state = {}, context = {}) {
  const group = svg('g')
  const visual = context.visual || {}
  const world = context.world || {}
  // 自身屏幕位(world 缺失时回退 visual.transform / 缺省位)
  let self = null
  const item = world[entity?.id]
  if (item) self = {x: Number(item.x ?? 0.3) * 1000, y: 560 - Number(item.y ?? 0.435) * 500}
  if (!self) {
    const t = entity?.visual?.transform || visual.transform || {}
    self = {x: Number(t.x ?? 0.5) * 1000, y: 560 - Number(t.y ?? 0.435) * 500}
  }
  // 滑跑映射: 吸附在板上时按线性律沿板面定位, 否则画在自身位(offset=0)
  let offsetX = 0
  let offsetY = 0
  const anchor = context.preview ? null : cartRunScreen(world, visual, state, Boolean(context.preview))
  if (anchor) {
    offsetX = anchor.x - self.x
    offsetY = anchor.y - self.y
  }
  const body = svg('g', (offsetX || offsetY) ? {transform: `translate(${offsetX.toFixed(1)} ${offsetY.toFixed(1)})`} : {})
  add(body,
    shadow(0, 2.5, 34, 4),
    // 远侧轮(前后各 2, 半遮)
    svg('circle', {cx: -13, cy: -8.6, r: 5.4, fill: WHEEL_FAR}),
    svg('circle', {cx: 13, cy: -8.6, r: 5.4, fill: WHEEL_FAR}),
    // 车身(64×18)
    svg('rect', {x: -32, y: -26, width: 64, height: 18, rx: 2.5, fill: BODY, stroke: EDGE, 'stroke-width': 1.6}),
    // 2.5D 车顶受光斜折 + 白高光
    svg('path', {d: 'M-32 -26L-26 -31L26 -31L32 -26Z', fill: BODY_TOP, stroke: EDGE, 'stroke-width': 1.2, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -22, y1: -29.4, x2: 22, y2: -29.4, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
    // 右侧背光暗部
    svg('rect', {x: 22, y: -26, width: 10, height: 18, rx: 2, fill: '#2e2e2d', opacity: 0.22}),
    // 尾部系绳柱(左侧=车尾, 纸带/细绳系点)
    svg('line', {x1: -32, y1: -18, x2: -40, y2: -18, stroke: METAL, 'stroke-width': 2.6, 'stroke-linecap': 'round'}),
    svg('circle', {cx: -41.5, cy: -18, r: 2.6, fill: 'none', stroke: METAL, 'stroke-width': 1.6}),
    // 近侧轮
    svg('circle', {cx: -19, cy: -6, r: 6, fill: WHEEL, stroke: EDGE, 'stroke-width': 1.2}),
    svg('circle', {cx: 19, cy: -6, r: 6, fill: WHEEL, stroke: EDGE, 'stroke-width': 1.2}),
    svg('circle', {cx: -19, cy: -6, r: 2, fill: HUB}),
    svg('circle', {cx: 19, cy: -6, r: 2, fill: HUB}),
  )
  body.append(label(entity.label, 0, 16))
  group.append(body)
  return group
}
