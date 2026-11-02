import {add, label, shadow, svg} from './svg.js'

//  -  打点小车(119-用打点计时器测匀加速直线运动: 深炭色低矮四轮滑块) - 
// 视觉依据: frame-005/006(38-39s: 板下端深色矩形滑块压在板面上, 暗光采样车身 #3c3f44
//           族, 低矮宽体, 轮子很小几乎藏于车底); frame-007(36.5s 运动中拖影, 位置沿板
//           面下移); frame-002(释放前停于板顶端附近).
// 复用审查否决记录: physics.cart.v1=24 案例红壳双轮小车(车体随坡旋转, s/v 读数与响声
//           徽标为该案例专用语义), 与本片深炭色四轮滑块形色俱异; magnetic-cart-left/right=
//           106 案例银色车+伸出磁铁条, 亦不同物.均不得顶替.可信源发现命中 twbs/icons
//           battery-low(电池图标), 形状语义无关已回滚.
// 风格依据: physics.js renderCart(case-24)的车身分层+先轮后车身层序与 run_progress 二次
//           映射先例, physics.magnetic-cart-right.v1.renderer.js 的 2.5D 顶面斜折/白高光/
//           远近侧车轮画法, 接地阴影同域约定.配色 inline, 不新增 styles.css class.
// 锚点: 局部 (0,0)=车轮接触线中点(落地线).车身 64×18(x∈[-32,32], y∈[-26,-8]), 总高
//           约 26px 含轮(契约约 64×26).
// 滑跑状态(契约重点, 与 physics/paper-tape.v1 的映射公式逐字一致, 两处必须同步修改): 
//   state.above === 'board-1' 时一律按映射定位(不读 state.sliding): 
//     p    = clamp01(Number(state.run_progress ?? 0))    -  context.preview 时强制 0(库房
//            缩略图冻结在静止位, case-24 renderCart 先例)
//     s_px = release_offset_px + run_span_px  -  p²         -  匀加速位移-时间平方律(引擎对
//            run_progress 线性插值, 渲染端平方 = 匀加速)
//     屏幕位置 = 板顶端板面点 + (cosθ, +sinθ) - s_px; 板几何从 context.world['board-1'] 实时
//     位置 + 板 properties(length_px 缺省 620, angle_deg 缺省 4.4)推导.
//   state.above !== 'board-1'(在家/被拖动)→ 画在自身 world 位置.
//   缺省: release_offset_px=120, run_span_px=450(终点 570, 板长 620 留端余量).
//   释放后 p 由引擎 1.5s 内 0→1, 跑完 p 保持 1(车停板下端不回跳).
// 车身朝向: 不随坡度旋转(平绘 2.5D, case-24 renderCart 保持水平的先例).
// 契约参数(context.visual, 全带缺省): release_offset_px=120, run_span_px=450, 
//           board_length_px=620, board_angle_deg=4.4(后两者一般不设, 走板 properties/缺省).
// 证据不清处: ① 车轮在帧内几乎不可辨(车底阴影里), 按"前后各 2, 远侧半遮"示意; 
//           ② 车尾系绳柱在 frame-005/006 被纸带遮挡, 依纸带走向补形为左侧小柱+环.
// 导出签名与模板一致: renderTickerCart(entity, state, context).
// 集成: renderer 键 physics/ticker-cart(index.js 的 import/注册由构建方完成: 复制本文件到
//           src/renderers/ 并在 index.js 注册 'physics/ticker-cart').

const BODY = '#3c3f44'      // 车身(frame-005 放大采样暗灰)
const BODY_TOP = '#565a60'  // 车顶受光条
const EDGE = '#1e2023'      // 描边
const WHEEL_FAR = '#232527' // 远侧轮(半遮)
const WHEEL = '#2c2e32'     // 近侧轮
const HUB = '#565a60'       // 轮毂
const METAL = '#7d8288'     // 系绳柱

//  -  板面基准与滑跑映射(physics/paper-tape.v1 内有逐字相同的副本, 改一处必须同步另一处) - 
function boardBasis(world, visual) {
  const board = (world && world['board-1']) || {}
  const props = board.properties || {}
  const origin = {x: Number(board.x ?? 0.5) * 1000, y: 560 - Number(board.y ?? 0.2) * 500}
  const lengthPx = Number(visual.board_length_px ?? props.length_px ?? 620)
  const rad = (Number(visual.board_angle_deg ?? props.angle_deg ?? 4.4) * Math.PI) / 180
  return {origin, lengthPx, ux: Math.cos(rad), uy: Math.sin(rad)}
}

// 小车有效渲染位: above/run_progress 取小车自身 state(契约), 板几何取 world['board-1'].
// physics/paper-tape.v1 为纸带端拷贝了同一映射(那边 above/run_progress 取 world[cart_ref], 
// 运行时 world['cart-1'] 即小车 state, 两式等价); 改公式/缺省必须两文件同步.
function cartRunScreen(world, visual, runState) {
  if ((runState && runState.above) !== 'board-1') return null
  const basis = boardBasis(world, visual)
  const p = Math.max(0, Math.min(1, Number(runState.run_progress ?? 0)))
  const s = Number(visual.release_offset_px ?? 120) + Number(visual.run_span_px ?? 450) * p * p
  return {x: basis.origin.x + basis.ux * s, y: basis.origin.y + basis.uy * s}
}

export function renderTickerCart(entity, state = {}, context = {}) {
  const group = svg('g')
  const visual = context.visual || {}
  const world = context.world || {}
  // 自身屏幕位(world 缺失时回退 visual.transform / 缺省位)
  let self = null
  const item = world[entity?.id]
  if (item) self = {x: Number(item.x ?? 0.5) * 1000, y: 560 - Number(item.y ?? 0.2) * 500}
  if (!self) {
    const t = entity?.visual?.transform || visual.transform || {}
    self = {x: Number(t.x ?? 0.5) * 1000, y: 560 - Number(t.y ?? 0.35) * 500}
  }
  // 滑跑映射: 吸附在板上时按 p² 沿板面定位, 否则画在自身位(offset=0)
  let offsetX = 0
  let offsetY = 0
  const anchor = context.preview ? null : cartRunScreen(world, visual, state)
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
    // 尾部系绳柱(左侧上坡侧, 纸带系点)
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
