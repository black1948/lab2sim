import {add, label, shadow, svg} from './svg.js'

//  -  气垫导轨(带标尺) - 
// 视觉依据: frame-008(绿色三角截面导轨横贯画面, 右端接气源), frame-014/016(导轨前缘
// 直尺刻度, 黑色支脚), frame-022/023(白/银色滑行面顶棱).
// 复用审查否决记录: physics.slope 为 20° 木质倾斜轨道(带倾角标注), 非水平气垫导轨; 
// physics.optical-bench 为光学导轨(带标尺但截面/支脚/端头不同且语义为光学).无诚实复用.
// 风格依据: physics.js renderIncline 基座/支脚画法 + markings 刻度约定, inline 配色.
// 锚点: 局部 (0,0)=导轨轴向中心; 滑行面顶棱在 y=-20(scene anchors.launch=(−0.24,−0.04)
// 即屏幕 (−240,−20)), 小车经 anchored_gap=0.08(40px)吸附到顶棱上方.
// 刻度: 导轨长 800px 对应 80 cm(IR properties.track_len_cm), 1 cm = 10px, 每 10 cm 标数.
export function renderAirTrack(entity) {
  const group = svg('g')
  const half = 400
  // 支脚(frame-014/016 黑色梯形脚)+ 接地阴影
  add(group,
    shadow(0, 66, half - 20, 9),
    svg('path', {d: `M${-half + 60} 14h56l-12 48h-32Z`, fill: '#26282c', stroke: '#111417', 'stroke-width': 1.6}),
    svg('path', {d: `M${half - 116} 14h56l-12 48h-32Z`, fill: '#26282c', stroke: '#111417', 'stroke-width': 1.6}),
  )
  // 三角截面导轨(绿色): 顶棱滑行面 + 前斜面 + 底缘
  add(group,
    svg('path', {d: `M${-half} -20L${half} -20L${half} 16L${-half} 16Z`, fill: '#4a8c50', stroke: '#2f6134', 'stroke-width': 1.8}),
    svg('path', {d: `M${-half} -20L${half} -20L${half} -6L${-half} -6Z`, fill: '#5da363'}),
    // 滑行面顶棱(白/银, frame-022/023)
    svg('line', {x1: -half, y1: -20, x2: half, y2: -20, stroke: '#eef3ee', 'stroke-width': 3, 'stroke-linecap': 'round'}),
    // 气孔示意(顶棱下缘一排微点)
    ...[-360, -280, -200, -120, -40, 40, 120, 200, 280, 360].map(x =>
      svg('circle', {cx: x, cy: -13, r: 1.4, fill: '#2f6134', opacity: 0.7})),
  )
  // 前面板标尺(frame-014/016 底部直尺): 1 cm = 10px, 每 10 cm 标数
  const ruler = svg('g')
  add(ruler, svg('rect', {x: -half, y: -6, width: half * 2, height: 20, fill: '#f2efe4', stroke: '#8a8674', 'stroke-width': 1.2}))
  for (let cm = 0; cm <= 80; cm += 1) {
    const x = -half + cm * 10
    const major = cm % 10 === 0
    const mid = cm % 5 === 0
    add(ruler, svg('line', {x1: x, y1: -6, x2: x, y2: -6 + (major ? 12 : mid ? 9 : 5), stroke: '#5a5648', 'stroke-width': major ? 1.4 : 0.9}))
    if (major) {
      const t = svg('text', {x: x === -half ? x + 2 : x, y: 12, 'text-anchor': x === -half ? 'start' : 'middle', class: 'angle-label'})
      t.textContent = String(cm)
      t.setAttribute('font-size', '9')
      ruler.append(t)
    }
  }
  group.append(ruler)
  // 右端出气端头(frame-030 波纹管接口)
  add(group, svg('rect', {x: half - 6, y: -18, width: 14, height: 14, rx: 3, fill: '#8a929a', stroke: '#565e66', 'stroke-width': 1.4}))
  group.append(label(entity.label, 0, 84))
  return group
}
