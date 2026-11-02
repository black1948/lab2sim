import {add, svg} from './svg.js'

//  -  实心泪滴导体(kind=teardrop_conductor, station C 可取下部件) - 
// 证据帧: frame-021(讲师手持实心黄铜/青铜泪滴金属板: 形状与显示板上的丝圈一致 - 圆部
//          + 两条切线收拢到尖端, 底部有小绝缘手柄/握柄); frame-023/024(导体装入丝圈: 
//          实心板覆盖丝圈内部, 尖端朝向接线端子); frame-026/027(取下导体对照).
// 复用否决理由: 可信源发现曾误命中 conductor-oss/conductor(Netflix/Orkes 工作流引擎
//          的蓝色抽象 logo, Apache-2.0) - 关键词"conductor"歧义命中, 形状语义(圆形
//          徽记)与风格(蓝 #1976d2 扁平矢量 vs 帧中黄铜金属板)均不符, 按协议否决并
//          已回滚注册(trace assets/discover-teardrop_conductor + 决策记录); 四域注册
//          表无金属导体板类条目(physics.metal-specimen 为矩形试样块, 否决), 故代码
//          原生生成.
// 风格基础: 与 physics.teardrop-panel.v1 的丝圈同一轮廓解析式(圆部 r30 + 切线到尖端, 
//          保证装入丝圈时轮廓吻合); 金属质感先例 physics.pendulum-bob 钢球的双色+
//          高光画法, 色相换黄铜: frame-021 采样归一化 (127,112,79) → 亮部 #c9ae74 /
//          中间调 #b39a63 / 暗部 #a8925e, 描边 #7d6a42.配色内联, 不新增 class.
// 状态语义: 无状态字段(静止导体板); z 序遮挡由 IR visual.z_index 保证(teardrop-
//          conductor z=14 高于面板 z=10), 渲染器不处理遮挡.
// 关键尺寸(局部原点=导体形心(圆部圆心与尖端连线的中点偏圆心一侧, 视觉质心); 
//   注意: 小件原点偏离"底座中心"约定 - 对接基准是 teardrop-panel 的丝圈圆心
//   (面板局部 (-18,-86)), 请构建方将 anchors.loop-center 对准该处): 
//   轮廓与丝圈一致: 圆部圆心取局部 (-4,0), r=30, 尖端局部 (60,0)(圆心到尖端 64, 
//   切线长 56.5, 切点角 ±62.1°); 实心板厚以双层描边示意; 绝缘手柄: 底部 (0,26)→
//   (0,40) 宽 6 深色柄 + 金属领箍.外接盒约 x∈[-34,60], y∈[-30,44].
// 证据不清处: 手柄在 frame-021 被手部分遮挡(可见深色柄伸出), 柄长按比例示意; 
//   板厚(2.5D 厚度)在帧内不可读, 取双层描边示意.不画 apparatus-shadow(手持部件
//   无台面接触, 先例 physics.crank-handle.v1 小件免投影).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/teardrop-conductor'
//   (import {renderTeardropConductor} from './physics.teardrop-conductor.v1.renderer.js').

const BRASS_MID = '#b39a63'
const BRASS_LIGHT = '#c9ae74'
const BRASS_DARK = '#a8925e'
const BRASS_EDGE = '#7d6a42'
const LOOP_CX = -4
const LOOP_R = 30
const TIP_X = 60
const TIP_Y = 0

function teardropPath() {
  const beta = Math.acos(LOOP_R / Math.hypot(TIP_X - LOOP_CX, TIP_Y)) // 切点角 62.1°
  const pts = []
  const N_ARC = 40
  for (let k = 0; k <= N_ARC; k += 1) {
    const a = beta + (2 * Math.PI - 2 * beta) * (k / N_ARC)
    pts.push([LOOP_CX + LOOP_R * Math.cos(a), -LOOP_R * Math.sin(a)]) // 局部 y, 圆心 y=0
  }
  const N_LINE = 12
  const lower = pts[pts.length - 1]
  for (let k = 1; k <= N_LINE; k += 1) {
    const f = k / N_LINE
    pts.push([lower[0] + (TIP_X - lower[0]) * f, lower[1] * (1 - f)])
  }
  return [
    `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`,
    ...pts.slice(1).map(p => `L${p[0].toFixed(2)} ${p[1].toFixed(2)}`),
    'Z',
  ].join('')
}

export function renderTeardropConductor(entity, state = {}, context = {}) {
  const group = svg('g')
  const d = teardropPath()
  // 不画 apparatus-shadow: 本件为手持/挂架部件, 无台面接触(frame-021/023)
  // 绝缘小手柄(frame-021 底部深色柄 + 金属领箍)
  add(group,
    svg('line', {x1: 0, y1: 24, x2: 0, y2: 40, stroke: '#2b3134', 'stroke-width': 7, 'stroke-linecap': 'round'}),
    svg('line', {x1: 0, y1: 24, x2: 0, y2: 40, stroke: '#454e53', 'stroke-width': 4, 'stroke-linecap': 'round'}),
    svg('line', {x1: 0, y1: 22, x2: 0, y2: 27, stroke: '#8f959c', 'stroke-width': 6.5, 'stroke-linecap': 'round'}),
  )
  // 实心黄铜泪滴板: 暗边层 + 亮面层 + 沿圆部的高光弧 + 拉丝线
  add(group,
    svg('path', {d, fill: BRASS_DARK, stroke: BRASS_EDGE, 'stroke-width': 2}),
  )
  add(group,
    svg('path', {d, fill: BRASS_MID, stroke: 'none', transform: 'translate(1.6 1.6) scale(0.955)'}),
    svg('path', {d: `M${(LOOP_CX - 18).toFixed(1)} ${(-21).toFixed(1)}A${(LOOP_R - 6).toFixed(1)} ${(LOOP_R - 6).toFixed(1)} 0 0 1 ${(LOOP_CX + 16).toFixed(1)} ${(-21.5).toFixed(1)}`, fill: 'none', stroke: BRASS_LIGHT, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .8}),
    svg('line', {x1: 6, y1: -8, x2: 34, y2: -3, stroke: BRASS_LIGHT, 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: .55}),
    svg('line', {x1: 2, y1: 8, x2: 30, y2: 5, stroke: BRASS_EDGE, 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .4}),
  )
  return group
}
