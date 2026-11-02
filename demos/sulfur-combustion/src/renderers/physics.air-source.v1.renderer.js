import {add, label, shadow, svg} from './svg.js'

//  -  气源(风机+波纹管) - 
// 视觉依据: frame-008(蓝色气源罐置于台面右侧), frame-022/023(教师推车时气源在画右, 
// 波纹管连向导轨), frame-030(暗段右下: 白色波纹软管连向导轨右端接口).
// 复用审查否决记录: biology/hair-dryer 为手持电吹风(语义为生物案例气流源); 化学气瓶
// 类均为细口钢瓶.蓝色罐式风机+波纹管无诚实复用, 生成.
// 风格依据: physics.js renderDryCell 盒体画法, renderWoodenBox inline 配色与暗部叠层; 
// 波纹管用双弧线+横向棱纹(frame-030 白色波纹管).
// 锚点: 局部 (0,0)=罐底中心(落地静置).
export function renderAirSource(entity) {
  const group = svg('g')
  add(group,
    shadow(0, 4, 62, 8),
    // 蓝色罐体(frame-008)+ 顶盖 + 暗部
    svg('rect', {x: -52, y: -58, width: 104, height: 58, rx: 7, fill: '#3a6ea8', stroke: '#24486e', 'stroke-width': 1.8}),
    svg('rect', {x: -30, y: -67, width: 60, height: 10, rx: 3, fill: '#2c5480', stroke: '#24486e', 'stroke-width': 1.5}),
    svg('rect', {x: 26, y: -58, width: 26, height: 58, rx: 6, fill: '#1e3c5c', opacity: 0.35}),
    // 散热格栅 + 调节旋钮
    ...[-46, -34, -22].map(y => svg('line', {x1: -42, y1: y, x2: -14, y2: y, stroke: '#24486e', 'stroke-width': 2.4, opacity: 0.8})),
    svg('circle', {cx: 6, cy: -30, r: 9, fill: '#d8dde2', stroke: '#5c646c', 'stroke-width': 1.5}),
    svg('line', {x1: 6, y1: -30, x2: 11, y2: -36, stroke: '#5c646c', 'stroke-width': 2}),
  )
  // 白色波纹软管: 罐顶连向导轨右端方向(frame-030)
  const hose = svg('g')
  hose.append(svg('path', {d: 'M-8 -67Q26 -104 62 -78', fill: 'none', stroke: '#e8eaec', 'stroke-width': 11, 'stroke-linecap': 'round'}))
  hose.append(svg('path', {d: 'M-8 -67Q26 -104 62 -78', fill: 'none', stroke: '#b9bec6', 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-dasharray': '2.5 6'}))
  group.append(hose)
  group.append(label(entity.label, 0, 26))
  return group
}
