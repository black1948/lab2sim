import {add, label, shadow, svg} from './svg.js'

//  -  纸带 - 匀速点迹变体(120-用打点计时器演示匀速直线运动: 打点计时器纸带, 派生视觉
//      渲染器) - 
// 派生视觉渲染器: 不画固定本体, 每帧按 world 里计时器/小车/板的实时位置重绘(screenOf
// 先例 physics.paper-tape.v1.renderer.js; renderStage 以 {visual, asset, world: state} 调用
// 本渲染器, 返回节点会被平移到纸带自身 screen 位 - 故绝对坐标一律以 self 偏移回绘).
// 视觉依据: frame-005/011(白纸带横穿计时器底座被铬色 U 压片夹住, 沿板面拉直到小车尾部); 
//           frame-015/016/017(纸带平躺板上, 系列墨点+手写字母 A B C D); frame-020
//           (叠印"t = 2×0.02 s", 每字母间隔 2 个 0.02s 计时点); frame-022/023/024
//           (钢尺测量: AB=17.5mm, BC=17.5mm, CD=18.0mm=1.75/1.75/1.80×10⁻² m); 
//           frame-025..027(v₁=v₂=0.44 m/s, v₃=0.45 m/s → 匀速结论).米白 #f4f1e8 族
//           暗光采样归一化.
// 复用审查否决记录: physics.paper-tape.v1(119)为加速度点迹(非均匀 mm 表 + Δs/方法一二
//           三标注 + p² 映射), 点距与标注语义均不同, 不得直接复用条目 - 按构建方契约
//           以其为骨架生成匀速变体; film_strip/string/rubber_tube 亦不同物.变体骨架
//           复用同域渲染器源码, 无需在线发现.
// 风格依据: physics.paper-tape.v1.renderer.js 的三层同路径描边纸质带化+状态机+放大分析带, 
//           svg.js shadow/label 工具; 测量标注蓝 #3070d0 / 结果红 #c93030 同域约定; 结论
//           绿 #3f7d4a 取 physics.ticker-timer.v1 标签绿族.配色 inline, 不新增 styles.css
//           class.
// 锚点: 台上平放态用自身 transform(scene 摆位); 穿孔/固车态全部几何从 context.world
//           重绘, 忽略自身 transform.要求 tape-1 的 visual.transform.scale 保持 1(分析带
//           按舞台绝对坐标绘制, 会被本实体 scale 放缩).
// 状态机(读 state 与 context.world 跨实体标志; 与 119 相同的三态 + 匀速标注族): 
//   a) 台上平放(缺省, world[timer_ref].threaded 为假且未固车): 自身位画平放白条.
//   b) 穿孔未固车(threaded=true 且 world[cart_ref].tape_attached=false): 自计时器前限位
//      孔进, 后限位孔出, 长尾垂直下垂约 90px 二次贝塞尔轻飘(119 先例, 本片流程初始即
//      固车, 此态为骨架保留).
//   c) 已固车(tape_attached=true): 自限位孔沿板面拉直到小车尾部系点, 计时器另一侧留
//      20px 短头(frame-005/011).
//   d) state.stamped=true(b/c 之上叠加): 沿带按毫米表画 8 墨点; state.inspected=true 后
//      才画字母(板上带+放大带同时开启); 测量/结果/结论标注按各自状态旗标叠加.
// 小车尾部系点(与 physics/ticker-cart-uniform.v1 逐字一致的线性映射, 改一处必须同步
//   另一处; ticker-drive-string.v1 亦拷贝同一板面基准): world[cart_ref].above==='board-1'
//   时 s_px = release_offset_px + run_span_px - p(p=world[cart_ref].run_progress, 匀速线性
//   律, 不得用 p²; 板几何从 world['board-1'] 推导)求小车有效渲染位, 否则用 world[cart_ref]
//   自身位; 再加 tail 偏移.两处公式/缺省不一致会滑跑脱节.
// 契约参数(context.visual, 全带缺省): timer_ref='timer-1', cart_ref='cart-1', 
//   slot_dx=14, slot_dy=-34(计时器限位孔相对计时器原点的屏幕偏移, 另一孔取 -slot_dx 镜像), 
//   tail_dx=-30, tail_dy=-6(小车尾部系点相对小车原点偏移), bench_len_px=120, 
//   bench_w_px=14, board_px_per_mm=7.3(板面带比例, 可按板长微调), band_px_per_mm=10, 
//   release_offset_px=110, run_span_px=470, board_length_px=620, board_angle_deg=0.
// 点迹毫米表(mm 自 A 端, A 端在小车侧=最先打出; 等间距 8.75mm=0.04s 内 2 个 0.02s 点, 
//   匀速等位移): [0, 8.75, 17.5, 26.25, 35.0, 43.75, 53.0, 61.75]; 
//   字母仅 A(0) B(2) C(4) D(6)(每字母间隔 2 个 0.02s 点, 即 t=0.04s, frame-020 叠印).
// 测量标注(蓝 #3070d0, frame-023/024): measured_ab→"AB=17.5mm"(i0-j2), measured_bc→
//   "BC=17.5mm"(i2-j4), measured_cd→"CD=18.0mm"(i4-j6); 三条全完成后带区标题行写
//   "t = 2×0.02 s = 0.04 s"(frame-020/022 叠印句式).
// 结果标注(红 #c93030, frame-025..027): computed_v1→"v₁=0.44 m/s", computed_v2→
//   "v₂=0.44 m/s", computed_v3→"v₃=0.45 m/s"; uniform_motion=true → 分析带下加绿色结论
//   带"v₁≈v₂≈v₃ - uniform linear motion"(结论带为本模拟器标注 affordance, 视频为口播+叠字).
// 证据不清处: ① b) 态(手穿未固车)下点迹若提前开启, 只有 A 点附近落在垂下段(带长所
//   限, 裁剪不画); ② 结论带的绿底白字为本域结论配色约定, 视频中无对应实体.
// 导出签名与模板一致: renderPaperTapeUniform(entity, state, context).
// 集成: renderer 键 physics/paper-tape-uniform(index.js 的 import/注册由构建方完成: 
//   复制本文件到 src/renderers/ 并在 index.js 注册 'physics/paper-tape-uniform').

