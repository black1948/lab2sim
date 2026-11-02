import {add, label, svg} from './svg.js'

//  -  小木条(水平横穿蜡烛火焰, 探究火焰各层温度) - 
// 视觉依据: frame-021(细长浅木色小木条水平横穿火焰; 比火柴梗更粗更长); frame-022/023/024
// (木条与外焰相交处一条深褐炭化带: 带宽约木条厚度的 1.5 倍, 位于木条中部偏右, 木条其余
// 部分仍浅木色 - 单条炭化带为证据主形态; state.char_zones=2 作为"横穿火焰中部"通用摆放的
// 可选分支, 画两条对称炭化带).
// 风格依据: chemistry.js renderMatch 木杆 inline 配色族(杆身 #e3c193 / 描边 #b09468 /
// 木纹 #c9a97e)按 frame-022 采样略去饱和提亮(杆身 #e6c79c); 炭化带沿用
// biology.glowing-splint.v1 charredSegment 的"外缘羽化层 + 核心带 + 灰白灰烬点"分层画法, 
// 色取 frame-022 深褐 #3f2c18(非纯黑); 受热高亮沿用 chemistry.copper-spiral.v1 的分层
// 低不透明度暖色光斑画法.均不新增 styles.css class(inline 配色 + 既有 apparatus-label).
// 局部几何(y 向下, (0,0)=木条中心): 水平长条 120x10(长宽比 12:1, 任务规范值; 证据帧
// 木条两端出画, 全长不可测, 如实记录), 左端 ~15px 渐缩坡口(frame-022 左端略细), 右端
// 圆角.无接地阴影: 手持探件横穿火焰上方(frame-021 手持端在画面右缘外), 固定接地阴影会
// 落在火焰/烛体上产生悬空暗斑(同 chemistry.copper-spiral.v1 的手持探件处理).
// 状态绑定: state.charred=true → 中部偏右单条炭化带(带心 x=+10); state.char_zones=2 →
// 对称双带 x=±10 可选分支; state.heating=true → 受热位置(带心同位 x=+10)弱暖色高亮, 
// 与炭化带可同现(受热→炭化的过渡期).
const BAND_SOFT = '#6b4a28'
const BAND_CORE = '#3f2c18'

// 炭化带: 外缘羽化层(半透明深褐, 带宽 1.5 倍核心带)+ 核心带 + 灰白灰烬点
function charBand(cx) {
  const band = svg('g')
  add(band,
    svg('path', {d: `M${cx - 10} -6.1H${cx + 10}V6.1H${cx - 10}Z`, fill: BAND_SOFT, opacity: 0.42}),
    svg('path', {d: `M${cx - 7} -6.3H${cx + 7}V6.3H${cx - 7}Z`, fill: BAND_CORE}),
    svg('circle', {cx: cx - 2.4, cy: -1.2, r: 0.6, fill: '#b3aea6', opacity: 0.8}),
    svg('circle', {cx: cx + 2.2, cy: 1.4, r: 0.5, fill: '#9d9891', opacity: 0.7}),
  )
  return band
}

// 受热高亮: 受热位置弱暖色光斑(frame-021 受热中; 不透明度低, 不遮挡杆身木色)
function heatGlow(cx) {
  const glow = svg('g')
  add(glow,
    svg('ellipse', {cx, cy: 0, rx: 17, ry: 8.5, fill: '#ff9440', opacity: 0.15}),
    svg('ellipse', {cx, cy: 0, rx: 10, ry: 5, fill: '#ffb066', opacity: 0.17}),
  )
  return glow
}

export function renderWoodSplint(entity, state = {}) {
  const group = svg('g')
  const charred = Boolean(state.charred)
  const heating = Boolean(state.heating)
  const bandCenters = Number(state.char_zones) === 2 ? [-10, 10] : [10]
  // 木条本体: 浅木色长条 + 左端渐缩坡口 + 右端圆角 + 上下两道木纹
  add(group,
    svg('path', {
      d: 'M-60 0Q-60 -1.4 -55.5 -2.6L-46 -4.7Q-44.4 -5 -42.5 -5H54.5Q60 -5 60 0Q60 5 54.5 5H-42.5Q-44.4 5 -46 4.7L-55.5 2.6Q-60 1.4 -60 0Z',
      fill: '#e6c79c', stroke: '#b09468', 'stroke-width': 1, 'stroke-linejoin': 'round',
    }),
    svg('path', {d: 'M-40 -1.2H52', fill: 'none', stroke: '#c9a97e', 'stroke-width': 0.8, opacity: 0.85}),
    svg('path', {d: 'M-32 1.9H44', fill: 'none', stroke: '#c9a97e', 'stroke-width': 0.7, opacity: 0.7}),
  )
  // 炭化带在下, 受热光斑叠上(受热→炭化过渡期两者同现时呈"炭化+余温"观感)
  if (charred) bandCenters.forEach(cx => group.append(charBand(cx)))
  if (heating) group.append(heatGlow(10))
  group.append(label(entity.label, 0, 20))
  return group
}
