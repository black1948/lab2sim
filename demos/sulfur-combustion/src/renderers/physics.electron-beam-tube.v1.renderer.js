import {add, label, shadow, svg} from './svg.js'

//  -  球形电子束管(低压气体放电泡, kind=electron_beam_tube, case 138) - 
// 视觉依据: frame-001/002(全景: 球形玻璃泡坐于机箱上室, 泡内近黑 - 本实验在暗室中观察辉光
//           束流); frame-004(特写: 泡底中央棕金阴极组件 - 小杯状结构+支架, 枪口朝上, 杯口
//           即枪口; 泡底玻璃颈伸入深棕座杯); frame-006(通电暗室: 枪口橙红辉光+蓝白直线束流
//           自枪口向右直抵泡壁); frame-008/010/011(加磁场后束流卷成圆轨迹: 自枪口出发先向
//           右, 视觉上逆时针卷起一圈, 近枪口段最亮, 远端渐隐, 蓝白辉光).
// 复用审查否决(注册表无 electron_beam_tube 条目): physics.cathode-ray-tube.v1=卧式横管+喇叭
//           荧光屏(137 案例), 非球形泡; physics.ring-vessel.v1=白瓷环形容器; 玻璃细管类
//           (hydrogen-jet-tube/test-tube 等)均为细长管形 - 均禁止顶替.可信源发现命中
//           feathericons youtube.svg('tube' 词元误配)已回滚(trace assets/rollback-
//           electron_beam_tube), 故代码原生生成.
// 风格基础: 玻璃语言沿 physics.js renderConvexLens(glass 轮辋+内圈淡高光+白高光弧)与
//           physics.cathode-ray-tube.v1.renderer.js(GLASS_EDGE #4a6a74, 阴极棕金 #6a5346, 
//           阴极橙红辉光 #ff8c3a 三层圆, 束流蓝白三层描边 #7fd4ff/#9fdcff/#e8f7ff)同族; 
//           但内腔按 frame-006..016 暗室实拍改为深色径向渐变(近黑); 颈座深棕 #3d2c22 依
//           frame-004 采样归一化.配色全部内联, 不新增 styles.css class.
// 关键尺寸(局部原点=球泡底与颈座交接点=落座机箱顶面处, y 向下为正, 本体向 −y 生长): 
//   球泡圆心 (0,-95), 半径 95(玻璃轮辋 r95 描边+内腔径向渐变 r95+内圈高光 r93+左上白高光弧); 
//   电子枪: 支架杆 y∈[-34,-16], 阴极杯 y∈[-45,-33](杯口=枪口尖端 (0,-45), 杯底宽 9 杯口宽 6); 
//   颈座: 玻璃颈 (-11,-16)~(11,-16) 收至 (±7,-1), 深棕座杯 y∈[-13,3](底椭圆 rx18 ry3.2).
//   总高约 198px, 总宽 190px.
// 状态契约(读实体自身 state): 
//   state.gun_lit(bool)=阴极橙红辉光(枪口 (0,-45) 三层圆 #ff8c3a/#ffb35c/#ffe0a0, CRT 同法); 
//   state.beam_on(bool)=束流圆轨迹: 圆心 (0,-45-r_px), 半径 r_px=Number(state.beam_radius_norm||0)*95, 
//     起点=枪口 (0,-45), 初始方向 +x, 视觉上逆时针卷起(参数化 P(θ)=(r - sinθ, -45-r+r - cosθ), 
//     θ 0..2π), clip 到圆心 (0,-95) r93 的泡内腔圆; 三层描边辉光(外 #7fd4ff w7 op.16 /
//     中 #9fdcff w3.2 op.42 / 芯 #e8f7ff w1.5 op.95), 拆两段半圆弧: 近枪口段全亮, 远半段
//     亮度×0.45(渐隐); r_px<2 不画弧; beam_on 时枪口加亮斑; 
//   state.beam_straight(bool)=束流直线 (0,-45)→(78,-45)(泡壁内侧), 同三层描边; 
//   beam_on/beam_straight/gun_lit 全 false 时无任何辉光.缺省/非数值 beam_radius_norm 按 0.
// 证据不清处: ① 束流圆的进光端亮斑尺寸帧内不可辨, 按 CRT 落点荧光先例画 r2.6/r5 两层示意; 
//           ② 阴极杯内灯丝结构 frame-004 不可辨→不画; ③ 座杯与机箱顶面的连接件(卡箍)帧内
//           不可辨→不画; ④ 直线束与圆轨迹的切换由引擎驱动, 本渲染器只按 state 二选一/同显.
// 集成: 复制本文件到模板 src/renderers/ 并在 index.js 注册 'physics/electron-beam-tube'
//           (import {renderElectronBeamTube} from './physics.electron-beam-tube.v1.renderer.js').
//           场景落位(构建方契约): 球管 (0.5,0.384)→屏幕 px (500,368), scale 1.15; z 序居中景
//           (主机之上, 前环之前/后环之后), 辉光束流画于本组内即位于前环之下(构建方按需调整
//           前后环 z 序).clipPath id 随 entity.id 唯一, 防多实例冲突.

