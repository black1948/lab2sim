import {add, shadow, svg} from './svg.js'

//  -  传动转轮(kind=crank_disc, 带红色旋钮的盘式传动轮, 本案 112 主机左侧传动件) - 
// 证据帧: frame-003(整机近景: 白色双层圆盘立于底座左端, 盘面近缘立红色旋钮, 盘心银色
//          轴承点, 淡黄皮带绕下层盘缘走向右侧发电机); frame-009(近景: 下层盘大, 上层
//          盘小两叠, 红旋钮带竖纹高光位于盘缘 ~10 点位); frame-013/014/016(演示者手指
//          拨盘缘使盘旋转, 旋钮随盘公转).
// 复用否决理由: physics-core 71 条无盘式传动轮条目; physics.pulley(吊重滑轮语义), 
//          physics.crank-handle.v1(L 形金属曲臂+木柄, 与本案盘式转轮形状不符)均不得
//          顶替.可信源发现两轮: 第 1 轮命中 NNTin/discord-logo animateddiscord.svg
//          (Discord logo, 关键词 disc 误命中, 已否决并清理注册副作用); 第 2 轮
//          query=rotating pulley wheel knob 无评分通过文件(候选均为 UI 旋钮库
//          svg-knob/imgui-knobs, 非实验器材)(trace assets/discover-crank_disc), 故代
//          码原生生成.
// 风格基础: physics.crank-handle.v1(可拖小件先例: 金属件 #b4c0c2/#5b6a6d, screw 轴点, 
//          悬空小件不画接地底座)+ physics.wimshurst-generator.v1 白件 #ecebe3/#b9b3a4
//          描边族 + 带轮轴承画法(renderPulley pulley-axle 族银色 #8f959c).红旋钮配色
//          取 frame-009 采样归一化 (178,52,44) → #c23a2a/#d94a35(域红族, 边 #7a1f16).
//          配色内联, 不新增 class.
// 状态语义: 无状态字段(本件转动由场景/编舞驱动位姿, 渲染器不内置动画; 演示者拨盘在
//          视频中为连续旋转, 如需动画可由编舞旋转本组, 旋钮随组公转).
// 关键尺寸(局部原点=盘心=上层盘顶面圆心; 注意: 小件原点偏离"底座中心"约定, 对接基准
//   是盘心而非台面; 下层盘底面在局部 y=+14): 
//   上层盘 r34 椭圆(透视 ry11)顶面 y=0, 厚 7(侧面带 y∈[0,7]); 下层盘 r40 椭圆
//   (ry13)顶面 y=7, 厚 7(y∈[7,14]); 红旋钮 r8 圆柱高 11, 立于上层盘顶面 ~10 点位
//   椭圆参数点 (−24, +7.8), 含顶面高光与竖向受光线; 盘心银色轴承 r4 + screw 中心点.
//   外接盒约 x∈[-40,40], y∈[-22,14](旋钮顶 −21.6).不画底座(本件由场景放在发电机
//   底座左端台面上方), 仅画接地阴影.
// 证据不清处: 盘厚/椭圆透视比在低照度帧按比例估读(各 ~7px, ry≈0.32r); 旋钮确切方位
//   角随盘旋转变化(frame-003 ~10 点位, frame-013~016 随拨动转动), 渲染器取静置 ~10
//   点位(135°)为缺省位姿; 上层盘与下层盘直径差目测 ~15%.
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/crank-disc'
//   (import {renderCrankDisc} from './physics.crank-disc.v1.renderer.js').z 序建议 12
//   (高于发电机 10, 盘与红旋钮盖在皮带端上方).场景建议: 本件局部原点放在发电机
//   (physics/ac-generator 局部系)(−150,−34), 下层盘缘右缘 x=−110 与发电机皮带端
//   (−114,−21) 相接, 皮带贴下层盘缘.

const WHITE = '#ecebe3'
const WHITE_TOP = '#f0eee6'
const WHITE_SIDE = '#e6e4da'
const WHITE_RIM = '#d8d5ca'
const WHITE_EDGE = '#b9b3a4'
const KNOB_RED = '#c23a2a'      // 红旋钮(frame-009 采样归一化, 域红族)
const KNOB_TOP = '#d94a35'
const KNOB_EDGE = '#7a1f16'

export function renderCrankDisc(entity, state = {}, context = {}) {
  const group = svg('g')
  add(group, shadow(0, 15, 42, 5))
  // 下层盘(r40, 顶面 y=7, 厚 7)
  add(group,
    svg('ellipse', {cx: 0, cy: 14, rx: 40, ry: 13, fill: WHITE_RIM, stroke: WHITE_EDGE, 'stroke-width': 1.4}),
    svg('rect', {x: -40, y: 7, width: 80, height: 7, fill: WHITE_SIDE}),
    svg('ellipse', {cx: 0, cy: 7, rx: 40, ry: 13, fill: WHITE, stroke: WHITE_EDGE, 'stroke-width': 1.2}),
  )
  // 上层盘(r34, 顶面 y=0, 厚 7)
  add(group,
    svg('ellipse', {cx: 0, cy: 7, rx: 34, ry: 11, fill: WHITE_RIM, stroke: WHITE_EDGE, 'stroke-width': 1.3}),
    svg('rect', {x: -34, y: 0, width: 68, height: 7, fill: WHITE_SIDE}),
    svg('ellipse', {cx: 0, cy: 0, rx: 34, ry: 11, fill: WHITE_TOP, stroke: WHITE_EDGE, 'stroke-width': 1.4}),
    // 顶面前缘受光弧
    svg('path', {d: 'M-26 5.6Q0 13.4 26 5.6', fill: 'none', stroke: 'rgb(255 255 255 / 50%)', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
  )
  // 近缘红色旋钮(r8 圆柱, ~10 点位, 含高光)
  add(group,
    svg('ellipse', {cx: -24, cy: 7.8, rx: 8, ry: 2.8, fill: KNOB_EDGE}),
    svg('rect', {x: -32, y: -3.2, width: 16, height: 11, rx: 1.5, fill: KNOB_RED, stroke: KNOB_EDGE, 'stroke-width': 1.2}),
    svg('ellipse', {cx: -24, cy: -3.2, rx: 8, ry: 2.8, fill: KNOB_TOP, stroke: KNOB_EDGE, 'stroke-width': 1.2}),
    svg('line', {x1: -29.5, y1: -1.5, x2: -29.5, y2: 5.5, stroke: 'rgb(255 255 255 / 30%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('ellipse', {cx: -26.5, cy: -4.2, rx: 2.2, ry: 1.1, fill: '#ffffff', opacity: .75}),
  )
  // 盘心银色轴承
  add(group,
    svg('circle', {cx: 0, cy: 0, r: 4, fill: '#8f959c', stroke: '#5b6a6d', 'stroke-width': 1.4}),
    svg('circle', {cx: 0, cy: 0, r: 1.5, class: 'screw'}),
  )
  return group
}
