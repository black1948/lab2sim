import {add, liquidColor, shadow, svg} from './svg.js'

function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

//  -  塑料洗瓶(蒸馏水; 固体的溶解速率对比) - 
// 视觉依据: frame-013/014/016(手持倾倒特写最清晰: 半透明乳白 HDPE 椭圆长瓶身 +
// 红色瓶盖 + 与盖同色的细长弯嘴; 倾倒时瓶体整体倾斜, 弯嘴尖端朝下伸向管口, 
// 液流自嘴尖落入).证据帧暗光采样归一: 瓶身乳白 #a2aa9b/#b0b0ae → rgb(233 236 231/92%)
// 半透明填充 + #a8b2a6 描边; 盖/嘴红 #ab3519 → #c2452c(描边 #8f2f1d).
// 几何锚点(集成约束, 构建方给定): 局部原点 = 瓶身中心, y 向下为正; 弯嘴尖端必须
// 落在局部 (20,-16) 附近  -  motion.js 无 wash_bottle 专属 GEOMETRY 条目, 倾倒液流起点
// 读 DEFAULT_GEOMETRY.spout={x:20,y:-16}, 嘴尖即液流起点, 不需改模板.弯嘴自红盖顶
// 弧起, 外摆后下勾到嘴尖(杖头形), 配合 pour(tilt 52°, 目标在左时 sign=-1 瓶顶向左倾)
// 嘴尖旋至瓶体上方偏左, 液流自嘴尖落入目标口.
// 状态绑定(渲染器直读): state.volume_ml(initial 200, 每次倾倒 -4)画瓶内水位, 
// 液位公式 level_y = 27 - (volume_ml/capacity)*46, capacity 读 entity.properties.capacity_ml
// 缺省 250(瓶体大部分常满, 与视频一致); volume_ml<=0 不画液.瓶内液为微浑 milky 水色
// #d7e3dd(.liquid class 78% 不透明度叠半透明瓶身即乳白观感), 常满态由 initial 200/250 呈现.
// 风格依据: 2.5D 塑料件配色先例 biology.test-tube-rack.v1.renderer.js 的浅色体块 +
// 左缘受光高光 + 右侧暗线画法(本件为半透明塑料, 色相偏冷灰白); apparatus-shadow
// 接地阴影; 不新增 styles.css class.

const CAP_RED = '#c2452c'
const CAP_RED_EDGE = '#8f2f1d'

// 瓶身内轮廓(液面裁剪用, 比外轮廓内缩约 3)
const BODY_INNER = 'M-6.2 -26.5H6.2Q8 -22.5 13 -18.5Q18.6 -11.5 18.6 3Q18.6 23.5 10.5 27.5Q0 31.5 -10.5 27.5Q-18.6 23.5 -18.6 3Q-18.6 -11.5 -13 -18.5Q-8 -22.5 -6.2 -26.5Z'

export function renderWashBottle(entity, state = {}) {
  const group = svg('g')
  const capacity = Number(entity?.properties?.capacity_ml || 250)
  const volume = Number(state.volume_ml || 0)
  const ratio = volume > 0 ? Math.max(0.05, Math.min(0.95, volume / Math.max(capacity, 1))) : 0
  const liquidTop = 27 - ratio * 46
  const water = liquidColor(state, '#d7e3dd')
  const clipId = `washbottle-liquid-${String(entity?.id || 'x').replace(/[^a-zA-Z0-9_-]/g, '')}`
  add(group,
    shadow(0, 34, 27, 6),
    // 瓶身: 乳白半透明 HDPE(肩部收颈, 腹圆, 底圆收)
    svg('path', {d: 'M-8 -30H8Q10 -24 16 -20Q22.5 -12 22.5 3Q22.5 26 12.5 30.5Q0 34.5 -12.5 30.5Q-22.5 26 -22.5 3Q-22.5 -12 -16 -20Q-10 -24 -8 -30Z', fill: 'rgb(233 236 231 / 92%)', stroke: '#a8b2a6', 'stroke-width': 2, 'stroke-linejoin': 'round'}),
    // 瓶内水位(clip 到内轮廓; milky 蒸馏水)
    ratio > 0 ? svg('path', {d: BODY_INNER, fill: water, class: 'liquid', 'clip-path': `url(#${clipId})`}) : null,
    ratio > 0 ? add(svg('clipPath', {id: clipId}), svg('rect', {x: -24, y: liquidTop, width: 48, height: 62 - liquidTop})) : null,
    ratio > 0 ? svg('path', {d: `M-17.5 ${liquidTop}Q0 ${liquidTop - 2.6} 17.5 ${liquidTop}`, fill: 'none', stroke: 'rgb(120 150 142 / 55%)', 'stroke-width': 1.3, 'stroke-linecap': 'round'}) : null,
    // 瓶身左缘受光高光 + 右侧暗线(2.5D 塑料体积感)
    svg('path', {d: 'M-14.5 -12Q-16.5 4 -11.5 22', fill: 'none', stroke: 'rgb(255 255 255 / 75%)', 'stroke-width': 2.8, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M15 -10Q16.8 4 12 22', fill: 'none', stroke: 'rgb(120 132 120 / 60%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
    // 瓶底暗弧
    svg('path', {d: 'M-12 27.5Q0 31.5 12 27.5', fill: 'none', stroke: 'rgb(120 132 120 / 45%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    // 红色瓶盖(较高, 顶缘略宽, frame-013/016)
    svg('path', {d: 'M-8.5 -30H8.5V-41.5Q8.5 -44.5 5.5 -44.5H-5.5Q-8.5 -44.5 -8.5 -41.5Z', fill: CAP_RED, stroke: CAP_RED_EDGE, 'stroke-width': 1.6, 'stroke-linejoin': 'round'}),
    svg('path', {d: 'M-8.5 -34.5H8.5M-7.5 -39H7.5', stroke: 'rgb(255 255 255 / 35%)', 'stroke-width': 1.1, 'stroke-linecap': 'round', fill: 'none'}),
    // 细长弯嘴: 自盖顶弧起, 外摆后下勾, 尖端精确落在 (20,-16)(DEFAULT_GEOMETRY.spout, 
    // 倾倒液流起点); 嘴与盖同为红色塑料(frame-014 嘴盖同色)
    svg('path', {d: 'M1 -43.5Q11 -42 13.5 -35Q15.5 -28 18.6 -20.5Q19.6 -18.2 20 -16', fill: 'none', stroke: CAP_RED_EDGE, 'stroke-width': 4.6, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M1 -43.5Q11 -42 13.5 -35Q15.5 -28 18.6 -20.5Q19.6 -18.2 20 -16', fill: 'none', stroke: CAP_RED, 'stroke-width': 3.4, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M2.5 -42.6Q10.5 -41.4 12.4 -35.6', fill: 'none', stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
    // 嘴尖开口(暗点)
    svg('ellipse', {cx: 20, cy: -16, rx: 1.9, ry: 1.3, fill: '#6d2415', transform: 'rotate(42 20 -16)'}),
  )
  group.append(label(entity.label, 0, 54))
  return group
}
