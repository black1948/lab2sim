import {label, shadow, svg} from './svg.js'

//  -  圆柱钩码(kind=weight 的穿杆扁圆柱码变体, 116-用形变演示器演示形变产生弹力; 
//      IR visual.asset_ref=physics.weight-cylinder.v1 显式选择, physics.weight.v1
//      仍为 kind=weight 的 default)
//      [2026-09-20 构建方复核证据后形态重画]frame-025 实证: 钩码为穿杆扁圆柱码
//      (码心套在演示杆上, 坐于杆定位环上), **无顶部挂环**(前版锻接挂环删除).
// 视觉依据: frame-025(黑色扁圆柱钩码串在演示杆上, 直径明显大于杆径, 厚约为直径的
//           1/3; 铸铁质感微反光; 低照度采样亮部 (58,62,68)/暗部 (28,32,37) →
//           #3a4046/#23282e 归一化).
// 局部原点 = 码体中心.
// 几何: 扁圆柱 Ø50(x±25)x 16(y -8..+8); 顶面中央中心孔(暗椭圆 rx6 ry2.5
//       #10141a, 示意穿杆 - 本码 z=22 画在杆 z=20 之上, 挂上时杆自码身后穿过, 
//       中心孔呈暗孔); **无顶部挂环**; 无广口槽(与 physics.weight.v1 广口钩码的
//       区分点); 接地阴影保留; label 移到码下 (0,+22).
// 配合关系: 码中心=杆定位环处 - 本码原点(码心)对准 deform-demo-rod 局部 (0,+65)
//       (IR snap_anchor hook=(0,+0.13) 配合点), anchored_gap=0.
// 风格依据: physics.js renderWeight 的体块+受光面+接地阴影两色阶画法, 配色改黑色
//       铸铁系 inline(模板 weight-body 银蓝系与实拍黑钩码不符); 高光/暗部两色阶.
// 导出签名与模板一致: renderWeightCylinder(entity, state, context).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/weight-cylinder'
//   (import {renderWeightCylinder} from './physics.weight-cylinder.v1.renderer.js').

const IRON = {body: '#3a4046', light: '#565e66', dark: '#23282e', stroke: '#10141a'}

export function renderWeightCylinder(entity, state = {}, context = {}) {
  const group = svg('g')
  group.append(
    shadow(0, 10, 27, 4),
    // 扁圆柱体(Ø50x16 黑铸铁)+ 右侧背光暗带 + 左侧受光高光带 + 底缘圆角暗线
    svg('rect', {x: -25, y: -8, width: 50, height: 16, rx: 2, fill: IRON.body, stroke: IRON.stroke, 'stroke-width': 2}),
    svg('path', {d: 'M10 -6.5Q25 -6.5 25 -4V4Q25 8 20 8H10Z', fill: IRON.dark, opacity: .6}),
    svg('rect', {x: -19, y: -5, width: 6.5, height: 12, rx: 3, fill: IRON.light, opacity: .55}),
    svg('path', {d: 'M-21.5 5.6Q0 9.6 21.5 5.6', fill: 'none', stroke: '#14181c', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    // 顶面(2.5D 受光椭圆)+ 顶面中央中心孔(示意穿杆; 挂上时杆自码身后穿过)
    svg('ellipse', {cx: 0, cy: -7.6, rx: 24.2, ry: 3.4, fill: '#4a525a', stroke: IRON.stroke, 'stroke-width': 1.2}),
    svg('ellipse', {cx: 0, cy: -7.9, rx: 6, ry: 2.5, fill: IRON.stroke}),
    svg('ellipse', {cx: 0, cy: -8.2, rx: 3.4, ry: 1.3, fill: '#1c2126'}),
  )
  group.append(label(entity.label, 0, 22))
  return group
}
