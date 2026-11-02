import {add, label, shadow, svg} from './svg.js'

//  -  木盒(玻璃标本配件盒, 台面静物道具) - 
// 视觉依据: frame-005/007(台面左侧矮木盒, 盒盖接缝线清晰; frame-005 采样亮部 #826a4e, 
// 暗部 #6f5034, frame-007 采样 #68624c/#614321 - 低照度下呈灰木色, 题给采样 #706b6a/#2e2e2d).
// 低调静态道具: 无状态视觉, 不抢主体视觉(IR properties: bench prop; assumptions 明确盒内
// 圆形玻璃片不建模, 仅保留木盒静物).
// 复用审查否决记录: physics.dry-cell.v1 为蓝色开口电池盒(内有电池)非木盒; chemistry 各
// 器皿均非盒体.无诚实复用.
// 风格依据: physics.js renderWeight 体块+顶部受光面画法与 metal-bracket 描边约定改用木色
// inline 配色 + apparatus-shadow 接地阴影; 2.5D 顶面斜折面(先例 renderOpticalBench 支脚
// 斜面画法).
// 锚点: 局部 (0,0)=盒底中心; 盒体 x ±66, 高 50(与 IR hit_shape 0.14x0.14(140x70px)相当).
export function renderWoodenBox(entity, state = {}) {
  const group = svg('g')
  add(group,
    shadow(0, 2, 74, 6),
    // 盒身(低照度灰木色, 题给亮部 #706b6a)
    svg('rect', {x: -66, y: -40, width: 132, height: 40, rx: 3, fill: '#706b6a', stroke: '#2e2e2d', 'stroke-width': 1.8}),
    // 盒盖顶面(2.5D 斜折面, frame-005 盒盖微出檐)
    svg('path', {d: 'M-66 -40L-58 -50L58 -50L66 -40Z', fill: '#8a8179', stroke: '#2e2e2d', 'stroke-width': 1.8, 'stroke-linejoin': 'round'}),
    // 盒盖接缝线(frame-005/007 盖身分缝)
    svg('line', {x1: -66, y1: -14, x2: 66, y2: -14, stroke: '#2e2e2d', 'stroke-width': 1.6, opacity: .8}),
    // 右侧暗部(frame-005 暗部 #2e2e2d 低透明度叠层)
    svg('rect', {x: 34, y: -40, width: 32, height: 40, rx: 3, fill: '#2e2e2d', opacity: .3}),
    // 盒身木纹淡线
    svg('path', {d: 'M-52 -28h104M-52 -8h104', stroke: '#57504c', 'stroke-width': 1, opacity: .5, fill: 'none'}),
  )
  group.append(label(entity.label, 0, 20))
  return group
}
