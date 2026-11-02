import {add, shadow, svg} from './svg.js'

function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

// 颜色明暗推导(确定性, 无外部依赖)
function shade(hex, f) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) return hex
  const value = parseInt(match[1], 16)
  const channel = shift => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * f)))
  return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, '0')}`
}

//  -  胆矾试剂瓶变体(透明玻璃广口瓶, 内装蓝色晶体, 白纸红边标签) - 
// 视觉依据: frame-002/003/004(无色透明玻璃广口瓶: 与默认 chemistry.reagent-bottle.v1
// 同族轮廓 - 直筒瓶身 + 短颈 + 外翻肩, 但玻璃无琥珀色; 瓶内下半为蓝色胆矾晶体堆; 
// 瓶身贴白纸红边手写标签"胆矾 / CuSO4 - 5H2O"; 磨口玻璃塞有时取出横放在旁 - 静置态
// 画塞子在位).证据帧晶体色暗光采样 #316b90/#427da9/#376e8c → 归一到 #2f5f8a 基色 +
// #3a78a8/#4a8fbf 亮阶(与 IR tube-a solid_color #2f5f8a 同源, 先例同 weighing-paper
// 晶色归一口径).
// 状态绑定(渲染器直读): state.solid_g(initial 20, g)→ 晶堆量 amount=clamp(solid_g/40,0,1)
// (40g 满堆口径为 design_notes 声明的渲染约定, IR 无 capacity 字段), 画瓶底晶体堆: 
// 暗色底影椭圆 + 确定性菱形晶体颗群(golden-angle 散布)+ 少量白高光点; solid_g<=0 不画.
// state.volume_ml 有意忽略(瓶装固体, 无液; 默认条目 volume_ml>0 才画液体的语义在此不适用).
// 标签文字读 entity.properties.contents(IR: "胆矾 CuSO₄ - 5H₂O", 按首个空格拆两行), 
// 回退 entity.label.
// 几何: 瓶身轮廓与 renderReagentBottle 逐坐标同族(M-16-43H16V-30L28-20V30Q28 36 21 36H-21Q-28
// 36-28 30V-20L-16-30Z), 原点=瓶底接地中心.玻璃画法 glass-body/glass-highlight/glass-rim, 
// 磨口塞玻璃 frosted 半透明填充.不设 default_for_kind, 由 IR visual.asset_ref 选择
// (default_note 先例同 chemistry.beaker-inverted.v1).

const CRYSTAL_BASE = '#2f5f8a'
const CRYSTAL_FILLS = ['#3a78a8', '#2f5f8a', '#4a8fbf', '#356f9d']

function crystalPile(amount) {
  const nodes = []
  const spread = 6 + 15 * amount
  const baseY = 31
  // 晶堆底影
  nodes.push(svg('ellipse', {cx: 0, cy: baseY, rx: spread + 3, ry: 2.6 + 1.6 * amount, fill: shade(CRYSTAL_BASE, 0.5), opacity: 0.5}))
  // 菱形晶体颗群(golden-angle 确定性散布, 堆高随 amount 升)
  const count = 5 + Math.round(amount * 9)
  for (let index = 0; index < count; index += 1) {
    const angle = (index * 137.5) % 360 * Math.PI / 180
    const radius = (index % 5) * (1.4 + amount)
    const cx = Math.cos(angle) * radius * 1.55
    const cy = baseY - 1.2 - Math.abs(Math.sin(angle)) * radius * 0.62 - (index % 3) * 1.1
    const size = 2.1 + (index % 4) * 0.65
    const fill = CRYSTAL_FILLS[index % CRYSTAL_FILLS.length]
    nodes.push(svg('path', {
      d: `M${cx} ${cy - size}L${cx + size * 0.78} ${cy}L${cx} ${cy + size}L${cx - size * 0.78} ${cy}Z`,
      fill,
      stroke: shade(fill, 0.55),
      'stroke-width': 0.5,
      'stroke-linejoin': 'round',
      class: 'salt-grain',
    }))
    if (index % 3 === 0) {
      nodes.push(svg('circle', {cx: cx - 0.6, cy: cy - size * 0.45, r: 0.5, fill: 'rgb(255 255 255 / 85%)'}))
    }
  }
  return nodes
}

export function renderReagentBottleCuso4(entity, state = {}) {
  const group = svg('g')
  const solidG = Number(state.solid_g)
  const amount = Number.isFinite(solidG) && solidG > 0 ? Math.max(0.12, Math.min(1, solidG / 40)) : 0
  const contents = String(entity?.properties?.contents || entity?.label || '')
  const splitAt = contents.indexOf(' ')
  const line1 = splitAt > 0 ? contents.slice(0, splitAt) : contents
  const line2 = splitAt > 0 ? contents.slice(splitAt + 1) : ''
  add(group,
    shadow(0, 40, 30, 7),
    // 瓶身: 透明玻璃(同族轮廓, 无 amber-glass)
    svg('path', {d: 'M-16-43H16V-30L28-20V30Q28 36 21 36H-21Q-28 36-28 30V-20L-16-30Z', class: 'glass-body'}),
    // 瓶内胆矾晶体堆(solid_g 驱动)
    ...(amount > 0 ? crystalPile(amount) : []),
    // 瓶颈口沿双线(玻璃厚度)
    svg('path', {d: 'M-18-43H18M-16-30H16', class: 'glass-rim'}),
    // 磨口玻璃塞(静置态塞在位; frosted 半透明)
    svg('path', {d: 'M-10 -46H10V-52Q10 -57 5.5 -57H-5.5Q-10 -57 -10 -52Z', fill: 'rgb(221 245 249 / 55%)', stroke: '#41626b', 'stroke-width': 1.6, 'stroke-linejoin': 'round'}),
    svg('path', {d: 'M-6.5 -54.5Q0 -56 6.5 -54.5', fill: 'none', stroke: 'rgb(255 255 255 / 65%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
    // 白纸红边标签(frame-002: 红框白底, 两行手写字)
    svg('rect', {x: -18, y: -1, width: 36, height: 19, rx: 1.5, fill: '#f7f4ea', stroke: '#c0392b', 'stroke-width': 1.6}),
    // 瓶身左缘竖向高光(透明玻璃)
    svg('path', {d: 'M-23 -14V26', class: 'glass-highlight'}),
    svg('path', {d: 'M-13 -40V-33', class: 'glass-highlight'}),
  )
  if (line1) group.append(label(line1, 0, 7, 'bottle-label-text'))
  if (line2) group.append(label(line2, 0, 15.5, 'bottle-label-text'))
  group.append(label(entity.label, 0, 56))
  return group
}
