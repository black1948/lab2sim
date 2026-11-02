import {add, label, shadow, svg} from './svg.js'

//  -  纸带(119-用打点计时器测匀加速直线运动: 打点计时器纸带, 派生视觉渲染器) - 
// 派生视觉渲染器: 不画固定本体, 每帧按 world 里计时器/小车/板的实时位置重绘(screenOf
// 先例 physics.rubber-tube.v1.renderer.js; renderStage 以 {visual, asset, world: state} 调用
// 本渲染器, 返回节点会被平移到纸带自身 screen 位 - 故绝对坐标一律以 self 偏移回绘).
// 视觉依据: frame-005/006(38-39s 白纸带自计时器沿板面拉直到小车尾部); frame-007/008
// (39.8-40.5s 纸上系列墨点躺在板上); frame-013/014(放大分析带: A B C  -   -   -  M N P 字母
// 标注); frame-015/021(蓝色测量标记线: Δs₁/Δs₂/S₁/S₇); frame-004(手穿纸带自计时器
// 垂下的构图); 米白纸带 #f4f1e8 族(暗光采样归一化).
// 复用审查否决记录: 注册表无纸带条目; film_strip=幻灯胶片条(带齿孔的胶片), string=棉线, 
//           rubber_tube=乳胶管, 均不同物.可信源发现命中 germondai/icons mono.svg - 空壳
//           SVG(无绘制元素), 已回滚.
// 风格依据: rubber-tube 的三层同路径描边(外描边/主体/上移高光)纸质带化; svg.js shadow/
//           label 工具; 测量标注蓝色 #3070d0 同域约定(physics.js 力分解/斜面标注); 结果
//           红字 #c93030 同域红族.配色 inline, 不新增 styles.css class.
// 锚点: 台上平放态用自身 transform(scene 摆位); 穿孔/固车态全部几何从 context.world 重绘, 
//           忽略自身 transform.要求 tape-1 的 visual.transform.scale 保持 1(分析带按舞台
//           绝对坐标绘制, 会被本实体 scale 放缩).
// 状态机(读 state 与 context.world 跨实体标志): 
//   a) 台上平放(缺省, world[timer_ref].threaded 为假): 自身位画平放白条.
//   b) 穿孔未固车(threaded=true 且 world[cart_ref].tape_attached=false): 自计时器前限位孔
//      进, 后限位孔出, 长尾垂直下垂约 90px 二次贝塞尔轻飘(frame-004 构图).
//   c) 已固车(tape_attached=true): 自限位孔沿板面拉直到小车尾部系点, 计时器另一侧留
//      20px 短头(frame-005/006).
//   d) state.stamped=true(b/c 之上叠加): 沿带按毫米表画 9 墨点并标 A/B/C/M/N/P; 另在
//      舞台上方带区 screenY 120..205 画放大 10 倍分析带 + 测量标注 + 方法结果.
// 小车尾部系点(与 physics/ticker-cart.v1 逐字一致的映射, 改一处必须同步另一处): 
//   world[cart_ref].above === 'board-1' 时按 s_px = release_offset_px + run_span_px - p²
//   (p=world[cart_ref].run_progress, 板几何从 world['board-1'] 推导)求小车有效渲染位, 
//   否则用 world[cart_ref] 自身位; 再加 tail 偏移.两处公式/缺省不一致会滑跑脱节.
// 契约参数(context.visual, 全带缺省): timer_ref='timer-1', cart_ref='cart-1', 
//   slot_dx=14, slot_dy=-34(计时器限位孔相对计时器原点的屏幕偏移, 另一孔取 -slot_dx 镜像), 
//   tail_dx=-30, tail_dy=-6(小车尾部系点相对小车原点偏移), bench_len_px=120, 
//   bench_w_px=14, board_px_per_mm=7.3, band_px_per_mm=10, release_offset_px=120, 
//   run_span_px=450, board_length_px=620, board_angle_deg=4.4.
// 点迹毫米表(mm, 自 A 端; A 端在小车侧=最先打出): [0,7.4,15.2,23.55,32.1,40.85,49.8,58.9,68.7]; 
//   字母仅 A(0) B(1) C(2) M(6) N(7) P(8), 其余点不标(frame-013/014).
// 证据不清处: ① state b)(手穿未打点)下点迹如果提前开启, 只有 A/B 两点落在垂下段内
//   (带长所限), 其余裁剪不画; ② 全部测量同屏(完成态)时标注分两行防互撞: 
//   s₁/s₇(短间距, tie 138)→ labelY 108, Δs₁/Δs₂/s(tie 130)→ labelY 124, 
//   带区标题再上移 y=99, 三行互不重叠(119 完成态验证 minor 修复).
// 导出签名与模板一致: renderPaperTape(entity, state, context).
// 集成: renderer 键 physics/paper-tape(index.js 的 import/注册由构建方完成: 复制本文件到
//   src/renderers/ 并在 index.js 注册 'physics/paper-tape').

