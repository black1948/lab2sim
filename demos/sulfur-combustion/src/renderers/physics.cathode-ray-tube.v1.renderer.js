import {add, label, shadow, svg} from './svg.js'

//  -  阴极射线管(kind=cathode_ray_tube, case 137 用阴极射线管演示带电粒子在电场中的偏转) - 
// 证据帧: frame-003/005(全景: 水平横放玻璃射线管, 左端白色/象牙色瓷管座, 右端管壳加宽成
//          喇叭锥口(内壁荧光屏, 锥口深色椭圆窗), 管由两只金属支座托住, 座上有金属抱箍; 
//          frame-005 网格实测比例: 管长约 133px(瓷座 25 / 窄玻璃段 51 / 喇叭锥 57), 管轴
//          高出支座落地线约 43px, 瓷座半高 16 / 玻璃半高 13 / 锥口半高 24, 右端窗椭圆
//          rx≈13/ry≈24); frame-007/010(暗室实拍: 通电后瓷座边阴极区橙红炽热辉光, 蓝白色
//          束流直抵右宽端, 窗内蓝白荧光); frame-013(原理动画: 灯丝/阴极/阳极(中间有孔)/
//          两块黄色偏转极板/水平径迹); frame-015(下偏帧: 过板后径迹下折, 上板'−'下板'+').
// 复用否决: 注册表无 cathode_ray_tube 及任何玻璃管类条目(physics.rubber-tube 为橡胶管, 
//          physics.glass-plate 为载玻片, ring-vessel 为环形容器, 形状语义均不符, 普通玻璃
//          管/试管≠阴极射线管); 可信源发现命中 twbs/icons youtube.svg(YouTube 品牌 logo, 
//          'tube' 词元误配, 单色 glyph 与域内 2.5D 体块风格断裂)已回滚出注册表并删除 svg
//          (trace assets/discover-cathode_ray_tube, assets/rollback-cathode_ray_tube), 故代码
//          原生生成.
// 风格基础: 玻璃语言沿用域内 glass-body/glass-highlight 同族配色(rgb(221 245 249/30%) 填充, 
//          #4a6a74 描边, 白高光线, physics.js renderConvexLens 先例); 瓷管座象牙白 #ece9df/
//          #b5ae9d(power-supply CAP_WHITE 同族); 支座深金属 #3a4246+白高光(plate-electrode
//          立柱画法); 抱箍 class metal(#b4c0c2/#5b6a6d 金属族); 接地阴影 apparatus-shadow.
//          配色全部内联, 不新增 styles.css class.
// 状态契约(读实体自身 state): state.beam_on(bool, 缺省 false)=阴极辉光+束流+窗内荧光; 
//          state.deflect_mode(str)="No deflection"(缺省)→水平直线径迹, "向上偏转"→过板后向上折
//          14px, "向下偏转"→向下折 14px, 并按 deflect_mode 绘两极板 +/- 极性小标识(上偏=
//          上板+/下板−, 下偏=上板−/下板+, frame-015 镜像; 标识置于极板左侧同高处 - 帧内
//          标识贴极板外缘, 但资产尺度板-壁间不足 4px 无容字空间, 见 design_notes); beam_on=
//          false 时无辉光无径迹(极性标识仅随 deflect_mode, 电压可在断束时施加).
// 关键尺寸(局部原点=两只支座落地线中点=坐落主机顶面处, y 向下为正, 本体向 −y 生长): 
//   管轴 y=-43; 瓷座 x∈[-66,-41] 半高 16; 窄玻璃 x∈[-41,10] 半高 13; 喇叭锥 x∈[10,54]
//   半高 13→24, 右端窗椭圆 cx54 rx13/ry24(最右 67); 抱箍/支座 x=-20/+20; 支座立柱宽 5
//   y∈[-26,0]+脚垫; 总宽约 133px, 总高约 77px.
// 证据不清处: ① 实拍帧内偏转极板不可辨(352×288 源), 极板位置/黄色依原理动画 frame-013/015
//          补形(半透明黄板嵌于玻璃内示意); ② 阳极(中间有孔)依 frame-013 补为窄玻璃段内
//          竖杆+中孔缺口, 实拍不可辨; ③ 极性标识改画极板左侧同高处(帧内贴板外缘, 资产尺度
//          无容字空间); ④ 抱箍目测两道, 等距示意.
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/cathode-ray-tube'
//          (import {renderCathodeRayTube} from './physics.cathode-ray-tube.v1.renderer.js').
//          z 序: 本管居中景(遮光屏之后, 主机面板之前), scene 建议 console z < tube z <
//          lever z; 落位对准 crt-demo-console 顶面唇缘(其局部 (0,-50)).

