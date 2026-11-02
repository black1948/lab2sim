import {label, shadow, svg} from './svg.js'

//  -  球提钮砝码(kind=weight 变体 physics.weight-knob.v1; 117-用微小压强计演示超重于失重) - 
// 视觉依据: frame-001(台面特写最完整: 铬钢圆柱+顶部球形蘑菇提钮, 坐放姿态), 
//           frame-007/019(砝码坐放在探头橡皮膜上).复用审查否决两条既有 weight: 
//           ① 模板 renderWeight(银蓝 #8fa3ab 圆柱+顶部 weight-top 盖+线环钩 weight-hook)
//            - 线环钩≠视频球形蘑菇提钮; ② discovered physics.weight-cylinder.v1(黑色铸铁
//           穿杆扁圆柱, 无顶钮) - 黑铸铁≠铬钢且穿杆中心孔/形态均不符.故生成本变体.
//           铬钢配色按 frame-007 采样归一化: 亮部 #412f21(p95)→受光带 #dde4e9, 中间调
//           #a9b4bc, 背光带 #77828a, 描边 #45525a(沿用模板 weight-body 银灰系骨架, 
//           提亮以表铬钢抛光反光).
// 局部原点 = 圆柱底面中心(坐放姿态, 底面平 - 坐膜/坐台两用).
// 几何(scale=1): 圆柱 Ø50(x±25)× 高 30(y -30..0), 顶面受光椭圆 ry4; 提钮: 锥形颈
//           (顶面中心 y-30 收到 ±4)+ 球形钮 r8(球心 y-41, 球顶 y-49)→ 底面到提钮顶
//           总高 ≈49, 圆柱直径 50(design_notes 锚点用).接地阴影+label 沿用 renderWeight.
// 状态契约: 无状态视觉(state.force_n 文字不画 - 本案权重固定 100g, N 由 force_arrow 表达).
// 风格依据: physics.js renderWeight 体块+受光面+接地阴影两色阶画法 + weight-cylinder 的
//           内联配色做法, 不新增 styles.css class.
// 导出签名与模板一致: renderWeightKnob(entity, state, context).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/weight-knob'
//   (import {renderWeightKnob} from './physics.weight-knob.v1.renderer.js').

const CHROME = {body: '#a9b4bc', light: '#dde4e9', dark: '#77828a', stroke: '#45525a'}

export function renderWeightKnob(entity, state = {}, context = {}) {
  const group = svg('g')
  group.append(
    shadow(0, 3, 26, 5),
    // 圆柱体(Ø50×30)+ 右侧背光暗带 + 左侧受光高光带 + 底缘暗线
    svg('rect', {x: -25, y: -30, width: 50, height: 30, rx: 2.5, fill: CHROME.body, stroke: CHROME.stroke, 'stroke-width': 2}),
    svg('path', {d: 'M11 -28Q25 -28 25 -25V-4Q25 0 20 0H11Z', fill: CHROME.dark, opacity: 0.55}),
    svg('rect', {x: -19, y: -27, width: 7, height: 24, rx: 3.5, fill: CHROME.light, opacity: 0.8}),
    svg('path', {d: 'M-22.5 -2.4Q0 1.4 22.5 -2.4', fill: 'none', stroke: '#39434a', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    // 顶面(2.5D 受光椭圆)
    svg('ellipse', {cx: 0, cy: -29.4, rx: 24.2, ry: 3.8, fill: '#c2ccd2', stroke: CHROME.stroke, 'stroke-width': 1.2}),
    // 提钮: 锥形颈 + 球形蘑菇头(frame-001: 颈自顶面收到窄腰, 球钮压顶)
    svg('path', {d: 'M-4.5 -31.5Q-2 -34 -1.8 -37L1.8 -37Q2 -34 4.5 -31.5Z', fill: CHROME.dark, stroke: CHROME.stroke, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('circle', {cx: 0, cy: -41, r: 8, fill: CHROME.body, stroke: CHROME.stroke, 'stroke-width': 1.6}),
    svg('path', {d: 'M-5.6 -45.6Q0 -50.5 5.6 -45.6Q2.4 -47.6 0 -47.6Q-2.4 -47.6 -5.6 -45.6Z', fill: CHROME.light, opacity: 0.9}),
    svg('circle', {cx: -2.6, cy: -44.2, r: 1.7, fill: '#ffffff', opacity: 0.95}),
  )
  group.append(label(entity.label, 0, 18))
  return group
}
