import {add, label, shadow, svg} from './svg.js'

//  -  红光激光光源(激光光学演示仪用半导体激光器) - 
// 视觉依据: frame-001/005/006/010(银灰金属箱体+略出檐的顶盖, 正面深色观察窗内红色激光管
// 星芒辉光, 箱体下灰白立柱+梯形支脚立在导轨上; frame-001 暗室中沿 +x 可见红色光束远斑, 
// frame-006 光束打在缝盘/屏上成红色点列).与既有 physics.light-source.v1(暖黄白光灯箱
// renderLightSource: #fff3c4 口径+暖黄泛光束)不能互相顶替 - 色相与发光方式均不同 - 
// 故按 IR visual.asset_ref 另立变体渲染器, 不设 default_for_kind(kind 默认仍指
// physics.light-source.v1).
// 风格依据: physics.js renderLightSource 的箱体画法(metal-bracket 箱体+深色前端面+圆形
// 口径同心圆+尾部垂线+接地阴影)与 renderPolarizer/renderConvexLens 的立柱滑块画法; 
// 激光红取证据帧红光(#ff4b3e 系, inline 配色), 不新增 styles.css class.
// 锚点: 发光口径=局部原点 (0,0) 落在光轴上, 光束沿 +x; 箱体占局部 x -73..+14, 立柱支脚
// 落在 y≈+52..+64(导轨面=光轴下方约 62px).
// 状态约定: state.laser_powered=true(兼容旧键 state.powered)→ 口径红光辉光+向右约 230px
// 渐隐红色光束 stub(01 案例布点下恰好抵达缝盘左缘, 避免光束断带); 
// false → 无光束, 口径呈暗色没光窗口(残留暗红瞳点).
export function renderLaserSource(entity, state = {}) {
  const group = svg('g')
  const powered = Boolean(state.laser_powered ?? state.powered)
  const louvers = []
  for (let i = 0; i < 3; i += 1) {
    louvers.push(svg('rect', {x: -64, y: -27 + i * 12, width: 26, height: 7, rx: 3.5, fill: '#d7e2e5', stroke: '#7b8a8d', 'stroke-width': 1}))
  }
  add(group,
    shadow(0, 66, 46, 7),
    // 光束 stub: 自口径向 +x 约 230px 渐隐的三层近平行细束(powered; 末端接缝盘左缘)
    powered ? svg('path', {d: 'M2 -5L230 -9L230 9L2 5Z', fill: '#ff4b3e', opacity: .08}) : null,
    powered ? svg('path', {d: 'M2 -3L230 -5.2L230 5.2L2 3Z', fill: '#ff4b3e', opacity: .16}) : null,
    powered ? svg('path', {d: 'M2 -1.2L230 -2.4L230 2.4L2 1.2Z', fill: '#ff6a55', opacity: .4}) : null,
    // 尾部电源线(frame-005/010 箱尾垂下的暗色线缆)
    svg('path', {d: 'M-62 26q-9 18-3 38', fill: 'none', stroke: '#46575f', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
    // 立柱+梯形支脚(落导轨 y=52..64, frame-010 立柱上可见沉头螺孔)
    svg('rect', {x: -33, y: 24, width: 10, height: 30, rx: 2, fill: '#9aa6aa', stroke: '#5b6a6d', 'stroke-width': 1.4}),
    svg('circle', {cx: -28, cy: 42, r: 1.4, fill: '#5b6a6d'}),
    svg('path', {d: 'M-44 52h32l-7 12h-18Z', class: 'metal-bracket'}),
    // 箱体(银灰金属, 前上角斜切)+ 出檐顶盖(frame-010 顶盖略大于箱体)
    svg('path', {d: 'M-70 -34H-14L0 -20V26H-70Z', class: 'metal-bracket'}),
    svg('rect', {x: -73, y: -41, width: 74, height: 9, rx: 2, fill: '#c7d3d8', stroke: '#5b6a6d', 'stroke-width': 1.5}),
    ...louvers,
    // 前端深色面(renderLightSource 前端深色面画法; frame-006/010 前端收光暗面)
    svg('path', {d: 'M-14 -34L0 -20V26H-14Z', fill: '#4a565c', stroke: '#2c3840', 'stroke-width': 1.5, 'stroke-linejoin': 'round'}),
  )
  // 口径: 同心圆(壳口→深色瞳孔→红光芯), 中心严格在局部原点 (0,0)
  add(group,
    powered ? svg('circle', {cx: 0, cy: 0, r: 16, fill: '#ff4b3e', opacity: .12}) : null,
    powered ? svg('circle', {cx: 0, cy: 0, r: 10, fill: '#ff4b3e', opacity: .26}) : null,
    svg('circle', {cx: 0, cy: 0, r: 9, fill: '#4a565c', stroke: '#2c3840', 'stroke-width': 1.6}),
    svg('circle', {cx: 0, cy: 0, r: 6, fill: '#1d2a30'}),
  )
  if (powered) {
    add(group,
      svg('circle', {cx: 0, cy: 0, r: 4.4, fill: '#ff5040'}),
      svg('circle', {cx: 0, cy: 0, r: 2.1, fill: '#ffd9c9'}),
    )
  } else {
    group.append(svg('circle', {cx: 0, cy: 0, r: 2, fill: '#5a1e16', opacity: .8}))
  }
  group.append(label(entity.label, 0, 84))
  return group
}
