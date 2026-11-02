import {add, label, shadow, svg} from './svg.js'

//  -  磁力小车 - 左车(银色四轮金属小车 + 车顶红蓝双色条形磁铁, 蓝端朝画面中央) - 
// 视觉依据: frame-004 特写(银色低矮金属小车: 车身 ~66×22px, 4 个小轮带铆钉/车轴细节, 
//           车身中段有凸起座; 车顶纵向平放一根条形磁铁 - 左半红右半深蓝, 端头浅色端帽, 
//           微高出车身, 两端远伸出车身); frame-011/012(左车磁铁=红左蓝右, 蓝端朝中央); 
//           frame-018(压合时两杆几乎连成一线); frame-020(弹开后左车居左, 磁铁姿态不变).
// 复用审查否决记录: physics.cart.v1(renderCart)为 07 案例专用 - state.angle_deg 缺省取
//           斜面角 TRACK.angle_deg(车体被斜着画), 恒显 s/v 读数, 带"第1响/第2响"徽标与
//           ✓1:4 徽标, 对本案例是错误物理叙事; physics.horseshoe-magnet.v1 为蹄形磁铁≠
//           车载条形磁铁.可信源发现命中 twbs/icons 购物车 glyph(16x16 单色线稿), 形状
//           语义与风格均不符, 已否决回滚.无诚实复用.
// 风格依据: physics.js renderCart 车轮/车体层序(先轮后车身)+ apparatus-shadow 接地阴影, 
//           physics.wooden-box.v1.renderer.js 的 2.5D 顶面斜折面+白色高光线+右侧暗部叠层, 
//           chemistry.digital-thermometer.v1.renderer.js 的金属族配色(BODY 取 styles .metal
//           族 #b9bfc6/#dde2e7, 描边 #5b6a6d).磁铁红取构建方指定 #c93030 族, 蓝取
//           #2b4d8c/#1f3a6e 深蓝族(frame-004 实拍蓝端 #0b0c11 为暗光所致, 归一化到深蓝), 
//           端帽浅银白 #dfe3e8.配色全部内联, 不新增 styles.css class.
// 局部几何(y 向下, (0,0)=车轮接触线中点/底面中心): 
//   车身 x∈[-33,33], y∈[-36,-14](66×22); 2.5D 顶面斜折 y∈[-41,-36]; 
//   凸起座(梯形)y∈[-45,-36], x∈[-20,20]; 车轮 4 只: 近侧 2 只 (±22,-8) r8, 
//   远侧 2 只 (±17.5,-8.6) r7.2(侧视半遮); 接地阴影椭圆 (0,1.5) rx38.
//   磁铁条: x∈[-120,120](两端伸出到 ±120px, 与构建方 couple 锚点 ±115px 对应 - 锚点落在
//   端帽 112..120 区间内, 压合 anchored_gap=0 时两杆端面相距 10px≈frame-018"几乎连成一线"), 
//   y∈[-57,-45](12px 高, 坐凸起座顶), 半红半蓝以 x=0 分界.
//   本文件=左车: 磁铁红左蓝右(蓝端朝 +x/画面中央); 右车见
//   physics.magnetic-cart-right.v1.renderer.js(同几何镜像, 绘制函数各自内联, 互不依赖).
// 状态契约: 无状态绑定(IR state_bindings 空; pushed_away 等状态叙事由引擎位移表达, 
//   渲染器不画状态视觉).不读 state.angle_deg - 本车恒水平(与 physics.cart.v1 的本质区别).
// 证据不清处: ① 磁铁表面无 N/S 丝印(IR assumptions 亦注明), 未标极名; ② frame-004 右车
//   磁铁红端上有一道白色反光划痕, 属镜面眩光未复刻; ③ 车身正面的两枚深色圆钮在帧内为
//   低置信(疑似侧板开孔露出的车轮/轴钮), 按铆钉细节示意于 (±13,-20).
// 导出签名与模板一致: renderMagneticCartLeft(entity, state, context).
// 集成: renderer 键 physics/magnetic-cart-left(index.js 的 import/注册由构建方完成: 复制
// 本文件到 src/renderers/ 并在 index.js 注册 'physics/magnetic-cart-left'; 右车文件同理).
// 两车实体不设 default_for_kind(镜像几何不外溢).

const BODY = '#b9bfc6'        // 车身前脸(铝合金, styles .metal 族)
const BODY_TOP = '#dde2e7'    // 2.5D 顶面斜折(受光)
const BODY_EDGE = '#5b6a6d'   // 描边(styles .metal 描边族)
const BODY_SEAM = '#878e96'   // 车身缝线/细节
const SEAT = '#ccd2d8'        // 凸起座
const WHEEL = '#3f434a'       // 近侧车轮
const WHEEL_FAR = '#303338'   // 远侧车轮(侧视半遮, 更暗)
const WHEEL_RIM = '#b9bfc6'   // 轮缘高光
const HUB = '#a7adb4'         // 轮毂
const AXLE_DOT = '#26282c'    // 轴心
const MAGNET_RED = '#c93030'      // 磁铁红端(构建方指定族)
const MAGNET_RED_DEEP = '#8f1f1f'
const MAGNET_BLUE = '#2b4d8c'     // 磁铁蓝端(深蓝族, frame-004 实拍归一化)
const MAGNET_BLUE_DEEP = '#1f3a6e'
const CAP = '#dfe3e8'         // 端帽浅银白
const CAP_EDGE = '#9aa3ad'
const JOINT = '#23262b'       // 磁铁描边/中缝

