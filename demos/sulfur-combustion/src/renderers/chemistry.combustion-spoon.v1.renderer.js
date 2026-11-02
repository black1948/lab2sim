import {add, label, svg} from './svg.js'

//  -  燃烧匙(长柄金属灼烧匙: 细长杆自上而下 + 末端宽浅勺窝, 勺口朝上) - 
// 视觉依据: frame-002(特写: 宽浅半球勺窝, 杆接勺窝右后缘向上, 淡黄硫粉堆高出勺口); 
// frame-004/005(侧视: 浅盘勺窝, 杆接右缘竖直上行, 熔融黄绿硫液平铺勺窝); frame-003/006
// (酒精灯加热, 勺窝悬于灯焰上方); frame-007/008/015/016/017/020/021(空气中燃烧: 勺窝上
// 方微弱淡蓝色小火焰, 锥形, 低对比, 近勺窝同宽); frame-011/012/018/019(氧气中燃烧: 明亮
// 蓝紫色大火焰 - 近白亮核 + 蓝紫外晕 + 大范围泛光, 透过瓶身照亮整瓶).
// 复用否决(trace assets-1-reuse-review): chemistry.spoon.v1 是短柄小勺窝横置送粉药匙, 几何
// 锚定 DEFAULT_GEOMETRY.spout 倾倒手势, 无硫状态/火焰分支(送粉≠灼烧, 不许顶替); 
// match/candle/lighter/burning-splint/wood-splint/copper-spiral 均无勺窝盛粉容器, 形状功能不符.
// 发现无候选(trace assets-2-discover): discover_apparatus.py query 'combustion spoon deflagrating
// spoon chemistry' 与放宽 'spoon' 两轮均 no scored vector file matched.
// 风格依据: 金属画法沿用 chemistry.js renderGlassRod 细长杆+竖向高光惯例与 chemistry.iron-nail.v1 /
// chemistry.spoon.v1 的金属内联填色口径(shade 推导描边/高光, 不用 .metal class 以免 CSS 覆盖
// 属性 fill); 火焰分层沿用三层 flame-outer/flame-inner/flame-core 既有 class(styles.css 仅挂
// flame-flicker 动画, fill 走内联属性 - chemistry.burning-splint.v1 先例), 淡蓝焰配色参照
// chemistry.js 尖嘴 CO 淡蓝焰(#7db8ff/#c9e2ff/#eef7ff 族按 frame-007 低对比采样降饱和降不透明度), 
// 蓝紫焰配色按 frame-011/012/019 采样(亮核 #f8fdfd, 外晕 #9fbef8/#abcaf3 蓝紫, 泛光 #9ab6e8); 
// 泛光晕低不透明度分层画法参照 chemistry.burning-splint.v1 boostedFlame / biology.glowing-splint.v1.
// 颜色采样(归一化到模板浅色主题口径, 证据帧为冷蓝背光故整体压暗): 勺窝金属 frame-002 实测
// #293126/#566f53(背光剪影 frame-007 近 #000)→ 归一深钢 #5a6367; 硫粉 frame-002 #bada9d/#a3c497
// → #cdd89c; 熔融硫 frame-004 #6b8f36 → #86a63c; 燃烧后勺窝 frame-016 暗黑 → #2f302a.
// 局部几何(y 向下, (0,0)=勺窝开口中心): 勺窝开口半宽 ±23(椭圆开口 ry 4.6), 勺窝深 18(外底
// y=+18, frame-002 深/宽≈0.36); 金属杆接右缘(±21.5, 宽 4.2)竖直上行至 y=-207(≥200 约定, 
// 视频中杆出画全长不可测); 火焰自勺窝口向上(y 负方向).
// 状态绑定(渲染器直读, 键名与 IR 契约一致; 未知值/缺省零分支): 
//   state.sulfur_state 'powder' → 勺窝内淡黄硫粉堆(高出勺口, frame-002)
//                       'melted' → 熔融黄绿硫液平铺勺窝(frame-004/005)
//                       'burning' → 燃烧后暗色焦渣(frame-016/017 勺窝暗黑)
//   state.flame_mode  'air' → 微弱淡蓝小火焰(宽≈0.6 勺窝, 低不透明度, frame-007/020/021)
//                       'oxygen' → 明亮蓝紫大火焰(亮核+蓝紫外晕+双层泛光, frame-011/012/018/019)
//                       'none'/缺省 → 无火焰
//   state.heating true → 勺窝下方受热暖光晕(可选效果, frame-003/006 勺底被灯焰照亮)
//   守卫: 全部分支用严格相等枚举匹配 - 硫状态与火焰模式互不牵连(空气中燃烧时勺窝呈 burning
//   焦渣+air 焰, 氧气中为 burning+oxygen 焰, 同帧共存), 缺省不臆造粉末或火焰.

