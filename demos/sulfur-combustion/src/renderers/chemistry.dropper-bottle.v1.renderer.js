import {add, label, shadow, svg} from './svg.js'

function label2(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

//  -  滴瓶(胶头滴管瓶; 本案例 FeCl₃ 溶液滴瓶) - 
// 视觉依据: frame-010(滴瓶静置特写: 矮广口透明玻璃瓶身 + 磨口短颈 + 红色橡胶胶头帽
// (乳头状滴管帽: 卵形胶头顶圆下收, 经短红座插入磨口颈)+ 瓶内底部黄棕色液体 +
// 瓶身白纸红边双线大标签"FeCl₃ / 1mol/L", 标签约占瓶身前表面九成宽); frame-011
// (该瓶所配胶头滴管吸液后悬滴态).既有 chemistry.indicator-bottle.v1(renderer
// chemistry/reagent-bottle: 深色帽广口瓶)无胶头帽形制, 不能诚实代表本器材, 故新增
// 本渲染器(不动既有条目, default_for_kind=false 不劫持 kind=indicator 缺省解析).
// 比例取样(frame-010, 瓶全高 465px): 胶头 125/465≈27%, 颈+肩 105/465≈23%, 
// 瓶身 208/465≈45%, 瓶身宽/高≈150/208≈0.72, 颈半宽/身半宽≈32/75≈0.43, 
// 胶头高/宽≈125/56≈2.2(长卵形).本渲染器全高 -73..36(109): 胶头 27, 颈肩 31, 
// 身 54, 身半宽 24, 颈半宽 9.5, 胶头半宽 9.5 - 与上列比例一致.
// 风格依据: chemistry.js renderReagentBottle / renderTestTube 的 glass-body 液体口径
// (液面 path + meniscus 弧, 局部 y 向下为正, 瓶底圆角)与 renderDropper 的红胶头
// 画法(.rubber 色 #bc4d58/#71313a); 白纸红边标签沿用
// chemistry.reagent-bottle-cuso4-solid.v1 的内联 #c0392b 描边口径(不新增 styles.css
// class); 窄瓶身高光用内联细描边(.glass-highlight 3px 对窄身过粗, CSS 会覆盖属性).
// 几何(局部原点 = 瓶身几何中心, y 向下为正): 
//   瓶身玻璃 M-9.5-42H9.5V-30L24-18V30Q24 36 16.5 36H-16.5Q-24 36-24 30V-18L-9.5-30Z
//    -  颈口半宽 9.5(y -42..-30), 肩 -30..-18, 身半宽 24, 瓶底 36(圆角).
//   玻璃颈口(磨口接头顶)(0,-42) → scene anchors 口径 y=-42/500={x:0,y:-0.084}.
//   红胶头帽顶(闭合态瓶顶 = 胶头滴管悬停瞄准点)(0,-73) → {x:0,y:-0.146}
//    -  scene 现 anchors.mouth {0,-0.14}(resolve_assets indicator 缺省)落点在胶头顶
//   圆弧下 1.5px 局部, 语义吻合(滴管悬停在瓶顶上方); 构建方如需精确可改 -0.146.
// 状态绑定(渲染器直读): 
//   state.color → 液色(liquidColor(state,'#c9932b') 兜底, #c9932b = frame-010 黄棕
//   液面暗光采样归一, 同 IR fecl3-bottle initial color); 
//   state.volume_ml → 液面比例 r = clamp(volume_ml / capacity_ml, 0.06, 0.85), 
//   capacity_ml = entity.properties?.capacity_ml 缺省 30(滴瓶常见规格); 
//   液体区: 内壁半宽 20, 内底 y=33, liquidTop = 32 - r*48(0.06→29.1 可见薄液, 
//   0.85→-8.8 不没肩).
// 标签文字读 entity.properties.contents(IR: "FeCl₃ 1mol/L", 按首个空格拆两行, 
// 同 cuso4 试剂瓶惯例), 回退 entity.label 整行.
// 无 Math.random, 全部确定性坐标.

// 滴瓶容量缺省(ml): 液面比例分母
const DEFAULT_CAPACITY_ML = 30
// 胶头红(与 .rubber class 同色; 内联同值 fill 仅为冒烟可断言, 浏览器端 CSS 仍生效)
const RUBBER_RED = '#bc4d58'
// 液面比例上/下限(0.06 = 有液可见下限, 0.85 = 不没肩, 同 liquidRatio 口径)
const FILL_MIN = 0.06
const FILL_MAX = 0.85

function fillRatio(entity, state) {
  const capacity = Number(entity.properties?.capacity_ml || DEFAULT_CAPACITY_ML)
  const volume = Number(state.volume_ml || 0)
  if (!Number.isFinite(volume) || volume <= 0) return 0
  return Math.max(FILL_MIN, Math.min(FILL_MAX, volume / Math.max(capacity, 1)))
}

function liquidColor(state, fallback) {
  const value = state.color
  return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback
}

export function renderDropperBottle(entity, state = {}) {
  const group = svg('g')
  const color = liquidColor(state, '#c9932b')
  const ratio = fillRatio(entity, state)
  const hasLiquid = ratio > 0
  const top = 32 - ratio * 48
  const contents = String(entity?.properties?.contents || entity?.label || '')
  const splitAt = contents.indexOf(' ')
  const line1 = splitAt > 0 ? contents.slice(0, splitAt) : contents
  const line2 = splitAt > 0 ? contents.slice(splitAt + 1) : ''
  add(group,
    shadow(0, 40, 26, 5.5),
    // 瓶身: 矮广口透明玻璃(颈口 -42 / 肩 -30..-18 / 身半宽 24 / 底 36)
    svg('path', {d: 'M-9.5 -42H9.5V-30L24 -18V30Q24 36 16.5 36H-16.5Q-24 36 -24 30V-18L-9.5 -30Z', class: 'glass-body'}),
    // 瓶内液体(volume_ml/capacity_ml 驱动)+ 弯月面
    ...(hasLiquid ? [
      svg('path', {d: `M-20 ${top}Q0 ${top - 2} 20 ${top}V29Q20 33 14 33H-14Q-20 33 -20 29Z`, fill: color, class: 'liquid'}),
      svg('path', {d: `M-20 ${top}Q0 ${top - 3} 20 ${top}`, class: 'meniscus'}),
    ] : []),
    // 胶头滴管的玻璃管芯: 自帽座穿磨口入瓶内(frame-010 透过玻璃可见, 近底收细)
    svg('path', {d: 'M-1.8 -40H1.8L1.2 24L0 27L-1.2 24Z', fill: 'rgb(221 245 249 / 45%)', stroke: '#41626b', 'stroke-width': 1.1, 'stroke-linejoin': 'round'}),
    // 磨口颈的淡琥珀玻璃色(frame-010 颈部呈浅黄)
    svg('path', {d: 'M-9.5 -42H9.5V-30H-9.5Z', class: 'amber-glass'}),
    // 白纸红边双线大标签(frame-010: 红框白底, 约占瓶身前表面九成宽)
    svg('rect', {x: -21, y: -13, width: 42, height: 42, rx: 1.5, fill: '#f7f4ea', stroke: '#c0392b', 'stroke-width': 1.6}),
    svg('rect', {x: -19.5, y: -11.5, width: 39, height: 39, rx: 1, fill: 'none', stroke: '#c0392b', 'stroke-width': 0.7}),
    // 瓶身左缘竖向高光(细内联描边, 窄瓶身不用 3px .glass-highlight 口径)
    svg('path', {d: 'M-20 -14V28', fill: 'none', stroke: 'rgb(255 255 255 / 75%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-7 -40V-32', fill: 'none', stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
    // 颈口沿双线(玻璃厚度)
    svg('path', {d: 'M-11.5 -42H11.5M-9.5 -30H9.5', class: 'glass-rim'}),
    // 红胶头帽: 短红座 + 长卵形胶头(乳头状, frame-010 顶圆下收)
    svg('path', {d: 'M-3 -46.5H3L2.4 -42H-2.4Z', fill: RUBBER_RED, stroke: '#71313a', 'stroke-width': 1.4, 'stroke-linejoin': 'round', class: 'rubber'}),
    svg('path', {d: 'M0 -73Q-5.5 -72 -8 -65Q-9.5 -58 -6.5 -52Q-4 -46.5 0 -46.5Q4 -46.5 6.5 -52Q9.5 -58 8 -65Q5.5 -72 0 -73Z', fill: RUBBER_RED, stroke: '#71313a', 'stroke-width': 1.6, 'stroke-linejoin': 'round', class: 'rubber'}),
    // 胶头左侧橡皮高光
    svg('path', {d: 'M-4.5 -67Q-6.5 -61 -4.5 -54', fill: 'none', stroke: 'rgb(255 255 255 / 40%)', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
  )
  if (line1) group.append(label2(line1, 0, 4, 'bottle-label-text'))
  if (line2) group.append(label2(line2, 0, 15, 'bottle-label-text'))
  group.append(label2(entity.label, 0, 52))
  return group
}