const GLASS_FILL = 'rgb(221 245 249 / 30%)'
const GLASS_EDGE = '#4a6a74'
const CERAMIC = '#ece9df'        // 瓷管座象牙白(frame-005)
const CERAMIC_EDGE = '#b5ae9d'
const CERAMIC_SHADE = '#d8d3c4'
const STAND = '#3a4246'          // 支座深金属(frame-003/005)
const STRAP = '#b4c0c2'          // 抱箍亮金属
const STRAP_EDGE = '#5b6a6d'
const PLATE_YELLOW = '#e3cf4b'   // 偏转极板黄(frame-013/015)
const PLATE_YELLOW_EDGE = '#a8922e'
const POLARITY_RED = '#d24a3a'   // 极性标识红(frame-015 红色 +/−)
const CATHODE_BODY = '#6a5346'   // 阴极组件(frame-005 管内棕金结构)
const GLOW_ORANGE = '#ff8c3a'    // 阴极辉光(frame-007)
const GLOW_ORANGE_CORE = '#ffb35c'
const GLOW_HOT = '#ffe0a0'
const BEAM_HALO = '#7fd4ff'      // 束流蓝白(frame-007/010)
const BEAM_GLOW = '#9fdcff'
const BEAM_CORE = '#e8f7ff'
const SCREEN_GLOW = '#bfe9ff'    // 窗内荧光(frame-007 宽端蓝白辉光)

const AXIS_Y = -43               // 管轴高度(frame-005 实测比例)
const STAND_X = [-20, 20]        // 两只支座/抱箍(frame-005: 座边+亮箍各一)
const GLASS_HALF = 13            // 窄玻璃段半高
const CONE_X0 = 10               // 喇叭锥起点
const CONE_X1 = 54               // 锥口平面(窗椭圆心)
const CONE_HALF = 24             // 锥口半高
const RIM_RX = 13                // 端窗椭圆横半径
const PLATE_X0 = -6              // 偏转极板区间(frame-013 板在阳极后)
const PLATE_X1 = 14
const PLATE_GAP = 6              // 极板内缘离轴距离
const PLATE_THICK = 3.5
const DEFLECT_DY = 14            // 过板后偏转落差
const BEAM_X0 = -38              // 束流起点(瓷座边阴极面, frame-007 辉光位)
const SCREEN_X = 50              // 荧光屏落点(窗面内侧)

function deflectMode(state) {
  // "No deflection"(缺省)| "向上偏转" | "向下偏转"(含子串容错)
  const raw = String(state.deflect_mode || state.deflectMode || 'No deflection')
  if (raw.includes('up')) return 'up'
  if (raw.includes('down')) return 'down'
  return 'none'
}

function coneHalfAt(x) {
  // 喇叭锥在 x 处的半高(10→54 线性 13→24)
  if (x <= CONE_X0) return GLASS_HALF
  return GLASS_HALF + (CONE_HALF - GLASS_HALF) * (x - CONE_X0) / (CONE_X1 - CONE_X0)
}

