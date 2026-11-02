import {label, svg} from './svg.js'

//  -  演示杆(kind=loading_rod, 116-用形变演示器演示形变产生弹力; 可拖动小件)
//      [2026-09-20 构建方复核证据后局部重画]底部去 J 形挂钩叙事, 改 T 形踏脚横杆
//      (frame-021 实证: 杆底横杆微上翘端头), 并加定位环小凸台供钩码坐落.
// 视觉依据: frame-015(手握杆底向下拉), frame-021(银色金属杆竖直悬挂, 杆底 T 形
//           横杆清晰可辨); 配色取低照度帧钢杆亮部 (196,200,204) → #c9cfd5 族
//           (先例 physics.ball-flight/ramp-ball 钢质配色).
// 局部原点 = 杆顶中点(=导孔悬挂点/铰接圆头配合位), +y 向下延伸.
// 几何: 杆体 10px 宽 x 95px 长(双色钢杆); 杆顶暗色截断椭圆=导孔/铰接圆头内隐藏段的
//       可视截断处理(画到原点即止; rest 态(本机局部 y=-165)杆顶没入主机铰接圆头
//       (0,-168) r7 内, 也穿过导孔座 x±9 y -126..-112); 定位环小凸台 y +62..+66
//       (x±5, 钩码坐落其上 - 码中心=+65=snap_anchor hook=(0,+0.13) 配合点, 穿杆码
//       中心孔套杆坐于环上, 码 z=22>杆 z=20 盖住凸台呈串接态); 底部 T 形踏脚横杆
//       x±14, y +90..+94, 微上翘端头(frame-021 实证, 手拉受力位).
// 与 IR anchors 配合: 本机 snap_anchor hook=(0,+0.13)=局部 (0,+65); 钩码
//       (physics/weight-cylinder.v1, 码心原点)经 anchored_gap=0 挂上时码心恰落 +65.
// 无接地阴影(悬挂件, 先例 physics.crank-handle); label 右移 (34,42) 避让挂码落位.
// 导出签名与模板一致: renderDeformDemoRod(entity, state, context).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/deform-demo-rod'
//   (import {renderDeformDemoRod} from './physics.deform-demo-rod.v1.renderer.js').

const STEEL = {light: '#cfd5da', dark: '#a7aeb6', edge: '#5a626a'}

export function renderDeformDemoRod(entity, state = {}, context = {}) {
  const group = svg('g')
  group.append(
    // 杆顶截断(导孔/铰接圆头内隐藏段画到原点止: 暗色截面椭圆)
    svg('ellipse', {cx: 0, cy: 0.8, rx: 5, ry: 2.2, fill: '#59616a'}),
    // 杆体(10x95, 双色圆柱质感)
    svg('rect', {x: -5, y: 2, width: 5, height: 88, fill: STEEL.light}),
    svg('rect', {x: 0, y: 2, width: 5, height: 88, fill: STEEL.dark}),
    svg('rect', {x: -5, y: 2, width: 10, height: 88, rx: 2, fill: 'none', stroke: STEEL.edge, 'stroke-width': 1.4}),
    // 定位环小凸台(y +62..+66: 钩码坐落其上, 码中心=+65=snap_anchor hook 配合点)
    svg('rect', {x: -6.5, y: 62, width: 13, height: 4, rx: 1.6, fill: '#8b939c', stroke: STEEL.edge, 'stroke-width': 1.2}),
    // 底部 T 形踏脚横杆(x±14, y +90..+94, 微上翘端头, frame-021 实证)
    svg('path', {d: 'M-14 94L-14 91.5Q-14 90 -16.8 88.2L-13.4 86.4Q-10.5 89 -10.5 90L10.5 90Q10.5 89 13.4 86.4L16.8 88.2Q14 90 14 91.5L14 94Z', fill: '#b9c0c7', stroke: STEEL.edge, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('rect', {x: -12.8, y: 90.7, width: 25.6, height: 1.6, fill: '#dfe3e8', opacity: .8}),
  )
  group.append(label(entity.label, 34, 42))
  return group
}
