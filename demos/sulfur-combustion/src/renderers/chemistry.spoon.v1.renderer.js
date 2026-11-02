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

//  -  药匙(固体的溶解速率对比; IR actor=spatula, kind=spoon) - 
// 视觉依据: frame-007/008(手持药匙对横倒试管口送粉: 深灰钢色, 细长柄微弯, 
// 端部浅勺窝, 勺窝朝上); frame-006(匙伸入研钵取粉).
// 几何锚点(与 motion.js DEFAULT_GEOMETRY 对齐): 局部原点 = 勺身中心, y 向下为正; 
// 勺窝朝 +x, 勺窝中心 (20,-16) 恰为 DEFAULT_GEOMETRY.spout  -  charge-tube-b 的 pour
// (tilt 62°) 液流/颗粒流起点即勺窝, 粉末从勺端落入管口; 勺端横移受限(尖端 x=+31, 
// 总长 65), 62° 整体旋转绕原点进行, 勺端不会甩出管口轴线(倾倒锚点 dx 再把勺窝
// 平移到目标口轴线上).柄端 (-34,16) 略下坠, 符合 frame-007 手持姿态(勺端高, 柄低).
// 状态绑定(渲染器直读): state.carrying 'none'|'crystal'|'powder' - crystal 画一小簇
// 深蓝晶体(IR tube-a 同源色 #2f5f8a), powder 画勺窝内细颗粒粉堆(色可由
// entity.properties.powder_color 覆盖, 缺省 #4aa3c9; 本案例黑色 MnO₂ #3a3a3a), none 不画.
// 风格依据: chemistry.js renderGlassRod 细长杆 + 竖向高光惯例与 chemistry.iron-nail.v1
// 的金属内联填色(shade 推导描边/高光, CSS 类会覆盖属性 fill 故不用 .metal); 金属色取
// frame-007 暗光钢色归一 #7d878c(深灰钢, 非亮铬).颗粒堆画法同 solidPile/undissolvedPile
// 惯例(确定性小圆粒 + salt-grain class), 不新增 styles.css class.

const STEEL = '#7d878c'
const STEEL_EDGE = shade(STEEL, 0.52)
const STEEL_HIGHLIGHT = 'rgb(255 255 255 / 55%)'

function carryingLoad(form, hex) {
  const edge = shade(hex, 0.6)
  if (form === 'crystal') {
    // crystal: 勺窝内 1 粒晶体 + 2 碎块(不规则小多边形 + 亮棱面)
    return [
      svg('path', {d: 'M16 -21L21 -22.5L24 -19L21.5 -15.5L16.5 -16L15 -19Z', fill: hex, stroke: edge, 'stroke-width': 0.7, 'stroke-linejoin': 'round', class: 'salt-grain'}),
      svg('path', {d: 'M17 -20L20 -21L22 -18.7L19.5 -17L17 -18Z', fill: shade(hex, 1.45), opacity: 0.75, class: 'salt-grain'}),
      svg('path', {d: 'M23.5 -17.5L26 -18.5L27.5 -16L25.5 -13.8L23 -15Z', fill: shade(hex, 0.85), stroke: edge, 'stroke-width': 0.6, 'stroke-linejoin': 'round', class: 'salt-grain'}),
      svg('path', {d: 'M12.5 -17.5L14.8 -18.3L15.6 -16.2L13.6 -14.8L11.8 -15.8Z', fill: shade(hex, 0.85), stroke: edge, 'stroke-width': 0.6, 'stroke-linejoin': 'round', class: 'salt-grain'}),
    ]
  }
  // powder: 沿勺窝开口线的细颗粒堆(确定性坐标)
  const nodes = []
  const count = 9
  for (let index = 0; index < count; index += 1) {
    const t = index / (count - 1)
    nodes.push(svg('circle', {
      cx: 12.5 + 12.5 * t,
      cy: -15.5 + 3.2 * t - Math.sin(t * Math.PI) * 1.8 - (index % 3) * 0.7,
      r: 1.05 + (index % 3) * 0.3,
      fill: index % 4 === 0 ? shade(hex, 1.25) : hex,
      stroke: edge,
      'stroke-width': 0.35,
      class: 'salt-grain',
    }))
  }
  return nodes
}

export function renderSpoon(entity, state = {}) {
  const group = svg('g')
  add(group,
    shadow(-4, 22, 34, 5),
    // 柄: 细长钢柄, 自柄端 (-34,16) 微弯收到勺尾 (10,-12)(frame-007 柄身浅 S 弯)
    svg('path', {d: 'M-34 16Q-10 12 10 -12', fill: 'none', stroke: STEEL_EDGE, 'stroke-width': 4.2, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-34 16Q-10 12 10 -12', fill: 'none', stroke: STEEL, 'stroke-width': 3.2, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-31 14.2Q-10 10.4 7 -10.5', fill: 'none', stroke: STEEL_HIGHLIGHT, 'stroke-width': 0.9, 'stroke-linecap': 'round', opacity: 0.8}),
    // 勺窝(+x 端浅勺, 侧视: 开口线微凹 + 腹部下垂, 勺窝中心 (20,-16))
    svg('path', {d: 'M10 -12Q20 -3.5 30 -20Q20.5 -10.5 10 -12Z', fill: STEEL, stroke: STEEL_EDGE, 'stroke-width': 1, 'stroke-linejoin': 'round'}),
    // 勺窝开口(暗腔)
    svg('path', {d: 'M10.5 -12.4Q20 -13.5 29.5 -19.6', fill: 'none', stroke: '#3c4347', 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
    // 勺腹反光
    svg('path', {d: 'M13.5 -9.5Q20 -5 26.5 -14.5', fill: 'none', stroke: STEEL_HIGHLIGHT, 'stroke-width': 0.9, 'stroke-linecap': 'round', opacity: 0.6}),
  )
  const carrying = state.carrying
  if (carrying === 'crystal' || carrying === 'powder') {
    // powder 色可由 entity.properties.powder_color 覆盖(本案例黑色 MnO₂ #3a3a3a, 
    // frame-008 瓶口黑粉/IR 倾倒流 color), 缺省保持 #4aa3c9 向后兼容既有案例; 
    // crystal 分支固定 #2f5f8a 不参数化.
    carryingLoad(carrying, carrying === 'crystal' ? '#2f5f8a' : (entity.properties?.powder_color || '#4aa3c9')).forEach(node => group.append(node))
  }
  group.append(label(entity.label, -4, 36))
  return group
}