const GLASS_EDGE = '#4a6a74'   // 玻璃描边(renderConvexLens/CRT 同族)
const CATHODE = '#6a5346'      // 阴极杯棕金(frame-004, CRT CATHODE_BODY 同族)
const CATHODE_EDGE = '#4a3a30'
const CATHODE_LIGHT = '#8a6f52'
const CATHODE_STEM = '#5a4536' // 枪支架杆
const SEAT = '#3d2c22'         // 颈座深棕杯(frame-004 采样归一化)
const SEAT_EDGE = '#241811'
const SEAT_LIGHT = '#7a5a40'
const GLOW_ORANGE = '#ff8c3a'  // 阴极辉光(frame-006, CRT 同族)
const GLOW_CORE = '#ffb35c'
const GLOW_HOT = '#ffe0a0'
const BEAM_HALO = '#7fd4ff'    // 束流蓝白(frame-008/010, CRT 同族)
const BEAM_GLOW = '#9fdcff'
const BEAM_CORE = '#e8f7ff'

const BULB_C = [0, -95]        // 球泡圆心
const BULB_R = 95              // 球泡半径
const MUZZLE = [0, -45]        // 枪口尖端
const CLIP_R = 93              // 束流 clip 半径(泡内腔)

// 束流三层描边(k=亮度系数: 近枪口段 1, 远半段 0.45)
function beamStroke(pathD, k) {
  return add(svg('g'),
    svg('path', {d: pathD, fill: 'none', stroke: BEAM_HALO, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: (.16 * k).toFixed(3)}),
    svg('path', {d: pathD, fill: 'none', stroke: BEAM_GLOW, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: (.42 * k).toFixed(3)}),
    svg('path', {d: pathD, fill: 'none', stroke: BEAM_CORE, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: (.95 * k).toFixed(3)}),
  )
}

