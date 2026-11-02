import {add, label, svg} from './svg.js'

//  -  吊桶(120-用打点计时器演示匀速直线运动: 跨过板端定滑轮吊轻质小桶) - 
// 视觉依据: frame-001/006(17.5s 全景: 板右端外桌沿外悬挂的浅色小圆柱杯, 提系为 Y 形
//           双绳, 上端并作单绳接滑轮; 杯体浅灰白, 微锥底, 敞口); frame-012/014(小车
//           滑行时桶随绳下降 - 帧内桶位因暗背景仅可辨轮廓, 下降量按绳长守恒=小车位移
//           契约补形).暗光采样归一化: 杯体 #dcd9d0 族, 杯口沿 #e9e6dd, 绳 #4a4640.
// 复用审查否决记录: 注册表无 hanging_cup 条目.可信源发现命中 twbs/icons bucket-fill
//           (16x16 单色家用提水桶 glyph: 椭圆敞口+提手弧+梯形桶身) - 与本片吊桶
//           (直壁圆柱杯, 微锥底, 顶部 Y 形双绳提系, 无提手弧)形状不符, 单色线稿与
//           域内 2.5D 体块风格断裂, 已回滚不注册, 转代码原生生成.
// 风格依据: physics.weight.v1(physics.js)的吊悬挂线+体块画法, physics.ticker-timer.v1
//           的 inline 配色约定, 派生定位沿用 physics.paper-tape.v1.renderer.js 的
//           screenOf/-self 抵消写法.不画接地阴影(悬空于板端外暗背景).配色 inline, 
//           不新增 styles.css class.
// 锚点: 局部 (0,0)=提环(Y 形双绳汇聚点, 绳自滑轮垂直下来接此).杯体自 (0,16) 到
//           (0,40)(宽 18, 高约 24, 加双绳总高约 42).
// 位置派生(每帧重算): 挂点=world['pulley-1'] 屏幕位, 提环=挂点 + (0, hang_gap_px +
//   run_span_px - p), p=clamp01(world['cart-1'].run_progress), context.preview 强制 0; 桶
//   下降距离=run_span_px - p(定滑轮绳长守恒: 桶降=车进, 与车前进距离一致).垂直单绳段
//   自滑轮到提环由 physics/ticker-drive-string.v1 绘制, 本渲染器只画 Y 双绳+杯体 - 
//   提环公式与该文件逐字一致, 改一处必须两文件同步.
// 契约参数(context.visual, 全带缺省): pulley_ref='pulley-1', cart_ref='cart-1', 
//   hang_gap_px=64, release_offset_px=110, run_span_px=470, board_length_px=620, 
//   board_angle_deg=0.
// 证据不清处: ① 桶体在 frame-001/006 仅约 14px 见方且发暗, 杯口/锥底比例按常见吊桶
//   补形; ② 双绳并拢点高度(提环与杯口距离)帧内不可辨, 按杯口上 16px 补形; ③ 下降
//   契约下桶在 p=1 时低于舞台下缘(滑轮初始 y=0.42, hang 64px + span 470px → 提环
//   y≈884 > 560), 已如实按契约实现并在注册条目 design_notes 提示构建方调布置.
// 导出签名与模板一致: renderHangingCup(entity, state, context).
// 集成: renderer 键 physics/hanging-cup(index.js 的 import/注册由构建方完成: 复制本
//   文件到 src/renderers/ 并在 index.js 注册 'physics/hanging-cup').

const CUP = '#dcd9d0'        // 杯体(frame-001 暗光采样归一化浅灰白)
const CUP_LIT = '#e9e6dd'    // 杯口沿受光
const CUP_EDGE = '#8f8b80'   // 描边
const ROPE = '#4a4640'       // 双绳(与 ticker-drive-string 同色)

export function renderHangingCup(entity, state = {}, context = {}) {
  const group = svg('g')
  const visual = context.visual || {}
  const world = context.world || {}
  const pulleyRef = typeof visual.pulley_ref === 'string' && visual.pulley_ref ? visual.pulley_ref : 'pulley-1'
  const cartRef = typeof visual.cart_ref === 'string' && visual.cart_ref ? visual.cart_ref : 'cart-1'
  const hangGap = Number(visual.hang_gap_px ?? 64)
  const preview = Boolean(context.preview)

  // 自身屏幕位(画布原点; world 缺失逐级回退)
  let self = null
  const item = world[entity?.id]
  if (item) self = {x: Number(item.x ?? 0.81) * 1000, y: 560 - Number(item.y ?? 0.31) * 500}
  if (!self) {
    const t = entity?.visual?.transform || visual.transform || {}
    self = {x: Number(t.x ?? 0.81) * 1000, y: 560 - Number(t.y ?? 0.31) * 500}
  }

  // 位置派生: 提环 = 滑轮屏幕位 + (0, hang_gap_px + run_span_px - p)(与 ticker-drive-string
  // 逐字一致, 改一处必须两文件同步)
  const pulley = (() => {
    const item2 = world?.[pulleyRef]
    if (item2) return {x: Number(item2.x ?? 0.81) * 1000, y: 560 - Number(item2.y ?? 0.42) * 500}
    return null
  })()
  const cart = world?.[cartRef] || {}
  const p = preview ? 0 : Math.max(0, Math.min(1, Number(cart.run_progress ?? 0)))
  let target = null
  if (pulley) {
    target = {x: pulley.x, y: pulley.y + hangGap + Number(visual.run_span_px ?? 470) * p}
  } else {
    target = self // 滑轮缺失退化为自身位(不派生)
  }

  const layer = svg('g', {transform: `translate(${(target.x - self.x).toFixed(1)} ${(target.y - self.y).toFixed(1)})`})
  group.append(layer)
  // Y 形双绳: 提环 → 杯口两缘
  add(layer,
    svg('circle', {cx: 0, cy: 0, r: 2, fill: 'none', stroke: CUP_EDGE, 'stroke-width': 1.2}),
    svg('path', {d: 'M0 0L-7 16M0 0L7 16', fill: 'none', stroke: ROPE, 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )
  // 杯体: 直壁圆柱, 微锥底(frame-001 浅色小圆柱杯)
  add(layer,
    svg('path', {d: 'M-9 16L9 16L7.6 37.5Q7.4 40 5 40L-5 40Q-7.4 40 -7.6 37.5Z', fill: CUP, stroke: CUP_EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    // 杯口沿(受光椭圆)
    svg('ellipse', {cx: 0, cy: 16, rx: 9, ry: 2.4, fill: CUP_LIT, stroke: CUP_EDGE, 'stroke-width': 1.1}),
    // 左缘高光
    svg('line', {x1: -5.6, y1: 20, x2: -4.8, y2: 35, stroke: '#f4f2ea', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.85}),
    // 锥底压深
    svg('path', {d: 'M-7.6 34.5Q0 37 7.6 34.5L7.6 37.5Q7.4 40 5 40L-5 40Q-7.4 40 -7.6 37.5Z', fill: '#b5b1a6', opacity: 0.7}),
  )
  layer.append(label(entity.label, 0, 54))
  return group
}
