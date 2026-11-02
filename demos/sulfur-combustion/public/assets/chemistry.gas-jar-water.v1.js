import {add, label, shadow, svg} from './svg.js'

//  -  正立宽口集气瓶 - 带瓶底水层派生变体(125mL 级 + 瓶底少量无色水) - 
// 派生声明: 器身画法 1:1 拷贝自 chemistry.gas-jar.v1(chemistry.gas-jar.v1.renderer.js, 他案共享, 
// 未改动原文件) - 同一瓶形(直筒身微上宽下窄 + 圆肩短颈 + 外扩磨口沿 + 厚玻璃底带), 同一
// glass-body/glass-rim/glass-highlight/apparatus-shadow 类与几何(局部 (0,0)=瓶底面中心, 口沿顶线
// y=-127, 总高 131, 瓶身宽 66..71), 保证 verifier 按同一器材识别(style_basis 见注册表条目).
// 本文件唯一增量 = 瓶底无色水层.
// 视觉依据: frame-009(开盖静置: 瓶底无色液体, 实测水面线 y≈390, 瓶底 y≈470, 总高 335px →
// 可见液层≈瓶身 13%); frame-012/019(燃烧时瓶底水层仍在, 被焰光映亮); frame-020/021(分屏
// 对比左瓶同款水层).水层画在厚底带之上, 极淡冷色透明 + 水面高光线(证据帧水体与空瓶玻璃
// 色差微弱: 水 #76948c vs 空瓶 #9bb9c4, 略深略绿); 不画雾层/刻度/气泡(证据帧瓶壁只有既有
// 器身细尘点语义, 归 gas-jar 原画法, 不新增).
// 水层高度: 读 entity.properties.bottom_water_ml(mL), 线性映射 1mL→2.125 局部px, 缺省 8mL →
// 17px ≈ 总高 131 的 13%(落在证据帧 12~18% 区间); clamp [3,30](0/缺省/非法值 → 8mL 缺省层; 
// 负值/NaN 不画水量失真).水位线沿瓶身内壁锥度收窄(厚底带内口 ±30.6 → 上方按 0.026/px 展开).
// state 形参仅签名一致(器身无状态分支, 水层只读 entity.properties - 同 chemistry.gas-jar.v1 /
// chemistry.knife.v1 先例).
const RIM_Y = -127

function waterGeometry(entity) {
  const ml = Number(entity.properties?.bottom_water_ml)
  const height = Number.isFinite(ml) && ml > 0 ? Math.min(30, Math.max(3, ml * 2.125)) : 17
  const top = -8 - height
  // 瓶身内壁半宽: 厚底带内口 ±30.6(y=-8), 向上沿直筒身锥度微展宽(外锥 2.5/96 → 内锥 ≈0.026/px)
  const halfWidth = 30.6 - (top + 8) * 0.026
  return {top, halfWidth}
}

function waterLayer(entity) {
  const {top, halfWidth} = waterGeometry(entity)
  const w = Math.abs(halfWidth)
  const g = svg('g')
  add(g,
    // 极淡冷色透明水体(玻璃绿灰族, 比厚底带 18% 略深 - 证据帧水体比空瓶略深略绿)
    svg('path', {
      d: `M${-w} ${top}L${w} ${top}L30.6 -8L-30.6 -8Z`,
      fill: 'rgb(95 143 124 / 26%)', stroke: 'none',
    }),
    // 水面线(meniscus 既有 class 惯例, 同 renderBeaker 液面画法)
    svg('path', {d: `M${-w} ${top}Q0 ${top - 1.8} ${w} ${top}`, class: 'meniscus'}),
    // 水面下高光线(frame-009 水面亮带)
    svg('path', {d: `M${-(w - 2.5)} ${top + 2.6}Q0 ${top + 0.8} ${w - 2.5} ${top + 2.6}`, fill: 'none', stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
  )
  return g
}

export function renderGasJarWater(entity, state = {}) {
  const group = svg('g')
  void state  // 器身无状态分支: 水层只读 entity.properties.bottom_water_ml(见文件头)
  add(group,
    shadow(0, 7, 42, 7),
    //  -  以下器身与 chemistry.gas-jar.v1 逐笔一致  - 
    // 瓶体轮廓: 口沿 → 颈 → 肩 → 直筒身 → 厚底(glass-body 半透明玻璃)
    svg('path', {
      d: 'M-21 -127L21 -127L21 -112.5Q35.5 -110 35.5 -96L33 0Q32.5 4 26 4L-26 4Q-33.5 4 -33 0L-35.5 -96Q-35.5 -110 -21 -112.5Z',
      class: 'glass-body',
    }),
    // 厚玻璃底带 + 内底弧
    svg('path', {
      d: 'M-30.6 -8L30.6 -8L29.6 0Q29 3 24 3L-24 3Q-29 3 -29.6 0Z',
      fill: 'rgb(95 143 124 / 18%)', stroke: 'none',
    }),
    svg('path', {d: 'M-30.6 -8Q0 -5.2 30.6 -8', fill: 'none', stroke: '#5f8f7c', 'stroke-width': 1.2, opacity: 0.5}),
  )
  // 增量: 瓶底水层(厚底带之上)
  group.append(waterLayer(entity))
  add(group,
    // 平磨口沿: 外扩唇线 + 磨砂密封带细线
    svg('path', {d: 'M-24 -127H24', class: 'glass-rim'}),
    svg('path', {d: 'M-21.5 -122H21.5', fill: 'none', stroke: '#34545e', 'stroke-width': 1.1, opacity: 0.5}),
    // 竖向高光: 瓶身主高光 + 颈部短高光
    svg('path', {d: 'M-26 -88V-14', class: 'glass-highlight'}),
    svg('path', {d: 'M-14 -124V-115', class: 'glass-highlight', opacity: 0.8}),
  )
  // 标签置于瓶身下方外侧(同 chemistry.gas-jar.v1)
  group.append(label(entity.label, 0, 26))
  return group
}