const PAPER = '#f4f1e8'      // 纸带主体(米白)
const PAPER_EDGE = '#b9b3a2' // 外描边浅灰
const PAPER_LIT = '#fbf8ef'  // 上缘高光
const INK = '#2f2b26'        // 墨点
const LETTER = '#3a3428'     // 手写字母
const BLUE = '#3070d0'       // 测量标注(域内标注蓝)
const RED = '#c93030'        // 结果红
const GREEN = '#3f7d4a'      // 结论绿(域内标签绿族)
const GREY = '#6f747a'       // 带区灰字
const HALO = '#f7f4ea'       // 文字 halo

const MM_TABLE = [0, 8.75, 17.5, 26.25, 35.0, 43.75, 53.0, 61.75]
const LETTERS = {0: 'A', 2: 'B', 4: 'C', 6: 'D'}
const MEASURES = [
  {key: 'measured_ab', i: 0, j: 2, text: 'AB=17.5mm', tie: 138, labelY: 126},
  {key: 'measured_bc', i: 2, j: 4, text: 'BC=17.5mm', tie: 138, labelY: 126},
  {key: 'measured_cd', i: 4, j: 6, text: 'CD=18.0mm', tie: 138, labelY: 126},
]
const RESULTS = [
  {key: 'computed_v1', text: 'v₁=0.44 m/s'},
  {key: 'computed_v2', text: 'v₂=0.44 m/s'},
  {key: 'computed_v3', text: 'v₃=0.45 m/s'},
]
const CONCLUSION = 'v₁≈v₂≈v₃ - uniform linear motion'
const T_TITLE = 't = 2×0.02 s = 0.04 s'

function screenOf(world, id) {
  const item = world?.[id]
  if (!item) return null
  return {x: Number(item.x ?? 0.5) * 1000, y: 560 - Number(item.y ?? 0.428) * 500}
}

//  -  板面基准与滑跑映射(physics/ticker-cart-uniform.v1, physics/ticker-drive-string.v1
//    内有逐字相同的副本, 改一处必须同步另两处) - 
function boardBasis(world, visual) {
  const board = (world && world['board-1']) || {}
  const props = board.properties || {}
  const origin = {x: Number(board.x ?? 0.18) * 1000, y: 560 - Number(board.y ?? 0.42) * 500}
  const lengthPx = Number(visual.board_length_px ?? props.length_px ?? 620)
  const rad = (Number(visual.board_angle_deg ?? props.angle_deg ?? 0) * Math.PI) / 180
  return {origin, lengthPx, ux: Math.cos(rad), uy: Math.sin(rad)}
}

