import {add, label, shadow, svg} from './svg.js'

//  -  圆烧瓶阴极射线管(木座)(kind=flask_ray_tube, case 139 电子束在磁场中偏转) - 
// 视觉依据: frame-014(全景暗室: 圆烧瓶状玻璃管横卧, 瓶泡朝左, 颈朝右搁在浅木色方木座
//           上, 颈端有电极芯柱与卡箍, 高压导线自颈端引出); frame-015/016 特写(通电: 
//           泡壁中偏左下一绿色荧光小光斑; frame-016 磁铁 N 极靠近后光斑沿泡壁上移 - 
//           采样: 光斑位于距泡心约 0.6R 的泡内左侧, home≈左偏下, N 极上移约 34°); frame-
//           017..021(移开磁铁光斑回位; 亮场景下烧瓶为透明玻璃微白).
// 复用否决: physics.electron-beam-tube.v1(球形泡但为竖直电子枪管, 坐洛伦兹仪上室, 深色
//           内腔)形状功能不符; chemistry 类烧瓶(锥形瓶/圆底烧瓶静容器)为"形似而功能
//           不同"的器皿顶替, 不允许; 普通试管/导管均非真空射线管.可信源发现命中 twbs/
//           icons flask-fill(16px 单色锥形瓶 glyph) - 器皿顶替+风格断裂, 已回滚删 svg
//           (trace assets/discover-flask_ray_tube), 故代码原生生成.
// 风格基础: 玻璃语言沿域内 glass-body 同族(rgb(221 245 249/30%) 填充 + #4a6a74 描边 + 白
//           高光弧, physics.js renderConvexLens / physics.electron-beam-tube.v1 先例), 泡内
//           加白色雾面径向渐变(frame-017..021 泡体微白); 木座沿 physics.wood-block 族浅木
//           色+木纹画法(frame-015 浅黄木采样); 金属芯柱/卡箍沿 cathode-ray-tube STRAP 金
//           属族; 光斑绿色三层圆与 deflection-tube 束迹同族.配色内联, 不新增 class.
// 关键尺寸(局部 (0,0)=木座底边中点, y 向下为正): 
//   木座 x∈[-45,45] y∈[-28,0]; 泡心 (-25,-75) 半径 55; 颈自泡面 (≈29,-87) 朝右至 x≈70
//   (半宽 8.5, 微上仰); 颈端卡箍 x∈[56,62], 电极帽 x∈[62,70]+尖端; 泡顶 y=-130.
// 状态契约(从 world 推导, 构建方运行时依赖): 
//   powered = Boolean(world['induction-coil-1']?.valve_open) &&
//             world['induction-coil-1']?.connected_to === 'crt-flask-1'
//   磁铁影响: magnet=world['bar-magnet-1']; 屏幕位换算到局部后 d=到颈基 (26,-88) 的距离; 
//     strength=clamp(1-d/120,0,1)(构建方布局核算口径: 吸附烧瓶 neck 锚点后 d≈51 →
//     strength≈0.57, 滑移≈19px); pole = magnet.valve_open ? -1 : +1(false=N 极朝管).
//   光斑: powered=false 无光斑; powered=true 画荧光光斑(绿白三层小圆 r≈5/3/1.5), home
//     局部 (-45,-60)(泡壁左下内侧, 距泡心 r=25 的内壁弧上); 磁铁影响下光斑沿泡心角度
//     参数滑移: 弧上滑距=34*strength px(r=25 → Δφ=滑距/25), N 极(pole=+1)沿壁向上
//     (φ 增大, frame-016 证据), S 极向下(φ 减小, 方向为推断); strength=0 回 home.
// 证据不清处: ① S 极滑移方向无帧证据(全片仅 N 极靠近, frame-016), 按物理惯例镜像推断; 
//   ② S 极满强度时滑程较大, 光斑可绕至泡下缘(推断外推), 如需更收敛可由构建方限制
//   strength; ③ 颈端电极与导线接驳细节帧内不可辨, 按芯柱+卡箍示意; ④ 泡内雾白程度亮/
//   暗场景不同(frame-014 泡体亮白, frame-020 透明微白), 取亮暗折中.
// 集成: 复制本文件到 src/renderers/ 并在 index.js import {renderFlaskRayTube} 后注册
//   'physics/flask-ray-tube'.z 序: 木座/泡体高于台面件(构建方 scene 排序).

