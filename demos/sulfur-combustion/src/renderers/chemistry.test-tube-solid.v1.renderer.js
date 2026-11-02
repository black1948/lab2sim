import {add, liquidColor, liquidRatio, shadow, svg} from './svg.js'

function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

// 颜色明暗推导(确定性, 无外部依赖): f<1 变深(描边), f>1 变亮(亮棱面/高光粒)
function shade(hex, f) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) return hex
  const value = parseInt(match[1], 16)
  const channel = shift => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * f)))
  return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, '0')}`
}

const REACTION_PHASES = {
  mixing: {class: 'reacting mixing', bubbles: 4},
  changing: {class: 'reacting changing', bubbles: 6},
  settling: {class: 'reacting settling', bubbles: 3},
}

// 与 chemistry.js 原实现同构(模块私有未导出无法导入, 先例同 chemistry.test-tube-layered.v1)
function reactionOverlay(state, width, top, bottom) {
  const overlay = svg('g', {class: 'reaction-layer'})
  const info = state.__reaction
  if (!info || !info.running) return overlay
  const phase = REACTION_PHASES[info.phase] || REACTION_PHASES.mixing
  overlay.setAttribute('data-phase', info.phase || 'mixing')
  for (let index = 0; index < phase.bubbles; index += 1) {
    const x = -width / 2 + (index / Math.max(1, phase.bubbles - 1)) * width
    overlay.append(svg('circle', {class: 'reaction-bubble', cx: x, cy: bottom, style: `--d:${0.3 + ((index * 37) % 40) / 100}s;--x:${(index % 3 - 1) * width * 0.22}`}))
  }
  return overlay
}

function reactingGroup(state, className = '') {
  const reacting = Boolean(state.__reaction && state.__reaction.running)
  return svg('g', {class: reacting ? `${className} reacting`.trim() : (className || undefined)})
}

//  -  带未溶固体的试管变体(固体的溶解速率对比; 左管底残留深蓝晶体块 / 右管研碎粉末) - 
// 视觉依据: frame-026/030 特写(左管底残留未溶深蓝固体块, 透过浅蓝溶液可见; 右管全溶; 
// 溶液近清 #dfeef2 → 浅蓝 #7cc4de → 饱和蓝 #2ba3d6 由 IR 规则驱动 state.color); 
// frame-011(研碎粉末入管, 管底细粉堆).
// 几何: 与 chemistry.js renderTestTube 完全一致(管体 M-10-52H10L9 54Q9 62 0 62Q-9 62-9 54Z, 
// 口沿 M-12-52H12M-9-48Q0-45 9-48, 高光 M-4-46V46, 阴影 shadow(0,62,16,5), 标签 y=78, 
// 内壁 ±8, 液位 liquidTop=42-ratio*82), 玻璃配色/线宽沿用 styles.css glass-body/glass-rim/
// glass-highlight/liquid/meniscus 族, 不新增 class.
// 新增固体层(本变体的存在意义): 读 state.solid_g(0..1, IR 初始 tube-a=1, shake 递减)
// 与 entity.properties.solid_form: 
//   'chunk'  → 管底 2~3 块不规则深蓝晶体块(properties.solid_color #2f5f8a, 缺省同值), 
//              块数随 solid_g 递减(>0.66 三块 / >0.33 两块 / >0 一块), 带亮棱面与暗描边; 
//   'powder' → 管底细颗粒粉堆(#4aa3c9), 颗数随 solid_g 缩放, 画法同 solidPile/
//              undissolvedPile 确定性小圆粒惯例.
// 固体画在液体之前: .liquid 78% 不透明度盖在固体上, 固体透溶液可见(frame-026 左管观感).
// 液体仍按 liquidRatio(entity,state)(capacity_ml 同式)且 volume_ml>0 才画; 
// 保留 vesselGasLayer 层, reactingGroup/__reaction 抖动与 reactionOverlay 气泡
// (振荡动画依赖, IR delay_ms 反应窗内渲染器 .reacting 抖动即振荡动画).
// 不设 default_for_kind, 由 IR visual.asset_ref 选择(default_note 先例同
// chemistry.test-tube-layered.v1).

const INNER_BOTTOM = 52 // reactionOverlay 气泡起点(与 renderTestTube 原值一致)

function chunkPile(color, amount) {
  const edge = shade(color, 0.55)
  const facet = shade(color, 1.45)
  // 3 块确定性坐标晶体块(自左下, 右下, 上层叠; 内壁 ±8 内)
  const chunks = [
    {d: 'M-6.5 47.5L-2.5 45.5L2 47.5L3 52L0.5 56.5L-4.5 57L-6.5 53Z', facet: 'M-5.5 48.5L-2.5 46.8L-0.5 48.3L-3 50.5Z'},
    {d: 'M1.5 49.5L5.5 47.5L8.5 50.5L7 55.5L2.5 56.5L0.8 53Z', facet: 'M3 50.5L5.5 49L7.2 50.8L5.2 52.2Z'},
    {d: 'M-2 44.5L2 44L4.2 46.8L1.5 49.5L-2.5 48.5Z', facet: 'M-1 45.5L1.5 45L2.8 46.6L0.5 47.8Z'},
  ]
  const count = amount > 0.66 ? 3 : amount > 0.33 ? 2 : 1
  const nodes = chunks.slice(0, count).map(chunk => [
    svg('path', {d: chunk.d, fill: color, stroke: edge, 'stroke-width': 0.8, 'stroke-linejoin': 'round', class: 'salt-grain'}),
    svg('path', {d: chunk.facet, fill: facet, opacity: 0.75, class: 'salt-grain'}),
  ]).flat()
  // 底部碎屑(量多时)
  if (amount > 0.5) {
    nodes.push(svg('circle', {cx: -6, cy: 58, r: 1.1, fill: shade(color, 0.8), class: 'salt-grain'}))
    nodes.push(svg('circle', {cx: 6.2, cy: 58.2, r: 0.9, fill: shade(color, 0.8), class: 'salt-grain'}))
  }
  return nodes
}

function powderPile(color, amount) {
  const edge = shade(color, 0.6)
  const nodes = [svg('ellipse', {cx: 0, cy: 57.5, rx: 4.5 + 2.5 * amount, ry: 1.6, fill: shade(color, 0.72), opacity: 0.5, class: 'salt-grain'})]
  const count = Math.max(4, Math.round(4 + amount * 10))
  for (let index = 0; index < count; index += 1) {
    const t = count === 1 ? 0.5 : index / (count - 1)
    nodes.push(svg('circle', {
      cx: -(4.5 + 2.5 * amount) + (4.5 + 2.5 * amount) * 2 * t,
      cy: 57 - Math.sin(t * Math.PI) * (1.2 + 1.6 * amount) - (index % 3) * 0.7,
      r: 1 + (index % 3) * 0.32,
      fill: index % 4 === 0 ? shade(color, 1.25) : color,
      stroke: edge,
      'stroke-width': 0.35,
      class: 'salt-grain',
    }))
  }
  return nodes
}

export function renderTestTubeSolid(entity, state = {}) {
  // 双层组: 外层定位, 内层承接 .reacting 抖动(CSS transform 动画会覆盖属性 transform, 
  // 与 chemistry.js renderTestTube 同构)
  const group = svg('g')
  const reacting = reactingGroup(state)
  const ratio = liquidRatio(entity, state)
  const liquidTop = 42 - ratio * 82
  const solidG = Math.max(0, Math.min(1, Number(state.solid_g) || 0))
  const form = entity?.properties?.solid_form === 'powder' ? 'powder' : 'chunk'
  const declared = entity?.properties?.solid_color
  const solidColor = typeof declared === 'string' && /^#[0-9a-f]{6}$/i.test(declared)
    ? declared
    : form === 'powder' ? '#4aa3c9' : '#2f5f8a'
  add(reacting,
    shadow(0, 62, 16, 5),
    svg('path', {d: 'M-10-52H10L9 54Q9 62 0 62Q-9 62-9 54Z', class: 'glass-body'}),
    // 未溶固体层(先于液体: 透过 78% 液体可见, frame-026 左管观感)
    ...(solidG > 0 ? (form === 'powder' ? powderPile(solidColor, solidG) : chunkPile(solidColor, solidG)) : []),
    ...(ratio > 0 ? [
      svg('path', {d: `M-8 ${liquidTop}Q0 ${liquidTop - 2} 8 ${liquidTop}V54Q8 58 3 59H-3Q-8 58-8 54Z`, fill: liquidColor(state), class: 'liquid'}),
      svg('path', {d: `M-8 ${liquidTop}Q0 ${liquidTop - 3} 8 ${liquidTop}`, class: 'meniscus'}),
    ] : []),
    svg('path', {d: 'M-12-52H12M-9-48Q0-45 9-48', class: 'glass-rim'}),
    svg('path', {d: 'M-4-46V46', class: 'glass-highlight'}),
    reactionOverlay(state, 14, liquidTop, INNER_BOTTOM),
  )
  group.append(reacting)
  group.append(label(entity.label, 0, 78))
  return group
}
