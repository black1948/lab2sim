import {add, label, shadow, svg} from './svg.js'

//  -  运动合成演示小车(复合装置: 黄色箱体+透明立杆+电磁线圈+接球漏斗) - 
// 视觉依据: frame-009/011(黄箱, 透明杆, 杆顶横臂悬铜绕线圈, 红/蓝引线夹), 
// frame-014(杆顶臂端线圈, 球挂在线圈正下方), frame-016(箱顶立杆左前方的灰色
// 接球圆筒), frame-021(特写: 黄箱正面两条铜接触条, 箱顶金属圆筒+喇叭口接球漏斗, 
// 底座四角调平螺钉), frame-030(暗段: 箱顶圆筒漏斗, 球从上方落入).
// 复用审查否决记录: physics.cart 为斜面案例的红壳双轮小车(无立杆/线圈/漏斗, 
// 语义为匀加速滑车); horseshoe_magnet 为蹄形永磁体≠电磁线圈.无诚实复用, 整体生成.
// 风格依据: physics.js renderCart 车体分层画法, renderWeight 金属钩件, renderOpticalBench
// 2.5D 顶面折面, renderWoodenBox inline 配色约定; 透明杆用低饱和蓝白半透明(玻璃画法).
// 锚点: 局部 (0,0)=底板底面中心(落在导轨顶棱上方 40px, anchored_gap=0.08).
// 状态语义: 小车整体位移由 state.x 驱动(引擎延时批插值); 钢球由 ball-flight 渲染器
// 叠画, 线圈正下方局部 (0,-180) 即球初始挂点.
const ROD_TOP_Y = -224
const SPOOL_Y = -197      // 线圈中心
const BALL_HANG_Y = -180  // 球挂点(与 IR ball-1 初始 y=0.68 对应)
const FUNNEL_RIM_Y = -118 // 漏斗口沿(球落定中心 ≈ -106, drop_px=74)
export function renderAirGlider(entity) {
  const group = svg('g')
  // 接地阴影 + 黑色棱纹底板 + 四角调平螺钉(frame-021)
  add(group,
    shadow(0, 40, 96, 8),
    svg('rect', {x: -85, y: 22, width: 170, height: 16, rx: 3, fill: '#26282c', stroke: '#111417', 'stroke-width': 1.6}),
    svg('line', {x1: -85, y1: 27, x2: 85, y2: 27, stroke: '#3a3d42', 'stroke-width': 2}),
    svg('line', {x1: -85, y1: 32, x2: 85, y2: 32, stroke: '#3a3d42', 'stroke-width': 2}),
    ...[[-78, 24], [78, 24], [-52, 38], [52, 38]].map(([x, y]) =>
      svg('circle', {cx: x, cy: y, r: 3.5, fill: '#111417', stroke: '#4a4e54', 'stroke-width': 1.2})),
  )
  // 黄色箱体(frame-009/011/021: 赭黄金属箱)+ 2.5D 顶面
  add(group,
    svg('rect', {x: -70, y: -38, width: 140, height: 60, rx: 2, fill: '#c9962e', stroke: '#7a5a16', 'stroke-width': 1.8}),
    svg('path', {d: 'M-70 -38L-62 -46L62 -46L70 -38Z', fill: '#e0b452', stroke: '#7a5a16', 'stroke-width': 1.8, 'stroke-linejoin': 'round'}),
    // 正面两条铜接触条(frame-021)
    svg('rect', {x: -16, y: -22, width: 18, height: 8, rx: 2, fill: '#b87333', stroke: '#7a4520', 'stroke-width': 1.2}),
    svg('rect', {x: -16, y: -8, width: 18, height: 8, rx: 2, fill: '#b87333', stroke: '#7a4520', 'stroke-width': 1.2}),
    // 右侧暗部
    svg('rect', {x: 44, y: -38, width: 26, height: 60, fill: '#2e2e2d', opacity: 0.25}),
  )
  // 透明亚克力立杆(杆在箱体右后方)
  add(group,
    svg('rect', {x: 36, y: ROD_TOP_Y, width: 8, height: 178, fill: 'rgba(222,236,246,0.4)', stroke: 'rgba(120,152,172,0.9)', 'stroke-width': 1.4}),
    svg('line', {x1: 38, y1: ROD_TOP_Y + 6, x2: 38, y2: -52, stroke: 'rgba(255,255,255,0.75)', 'stroke-width': 1.6}),
  )
  // 杆顶横臂(伸向左)+ 悬钩
  add(group,
    svg('rect', {x: -2, y: ROD_TOP_Y - 2, width: 46, height: 9, rx: 2, fill: '#8a8f96', stroke: '#565e66', 'stroke-width': 1.4}),
    svg('line', {x1: 0, y1: ROD_TOP_Y + 7, x2: 0, y2: SPOOL_Y - 14, stroke: '#565e66', 'stroke-width': 2}),
  )
  // 铜绕线电磁线圈(frame-009/011 顶部: 红铜色多层绕线)+ 上下金属夹板
  const coil = svg('g')
  add(coil,
    svg('rect', {x: -15, y: SPOOL_Y - 13, width: 30, height: 5, fill: '#9aa0a8', stroke: '#565e66', 'stroke-width': 1.2}),
    svg('rect', {x: -13, y: SPOOL_Y - 9, width: 26, height: 18, rx: 2, fill: '#a0522d', stroke: '#6b3418', 'stroke-width': 1.4}),
    ...[-5, -1, 3, 7].map(dy => svg('line', {x1: -13, y1: SPOOL_Y + dy, x2: 13, y2: SPOOL_Y + dy, stroke: '#6b3418', 'stroke-width': 1.1, opacity: 0.8})),
    svg('rect', {x: -15, y: SPOOL_Y + 9, width: 30, height: 5, fill: '#9aa0a8', stroke: '#565e66', 'stroke-width': 1.2}),
  )
  group.append(coil)
  // 接球漏斗+金属圆筒(frame-016/021: 线圈正下方, 箱顶左前)
  add(group,
    svg('rect', {x: -18, y: FUNNEL_RIM_Y + 22, width: 36, height: 50, fill: '#b9bec6', stroke: '#6d747d', 'stroke-width': 1.6}),
    svg('rect', {x: -12, y: FUNNEL_RIM_Y + 26, width: 5, height: 42, fill: '#e6e9ec', opacity: 0.8}),
    // 喇叭口(杯口朝上)+ 口沿椭圆 + 筒内暗部
    svg('path', {d: `M-30 ${FUNNEL_RIM_Y}L-18 ${FUNNEL_RIM_Y + 24}L18 ${FUNNEL_RIM_Y + 24}L30 ${FUNNEL_RIM_Y}Z`, fill: '#ccd2d9', stroke: '#6d747d', 'stroke-width': 1.6, 'stroke-linejoin': 'round'}),
    svg('ellipse', {cx: 0, cy: FUNNEL_RIM_Y, rx: 30, ry: 7, fill: '#d7dce1', stroke: '#6d747d', 'stroke-width': 1.6}),
    svg('ellipse', {cx: 0, cy: FUNNEL_RIM_Y + 1, rx: 23, ry: 4.6, fill: '#4a4f55'}),
  )
  group.append(label(entity.label, 0, 62))
  return group
}
