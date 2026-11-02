import {add, label, shadow, svg} from './svg.js'

//  -  白瓷环(内盛暗反射液面, 置于读数显微镜载物台上) - 
// 视觉依据: frame-003/012/016/017/039(白色磨砂圆环形容器, 环内暗反射液面, 径高比目测
// ≈2.5:1 → 环体 140x56; frame-039 环口被半透明薄条覆盖, 膜缘微超出环缘).
// 证据帧采样(frame-012): 环体亮部 #91928c(磨砂白高光), 环体暗侧 #524d4a, 环口暗液面
// 亮反光 #887d79 / 暗部 #493e3c; 按题给采样色系修正为液面 #a6928e/#36312e, 环体磨砂白
// #e8e6e0/#8f8a84(laboratory-light 明度还原, 先例 physics.flame.v1 对低照度采样的还原处理).
// 风格依据: chemistry.js 器皿 2.5D 画法(器身+顶部椭圆口+侧壁明暗带)+ physics.js
// renderMetalSpecimen 顶/底椭圆画法, glass-body 类半透明膜面(frame-039 覆口薄膜)与
// apparatus-shadow 接地阴影; inline 配色, 不新增 styles.css class.
// 锚点: 局部 (0,0)=环底中心; 功能锚点 mouth(环口中心)=局部 (0,-56) - IR visual.anchors.mouth
// 声明为 y:-0.06(-30px), 与本渲染 56 高环口相差 26px, 建议构建方复核 scene/IR 锚点声明
// (资产渲染器不读 anchors, 落位由场景处理).
// 状态绑定(IR visual.state_bindings): state.film_mode='probe'|缺省 → 环口呈暗反射液面; 
// 'strip' → 环口覆盖半透明膜(微超出环缘, frame-039).
const HALF_W = 70        // 环体外半径(径 140)
const WALL_H = 56        // 环体高(径高比 2.5:1)
const MOUTH_RX = 52      // 环口内半径
const MOUTH_RY = 10.5    // 环口纵向半径

export function renderRingVessel(entity, state = {}) {
  const group = svg('g')
  add(group,
    shadow(0, 1, 76, 8),
    // 环壁侧墙(2.5D 短圆柱: 底椭圆收口 + 前壁)
    svg('path', {d: `M${-HALF_W} ${-WALL_H}L${-HALF_W} -8A${HALF_W} 14 0 0 0 ${HALF_W} -8L${HALF_W} ${-WALL_H}Z`, fill: '#dedbd3', stroke: '#6f6a63', 'stroke-width': 1.8}),
    // 磨砂白高光带(左前受光)与暗侧带(frame-012 环体明暗)
    svg('path', {d: `M-52 ${-WALL_H + 4}L-52 -10Q-46 -4 -38 -6L-38 ${-WALL_H + 3}Z`, fill: '#f4f2ec', opacity: .7}),
    svg('path', {d: `M42 ${-WALL_H + 3}L42 -8Q48 -2 56 -7L56 ${-WALL_H + 3}Z`, fill: '#8f8a84', opacity: .55}),
    // 环底阴影收口
    svg('path', {d: `M${-HALF_W + 4} -12A${HALF_W - 4} 12 0 0 0 ${HALF_W - 4} -12L${HALF_W - 4} -9A${HALF_W - 4} 12 0 0 1 ${-HALF_W + 4} -9Z`, fill: '#6f6a63', opacity: .5}),
    // 环口外沿(磨砂白顶面)
    svg('ellipse', {cx: 0, cy: -WALL_H, rx: HALF_W, ry: 15, fill: '#e8e6e0', stroke: '#6f6a63', 'stroke-width': 1.8}),
    svg('ellipse', {cx: 0, cy: -WALL_H, rx: MOUTH_RX + 4, ry: MOUTH_RY + 2.5, fill: 'none', stroke: '#b9b4ac', 'stroke-width': 2.4, opacity: .8}),
  )
  // 环内暗反射液面(题给采样 #a6928e 亮反光/#36312e 暗面)
  add(group,
    svg('ellipse', {cx: 0, cy: -WALL_H, rx: MOUTH_RX, ry: MOUTH_RY, fill: '#36312e', stroke: '#2a2523', 'stroke-width': 1.4}),
    svg('ellipse', {cx: -12, cy: -WALL_H - 1.5, rx: 28, ry: 5, fill: '#a6928e', opacity: .5}),
    svg('ellipse', {cx: 22, cy: -WALL_H + 3, rx: 14, ry: 2.6, fill: '#a6928e', opacity: .28}),
  )
  if (state.film_mode === 'strip') {
    // 覆口半透明膜(frame-039: 膜面平铺环口, 膜缘微超出环缘)
    add(group,
      svg('rect', {x: -78, y: -WALL_H - 9, width: 156, height: 15, rx: 6, class: 'glass-body'}),
      svg('rect', {x: -74, y: -WALL_H - 6.5, width: 148, height: 10, rx: 4, fill: 'none', stroke: '#e8f2f4', 'stroke-width': 1, opacity: .5}),
      svg('path', {d: `M-58 ${-WALL_H - 5}q40 8 96 2`, fill: 'none', class: 'glass-highlight', 'stroke-width': 2, opacity: .55}),
    )
  }
  group.append(label(entity.label, 0, 26))
  return group
}