const PAPER = '#f4f1e8'      // 纸带主体(米白)
const PAPER_EDGE = '#b9b3a2' // 外描边浅灰
const PAPER_LIT = '#fbf8ef'  // 上缘高光
const INK = '#2f2b26'        // 墨点
const LETTER = '#3a3428'     // 手写字母
const BLUE = '#3070d0'       // 测量标注(域内标注蓝)
const RED = '#c93030'        // 方法结果红
const GREY = '#6f747a'       // 带区灰字
const HALO = '#f7f4ea'       // 文字 halo

const MM_TABLE = [0, 7.4, 15.2, 23.55, 32.1, 40.85, 49.8, 58.9, 68.7]
const LETTERS = {0: 'A', 1: 'B', 2: 'C', 6: 'M', 7: 'N', 8: 'P'}
const MEASURES = [
  {key: 'measured_s1', i: 0, j: 1, text: 's₁=7.4mm', tie: 138, labelY: 108},
  {key: 'measured_s7', i: 7, j: 8, text: 's₇=9.1mm', tie: 138, labelY: 108},
  {key: 'measured_ds1', i: 0, j: 2, text: 'Δs₁=15.2mm', tie: 130, labelY: 124},
  {key: 'measured_ds2', i: 6, j: 8, text: 'Δs₂=18.9mm', tie: 130, labelY: 124},
  {key: 'measured_bn', i: 1, j: 7, text: 's=51.5mm', tie: 130, labelY: 124},
]
const METHODS = [
  {key: 'method1', text: 'Method 1 a≈0.75 m/s²'},
  {key: 'method2', text: 'Method 2 a≈0.77 m/s²'},
  {key: 'method3', text: 'Method 3 a≈0.71 m/s²'},
]

function screenOf(world, id) {
  const item = world?.[id]
  if (!item) return null
  return {x: Number(item.x ?? 0.5) * 1000, y: 560 - Number(item.y ?? 0.2) * 500}
}

//  -  板面基准与滑跑映射(physics/ticker-cart.v1 内有逐字相同的副本, 改一处必须同步另一处) - 
function boardBasis(world, visual) {
  const board = (world && world['board-1']) || {}
  const props = board.properties || {}
  const origin = {x: Number(board.x ?? 0.5) * 1000, y: 560 - Number(board.y ?? 0.2) * 500}
  const lengthPx = Number(visual.board_length_px ?? props.length_px ?? 620)
  const rad = (Number(visual.board_angle_deg ?? props.angle_deg ?? 4.4) * Math.PI) / 180
  return {origin, lengthPx, ux: Math.cos(rad), uy: Math.sin(rad)}
}

function cartRunAnchor(world, visual, cartId) {
  const cart = (world && world[cartId]) || {}
  if (cart.above !== 'board-1') return null
  const basis = boardBasis(world, visual)
  const p = Math.max(0, Math.min(1, Number(cart.run_progress ?? 0)))
  const s = Number(visual.release_offset_px ?? 120) + Number(visual.run_span_px ?? 450) * p * p
  return {x: basis.origin.x + basis.ux * s, y: basis.origin.y + basis.uy * s}
}

function unit(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  return {x: dx / len, y: dy / len}
}

function haloText(content, attrs) {
  const node = svg('text', {...attrs, fill: attrs.fill, stroke: HALO, 'stroke-width': 3, 'paint-order': 'stroke', 'stroke-linejoin': 'round'})
  node.textContent = content
  return node
}

// 三层描边画带(外描边/主体/上移高光, rubber-tube 画法纸质化)
function tapeStroke(pathD, width) {
  return [
    svg('path', {d: pathD, fill: 'none', stroke: PAPER_EDGE, 'stroke-width': width + 3, 'stroke-linejoin': 'round'}),
    svg('path', {d: pathD, fill: 'none', stroke: PAPER, 'stroke-width': width, 'stroke-linejoin': 'round'}),
    svg('path', {d: pathD, fill: 'none', stroke: PAPER_LIT, 'stroke-width': Math.max(1.4, width * 0.2), 'stroke-linejoin': 'round', opacity: 0.8, transform: 'translate(0 -2.4)'}),
  ]
}

