import {add, label, shadow, svg} from './svg.js'

//  -  磁力小车 - 右车(左车的镜像: 车顶条形磁铁蓝端朝画面中央, 即蓝左红右) - 
// 视觉依据: frame-004 特写(右车磁铁=蓝左红右, 蓝端朝画面中央, 与左车蓝端相对构成同名
//           磁极斥力构型); frame-011/012/018(压合时两杆蓝端在中央几乎相接); 
//           frame-020(弹开后右车居右, 磁铁姿态不变).其余车身/车轮/凸起座证据同左车
//           (同一辆车, 见 physics.magnetic-cart-left.v1.renderer.js 头注).
// 复用审查否决记录: 同左车(physics.cart.v1 为 07 案例专用带斜面角/读数/徽标; 
//           physics.horseshoe-magnet.v1 为蹄形磁铁; twbs/icons 购物车 glyph 已否决回滚).
// 风格依据/局部几何/配色: 与 physics.magnetic-cart-left.v1.renderer.js 完全一致(镜像), 
//           绘制函数在本文件内联, 互不依赖(两文件各自仅 import ./svg.js, 便于构建方
//           独立复制注册).
// 状态契约: 无状态绑定; 恒水平, 不读 state.angle_deg.
// 导出签名: renderMagneticCartRight(entity, state, context).
// 集成: renderer 键 physics/magnetic-cart-right(复制本文件到 src/renderers/ 并在 index.js
// 注册; 两车实体均不设 default_for_kind, 镜像几何不外溢到其他案例).

const BODY = '#b9bfc6'
const BODY_TOP = '#dde2e7'
const BODY_EDGE = '#5b6a6d'
const BODY_SEAM = '#878e96'
const SEAT = '#ccd2d8'
const WHEEL = '#3f434a'
const WHEEL_FAR = '#303338'
const WHEEL_RIM = '#b9bfc6'
const HUB = '#a7adb4'
const AXLE_DOT = '#26282c'
const MAGNET_RED = '#c93030'
const MAGNET_RED_DEEP = '#8f1f1f'
const MAGNET_BLUE = '#2b4d8c'
const MAGNET_BLUE_DEEP = '#1f3a6e'
const CAP = '#dfe3e8'
const CAP_EDGE = '#9aa3ad'
const JOINT = '#23262b'

// 共用绘制: blueOnRight=false → 蓝端在 -120..0(朝 -x/画面中央), 红端在 0..120
function drawMagneticCart(entity, blueOnRight) {
  const group = svg('g')
  add(group,
    shadow(0, 1.5, 38, 5),
    svg('circle', {cx: -17.5, cy: -8.6, r: 7.2, fill: WHEEL_FAR, stroke: '#1d1f23', 'stroke-width': 1.2}),
    svg('circle', {cx: 17.5, cy: -8.6, r: 7.2, fill: WHEEL_FAR, stroke: '#1d1f23', 'stroke-width': 1.2}),
    svg('line', {x1: -22, y1: -8, x2: 22, y2: -8, stroke: '#565b62', 'stroke-width': 1.6}),
  )
  for (const x of [-22, 22]) {
    add(group,
      svg('circle', {cx: x, cy: -8, r: 8, fill: WHEEL, stroke: WHEEL_RIM, 'stroke-width': 1.4}),
      svg('circle', {cx: x, cy: -8, r: 3, fill: HUB}),
      svg('circle', {cx: x, cy: -8, r: 1.3, fill: AXLE_DOT}),
    )
  }
  add(group,
    svg('rect', {x: -33, y: -36, width: 66, height: 22, rx: 2.5, fill: BODY, stroke: BODY_EDGE, 'stroke-width': 1.6}),
    svg('path', {d: 'M-33 -36L-27 -41L27 -41L33 -36Z', fill: BODY_TOP, stroke: BODY_EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -26, y1: -39.6, x2: 26, y2: -39.6, stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    svg('rect', {x: 21, y: -36, width: 12, height: 22, rx: 2.5, fill: '#2e2e2d', opacity: .16}),
    svg('line', {x1: -33, y1: -24, x2: 33, y2: -24, stroke: BODY_SEAM, 'stroke-width': 1, opacity: .7}),
    svg('line', {x1: 0, y1: -34, x2: 0, y2: -16, stroke: '#6f767e', 'stroke-width': 1.2, opacity: .8}),
    svg('circle', {cx: -13, cy: -20, r: 2.1, fill: '#7d848c', stroke: BODY_EDGE, 'stroke-width': 1}),
    svg('circle', {cx: 13, cy: -20, r: 2.1, fill: '#7d848c', stroke: BODY_EDGE, 'stroke-width': 1}),
  )
  add(group,
    svg('path', {d: 'M-20 -36L-13 -45L13 -45L20 -36Z', fill: SEAT, stroke: BODY_EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -11, y1: -43.4, x2: 11, y2: -43.4, stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )
  const nearColor = blueOnRight ? MAGNET_RED : MAGNET_BLUE
  const farColor = blueOnRight ? MAGNET_BLUE : MAGNET_RED
  const nearDeep = blueOnRight ? MAGNET_RED_DEEP : MAGNET_BLUE_DEEP
  const farDeep = blueOnRight ? MAGNET_BLUE_DEEP : MAGNET_RED_DEEP
  add(group,
    svg('rect', {x: -120, y: -57, width: 120, height: 12, rx: 1.5, fill: nearColor}),
    svg('rect', {x: 0, y: -57, width: 120, height: 12, rx: 1.5, fill: farColor}),
    svg('rect', {x: -120, y: -49, width: 120, height: 4, fill: nearDeep}),
    svg('rect', {x: 0, y: -49, width: 120, height: 4, fill: farDeep}),
    svg('line', {x1: 0, y1: -57, x2: 0, y2: -45, stroke: JOINT, 'stroke-width': 1.6}),
    svg('line', {x1: -111, y1: -55.6, x2: 111, y2: -55.6, stroke: 'rgb(255 255 255 / 65%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('line', {x1: -111, y1: -46.4, x2: 111, y2: -46.4, stroke: JOINT, 'stroke-width': 1.2, opacity: .35, 'stroke-linecap': 'round'}),
    svg('rect', {x: -120, y: -57, width: 8, height: 12, rx: 1.5, fill: CAP, stroke: CAP_EDGE, 'stroke-width': 1.1}),
    svg('rect', {x: 112, y: -57, width: 8, height: 12, rx: 1.5, fill: CAP, stroke: CAP_EDGE, 'stroke-width': 1.1}),
    svg('rect', {x: -120, y: -57, width: 240, height: 12, rx: 1.5, fill: 'none', stroke: JOINT, 'stroke-width': 1.2, opacity: .85}),
  )
  group.append(label(entity.label, 0, -74))
  return group
}

export function renderMagneticCartRight(entity, state = {}, context = {}) {
  return drawMagneticCart(entity, false)
}
