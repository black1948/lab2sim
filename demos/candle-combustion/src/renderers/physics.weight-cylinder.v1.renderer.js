import {label, shadow, svg} from './svg.js'

//  -  圆柱钩码(kind=weight 的圆柱带顶挂环变体, 116-用形变演示器演示形变产生弹力; 
//      IR visual.asset_ref=physics.weight-cylinder.v1 显式选择, physics.weight.v1
//      仍为 kind=weight 的 default) - 
// 视觉依据: frame-025/026(黑色平顶圆柱钩码吊于演示杆下端挂钩上, 铸铁质感微反光; 
//           低照度采样亮部 (58,62,68)/暗部 (28,32,37) → 归一化 #3a4046/#23282e).
// 局部原点 = 圆柱体中心.
// 几何: 圆柱 Ø34x28(x±17, y -14..14); 顶面椭圆(2.5D 受光顶)+ 顶面中央锻接挂环
//       (环外径 12: stroke 环 r4.25/w3.5, 环顶=局部 y=-25  -  即 snap anchored_gap=-0.05
//       =25px 的配合尺寸: 挂到演示杆 (0,+95) 挂钩承托点时环顶恰与之相接).
//       与默认 physics.weight.v1(广口钩码: 圆弧底+顶盖+线状钩+广口槽)的区分点: 
//       本变体平顶圆柱, 顶挂环, 不画广口槽.
// 风格依据: physics.js renderWeight 的体块+受光面+接地阴影两色阶画法, 配色改黑色铸铁系
//       inline(weight-body 银蓝系与 frame-025/026 黑色钩码不符); 高光/暗部两色阶.
// 接地阴影沿用 renderWeight恒画先例(挂空时为低透明度淡影, 可由构建方裁量删除).
// 导出签名与模板一致: renderWeightCylinder(entity, state, context).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/weight-cylinder'
//   (import {renderWeightCylinder} from './physics.weight-cylinder.v1.renderer.js').

const IRON = {body: '#3a4046', light: '#565e66', dark: '#23282e', stroke: '#10141a', ring: '#2e343b'}

export function renderWeightCylinder(entity, state = {}, context = {}) {
  const group = svg('g')
  group.append(
    shadow(0, 17, 19, 4),
    // 圆柱体(Ø34x28 黑铸铁)+ 右侧背光暗带 + 左侧受光高光带 + 底缘圆角暗线
    svg('rect', {x: -17, y: -14, width: 34, height: 28, rx: 2, fill: IRON.body, stroke: IRON.stroke, 'stroke-width': 2}),
    svg('path', {d: 'M7 -12H15Q17 -12 17 -10V10Q17 14 13 14H7Z', fill: IRON.dark, opacity: .6}),
    svg('rect', {x: -13, y: -10, width: 5, height: 21, rx: 2.4, fill: IRON.light, opacity: .55}),
    svg('path', {d: 'M-14.5 11Q0 15.2 14.5 11', fill: 'none', stroke: '#14181c', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    // 顶面(2.5D 受光椭圆)
    svg('ellipse', {cx: 0, cy: -13.5, rx: 16.4, ry: 3, fill: '#4a525a', stroke: IRON.stroke, 'stroke-width': 1.2}),
    // 锻接挂环(外径 12: r4.25 + stroke 3.5 → 外缘 r6, 内孔 r2.5; 环顶=局部 y=-25)
    svg('circle', {cx: 0, cy: -19, r: 4.25, fill: 'none', stroke: IRON.ring, 'stroke-width': 3.5}),
    svg('path', {d: 'M-3.4 -21.6A4.25 4.25 0 0 1 0.6 -23.2', fill: 'none', stroke: '#6a727b', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
  )
  group.append(label(entity.label, 0, 30))
  return group
}