const STEEL = '#5a6367'
const STEEL_EDGE = '#31363a'
const CAVITY = '#31383c'
const ROD = '#464e52'
const ROD_EDGE = '#262b2e'
const METAL_HIGHLIGHT = 'rgb(255 255 255 / 45%)'

const HALF_W = 23
const RIM_RX = 21
const RIM_RY = 4.6
const ROD_X = 21.5
const ROD_TOP = -207
const ROD_W = 2.1

const POWDER = '#cdd89c'
const POWDER_EDGE = '#9aa66e'
const POWDER_LIGHT = '#e6ecbc'
const MELT = '#86a63c'
const MELT_LIGHT = '#b9d06a'
const MELT_EDGE = '#5f7d28'
const CRUST = '#2f302a'

// 淡黄硫粉堆(frame-002: 粉堆高出勺口, 顶面凹凸)
function powderMound() {
  const g = svg('g')
  add(g,
    svg('path', {
      d: 'M-19 0Q-17 -4 -12 -5.2Q-8 -7.6 -3 -6.2Q1 -8.6 6 -6.8Q11 -7.9 15 -4.6Q18 -3 19 0Q0 4.4 -19 0Z',
      fill: POWDER, stroke: POWDER_EDGE, 'stroke-width': 0.8, 'stroke-linejoin': 'round',
    }),
    svg('path', {d: 'M-14 -4.6Q-6 -7.4 2 -6.6Q9 -6.9 13.5 -4.2', fill: 'none', stroke: POWDER_LIGHT, 'stroke-width': 1.3, 'stroke-linecap': 'round', opacity: 0.85}),
    svg('circle', {cx: -9, cy: -4.4, r: 1.05, fill: POWDER_LIGHT, opacity: 0.9}),
    svg('circle', {cx: -2.5, cy: -6, r: 0.9, fill: POWDER_LIGHT, opacity: 0.8}),
    svg('circle', {cx: 8.5, cy: -5.4, r: 1, fill: POWDER_LIGHT, opacity: 0.85}),
    svg('circle', {cx: 14.5, cy: -3.2, r: 0.8, fill: POWDER_LIGHT, opacity: 0.7}),
  )
  return g
}

// 熔融硫液(frame-004/005: 黄绿液面平铺勺窝, 边缘亮线)
function meltPool() {
  const g = svg('g')
  add(g,
    svg('path', {
      d: `M${-RIM_RX} 0Q0 ${-RIM_RY} ${RIM_RX} 0Q${RIM_RX - 2} 3 0 3.6Q${-(RIM_RX - 2)} 3 ${-RIM_RX} 0Z`,
      fill: MELT, stroke: MELT_EDGE, 'stroke-width': 0.8, 'stroke-linejoin': 'round',
    }),
    svg('path', {d: 'M-15 -1.5Q0 -4 15 -1.5', fill: 'none', stroke: MELT_LIGHT, 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: 0.9}),
    svg('ellipse', {cx: -8, cy: -0.6, rx: 3.4, ry: 1, fill: MELT_LIGHT, opacity: 0.5}),
  )
  return g
}

