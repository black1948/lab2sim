import {add, svg} from './svg.js'

//  -  细绳 - 小车—滑轮—吊桶驱动绳(120-用打点计时器演示匀速直线运动, 派生视觉渲染器) - 
// 派生视觉渲染器: 不画固定本体, 每帧按 world 里小车/滑轮的实时位置重绘(screenOf 先例
// physics.paper-tape.v1.renderer.js; renderStage 以 {visual, asset, world: state} 调用本
// 渲染器, 返回节点会被平移到绳自身 screen 位 - 故绝对坐标一律以 self 偏移回绘).
// 视觉依据: frame-001/006(17.5s 全景: 细绳自小车尾部沿板面拉直到板端滑轮, 再垂直向下
//           吊小桶), frame-012/014(小车滑行中绳仍绷直贴板); 细绳暗光采样 #4a4640 族.
// 复用审查否决记录: physics.string.v1 为竖直单段静态线(builtin, tension 变径/变色), 
//           无"沿板面水平段+过滑轮+垂直下吊段"几何, 也不能逐帧从 world 推导小车—滑轮
//           位置, 不得顶替 - 按构建方契约生成派生变体.变体骨架按契约复用同域派生渲染
//           器(paper-tape.v1)的 screenOf/-self 抵消写法, 无需在线发现.
// 风格依据: physics.string.v1 的 1.5px 圆头细线(张力色按契约省略), 
//           physics.paper-tape.v1.renderer.js 的派生几何/-self 抵消/板面基准写法.配色
//           inline, 不新增 styles.css class.
// 锚点: 自身 world 位仅作画布原点(渲染位被 -self 抵消), 几何全部派生.
// 几何(每帧重算): 
//   1) 小车尾部系点: world['cart-1'].above==='board-1' 时按线性映射
//      s_px = release_offset_px + run_span_px - p(p=clamp01(cart-1.run_progress), 匀速线性
//      律, 不得用 p²; context.preview 强制 0; 板几何从 world['board-1'] 推导)求小车渲染
//      位, 否则用 cart-1 自身 world 位; 再加 tail 偏移(tail_dx=-30/tail_dy=-6).
//       -  与 physics/ticker-cart-uniform.v1, physics/paper-tape-uniform.v1 逐字一致, 
//      改公式/缺省必须三文件同步.
//   2) 水平/沿板绳段: 小车尾系点 → 板端滑轮顶点(world['pulley-1'] 屏幕位上方
//      pulley_top_px 处, 绳贴滑轮顶绕过; 滑轮轮体由 pulley 渲染器 z 较高遮盖绳端).
//   3) 垂直绳段: 滑轮顶点 → 吊桶提环(pulley + (0, hang_gap_px + run_span_px - p), 与
//      physics/hanging-cup.v1 的提环公式逐字一致, 改一处必须两文件同步).
// 契约参数(context.visual, 全带缺省): cart_ref='cart-1', pulley_ref='pulley-1', 
//   tail_dx=-30, tail_dy=-6, pulley_top_px=8(绳在滑轮顶的绕点高, 与 ticker-end-pulley
//   轮半径一致), hang_gap_px=64, release_offset_px=110, run_span_px=470, 
//   board_length_px=620, board_angle_deg=0.
// 证据不清处: frame-001/006 中绳的竖直段下端没入暗背景只到桶提系处为止, 按到吊桶提环
//   为止绘制; 绳张紧色(119 string 的 tension 变色)本片无张力状态契约, 按契约省略.
// 导出签名与模板一致: renderTickerDriveString(entity, state, context).
// 集成: renderer 键 physics/ticker-drive-string(index.js 的 import/注册由构建方完成: 
//   复制本文件到 src/renderers/ 并在 index.js 注册 'physics/ticker-drive-string').

const ROPE = '#4a4640'       // 细绳(frame-001 暗光采样归一化)

function screenOf(world, id) {
  const item = world?.[id]
  if (!item) return null
  return {x: Number(item.x ?? 0.5) * 1000, y: 560 - Number(item.y ?? 0.42) * 500}
}

//  -  板面基准与线性滑跑映射(physics/ticker-cart-uniform.v1, physics/paper-tape-uniform.v1
//    内有逐字相同的副本, 改一处必须同步另两处) - 
function boardBasis(world, visual) {
  const board = (world && world['board-1']) || {}
  const props = board.properties || {}
  const origin = {x: Number(board.x ?? 0.18) * 1000, y: 560 - Number(board.y ?? 0.42) * 500}
  const lengthPx = Number(visual.board_length_px ?? props.length_px ?? 620)
  const rad = (Number(visual.board_angle_deg ?? props.angle_deg ?? 0) * Math.PI) / 180
  return {origin, lengthPx, ux: Math.cos(rad), uy: Math.sin(rad)}
}

export function renderTickerDriveString(entity, state = {}, context = {}) {
  const group = svg('g')
  const visual = context.visual || {}
  const world = context.world || {}
  const cartRef = typeof visual.cart_ref === 'string' && visual.cart_ref ? visual.cart_ref : 'cart-1'
  const pulleyRef = typeof visual.pulley_ref === 'string' && visual.pulley_ref ? visual.pulley_ref : 'pulley-1'
  const tailDx = Number(visual.tail_dx ?? -30)
  const tailDy = Number(visual.tail_dy ?? -6)
  const pulleyTop = Number(visual.pulley_top_px ?? 8)
  const hangGap = Number(visual.hang_gap_px ?? 64)
  const preview = Boolean(context.preview)

  // 自身屏幕位(画布原点; world 缺失逐级回退)
  let self = screenOf(world, entity?.id)
  if (!self) {
    const t = entity?.visual?.transform || visual.transform || {}
    self = {x: Number(t.x ?? 0.55) * 1000, y: 560 - Number(t.y ?? 0.425) * 500}
  }

  // 1) 小车尾部系点(线性映射, 与小车/纸带渲染器同步)
  const cart = world?.[cartRef] || {}
  let cartScreen = null
  if (cart.above === 'board-1') {
    const basis = boardBasis(world, visual)
    const p = preview ? 0 : Math.max(0, Math.min(1, Number(cart.run_progress ?? 0)))
    const s = Number(visual.release_offset_px ?? 110) + Number(visual.run_span_px ?? 470) * p
    cartScreen = {x: basis.origin.x + basis.ux * s, y: basis.origin.y + basis.uy * s}
  } else {
    cartScreen = screenOf(world, cartRef)
  }
  if (!cartScreen) return group
  const tail = {x: cartScreen.x + tailDx, y: cartScreen.y + tailDy}

  // 2) 滑轮顶绕点 + 3) 吊桶提环(与 hanging-cup 渲染器同步)
  const pulley = screenOf(world, pulleyRef)
  if (!pulley) return group
  const bend = {x: pulley.x, y: pulley.y - pulleyTop}
  const p2 = preview ? 0 : Math.max(0, Math.min(1, Number(cart.run_progress ?? 0)))
  const hitch = {x: pulley.x, y: pulley.y + hangGap + Number(visual.run_span_px ?? 470) * p2}

  const layer = svg('g', {transform: `translate(${(-self.x).toFixed(1)} ${(-self.y).toFixed(1)})`})
  group.append(layer)
  add(layer,
    svg('path', {d: `M${tail.x.toFixed(1)} ${tail.y.toFixed(1)}L${bend.x.toFixed(1)} ${bend.y.toFixed(1)}L${hitch.x.toFixed(1)} ${hitch.y.toFixed(1)}`, fill: 'none', stroke: ROPE, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}),
  )
  return group
}
