import {svg} from './svg.js'

//  -  飞行态钢球(kind=ball 的变体资产, IR visual.asset_ref=physics.ball-flight.v1 选择; 
// physics.ball.v1 仍为 kind 默认) - 
// 视觉依据: frame-009/011(线圈下挂银灰钢球), frame-014(下落中的球, 画面左侧白点), 
// frame-019(轨迹图终点蓝球示意 - 图板由 graph-board 渲染器负责, 此处只画实体球).
// 复用审查: kind=ball 已有 physics.ball.v1(斜面案例 16px 蓝灰球) - 形状同类但该渲染器
// 无飞行位移语义, 本变体在其配色基础上叠加运动合成位移逻辑, 故另注册变体而非改默认.
// 运动合成语义(数据驱动, 先例 renderCart 的线性插值+渲染器二次映射): 
//   引擎把 glider-1.x(或静止释放的 ball-1.fall)在延时批内线性插值, 本渲染器把小车位
//   线性推进映射为竖直下落的二次量: 
//     f = held ? 0
//       : landed ? 1                                   // 落定后冻结在漏斗内
//       : max(fall, clamp((gliderX - break_x) / (end_x - break_x), 0, 1))
//   竖直偏移 = drop_px  -  f²  (水平位移已由 state.x 线性承载 - 水平匀速, 竖直 f² 加速, 
//   合成即抛物线; 常量来自实体 properties {break_x, end_x, drop_px})
// 锚点: 局部 (0,0)=球心; 挂点即线圈正下方(小车局部 (0,-180), IR y=0.68).
export function renderBallFlight(entity, state = {}, context = {}) {
  const group = svg('g')
  const props = entity.properties || {}
  const breakX = Number(props.break_x ?? 0.5)
  const endX = Number(props.end_x ?? 0.62)
  const dropPx = Number(props.drop_px ?? 74)
  const gliderX = Number(context.world?.['glider-1']?.x ?? breakX)
  const held = Boolean(state.held)
  const landed = Boolean(state.landed)
  const fall = Math.max(0, Math.min(1, Number(state.fall || 0)))
  const glideF = Math.max(0, Math.min(1, (gliderX - breakX) / Math.max(1e-6, endX - breakX)))
  const f = context.preview ? 0 : held ? 0 : landed ? 1 : Math.max(fall, glideF)
  const py = dropPx * f * f
  const ball = svg('g', {transform: `translate(0 ${py.toFixed(1)})`})
  ball.append(
    svg('circle', {cx: 0, cy: 0, r: 11, fill: '#c8ccd2', stroke: '#5a6068', 'stroke-width': 1.6}),
    svg('circle', {cx: -3.6, cy: -4, r: 3.2, fill: '#ffffff', opacity: 0.85}),
    svg('path', {d: 'M-7 5A8 8 0 0 0 7 5', fill: 'none', stroke: '#8a9098', 'stroke-width': 1.4, opacity: 0.7}),
  )
  group.append(ball)
  return group
}