// 燃烧后焦渣(frame-016/017: 勺窝内暗黑色泽 + 灰白渣点)
function burntCrust() {
  const g = svg('g')
  add(g,
    svg('path', {
      d: `M${-RIM_RX} 0Q0 ${-RIM_RY} ${RIM_RX} 0Q${RIM_RX - 2} 3 0 3.6Q${-(RIM_RX - 2)} 3 ${-RIM_RX} 0Z`,
      fill: CRUST,
    }),
    svg('circle', {cx: -7, cy: -0.8, r: 1, fill: '#8f8a80', opacity: 0.75}),
    svg('circle', {cx: 3.5, cy: 0.6, r: 0.8, fill: '#b3aea6', opacity: 0.65}),
    svg('circle', {cx: 11, cy: -1, r: 0.9, fill: '#8f8a80', opacity: 0.6}),
  )
  return g
}

// 空气中燃烧: 微弱淡蓝色小火焰(frame-007 实测: 软锥形, 底宽≈0.57 勺窝, 高≈0.5 勺窝, 
// 低对比低饱和 - 比背景仅略亮略蓝)
function airFlame() {
  const flame = svg('g', {transform: 'translate(0 -1)'})
  add(flame,
    svg('ellipse', {cx: 0, cy: -10, rx: 14, ry: 16, fill: '#9fb6e8', opacity: 0.1}),
    svg('path', {
      d: 'M0 -26Q-7 -17 -11 -7.5Q-13.5 0.5 0 1.8Q13.5 0.5 11 -7.5Q7 -17 0 -26Z',
      fill: '#8ca6de', opacity: 0.4, class: 'flame-outer',
    }),
    svg('path', {
      d: 'M0 -18Q-4.2 -12 -6.4 -5.6Q-7.8 0.4 0 1.1Q7.8 0.4 6.4 -5.6Q4.2 -12 0 -18Z',
      fill: '#ccd9f2', opacity: 0.52, class: 'flame-inner',
    }),
    svg('path', {
      d: 'M0 -10Q-2 -6.5 -2.8 -3.2Q-3.2 0.2 0 0.4Q3.2 0.2 2.8 -3.2Q2 -6.5 0 -10Z',
      fill: '#eef4fc', opacity: 0.5, class: 'flame-core',
    }),
  )
  return flame
}

// 氧气中燃烧: 明亮蓝紫大火焰(frame-011/012/018/019: 宽软泪滴亮核近白 + 蓝紫外晕 +
// 双层大泛光弥散; frame-012 亮核宽/高≈0.6, 焰体显著大于空气焰)
function oxygenFlame() {
  const flame = svg('g', {transform: 'translate(0 -1)'})
  add(flame,
    // 三层低不透明度大泛光晕(瓶内燃时照亮整瓶, frame-011/019; 低值大半径逐级软化边界)
    svg('ellipse', {cx: 0, cy: -34, rx: 56, ry: 80, fill: '#96acf2', opacity: 0.05}),
    svg('ellipse', {cx: 0, cy: -32, rx: 42, ry: 62, fill: '#96acf2', opacity: 0.08}),
    svg('ellipse', {cx: 0, cy: -24, rx: 27, ry: 42, fill: '#a3baf6', opacity: 0.12}),
    svg('path', {
      d: 'M0 -62Q-12 -42 -16.5 -21Q-19 -3.5 0 -1.6Q19 -3.5 16.5 -21Q12 -42 0 -62Z',
      fill: '#96b0f4', opacity: 0.75, class: 'flame-outer',
    }),
    svg('path', {
      d: 'M0 -48Q-9 -33 -12 -17Q-13.6 -2.8 0 -1.7Q13.6 -2.8 12 -17Q9 -33 0 -48Z',
      fill: '#cddcf9', class: 'flame-inner',
    }),
    svg('path', {
      d: 'M0 -32Q-5.4 -21 -7.6 -10.5Q-8.8 -2 0 -1.6Q8.8 -2 7.6 -10.5Q5.4 -21 0 -32Z',
      fill: '#f6fbfe', class: 'flame-core',
    }),
  )
  return flame
}