const GLASS_FILL = 'rgb(221 245 249 / 30%)'
const GLASS_EDGE = '#4a6a74'
const WOOD = '#d9c288'         // 浅木座(frame-015 采样归一化)
const WOOD_EDGE = '#a68b5e'
const WOOD_LIT = '#e6d5a5'
const WOOD_GRAIN = '#c2a76e'
const STRAP = '#b4c0c2'        // 卡箍(cathode-ray-tube 同族)
const STRAP_EDGE = '#5b6a6d'
const CAP = '#6a727a'          // 电极帽深金属
const GLOW = '#59c97a'         // 光斑绿(与 deflection-tube 束迹同族)
const GLOW_MID = '#8ef0a0'
const GLOW_CORE = '#d8ffe4'

const BC = [-25, -75]          // 泡心
const BR = 55                  // 泡半径
const SPOT_R = 25              // 光斑弧半径(home (-45,-60) 距泡心)
const HOME = [-45, -60]        // 光斑 home(构建方契约)
const SLIDE_MAX = 34           // 滑移上限(px, strength=1)
const NECK_BASE = [26, -88]    // 颈基(磁铁距离衰减参考点, 构建方核算口径)
const DECAY = 120              // 距离衰减尺度(clamp(1-d/120,0,1))

function screenOf(world, id) {
  const s = world && world[id]
  if (!s) return null
  const x = Number(s.x)
  const y = Number(s.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return {x: x * 1000, y: 560 - y * 500}
}

function selfScreen(context, entity) {
  const t = (context && context.visual && context.visual.transform)
    || (entity && entity.visual && entity.visual.transform) || {}
  const x = Number(t.x)
  const y = Number(t.y)
  return {x: (Number.isFinite(x) ? x : 0.5) * 1000, y: 560 - (Number.isFinite(y) ? y : 0.35) * 500}
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

export function renderFlaskRayTube(entity, state = {}, context = {}) {
  const group = svg('g')
  const world = context.world || {}

  //  -  状态推导(构建方契约) - 
  const coil = world['induction-coil-1']
  const powered = Boolean(coil && coil.valve_open) && (coil && coil.connected_to) === 'crt-flask-1'
  const self = selfScreen(context, entity)
  const magnet = world['bar-magnet-1']
  const mpos = screenOf(world, 'bar-magnet-1')
  let strength = 0
  let pole = 1
  if (magnet && mpos && magnet.visible !== false) {
    const mx = mpos.x - self.x
    const my = mpos.y - self.y
    const d = Math.hypot(mx - NECK_BASE[0], my - NECK_BASE[1])
    strength = clamp01(1 - d / DECAY)
    pole = magnet.valve_open ? -1 : 1
  }

  add(group, shadow(0, 2.5, 52, 7))

  //  -  浅木色方木座(frame-014/015) - 
  add(group,
    svg('rect', {x: -45, y: -28, width: 90, height: 28, rx: 2, fill: WOOD, stroke: WOOD_EDGE, 'stroke-width': 1.5}),
    svg('rect', {x: -45, y: -28, width: 90, height: 5, rx: 2, fill: WOOD_LIT, stroke: 'none'}),
    svg('line', {x1: -41, y1: -17, x2: 41, y2: -17, stroke: WOOD_GRAIN, 'stroke-width': .9, 'stroke-linecap': 'round', opacity: .85}),
    svg('line', {x1: -38, y1: -9, x2: 38, y2: -9, stroke: WOOD_GRAIN, 'stroke-width': .9, 'stroke-linecap': 'round', opacity: .7}),
    svg('line', {x1: -14, y1: -28, x2: -14, y2: 0, stroke: WOOD_EDGE, 'stroke-width': .9, opacity: .5}),
    svg('line', {x1: 18, y1: -28, x2: 18, y2: 0, stroke: WOOD_EDGE, 'stroke-width': .9, opacity: .5}),
  )

  //  -  颈(先画, 根部被泡体覆盖; 朝右微上仰)+ 颈端卡箍/电极帽(frame-014/016) - 
  const n0 = [29, -87]           // 颈根(泡面处)
  const n1 = [70, -90]           // 颈端
  const ndx = n1[0] - n0[0]
  const ndy = n1[1] - n0[1]
  const nlen = Math.hypot(ndx, ndy)
  const px = (ndy / nlen) * 8.5  // 法向(指向 +y 侧)
  const py = (-ndx / nlen) * 8.5
  const c = pts => pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')
  const off = (t, s) => [n0[0] + ndx * t + px * s, n0[1] + ndy * t + py * s]
  group.append(svg('path', {
    d: `M${c([off(0, -1), off(1, -1)])}L${c([off(1, 1), off(0, 1)])}Z`,
    fill: GLASS_FILL, stroke: GLASS_EDGE, 'stroke-width': 1.5, 'stroke-linejoin': 'round',
  }))
  add(group,
    svg('rect', {x: 56, y: -101, width: 6, height: 20, rx: 1.5, fill: STRAP, stroke: STRAP_EDGE, 'stroke-width': 1.1}),
    svg('line', {x1: 57.6, y1: -99, x2: 57.6, y2: -83, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
    svg('rect', {x: 62, y: -97, width: 8, height: 12, rx: 2, fill: CAP, stroke: '#3d444b', 'stroke-width': 1.1}),
    svg('line', {x1: 70, y1: -91, x2: 76, y2: -91, stroke: CAP, 'stroke-width': 3.4, 'stroke-linecap': 'round'}),
  )

  //  -  泡体(雾白内腔渐变→光斑→玻璃轮辋; id 随 entity.id 唯一) - 
  const gradId = `flask-cavity-${(entity && entity.id) || 'crt-flask-1'}`
  const defs = svg('defs')
  const grad = svg('radialGradient', {id: gradId, cx: '38%', cy: '34%', r: '78%'})
  add(grad,
    svg('stop', {offset: '0%', 'stop-color': 'rgb(255 255 255 / 34%)'}),
    svg('stop', {offset: '55%', 'stop-color': 'rgb(244 247 244 / 20%)'}),
    svg('stop', {offset: '100%', 'stop-color': 'rgb(222 232 228 / 8%)'}),
  )
  defs.append(grad)
  group.append(defs)
  group.append(svg('circle', {cx: BC[0], cy: BC[1], r: BR, fill: GLASS_FILL, stroke: 'none'}))
  group.append(svg('circle', {cx: BC[0], cy: BC[1], r: BR - 1.5, fill: `url(#${gradId})`, stroke: 'none'}))

  // 荧光光斑(powered; home 左偏下内侧, 磁铁影响下沿泡心角度参数滑移)
  if (powered) {
    const homeAng = Math.atan2(HOME[1] - BC[1], HOME[0] - BC[0])
    const slide = SLIDE_MAX * strength
    const ang = homeAng + (pole >= 0 ? 1 : -1) * (slide / SPOT_R)
    const sx = BC[0] + SPOT_R * Math.cos(ang)
    const sy = BC[1] + SPOT_R * Math.sin(ang)
    add(group,
      svg('circle', {cx: sx.toFixed(1), cy: sy.toFixed(1), r: 5, fill: GLOW, opacity: .3}),
      svg('circle', {cx: sx.toFixed(1), cy: sy.toFixed(1), r: 3, fill: GLOW_MID, opacity: .6}),
      svg('circle', {cx: sx.toFixed(1), cy: sy.toFixed(1), r: 1.5, fill: GLOW_CORE, opacity: .95}),
    )
  }

  // 玻璃轮辋+高光(最上层)
  add(group,
    svg('circle', {cx: BC[0], cy: BC[1], r: BR, fill: 'none', stroke: GLASS_EDGE, 'stroke-width': 2}),
    svg('circle', {cx: BC[0], cy: BC[1], r: BR - 4, fill: 'none', stroke: 'rgb(232 242 244 / 22%)', 'stroke-width': 1.2}),
    svg('path', {d: `M${BC[0] - 44} ${BC[1] - 30}A53 53 0 0 1 ${BC[0] - 6} ${BC[1] - 52.5}`, fill: 'none', stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
    svg('path', {d: `M${BC[0] + 30} ${BC[1] + 44}A52 52 0 0 1 ${BC[0] + 47} ${BC[1] + 18}`, fill: 'none', stroke: 'rgb(255 255 255 / 26%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
  )

  group.append(label(entity.label, 0, 14))
  return group
}