// 共用绘制: blueOnRight=true 蓝端朝 +x(左车), false 红端朝 +x(右车)
function drawMagneticCart(entity, blueOnRight) {
  const group = svg('g')
  // 接地阴影 + 车轮组(先轮后车身, 同 renderCart 层序)
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
  // 车身(66×22)+ 2.5D 顶面斜折 + 白高光
  add(group,
    svg('rect', {x: -33, y: -36, width: 66, height: 22, rx: 2.5, fill: BODY, stroke: BODY_EDGE, 'stroke-width': 1.6}),
    svg('path', {d: 'M-33 -36L-27 -41L27 -41L33 -36Z', fill: BODY_TOP, stroke: BODY_EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -26, y1: -39.6, x2: 26, y2: -39.6, stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    // 右侧背光暗部 + 缝线 + 中央槽口 + 铆钉(frame-004 铆钉/车轴细节)
    svg('rect', {x: 21, y: -36, width: 12, height: 22, rx: 2.5, fill: '#2e2e2d', opacity: .16}),
    svg('line', {x1: -33, y1: -24, x2: 33, y2: -24, stroke: BODY_SEAM, 'stroke-width': 1, opacity: .7}),
    svg('line', {x1: 0, y1: -34, x2: 0, y2: -16, stroke: '#6f767e', 'stroke-width': 1.2, opacity: .8}),
    svg('circle', {cx: -13, cy: -20, r: 2.1, fill: '#7d848c', stroke: BODY_EDGE, 'stroke-width': 1}),
    svg('circle', {cx: 13, cy: -20, r: 2.1, fill: '#7d848c', stroke: BODY_EDGE, 'stroke-width': 1}),
  )
  // 凸起座(frame-004 车身中段凸起, 磁铁坐其上)
  add(group,
    svg('path', {d: 'M-20 -36L-13 -45L13 -45L20 -36Z', fill: SEAT, stroke: BODY_EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -11, y1: -43.4, x2: 11, y2: -43.4, stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )
  // 条形磁铁(x ±120, 高 12, 半红半蓝以 x=0 分界; blueOnRight 决定朝向)
  const nearColor = blueOnRight ? MAGNET_RED : MAGNET_BLUE        // -120..0 半段
  const farColor = blueOnRight ? MAGNET_BLUE : MAGNET_RED         // 0..120 半段
  const nearDeep = blueOnRight ? MAGNET_RED_DEEP : MAGNET_BLUE_DEEP
  const farDeep = blueOnRight ? MAGNET_BLUE_DEEP : MAGNET_RED_DEEP
  add(group,
    svg('rect', {x: -120, y: -57, width: 120, height: 12, rx: 1.5, fill: nearColor}),
    svg('rect', {x: 0, y: -57, width: 120, height: 12, rx: 1.5, fill: farColor}),
    // 下半段压深(免渐变的双色阶画法, 同域内联配色惯例)
    svg('rect', {x: -120, y: -49, width: 120, height: 4, fill: nearDeep}),
    svg('rect', {x: 0, y: -49, width: 120, height: 4, fill: farDeep}),
    // 中缝 + 顶面白高光 + 底部压深线
    svg('line', {x1: 0, y1: -57, x2: 0, y2: -45, stroke: JOINT, 'stroke-width': 1.6}),
    svg('line', {x1: -111, y1: -55.6, x2: 111, y2: -55.6, stroke: 'rgb(255 255 255 / 65%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('line', {x1: -111, y1: -46.4, x2: 111, y2: -46.4, stroke: JOINT, 'stroke-width': 1.2, opacity: .35, 'stroke-linecap': 'round'}),
    // 两端浅银白端帽(couple 锚点 ±115 落在端帽区)
    svg('rect', {x: -120, y: -57, width: 8, height: 12, rx: 1.5, fill: CAP, stroke: CAP_EDGE, 'stroke-width': 1.1}),
    svg('rect', {x: 112, y: -57, width: 8, height: 12, rx: 1.5, fill: CAP, stroke: CAP_EDGE, 'stroke-width': 1.1}),
    // 整体描边收形
    svg('rect', {x: -120, y: -57, width: 240, height: 12, rx: 1.5, fill: 'none', stroke: JOINT, 'stroke-width': 1.2, opacity: .85}),
  )
  group.append(label(entity.label, 0, -74))
  return group
}

export function renderMagneticCartLeft(entity, state = {}, context = {}) {
  return drawMagneticCart(entity, true)
}
