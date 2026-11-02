//  -  手持式电吹风(有状态视觉) - 
// 视觉依据: frame-025/026(白色机身, 细长喷嘴朝向植株左侧喷风, 机身右后段有暗色品牌字样, 
// 手持段在画面外; frame-025 喷口截面窄, 约为机身高度的 1/3); frame-026 采样: 机身亮部
// #f2f4f4, 机身暗侧 #c3ccce, 描边 #8fa0a6, 喷嘴内孔 #5a676c.
// 风格依据: biology.js code-native 器械画法(renderTissueDissociator/renderTubeRotator 的
// 白色机身圆角体块 + inline 配色 + 圆角描边约定)+ apparatus-shadow 接地阴影 + 既有
// tube-flow 风丝动画 class(styles.css 已有, 不新增 class).
// 状态绑定(IR visual.state_bindings): state.running=true → 喷口向 -x 画出 3 道气流线/风丝
// (frame-025 风向自右向左: 喷口朝左, 本渲染局部 -x 即喷风方向); false → 无气流线.
// 可选 state.airflow_dir(+1/-1)覆盖喷风方向, 缺省 -1(与 plant_stem 的偏摆方向一致).
// 证据不清处: ①机身品牌字样按任务要求不复刻, 留白; ②手持柄在全部证据帧均不可见, 
// 不画手柄; ③开关细节证据不可辨, 以一枚无文字滑键示意.
// 锚点: 局部 (0,0)=喷口截面中心; 机身在 +x 侧(喷嘴长 22, 机身 78x56).
// 导出签名沿用既有模块先例: export function renderHairDryer(entity, state) 返回 SVG group; 
// svg()/add()/label()/shadow() 在模块内自含最小实现(不 import biology.js, 避免改动既有文件).

const NS = 'http://www.w3.org/2000/svg'

function svg(tag, attributes = {}) {
  const node = document.createElementNS(NS, tag)
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value))
  })
  return node
}

function add(parent, ...children) {
  children.flat().filter(Boolean).forEach(child => parent.append(child))
  return parent
}

function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

function shadow(cx = 0, cy = 0, rx = 28, ry = 7) {
  return svg('ellipse', {cx, cy, rx, ry, class: 'apparatus-shadow'})
}

const BODY_FILL = '#f4f6f7'
const BODY_EDGE = '#b7c1c5'
const BODY_SHADE = '#c3ccce'
const BODY_DARK = '#8fa0a6'

export function renderHairDryer(entity, state = {}) {
  const group = svg('g')
  const running = Boolean(state.running)
  const dir = Number(state.airflow_dir) === 1 ? 1 : -1  // 喷风方向: 缺省 -1(自右向左, frame-025)

  add(group,
    shadow(58, 34, 44, 7),
    // 细长喷嘴(frame-025/026: 喷口截面约为机身高度 1/3 的长锥管)
    svg('path', {d: 'M0 -5.5L20 -9.5L20 9.5L0 5.5Z', fill: '#eef1f2', stroke: BODY_EDGE, 'stroke-width': 1.6, 'stroke-linejoin': 'round'}),
    svg('path', {d: 'M2 -4.6L18 -7.6', stroke: 'rgb(255 255 255 / 75%)', 'stroke-width': 1.4, 'stroke-linecap': 'round', fill: 'none'}),
    svg('ellipse', {cx: 0.8, cy: 0, rx: 1.9, ry: 4.6, fill: '#5a676c'}),
    // 机身(白色圆角体块, frame-026 亮部 #f2f4f4 / 暗侧 #c3ccce)
    svg('rect', {x: 20, y: -30, width: 76, height: 56, rx: 15, fill: BODY_FILL, stroke: BODY_EDGE, 'stroke-width': 1.8}),
    svg('path', {d: 'M28 -26Q46 -30 70 -28', stroke: 'rgb(255 255 255 / 85%)', 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none'}),
    svg('path', {d: 'M92 -20Q94 0 90 20', stroke: BODY_SHADE, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none', opacity: 0.8}),
    // 机背进风格栅(frame-026 机尾色带)
    svg('rect', {x: 84, y: -24, width: 9, height: 46, rx: 4, fill: '#e3e8ea', stroke: BODY_EDGE, 'stroke-width': 1}),
    svg('path', {d: 'M87 -20V18M90 -20V18M93 -20V18', stroke: BODY_DARK, 'stroke-width': 1, opacity: 0.6, fill: 'none'}),
    // 机盖接缝线 + 滑键(无文字; frame-026 机身上缘开关位置)
    svg('path', {d: 'M22 4H80', stroke: BODY_SHADE, 'stroke-width': 1, opacity: 0.8, fill: 'none'}),
    svg('rect', {x: 44, y: -35, width: 18, height: 7, rx: 3, fill: '#dfe5e7', stroke: BODY_EDGE, 'stroke-width': 1}),
    svg('path', {d: 'M53 -34V-30', stroke: BODY_DARK, 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )
  if (running) {
    // 喷口气流线/风丝: 静态淡蓝底线 + tube-flow 虚线动画(既有 class, 无新增)
    // 风丝画在 +x 方向, 再按 dir 镜像: dir=-1(缺省)→ 向左喷(frame-025)
    const wind = svg('g', {transform: `scale(${dir} 1)`})
    add(wind,
      svg('path', {d: 'M3 -3.4Q16 -8 30 -6.5T54 -4', stroke: 'rgb(140 180 195 / 50%)', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round'}),
      svg('path', {d: 'M3 0Q18 -2 34 1T60 2', stroke: 'rgb(140 180 195 / 38%)', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round'}),
      svg('path', {d: 'M3 3.4Q16 8 30 6.5T54 4', stroke: 'rgb(140 180 195 / 50%)', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round'}),
      svg('path', {d: 'M4 -3.4Q16 -8 30 -6.5T54 -4', class: 'tube-flow'}),
      svg('path', {d: 'M4 0Q18 -2 34 1T60 2', class: 'tube-flow'}),
      svg('path', {d: 'M4 3.4Q16 8 30 6.5T54 4', class: 'tube-flow'}),
    )
    group.append(wind)
  }
  group.append(label(entity.label, 58, 52))
  return group
}