export function renderPaperTape(entity, state = {}, context = {}) {
  const group = svg('g')
  const visual = context.visual || {}
  const world = context.world || {}
  const timerRef = typeof visual.timer_ref === 'string' && visual.timer_ref ? visual.timer_ref : 'timer-1'
  const cartRef = typeof visual.cart_ref === 'string' && visual.cart_ref ? visual.cart_ref : 'cart-1'
  const slotDx = Number(visual.slot_dx ?? 14)
  const slotDy = Number(visual.slot_dy ?? -34)
  const tailDx = Number(visual.tail_dx ?? -30)
  const tailDy = Number(visual.tail_dy ?? -6)
  const benchLen = Number(visual.bench_len_px ?? 120)
  const benchW = Number(visual.bench_w_px ?? 14)
  const mmPx = Number(visual.board_px_per_mm ?? 7.3)

  // 自身屏幕位(world 缺失逐级回退)
  let self = screenOf(world, entity?.id)
  if (!self) {
    const t = entity?.visual?.transform || visual.transform || {}
    self = {x: Number(t.x ?? 0.5) * 1000, y: 560 - Number(t.y ?? 0.35) * 500}
  }
  // b/c 态与放大带全部按舞台绝对坐标绘制, 包一层 -self 平移抵消 renderStage 施加的
  // 自身位移(rubber-tube 的逐点偏移写法在多段路径+标注下太散, 收敛到单层组)
  const fmt = v => v.toFixed(1)

  const timerScreen = screenOf(world, timerRef) || self
  const slotCart = {x: timerScreen.x + slotDx, y: timerScreen.y + slotDy}  // 近车侧限位孔
  const slotBack = {x: timerScreen.x - slotDx, y: timerScreen.y + slotDy}  // 另一侧限位孔(镜像)
  const threaded = Boolean(world?.[timerRef]?.threaded)
  const attached = Boolean(world?.[cartRef]?.tape_attached)

  // 小车尾部系点: 小车上板时用与 ticker-cart 一致的滑跑映射, 否则自身位(缺一 fallback 平放)
  const cartAnchor = cartRunAnchor(world, visual, cartRef)
  const cartScreen = cartAnchor || screenOf(world, cartRef)
  const cartTail = cartScreen ? {x: cartScreen.x + tailDx, y: cartScreen.y + tailDy} : null

  //  -  a) 台上平放(缺省; preview 缩略图一律平放) - 
  if (context.preview || (!threaded && !attached)) {
    group.append(shadow(0, benchW / 2 + 2.5, benchLen / 2 + 6, 4))
    group.append(svg('rect', {
      x: -benchLen / 2, y: -benchW / 2, width: benchLen, height: benchW, rx: 1.5,
      fill: PAPER, stroke: PAPER_EDGE, 'stroke-width': 1.3,
    }))
    group.append(svg('line', {x1: -benchLen / 2 + 5, y1: -benchW / 2 + 2.2, x2: benchLen / 2 - 5, y2: -benchW / 2 + 2.2, stroke: PAPER_LIT, 'stroke-width': 1.3, 'stroke-linecap': 'round'}))
    if (!context.preview) group.append(label(entity.label, 0, benchW / 2 + 18))
    // 平放态不画点迹/分析带(契约 d 仅叠加于 b/c)
    return group
  }

  //  -  b/c) 穿孔态: 绝对坐标层(-self 抵消舞台平移) - 
  const layer = svg('g', {transform: `translate(${fmt(-self.x)} ${fmt(-self.y)})`})
  group.append(layer)
  // 统一为折线路径 + 端点/长度裁剪  - 
  const head = {x: slotBack.x - 20, y: slotBack.y} // 计时器另一侧 20px 短头(固车态)
  let pathD
  let aEnd       // A 端(最先打出的点)屏幕位
  let aDir       // 自 A 端沿带向计时器侧的单位向量
  let maxLen     // 自 A 端起可画长度上限
  if (attached && cartTail) {
    const up = unit(cartTail, slotBack) // 自车尾指向计时器(上坡向); 短头在 slotBack 再往-up延伸的背离小车侧
    head.x = slotBack.x + up.x * 20
    head.y = slotBack.y + up.y * 20
    pathD = `M${fmt(head.x)} ${fmt(head.y)}L${fmt(slotBack.x)} ${fmt(slotBack.y)}L${fmt(slotCart.x)} ${fmt(slotCart.y)}L${fmt(cartTail.x)} ${fmt(cartTail.y)}`
    aEnd = cartTail
    aDir = unit(cartTail, slotCart)
    maxLen = Math.hypot(cartTail.x - slotBack.x, cartTail.y - slotBack.y) - 4
  } else {
    // 手穿未固车: 前孔进(右侧短进带), 后孔出, 长尾下垂 90px 二次贝塞尔轻飘(frame-004)
    const inStart = {x: slotCart.x + 22, y: slotCart.y + 1}
    const tailEnd = {x: slotBack.x + 3, y: slotBack.y + 92}
    const ctrl = {x: slotBack.x + 7, y: slotBack.y + 48}
    pathD = `M${fmt(inStart.x)} ${fmt(inStart.y)}L${fmt(slotCart.x)} ${fmt(slotCart.y)}L${fmt(slotBack.x)} ${fmt(slotBack.y)}Q${fmt(ctrl.x)} ${fmt(ctrl.y)} ${fmt(tailEnd.x)} ${fmt(tailEnd.y)}`
    aEnd = tailEnd
    aDir = unit(tailEnd, slotBack)
    maxLen = Math.hypot(tailEnd.x - inStart.x, tailEnd.y - inStart.y) - 4
  }
  layer.append(...tapeStroke(pathD, benchW))

  //  -  d) 点迹: 沿带按毫米表画 9 墨点 + A/B/C/M/N/P 字母  - 
  const stamped = Boolean(state.stamped)
  if (stamped) {
    const n = {x: aDir.y, y: -aDir.x} // 带下侧法向(字母落板面侧)
    for (let i = 0; i < MM_TABLE.length; i += 1) {
      const d = MM_TABLE[i] * mmPx
      if (d > maxLen) break
      const p = {x: aEnd.x + aDir.x * d, y: aEnd.y + aDir.y * d}
      layer.append(svg('circle', {cx: fmt(p.x), cy: fmt(p.y), r: 2, fill: INK}))
      const letter = LETTERS[i]
      if (letter) {
        layer.append(haloText(letter, {
          x: fmt(p.x + n.x * 12), y: fmt(p.y + n.y * 12 + 3), 'text-anchor': 'middle',
          'font-size': 9.5, 'font-family': 'cursive', fill: LETTER,
        }))
      }
    }

    //  -  放大分析带(舞台上方带区 screenY 120..205, 10px/mm 重画 A..P 窗口) - 
    if (!context.preview) {
      const pxmm = Number(visual.band_px_per_mm ?? 10)
      const span = MM_TABLE[MM_TABLE.length - 1] * pxmm           // 687px
      const x0 = (1000 - span) / 2
      const bandTop = 146
      const bandBot = 186
      const dotY = 165
      const bx = i => x0 + MM_TABLE[i] * pxmm
      // 带区标题(左上角灰字, y=92 位于标注两行之上, 三行 bbox 间距≥2px 互不相撞)
      layer.append(haloText('Tape analysis (10x magnification, T=0.02 s)', {
        x: fmt(x0 + 2), y: 92, 'text-anchor': 'start', 'font-size': 11, fill: GREY,
      }))
      // 米白底条 + 9 点 + 字母
      layer.append(svg('rect', {x: fmt(x0), y: bandTop, width: fmt(span), height: bandBot - bandTop, rx: 2, fill: PAPER, stroke: PAPER_EDGE, 'stroke-width': 1.3}))
      layer.append(svg('line', {x1: fmt(x0 + 5), y1: bandTop + 2.4, x2: fmt(x0 + span - 5), y2: bandTop + 2.4, stroke: PAPER_LIT, 'stroke-width': 1.4, 'stroke-linecap': 'round'}))
      for (let i = 0; i < MM_TABLE.length; i += 1) {
        layer.append(svg('circle', {cx: fmt(bx(i)), cy: dotY, r: 2.4, fill: INK}))
        const letter = LETTERS[i]
        if (letter) {
          layer.append(haloText(letter, {
            x: fmt(bx(i)), y: bandBot - 6, 'text-anchor': 'middle',
            'font-size': 11, 'font-family': 'cursive', fill: LETTER,
          }))
        }
      }
      // 测量标注(蓝色系, frame-013/015/021): 端点竖线 + 顶横括线 + 标签
      for (const m of MEASURES) {
        if (!state[m.key]) continue
        const x1 = bx(m.i)
        const x2 = bx(m.j)
        const midX = (x1 + x2) / 2
        const bracket = svg('g', {stroke: BLUE, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round'})
        bracket.append(
          svg('line', {x1: fmt(x1), y1: dotY - 6, x2: fmt(x1), y2: m.tie}),
          svg('line', {x1: fmt(x2), y1: dotY - 6, x2: fmt(x2), y2: m.tie}),
          svg('line', {x1: fmt(x1), y1: m.tie, x2: fmt(x2), y2: m.tie}),
        )
        layer.append(bracket)
        layer.append(haloText(m.text, {
          x: fmt(midX), y: fmt(m.labelY ?? 124), 'text-anchor': 'middle', 'font-size': 11.5, fill: BLUE,
        }))
      }
      // 方法结果(红字一行)
      const results = METHODS.filter(m => state[m.key]).map(m => m.text)
      if (results.length) {
        layer.append(haloText(results.join('　'), {
          x: 500, y: 199, 'text-anchor': 'middle', 'font-size': 12.5, fill: RED,
        }))
      }
    }
  }
  return group
}