function beamTrack(mode) {
  // 三层描边的束流路径: 阴极→板入口水平; 板区内匀强场恒加速抛物线(二次贝塞尔, 
  // 入口切线水平, 出口斜率与板后直线连续 - y ∝ x²); 出板后沿切线直行打到屏
  // (frame-007 直线 / frame-015 折转; 137 验证 minor #3 由折线改为抛物线过渡)
  const sign = mode === 'up' ? -1 : mode === 'down' ? 1 : 0
  const plateLen = PLATE_X1 - PLATE_X0
  const span = SCREEN_X - PLATE_X0
  const k = (sign * DEFLECT_DY) / (plateLen * (2 * span - plateLen))
  const dyPlate = k * plateLen * plateLen
  const endY = AXIS_Y + sign * DEFLECT_DY
  const d = mode === 'none'
    ? `M${BEAM_X0} ${AXIS_Y}L${SCREEN_X} ${AXIS_Y}`
    : `M${BEAM_X0} ${AXIS_Y}L${PLATE_X0} ${AXIS_Y}Q${PLATE_X0 + plateLen / 2} ${AXIS_Y} ${PLATE_X1} ${AXIS_Y + dyPlate}L${SCREEN_X} ${endY}`
  const group = svg('g')
  add(group,
    svg('path', {d, fill: 'none', stroke: BEAM_HALO, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .16}),
    svg('path', {d, fill: 'none', stroke: BEAM_GLOW, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .42}),
    svg('path', {d, fill: 'none', stroke: BEAM_CORE, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .95}),
  )
  // 落点荧光辉光(frame-007 宽端窗内蓝白亮斑; 画在端窗椭圆之后)
  add(group,
    svg('circle', {cx: SCREEN_X + 2, cy: endY, r: 8, fill: SCREEN_GLOW, opacity: .3}),
    svg('circle', {cx: SCREEN_X + 2, cy: endY, r: 4, fill: '#d9f6ff', opacity: .65}),
  )
  return group
}

function polarityMarks(mode) {
  // 极性小标识(frame-015 红色 +/−; 置于极板左侧同高处, 见头部"证据不清处"③)
  if (mode === 'none') return svg('g')
  const upper = mode === 'up' ? '+' : '−'
  const lower = mode === 'up' ? '−' : '+'
  const mark = (text, x, y) => {
    const t = svg('text', {x, y, 'text-anchor': 'middle', fill: POLARITY_RED, 'font-size': 5.5, 'font-weight': 700})
    t.textContent = text
    return t
  }
  return add(svg('g'),
    mark(upper, PLATE_X0 - 5, AXIS_Y - PLATE_GAP - PLATE_THICK / 2 + 2),
    mark(lower, PLATE_X0 - 5, AXIS_Y + PLATE_GAP + PLATE_THICK / 2 + 2),
  )
}

