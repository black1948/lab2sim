import {add, label, shadow, svg} from './svg.js'

//  -  钠光灯(黄色单色光源, GP20 型圆柱灯体) - 
// 视觉依据: frame-005/010/023(台面右侧竖直圆柱灯体: 上部深色灯管/灯罩段, 下部奶白柱身, 
// 小圆脚座, 黄色电缆自灯座垂至台面; frame-010 深色段左侧可见一条暖橙发光窗缝).
// 证据帧采样(frame-010): 灯管暗段 #312b2d, 柱身亮部 #979d9d/#959e9b, 脚座 #888677; 
// 发光窗缝暖橙 #c96a3d 系(frame-010 暗段左缘).
// 与既有 physics.light-source.v1(renderLightSource 银灰楔形灯箱+暖黄白光口径), 
// physics.laser-source.v1(激光箱)形状语义均不同, 不能互相顶替 - 按先例另立变体; 
// 不设 default_for_kind(kind 默认仍指 physics.light-source.v1), 由 IR visual.asset_ref 选择.
// 风格依据: physics.js renderLightSource 的尾线/光晕画法(低透明度叠层椭圆泛光晕+垂下电缆
// 二次曲线), renderPolarizer 立柱体块画法; inline 配色, 不新增 styles.css class.
// 锚点: 局部 (0,0)=灯座底部中心(与其余 physics 器材一致); 灯体总高≈150, 宽≈70, 
// 与 IR hit_shape 0.12x0.30(120x150px)相当.
// 状态绑定(IR visual.state_bindings): state.lit=true → 暖黄辉光(灯管段发光窗缝+柱身
// 暖色泛光晕+灯管端缘亮边); false/缺省 → 熄灭暗柱(暗段更暗, 无光晕, 窗缝呈暗缝).
export function renderSodiumLamp(entity, state = {}) {
  const group = svg('g')
  const lit = Boolean(state.lit)
  add(group,
    shadow(0, 2, 40, 7),
    // 黄色电缆(frame-005/010/023 黄电缆自灯座垂至台面盘绕)
    svg('path', {d: 'M22 -10q26 8 30 26', fill: 'none', stroke: '#c9a23a', 'stroke-width': 2.6, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M52 16q14 6 4 14q-12 8 -30 2', fill: 'none', stroke: '#d8c25a', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
    // 圆脚座(frame-010 白色圆足+矮柱颈)
    svg('ellipse', {cx: 0, cy: -6, rx: 33, ry: 8, fill: '#c9c7bb', stroke: '#6f6a63', 'stroke-width': 1.6}),
    svg('ellipse', {cx: 0, cy: -10, rx: 24, ry: 6, fill: '#dddacb', stroke: '#8b857a', 'stroke-width': 1.2}),
    svg('rect', {x: -12, y: -34, width: 24, height: 22, rx: 4, fill: '#b9bdb4', stroke: '#6f6a63', 'stroke-width': 1.5}),
    // 下部奶白柱身(frame-010 采样 #979d9d → 模拟明度奶白)
    svg('rect', {x: -25, y: -92, width: 50, height: 60, rx: 5, fill: '#d6d8d0', stroke: '#6f6a63', 'stroke-width': 1.6}),
    svg('rect', {x: -25, y: -92, width: 12, height: 60, rx: 5, fill: '#f0f1ea', opacity: .75}),
    svg('rect', {x: 13, y: -90, width: 10, height: 56, rx: 4, fill: '#8f948d', opacity: .5}),
    // 上部深色灯管/灯罩段(frame-010 采样 #312b2d)
    svg('rect', {x: -22, y: -148, width: 44, height: 58, rx: 6, fill: lit ? '#4a4038' : '#38312f', stroke: '#221d1b', 'stroke-width': 1.8}),
  )
  if (lit) {
    // 暖黄泛光晕(renderLightSource 口径光晕画法: 低透明度叠层椭圆)
    add(group,
      svg('ellipse', {cx: 0, cy: -118, rx: 52, ry: 66, fill: '#ffe27a', opacity: .09}),
      svg('ellipse', {cx: 0, cy: -118, rx: 36, ry: 50, fill: '#ffe27a', opacity: .1}),
      // 灯管段端缘亮边(frame-010 灯管上下缘受光)
      svg('rect', {x: -22, y: -148, width: 44, height: 4, rx: 2, fill: '#ffd98e', opacity: .5}),
    )
  }
  add(group,
    // 发光窗缝(frame-010 暗段左侧竖向缝: lit 暖橙亮缝 / 熄灭暗缝)
    svg('rect', {x: -18, y: -138, width: 6, height: 38, rx: 3, fill: lit ? '#ffb45c' : '#211c1a', opacity: lit ? .85 : .9}),
  )
  if (lit) {
    add(group, svg('rect', {x: -18, y: -138, width: 6, height: 38, rx: 3, fill: '#fff0c2', opacity: .5}))
  }
  add(group,
    // 柱身/灯罩接缝环(frame-010 两段之间分界)
    svg('rect', {x: -24, y: -95, width: 48, height: 6, rx: 3, fill: '#a7aba2', stroke: '#6f6a63', 'stroke-width': 1.2}),
  )
  group.append(label(entity.label, 0, 24))
  return group
}
