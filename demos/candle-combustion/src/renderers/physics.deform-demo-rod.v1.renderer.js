import {label, svg} from './svg.js'

//  -  演示杆(kind=loading_rod, 116-用形变演示器演示形变产生弹力; 可拖动小件) - 
// 视觉依据: frame-015(手握杆底捏手向下拉), frame-021(银色金属杆竖直悬挂, 杆底横向
//           捏手圆盘清晰可辨); 配色取低照度帧钢杆亮部 (196,200,204) → #c9cfd5 族
//           (先例 physics.ball-flight/ramp-ball 钢质配色).
// 局部原点 = 杆顶中点(=导孔悬挂点), +y 向下延伸.
// 几何: 杆体 10px 宽 x 95px 长(snap_anchor hook=(0,0.19)=局部 (0,+95)=杆底挂钩承托点, 
//       与 IR 声明一致); 杆顶暗色截断椭圆=导孔内隐藏段的可视截断处理(画到原点即止, 
//       rest 态该端没入主机衬套 -175..-161 段内); 杆底捏手横圆盘(frame-021 实证, 
//       frame-015 手握件)+ 颈部 + 开口向下的 J 形挂钩 - 钩的承托点恰在 (0,95), 
//       钩码(physics/weight-cylinder)挂环顶 = 码心 -25px, anchored_gap=-0.05=25px, 
//       挂上时环顶恰落承托点, 环体(码 z=22 > 杆 z=20)盖住钩体呈挂接态.
// 无接地阴影(悬挂件, 先例 physics.crank-handle); label 右移 (34,42) 避让挂码位置.
// 导出签名与模板一致: renderDeformDemoRod(entity, state, context).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/deform-demo-rod'
//   (import {renderDeformDemoRod} from './physics.deform-demo-rod.v1.renderer.js').

const STEEL = {light: '#cfd5da', dark: '#a7aeb6', edge: '#5a626a'}

export function renderDeformDemoRod(entity, state = {}, context = {}) {
  const group = svg('g')
  group.append(
    // 杆顶截断(导孔内隐藏段画到原点止: 暗色截面椭圆)
    svg('ellipse', {cx: 0, cy: 0.8, rx: 5, ry: 2.2, fill: '#59616a'}),
    // 杆体(10x95, 双色圆柱质感)
    svg('rect', {x: -5, y: 2, width: 5, height: 84, fill: STEEL.light}),
    svg('rect', {x: 0, y: 2, width: 5, height: 84, fill: STEEL.dark}),
    svg('rect', {x: -5, y: 2, width: 10, height: 84, rx: 2, fill: 'none', stroke: STEEL.edge, 'stroke-width': 1.4}),
    // 杆底捏手横圆盘(frame-021 实证): 盘底面 + 盘顶面 呈 3px 厚圆盘
    svg('ellipse', {cx: 0, cy: 89.5, rx: 11, ry: 3.6, fill: '#8b939c', stroke: STEEL.edge, 'stroke-width': 1.4}),
    svg('ellipse', {cx: 0, cy: 86.5, rx: 11, ry: 3.6, fill: '#b9c0c7', stroke: STEEL.edge, 'stroke-width': 1.4}),
    // 盘下颈部 + 开口向下 J 形挂钩(承托点=局部 (0,95)=snap_anchor hook)
    svg('rect', {x: -3, y: 90.5, width: 3, height: 5, fill: STEEL.light}),
    svg('rect', {x: 0, y: 90.5, width: 3, height: 5, fill: STEEL.dark}),
    svg('path', {d: 'M-3.2 95 Q-3.2 100 0.4 100 Q3.6 100 3.6 95.8', fill: 'none', stroke: '#46575f', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
  )
  group.append(label(entity.label, 34, 42))
  return group
}