export function renderCathodeRayTube(entity, state = {}, context = {}) {
  const group = svg('g')
  const beamOn = Boolean(state.beam_on)
  const mode = deflectMode(state)
  add(group, shadow(0, 2.5, 60, 5))
  //  -  两只金属支座(frame-003/005, 托住抱箍下方落地于主机顶面) - 
  for (const x of STAND_X) {
    add(group,
      svg('rect', {x: x - 5.5, y: -2, width: 11, height: 2.6, rx: 1.2, fill: STAND, stroke: '#20262a', 'stroke-width': .9}),
      svg('line', {x1: x, y1: -2, x2: x, y2: AXIS_Y + 14, stroke: STAND, 'stroke-width': 5, 'stroke-linecap': 'round'}),
      svg('line', {x1: x - 1.1, y1: -4, x2: x - 1.1, y2: AXIS_Y + 16, stroke: 'rgb(255 255 255 / 20%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
    )
  }
  //  -  瓷管座(左端象牙白胶木座, frame-003/005) - 
  add(group,
    svg('rect', {x: -66, y: AXIS_Y - 16, width: 25, height: 32, rx: 9, fill: CERAMIC, stroke: CERAMIC_EDGE, 'stroke-width': 1.6}),
    svg('rect', {x: -66, y: AXIS_Y - 16, width: 8, height: 32, rx: 5, fill: CERAMIC_SHADE, stroke: 'none', opacity: .75}),
    svg('line', {x1: -60, y1: AXIS_Y - 10, x2: -60, y2: AXIS_Y + 10, stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 1.8, 'stroke-linecap': 'round'}),
  )
  //  -  玻璃管身(窄段+喇叭锥; frame-005 实测比例) - 
  const tubeBody = svg('path', {
    d: `M-41 ${AXIS_Y - GLASS_HALF}L${CONE_X0} ${AXIS_Y - GLASS_HALF}`
      + `C28 ${AXIS_Y - GLASS_HALF - 1.5} 42 ${AXIS_Y - 19.5} ${CONE_X1} ${AXIS_Y - CONE_HALF}`
      + `A${RIM_RX} ${CONE_HALF} 0 0 1 ${CONE_X1} ${AXIS_Y + CONE_HALF}`
      + `C42 ${AXIS_Y + 19.5} 28 ${AXIS_Y + GLASS_HALF + 1.5} ${CONE_X0} ${AXIS_Y + GLASS_HALF}`
      + `L-41 ${AXIS_Y + GLASS_HALF}Z`,
    fill: GLASS_FILL, stroke: GLASS_EDGE, 'stroke-width': 1.8, 'stroke-linejoin': 'round',
  })
  group.append(tubeBody)
  //  -  管内组件(透过玻璃; 阴极组件 frame-005 棕金结构, 阳极 frame-013 竖杆带孔, 极板 frame-013/015) - 
  add(group,
    svg('rect', {x: -38, y: AXIS_Y - 5, width: 14, height: 10, rx: 2, fill: CATHODE_BODY, stroke: '#4a3a30', 'stroke-width': 1}),
    svg('rect', {x: -16, y: AXIS_Y - 9, width: 2.5, height: 4.6, rx: 1, fill: '#8a9599'}),
    svg('rect', {x: -16, y: AXIS_Y + 4.4, width: 2.5, height: 4.6, rx: 1, fill: '#8a9599'}),
    svg('rect', {x: PLATE_X0, y: AXIS_Y - PLATE_GAP - PLATE_THICK, width: PLATE_X1 - PLATE_X0, height: PLATE_THICK, rx: 1, fill: PLATE_YELLOW, stroke: PLATE_YELLOW_EDGE, 'stroke-width': 1, opacity: .9}),
    svg('rect', {x: PLATE_X0, y: AXIS_Y + PLATE_GAP, width: PLATE_X1 - PLATE_X0, height: PLATE_THICK, rx: 1, fill: PLATE_YELLOW, stroke: PLATE_YELLOW_EDGE, 'stroke-width': 1, opacity: .9}),
  )
  //  -  右端荧光屏窗(frame-005 深色椭圆窗; beam_on 时窗内荧光, 画在窗椭圆之上) - 
  if (beamOn) {
    group.append(svg('ellipse', {cx: CONE_X1, cy: AXIS_Y, rx: RIM_RX, ry: CONE_HALF, fill: SCREEN_GLOW, opacity: .14}))
  }
  group.append(svg('ellipse', {cx: CONE_X1, cy: AXIS_Y, rx: RIM_RX, ry: CONE_HALF, fill: '#17282e', stroke: GLASS_EDGE, 'stroke-width': 1.6}))
  group.append(svg('ellipse', {cx: CONE_X1, cy: AXIS_Y, rx: 9, ry: 19.5, fill: 'none', stroke: 'rgb(255 255 255 / 18%)', 'stroke-width': 1}))
  //  -  束流与辉光(beam_on): 阴极橙红辉光 + 蓝白径迹 + 窗内落点荧光(frame-007/010) - 
  if (beamOn) {
    add(group,
      svg('circle', {cx: BEAM_X0, cy: AXIS_Y, r: 10, fill: GLOW_ORANGE, opacity: .26}),
      svg('circle', {cx: BEAM_X0, cy: AXIS_Y, r: 5.5, fill: GLOW_ORANGE_CORE, opacity: .5}),
      svg('circle', {cx: BEAM_X0 - 1.5, cy: AXIS_Y, r: 2.4, fill: GLOW_HOT, opacity: .9}),
    )
    group.append(beamTrack(mode))
  }
  // 极性标识仅随 deflect_mode(电压可在断束时施加)
  group.append(polarityMarks(mode))
  //  -  抱箍两道(画在束流之上: 金属箍在管前景, frame-005) - 
  for (const x of STAND_X) {
    const half = coneHalfAt(x) + 1.5
    add(group,
      svg('rect', {x: x - 2.6, y: AXIS_Y - half, width: 5.2, height: half * 2, rx: 2.2, fill: STRAP, stroke: STRAP_EDGE, 'stroke-width': 1.2}),
      svg('line', {x1: x - 1, y1: AXIS_Y - half + 3, x2: x - 1, y2: AXIS_Y + half - 3, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
    )
  }
  // 玻璃高光(沿窄段上缘 + 喇叭锥上缘短高光)
  add(group,
    svg('line', {x1: -37, y1: AXIS_Y - 10.2, x2: 6, y2: AXIS_Y - 10.2, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    svg('path', {d: `M18 ${AXIS_Y - 14.5}C28 ${AXIS_Y - 15.5} 38 ${AXIS_Y - 18} 46 ${AXIS_Y - 20.5}`, fill: 'none', stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
  )
  group.append(label(entity.label, 0, -74))
  return group
}
