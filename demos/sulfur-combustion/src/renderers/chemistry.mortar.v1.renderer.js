import {add, shadow, svg} from './svg.js'

function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

// 颜色明暗推导(确定性, 无外部依赖): f<1 变深(描边), f>1 变亮(高光/亮棱面)
function shade(hex, f) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) return hex
  const value = parseInt(match[1], 16)
  const channel = shift => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * f)))
  return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, '0')}`
}

//  -  研钵(固体的溶解速率对比: 胆矾块状晶体 vs 研碎粉末) - 
// 视觉依据: frame-011 特写(白瓷研钵: 宽碗形, 口沿为扁椭圆, 口沿右侧一个倾倒流口小尖嘴, 
// 无研杵不入画); frame-006(同器, 匙从中取粉, 碗宽约为试管直径 4 倍).
// 证据帧暗光采样归一: 瓷面受光 #fcfff8 → styles.css .ceramic 填充 #f6f8f8(同族直接复用), 
// 暗侧 #6e7466 → 描边/内腔阴影取 #9aa7aa/#8a9698 同族.
// 几何: 局部原点 = 钵底接地中心, y 向下为正.碗外轮廓 x ±48, 口沿椭圆心 y=-16(ry 10), 
// 钵底 y≈30(碗宽/碗高 ≈ 1.8, 与 frame-011 实测 355/195 一致); 流口在口沿右侧(+x).
// 状态绑定(渲染器直读): state.contents 'none'|'crystal'|'powder'; state.solid_g 0..1
//   (grind 规则置 1) - powder 堆量随 solid_g 缩放, solid_g 缺失时按满堆画(规则与
//   contents 同批写入, 此为防御回退); crystal 画 2~3 块不规则深蓝晶体(一匙一簇, 量固定), 
//   晶/粉色取 IR tube 属性同源色: 块 #2f5f8a, 粉 #4aa3c9(entity.properties.solid_color
//   可覆盖,  mortar 实体未声明时用默认).
// 风格依据: chemistry.js renderEvaporatingDish 的白瓷画法(.ceramic/.ceramic-rim class +
// 内腔暗面 + apparatus-shadow), 颗粒堆画法同其 solidPile/undissolvedPile 惯例(确定性
// 小圆粒 + salt-grain class), 不新增 styles.css class.

const CRYSTAL_CHUNKS = [
  // 钵内 2~3 块不规则晶体(确定性坐标, 画在钵腔下半 y -2..10)
  {d: 'M-14 2L-6 -2L2 1L4 7L-2 12L-11 11L-14 7Z', facet: 'M-11 3L-6 0L-1 2L-3 5L-9 6Z'},
  {d: 'M6 3L14 0L20 4L19 10L11 13L5 9Z', facet: 'M8 4.5L13 2L16 4.5L11 6.5Z'},
  {d: 'M-4 -8L3 -10L8 -6L5 -1L-2 0L-5 -4Z', facet: 'M-2 -7L2 -8.5L4.5 -6L0 -4.5Z'},
]

function crystalChunks(color) {
  const edge = shade(color, 0.55)
  const facet = shade(color, 1.45)
  return CRYSTAL_CHUNKS.map(chunk => [
    svg('path', {d: chunk.d, fill: color, stroke: edge, 'stroke-width': 0.8, 'stroke-linejoin': 'round', class: 'salt-grain'}),
    svg('path', {d: chunk.facet, fill: facet, opacity: 0.75, class: 'salt-grain'}),
  ]).flat()
}

function powderPile(color, amount) {
  const edge = shade(color, 0.6)
  const count = Math.max(8, Math.round(8 + amount * 10))
  const nodes = [svg('ellipse', {cx: 0, cy: 9, rx: 12 + 10 * amount, ry: 3.6, fill: shade(color, 0.72), opacity: 0.55, class: 'salt-grain'})]
  for (let index = 0; index < count; index += 1) {
    const t = count === 1 ? 0.5 : index / (count - 1)
    nodes.push(svg('circle', {
      cx: -(12 + 10 * amount) + (12 + 10 * amount) * 2 * t,
      cy: 8 - Math.sin(t * Math.PI) * (2.5 + 3 * amount) - (index % 3) * 0.9,
      r: 1.5 + (index % 3) * 0.5,
      fill: index % 4 === 0 ? shade(color, 1.25) : color,
      stroke: edge,
      'stroke-width': 0.4,
      class: 'salt-grain',
    }))
  }
  return nodes
}

export function renderMortar(entity, state = {}) {
  const group = svg('g')
  const contents = state.contents
  // 晶/粉色: 专用属性字段(本 IR mortar 未声明, 走默认; 与试管固体色同源)
  const chunkColor = typeof entity?.properties?.solid_color === 'string' && /^#[0-9a-f]{6}$/i.test(entity.properties.solid_color)
    ? entity.properties.solid_color
    : '#2f5f8a'
  const powderColor = typeof entity?.properties?.powder_color === 'string' && /^#[0-9a-f]{6}$/i.test(entity.properties.powder_color)
    ? entity.properties.powder_color
    : '#4aa3c9'
  const amountRaw = Number(state.solid_g)
  const amount = Number.isFinite(amountRaw) && amountRaw > 0 ? Math.min(1, amountRaw) : 1
  add(group,
    shadow(0, 32, 52, 8),
    // 钵身: 宽碗外轮廓(frame-011: 口沿宽, 碗底圆收)
    svg('path', {d: 'M-48 -16Q-53 12 -27 26Q0 36 27 26Q53 12 48 -16Z', class: 'ceramic'}),
    // 暗侧(右下内收阴影, 2.5D 体积感)
    svg('path', {d: 'M30 22Q46 12 47 -8Q50 12 27 26Q14 31 0 32Q18 30 30 22Z', fill: '#8a9698', opacity: 0.35, class: 'ceramic'}),
    // 受光高光(左上瓷面反光)
    svg('path', {d: 'M-38 -6Q-38 10 -22 20', fill: 'none', stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
    // 口沿: 外椭圆 + 内腔(扁椭圆, frame-011 口沿前后缘)
    svg('ellipse', {cx: 0, cy: -16, rx: 48, ry: 10, class: 'ceramic'}),
    svg('ellipse', {cx: 0, cy: -15.4, rx: 39, ry: 7.4, fill: '#dfe5e3', stroke: '#9aa7aa', 'stroke-width': 1.2, class: 'ceramic-rim'}),
    // 内腔背壁阴影(腔体深度)
    svg('path', {d: 'M-34 -16.5Q0 -11.5 34 -16.5Q20 -9.5 0 -9.5Q-20 -9.5 -34 -16.5Z', fill: '#8a9698', opacity: 0.4}),
    // 倾倒流口(口沿右侧小尖嘴, frame-011 特写清晰)
    svg('path', {d: 'M40 -25Q53 -26 59 -16Q52 -8 40 -8.5Z', class: 'ceramic'}),
    svg('path', {d: 'M42 -21.5Q50 -21.5 54 -16', fill: 'none', stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )
  // 钵内容物(画在内腔之上, 口沿前缘之下)
  if (contents === 'crystal') {
    crystalChunks(chunkColor).forEach(node => group.append(node))
  } else if (contents === 'powder') {
    powderPile(powderColor, amount).forEach(node => group.append(node))
  }
  // 口沿前缘压住内容物底部(内容物沉在腔内)
  group.append(svg('path', {d: 'M-39 -12.5Q0 -6.5 39 -12.5', fill: 'none', stroke: '#9aa7aa', 'stroke-width': 1.1, opacity: 0.7, class: 'ceramic-rim'}))
  group.append(label(entity.label, 0, 52))
  return group
}