// 受热光效(frame-003/006: 勺窝底部被灯焰照亮的暖光晕, 可选状态)
function heatGlow() {
  const g = svg('g')
  add(g,
    svg('ellipse', {cx: 0, cy: 16, rx: 17, ry: 5.5, fill: '#ff9440', opacity: 0.16}),
    svg('ellipse', {cx: 0, cy: 13.5, rx: 10, ry: 3.4, fill: '#ffb066', opacity: 0.14}),
  )
  return g
}

export function renderCombustionSpoon(entity, state = {}) {
  const group = svg('g')
  add(group,
    // 金属杆: 右缘竖直上行, 顶端圆头(视频杆出画, 取有限长直杆+圆端; 先例 burning-splint 圆角端)
    svg('path', {
      d: `M${ROD_X - ROD_W} ${ROD_TOP + 2.1}Q${ROD_X - ROD_W} ${ROD_TOP} ${ROD_X} ${ROD_TOP}Q${ROD_X + ROD_W} ${ROD_TOP} ${ROD_X + ROD_W} ${ROD_TOP + 2.1}L${ROD_X + ROD_W} -2L${ROD_X - ROD_W} -2Z`,
      fill: ROD, stroke: ROD_EDGE, 'stroke-width': 0.8, 'stroke-linejoin': 'round',
    }),
    svg('path', {d: `M${ROD_X - 0.9} ${ROD_TOP + 5}V-4`, fill: 'none', stroke: METAL_HIGHLIGHT, 'stroke-width': 0.8, 'stroke-linecap': 'round', opacity: 0.7}),
    // 勺窝: 开口暗腔 + 外壳(宽浅半球盘, frame-002 深/宽≈0.36)
    svg('ellipse', {cx: 0, cy: 0, rx: RIM_RX, ry: RIM_RY, fill: CAVITY}),
    svg('path', {
      d: `M${-HALF_W} 0C-22.5 10 -15 17 0 18C15 17 22.5 10 ${HALF_W} 0Q0 ${RIM_RY} ${-HALF_W} 0Z`,
      fill: STEEL, stroke: STEEL_EDGE, 'stroke-width': 1, 'stroke-linejoin': 'round',
    }),
    // 口沿亮边(frame-002 左右缘高光)+ 前唇反光
    svg('path', {d: 'M-23 0Q-21.5 -3.4 -16.5 -4.4', fill: 'none', stroke: METAL_HIGHLIGHT, 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: 0.8}),
    svg('path', {d: 'M23 0Q21.5 -3.4 16.5 -4.4', fill: 'none', stroke: METAL_HIGHLIGHT, 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: 0.6}),
    svg('path', {d: 'M-16 3.4Q0 6.6 16 3.4', fill: 'none', stroke: METAL_HIGHLIGHT, 'stroke-width': 0.9, 'stroke-linecap': 'round', opacity: 0.45}),
    svg('path', {d: 'M-12 12.5Q0 15.6 12 12.5', fill: 'none', stroke: METAL_HIGHLIGHT, 'stroke-width': 0.8, 'stroke-linecap': 'round', opacity: 0.3}),
  )
  // 硫状态(严格枚举匹配, 未知/缺省零分支 - 空勺窝)
  const sulfur = state.sulfur_state
  if (sulfur === 'powder') group.append(powderMound())
  else if (sulfur === 'melted') group.append(meltPool())
  else if (sulfur === 'burning') group.append(burntCrust())
  // 火焰模式(严格枚举匹配, 'none'/缺省/未知值无火焰)
  const mode = state.flame_mode
  if (mode === 'air') group.append(airFlame())
  else if (mode === 'oxygen') group.append(oxygenFlame())
  // 受热光效(可选)
  if (state.heating === true) group.append(heatGlow())

  // 无接地阴影: 手持/悬持探件(加热悬于灯焰上方, 燃烧悬于瓶内, chemistry.burning-splint.v1 先例)
  // 标签置于杆上段左侧外(text-anchor middle 于 x=-44: 文字右缘≈-25, 不压杆身 x≈19..24 与火焰/泛光区)
  group.append(label(entity.label, -44, -186))
  return group
}
