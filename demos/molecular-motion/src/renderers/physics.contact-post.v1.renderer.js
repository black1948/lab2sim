import {add, label, shadow, svg} from './svg.js'

//  -  触点立柱(接线柱) - 
// 视觉依据: frame-008(导轨旁固定细立柱, 顶带接线端与红色引线), frame-016(滑行结束后
// 左侧立柱顶端两只鳄鱼夹留在原位, 导线与小车分离 - 证明电磁铁电路经此立柱供电).
// 复用审查否决记录: chemistry/iron-stand 为铁架台(底座+立杆+夹持头, 体型巨大); 
// physics/wall-bracket 为壁挂挂钩件.细立柱+双接线端无诚实复用, 生成.
// 风格依据: physics.js renderWallBracket 金属件描边, renderDryCell 端子画法, inline 配色.
// 锚点: 局部 (0,0)=柱体轴向中点; 柱顶接线端在 y=-80(scene anchors.top=(0,−0.16)), 
// 鳄鱼夹导线(clip-lead-1)经 anchored_gap=0.03 吸附在端子上方.
export function renderContactPost(entity) {
  const group = svg('g')
  add(group,
    shadow(0, 58, 26, 6),
    // 绝缘底座 + 底脚盘
    svg('rect', {x: -16, y: 44, width: 32, height: 12, rx: 2, fill: '#333a40', stroke: '#1b2024', 'stroke-width': 1.5}),
    svg('rect', {x: -24, y: 54, width: 48, height: 7, rx: 2, fill: '#26282c', stroke: '#1b2024', 'stroke-width': 1.5}),
    // 金属立柱
    svg('rect', {x: -4, y: -72, width: 8, height: 118, fill: '#9aa2ab', stroke: '#5c646c', 'stroke-width': 1.5}),
    svg('line', {x1: -1.6, y1: -68, x2: -1.6, y2: 42, stroke: '#d3d8dd', 'stroke-width': 1.4, opacity: 0.8}),
    // 顶部双接线端子(frame-016 两只鳄鱼夹并排挂点)
    svg('line', {x1: 0, y1: -72, x2: -9, y2: -76, stroke: '#5c646c', 'stroke-width': 2.2}),
    svg('line', {x1: 0, y1: -72, x2: 9, y2: -76, stroke: '#5c646c', 'stroke-width': 2.2}),
    svg('circle', {cx: -9, cy: -80, r: 6, fill: '#b87333', stroke: '#7a4520', 'stroke-width': 1.5}),
    svg('circle', {cx: 9, cy: -80, r: 6, fill: '#b87333', stroke: '#7a4520', 'stroke-width': 1.5}),
    svg('circle', {cx: -10.5, cy: -81.5, r: 1.6, fill: '#e8b98a'}),
    svg('circle', {cx: 7.5, cy: -81.5, r: 1.6, fill: '#e8b98a'}),
  )
  group.append(label(entity.label, 0, 80))
  return group
}