export function renderElectronBeamTube(entity, state = {}, context = {}) {
  const group = svg('g')
  const gunLit = Boolean(state.gun_lit)
  const beamOn = Boolean(state.beam_on)
  const beamStraight = Boolean(state.beam_straight)
  const normRaw = Number(state.beam_radius_norm || 0)
  const rPx = Number.isFinite(normRaw) ? normRaw * BULB_R : 0

  // 落座接触阴影
  group.append(shadow(0, 1.5, 34, 5.5))
  //  -  玻璃颈 + 深棕座杯(frame-004; 先画, 被球泡/座杯叠上) - 
  add(group,
    svg('path', {d: 'M-11 -16L11 -16L7 -1L-7 -1Z', fill: 'rgb(221 245 249 / 14%)', stroke: GLASS_EDGE, 'stroke-width': 1.3, 'stroke-linejoin': 'round'}),
    svg('path', {d: 'M-17 -8Q0 -13.5 17 -8L13 1Q0 5 -13 1Z', fill: SEAT, stroke: SEAT_EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('path', {d: 'M-11 -8.6Q0 -12.4 11 -8.6', fill: 'none', stroke: SEAT_LIGHT, 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: .85}),
    svg('ellipse', {cx: 0, cy: 1.2, rx: 18, ry: 3.2, fill: '#2b1d15', stroke: SEAT_EDGE, 'stroke-width': 1}),
  )
  //  -  球泡: 深色内腔径向渐变(暗室实拍 frame-006..016 近黑) - 
  const clipId = `lorentz-beam-${(entity && entity.id) || 'electron-beam-tube'}`
  const gradId = `lorentz-cavity-${(entity && entity.id) || 'electron-beam-tube'}`
  const defs = svg('defs')
  const grad = svg('radialGradient', {id: gradId, cx: '38%', cy: '32%', r: '75%'})
  add(grad,
    svg('stop', {offset: '0%', 'stop-color': '#101820'}),
    svg('stop', {offset: '55%', 'stop-color': '#0b1116'}),
    svg('stop', {offset: '85%', 'stop-color': '#0e161c'}),
    svg('stop', {offset: '100%', 'stop-color': '#1c2a33'}),
  )
  const beamClip = svg('clipPath', {id: clipId})
  beamClip.append(svg('circle', {cx: BULB_C[0], cy: BULB_C[1], r: CLIP_R}))
  defs.append(grad)
  defs.append(beamClip)
  group.append(defs)
  group.append(svg('circle', {cx: BULB_C[0], cy: BULB_C[1], r: BULB_R, fill: `url(#${gradId})`, stroke: 'none'}))
  // 泡内玻璃反光内圈(renderConvexLens 内圈淡高光语言, 弱化以保持内腔暗)
  group.append(svg('circle', {cx: BULB_C[0], cy: BULB_C[1], r: 89, fill: 'none', stroke: 'rgb(120 150 165 / 10%)', 'stroke-width': 3}))
  //  -  电子枪(frame-004: 支架杆+棕金阴极杯, 枪口朝上, 尖端 (0,-45); 透过玻璃绘制) - 
  add(group,
    svg('rect', {x: -2.5, y: -34, width: 5, height: 18, rx: 1.6, fill: CATHODE_STEM, stroke: CATHODE_EDGE, 'stroke-width': 1}),
    svg('path', {d: 'M-4.5 -33L4.5 -33L3 -45L-3 -45Z', fill: CATHODE, stroke: CATHODE_EDGE, 'stroke-width': 1.2, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -3, y1: -44.6, x2: 3, y2: -44.6, stroke: CATHODE_LIGHT, 'stroke-width': 1, 'stroke-linecap': 'round'}),
    svg('ellipse', {cx: 0, cy: -45, rx: 2.6, ry: 1, fill: '#2e211a'}),
  )
  //  -  阴极橙红辉光(state.gun_lit, frame-006; CRT 三层圆同法) - 
  if (gunLit) {
    add(group,
      svg('circle', {cx: MUZZLE[0], cy: MUZZLE[1], r: 10, fill: GLOW_ORANGE, opacity: .26}),
      svg('circle', {cx: MUZZLE[0], cy: MUZZLE[1], r: 5.5, fill: GLOW_CORE, opacity: .5}),
      svg('circle', {cx: MUZZLE[0] - 1.5, cy: MUZZLE[1] - 1, r: 2.4, fill: GLOW_HOT, opacity: .9}),
    )
  }
  //  -  束流(clip 到泡内腔 r93; 三层描边辉光, 近枪口段更亮) - 
  if (beamOn && rPx >= 2) {
    const r = rPx.toFixed(2)
    const topY = (-45 - 2 * rPx).toFixed(2)
    // 近枪口半段: 枪口 (0,-45) 经右侧 (拱向 +x) 至圆轨迹顶 (0,-45-2r); sweep=0=视觉逆时针
    const near = `M0 -45A${r} ${r} 0 0 0 0 ${topY}`
    // 远半段: 顶经左侧回到枪口
    const far = `M0 ${topY}A${r} ${r} 0 0 0 0 -45`
    const beamGroup = svg('g', {'clip-path': `url(#${clipId})`})
    add(beamGroup, beamStroke(near, 1), beamStroke(far, .45))
    group.append(beamGroup)
  }
  if (beamStraight) {
    const beamGroup = svg('g', {'clip-path': `url(#${clipId})`})
    beamGroup.append(beamStroke('M0 -45L78 -45', 1))
    group.append(beamGroup)
  }
  if (beamOn || beamStraight) {
    // 枪口亮斑(束流自枪口亮起, frame-006/008)
    add(group,
      svg('circle', {cx: MUZZLE[0], cy: MUZZLE[1], r: 5, fill: BEAM_GLOW, opacity: .3}),
      svg('circle', {cx: MUZZLE[0], cy: MUZZLE[1], r: 2.6, fill: BEAM_CORE, opacity: .85}),
    )
  }
  //  -  玻璃轮辋 + 左上白高光弧(renderConvexLens 玻璃语言; 画在最上层=玻璃面在前) - 
  add(group,
    svg('circle', {cx: BULB_C[0], cy: BULB_C[1], r: BULB_R, fill: 'none', stroke: GLASS_EDGE, 'stroke-width': 2}),
    svg('circle', {cx: BULB_C[0], cy: BULB_C[1], r: 93, fill: 'none', stroke: 'rgb(232 242 244 / 22%)', 'stroke-width': 1.2}),
    svg('path', {d: 'M-79.7 -132.2A88 88 0 0 1 -22.8 -180', fill: 'none', stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
    svg('ellipse', {cx: -38, cy: -138, rx: 9, ry: 4.2, fill: '#ffffff', opacity: .4, transform: 'rotate(-32 -38 -138)'}),
  )
  group.append(label(entity.label, 0, -205))
  return group
}