function cartRunAnchor(world, visual, cartId) {
  const cart = (world && world[cartId]) || {}
  if (cart.above !== 'board-1') return null
  const basis = boardBasis(world, visual)
  const p = Math.max(0, Math.min(1, Number(cart.run_progress ?? 0)))
  const s = Number(visual.release_offset_px ?? 110) + Number(visual.run_span_px ?? 470) * p
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

// 三层描边画带(外描边/主体/上移高光, paper-tape.v1 画法沿用)
function tapeStroke(pathD, width) {
  return [
    svg('path', {d: pathD, fill: 'none', stroke: PAPER_EDGE, 'stroke-width': width + 3, 'stroke-linejoin': 'round'}),
    svg('path', {d: pathD, fill: 'none', stroke: PAPER, 'stroke-width': width, 'stroke-linejoin': 'round'}),
    svg('path', {d: pathD, fill: 'none', stroke: PAPER_LIT, 'stroke-width': Math.max(1.4, width * 0.2), 'stroke-linejoin': 'round', opacity: 0.8, transform: 'translate(0 -2.4)'}),
  ]
}

export function renderPaperTapeUniform(entity, state = {}, context = {}) {
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
    self = {x: Number(t.x ?? 0.5) * 1000, y: 560 - Number(t.y ?? 0.428) * 500}
  }
  // b/c 态与放大带全部按舞台绝对坐标绘制, 包一层 -self 平移抵消 renderStage 施加的
  // 自身位移(paper-tape.v1 同款收敛到单层组)
  const fmt = v => v.toFixed(1)

  const timerScreen = screenOf(world, timerRef) || self
  const slotCart = {x: timerScreen.x + slotDx, y: timerScreen.y + slotDy}  // 近车侧限位孔
  const slotBack = {x: timerScreen.x - slotDx, y: timerScreen.y + slotDy}  // 另一侧限位孔(镜像)
  const threaded = Boolean(world?.[timerRef]?.threaded)
  const attached = Boolean(world?.[cartRef]?.tape_attached)

  // 小车尾部系点: 小车上板时用与 ticker-cart-uniform 一致的线性滑跑映射, 否则自身位
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
    const up = unit(cartTail, slotBack) // 自车尾指向计时器; 短头在 slotBack 背离小车侧
    head.x = slotBack.x + up.x * 20
    head.y = slotBack.y + up.y * 20
    pathD = `M${fmt(head.x)} ${fmt(head.y)}L${fmt(slotBack.x)} ${fmt(slotBack.y)}L${fmt(slotCart.x)} ${fmt(slotCart.y)}L${fmt(cartTail.x)} ${fmt(cartTail.y)}`
    aEnd = cartTail
    aDir = unit(cartTail, slotCart)
    maxLen = Math.hypot(cartTail.x - slotBack.x, cartTail.y - slotBack.y) - 4
  } else {
    // 手穿未固车: 前孔进(右侧短进带), 后孔出, 长尾下垂 90px 二次贝塞尔轻飘(骨架保留)
    const inStart = {x: slotCart.x + 22, y: slotCart.y + 1}
    const tailEnd = {x: slotBack.x + 3, y: slotBack.y + 92}
    const ctrl = {x: slotBack.x + 7, y: slotBack.y + 48}
    pathD = `M${fmt(inStart.x)} ${fmt(inStart.y)}L${fmt(slotCart.x)} ${fmt(slotCart.y)}L${fmt(slotBack.x)} ${fmt(slotBack.y)}Q${fmt(ctrl.x)} ${fmt(ctrl.y)} ${fmt(tailEnd.x)} ${fmt(tailEnd.y)}`
    aEnd = tailEnd
    aDir = unit(tailEnd, slotBack)
    maxLen = Math.hypot(tailEnd.x - inStart.x, tailEnd.y - inStart.y) - 4
  }
  layer.append(...tapeStroke(pathD, benchW))

  //  -  d) 点迹: 沿带按毫米表画 8 墨点; inspected 后画字母(板带+放大带同启) - 
  const stamped = Boolean(state.stamped)
  const inspected = Boolean(state.inspected)
  if (stamped) {
    const n = {x: aDir.y, y: -aDir.x} // 带下侧法向(字母落板面侧)
    for (let i = 0; i < MM_TABLE.length; i += 1) {
      const d = MM_TABLE[i] * mmPx
      if (d > maxLen) break
      const p = {x: aEnd.x + aDir.x * d, y: aEnd.y + aDir.y * d}
      layer.append(svg('circle', {cx: fmt(p.x), cy: fmt(p.y), r: 2, fill: INK}))
      const letter = LETTERS[i]
      if (letter && inspected) {
        layer.append(haloText(letter, {
          x: fmt(p.x + n.x * 12), y: fmt(p.y + n.y * 12 + 3), 'text-anchor': 'middle',
          'font-size': 9.5, 'font-family': 'cursive', fill: LETTER,
        }))
      }
    }

    //  -  放大分析带(舞台上方带区, band_px_per_mm=10 重画 A..D 窗口) - 
    if (!context.preview) {
      const pxmm = Number(visual.band_px_per_mm ?? 10)
      const span = MM_TABLE[MM_TABLE.length - 1] * pxmm           // 617.5px
      const x0 = (1000 - span) / 2
      const bandTop = 146
      const bandBot = 186
      const dotY = 165
      const bx = i => x0 + MM_TABLE[i] * pxmm
      // 带区灰字标题(左上角, y=92, 位于测量标注行之上)
      layer.append(haloText('Tape analysis (10x magnification)', {
        x: fmt(x0 + 2), y: 92, 'text-anchor': 'start', 'font-size': 11, fill: GREY,
      }))
      // 三条测量全完成后标题行写 t = 2×0.02 s = 0.04 s(frame-020/022 叠印句式)
      const allMeasured = state.measured_ab && state.measured_bc && state.measured_cd
      if (allMeasured) {
        layer.append(haloText(T_TITLE, {
          x: fmt(x0 + 2), y: 108, 'text-anchor': 'start', 'font-size': 12.5, fill: INK,
        }))
      }
      // 米白底条 + 8 点 + 字母(字母仅 inspected 后)
      layer.append(svg('rect', {x: fmt(x0), y: bandTop, width: fmt(span), height: bandBot - bandTop, rx: 2, fill: PAPER, stroke: PAPER_EDGE, 'stroke-width': 1.3}))
      layer.append(svg('line', {x1: fmt(x0 + 5), y1: bandTop + 2.4, x2: fmt(x0 + span - 5), y2: bandTop + 2.4, stroke: PAPER_LIT, 'stroke-width': 1.4, 'stroke-linecap': 'round'}))
      for (let i = 0; i < MM_TABLE.length; i += 1) {
        layer.append(svg('circle', {cx: fmt(bx(i)), cy: dotY, r: 2.4, fill: INK}))
        const letter = LETTERS[i]
        if (letter && inspected) {
          layer.append(haloText(letter, {
            x: fmt(bx(i)), y: bandBot - 6, 'text-anchor': 'middle',
            'font-size': 11, 'font-family': 'cursive', fill: LETTER,
          }))
        }
      }
      // 测量标注(蓝色系, frame-023/024): 端点竖线 + 顶横括线 + 标签(三条并排一行)
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
          x: fmt(midX), y: fmt(m.labelY ?? 126), 'text-anchor': 'middle', 'font-size': 11.5, fill: BLUE,
        }))
      }
      // 结果标注(红字一行, frame-025..027)
      const results = RESULTS.filter(r => state[r.key]).map(r => r.text)
      if (results.length) {
        layer.append(haloText(results.join('　'), {
          x: 500, y: 199, 'text-anchor': 'middle', 'font-size': 12.5, fill: RED,
        }))
      }
      // 匀速结论带(uniform_motion=true: 绿底白字, 域内结论绿族)
      if (state.uniform_motion) {
        const cw = 330
        const cx0 = (1000 - cw) / 2
        layer.append(svg('rect', {x: fmt(cx0), y: 207, width: cw, height: 20, rx: 4, fill: GREEN, stroke: '#2c5a35', 'stroke-width': 1.2}))
        layer.append(haloText(CONCLUSION, {
          x: 500, y: 221, 'text-anchor': 'middle', 'font-size': 12.5, fill: '#eaf2ec',
        }))
      }
    }
  }
  return group
}
