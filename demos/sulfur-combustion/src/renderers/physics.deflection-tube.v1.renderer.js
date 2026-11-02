import {add, label, shadow, svg} from './svg.js'

//  -  长直阴极射线管(斜置荧光屏)(kind=deflection_tube, case 139 电子束在磁场中偏转) - 
// 视觉依据: frame-002/003(全景: 长横置玻璃管坐在黑色圆盘底座+黑色立柱上, 立柱顶端玻璃泡
//           带右侧玻璃支臂+金属电极; 管左端细锥形收口带阴极芯柱尖, 右端圆钝封口; 管内一条
//           沿管轴方向斜置的长条形荧光屏(米色, 对角横跨, 与管轴约 20° 夹角, 左下→右上); 
//           管左三分之一处上下各一只金属抱箍/电极端口); frame-004/006 特写(通电: 阴极处
//           亮绿白色光点, 沿斜屏一条亮绿色直线细光迹, 越远越淡; 金属抱箍下可见管内阴极杆
//           与斜置阴极小盘); frame-008/009/011/012/013(磁铁靠近: 束迹弯成弓形, N/S 极
//           弯向相反).
// 复用否决: physics.cathode-ray-tube.v1(另案静电偏转管: 喇叭锥+深色端窗+管内偏转极板+瓷
//           座, 读其 renderer 源码并经 frame-002/003 比对 - 本案为直玻璃管+内置斜置荧光条
//           屏+黑圆盘立柱座, 形状功能不符, 构建方否决成立); physics.electron-beam-tube.v1
//           (球形泡竖直电子枪管, 坐洛伦兹仪上室)形状不符; 普通试管/导管类均非真空射线管.
//           可信源发现命中 twbs/icons music-note-beamed(16px 音符 glyph, 'beam' 词元误配+
//           风格断裂)已回滚删 svg(trace assets/discover-deflection_tube), 故代码原生生成.
// 风格基础: 玻璃语言沿域内 glass-body 同族(rgb(221 245 249/30%) 填充 + #4a6a74 描边 + 白
//           高光, physics.js renderConvexLens / physics.cathode-ray-tube.v1 先例); 黑底座/
//           立柱亮面黑族(frame-002 强白色镜面反光); 金属抱箍沿 cathode-ray-tube STRAP 金
//           属族; 荧光屏米色依 frame-002 采样; 束迹绿色三层描边 #59c97a/#8ef0a0/#d8ffe4 按
//           构建方契约(域内蓝白束流三层描边画法的绿系变体).配色内联, 不新增 class.
// 关键尺寸(局部 (0,0)=支架圆盘底边中点, y 向下为正; 总高约 130px, 管长 240px): 
//   底座圆盘 rx58 y∈[-20,0]; 立柱 x∈[-7,7] y∈[-80,-16]; 玻璃泡 (0,-72) r11+右支臂至
//   x=37(金属电极帽); 管轴 TY=-95, 管半径 16, x∈[-120,120](左端 x∈[-120,-88] 细锥
//   收口+左尖芯柱, 右端 x∈[108,120] 圆钝封口); 金属抱箍(上下电极端口)x=-37; 斜屏中
//   心 (10,-95) 转 -20°, 半长 50/半宽 11(左下端≈(-37,-78), 右上端≈(57,-112)); 阴极
//   小盘 (-38,-80) 斜置, 阴极杆自上抱箍垂下.
// 状态契约(从 world 推导, 构建方运行时依赖): 
//   powered = Boolean(world['induction-coil-1']?.valve_open) &&
//             world['induction-coil-1']?.connected_to === 'crt-strip-1'
//   磁铁影响: magnet=world['bar-magnet-1']; 屏幕位换算到局部后 d=到管轴段(电子飞行路径
//     x∈[TIP_X,APEX_X], y=TY)的最近距离; strength=clamp(1-d/120,0,1)(构建方二次核算口径, 
//     覆盖首版束迹弦段量测 - 同落点到弦段 d≈64 → strength≈0.47 偏转偏弱, 与 frame-009
//     不符, 已废弃: 吸附落点局部 (105,-70) 到轴 d≈25 → strength≈0.79, 弯高≈20px, 与
//     frame-009 明显弓形一致; 台面初始位局部 (-160,10) 到轴 d≈115 → strength≈0.04, 
//     弯高≈1px, 仍符合 frame-011 磁铁移开直线束); pole = magnet.valve_open ? -1 : +1
//     (false=N 极朝管).
//   powered=false: 无辉光无光迹.powered=true: 左端阴极绿白辉光(三层同心圆)+沿斜屏束迹: 
//     strength≈0 → 直迹; pole=+1(N)束迹中部向斜屏上方向(左上)弯出二次曲线弓形, 
//     pole=-1(S)向相反方向, 弯高=26*strength px, Q 曲线连续平滑, strength=0 恰为直线; 
//     束迹三层描边 #59c97a w6/.16, #8ef0a0 w3/.45, #d8ffe4 w1.4/.95, 近阴极段 k=1, 
//     远段 k=0.45(de Casteljau t=0.5 精确拆分).
// 证据不清处: ① 抱箍/阴极的精确纵向位置 352×288 源不可辨, 按 frame-002 目测比例(管长
//   左 1/3 处)示意; ② 斜屏背面/厚度投影重合, 只画面向观察者一侧; ③ S 极弯向为按物理
//   惯例的镜像推断(frame-012 仅证 S 极在下偏), 构建方契约同向; ④ 右支臂金属电极与电路
//   的接驳细节帧内不可辨, 按芯柱示意.
// 集成: 复制本文件到 src/renderers/ 并在 index.js import {renderDeflectionTube} 后注册
//   'physics/deflection-tube'.z 序: 底座/管件高于感应圈与导线(构建方 scene 排序).

const GLASS_FILL = 'rgb(221 245 249 / 30%)'
const GLASS_EDGE = '#4a6a74'
const BASE_BLACK = '#1a1b1e'     // 底座亮面黑(frame-002)
const BASE_BLACK_DEEP = '#101114'
const BASE_BLACK_LIT = '#26282e'
const PILLAR = '#1f2126'
const STRAP = '#b4c0c2'          // 金属抱箍/电极帽(cathode-ray-tube 同族)
const STRAP_EDGE = '#5b6a6d'
const SCREEN_FACE = '#e7e2c6'    // 斜置荧光屏米色(frame-002 采样归一化)
const SCREEN_EDGE = '#b9b294'
const STEEL = '#4a4f55'          // 管内阴极盘深钢色
const STEEL_STEM = '#3a3f45'
const GLOW = '#59c97a'           // 阴极辉光/束迹绿(构建方契约)
const GLOW_MID = '#8ef0a0'
const GLOW_CORE = '#d8ffe4'

const TY = -95                   // 管轴
const RH = 16                    // 管半径
const NOSE_X = -88               // 锥形收口结束(进入圆柱段)
const TIP_X = -113               // 锥口起点(左端细口)
const END_X = 108                // 右端圆柱段结束(圆钝封口起点)
const APEX_X = 120               // 右端最右点
const COLLAR_X = -37             // 金属抱箍/电极端口(frame-002 管长左 1/3 目测)
const SC = [10, TY]              // 斜屏中心(管轴上)
const SC_ANG = -20 * Math.PI / 180
const SC_L = 50                  // 斜屏半长
const SC_W = 11                  // 斜屏半宽
const CATHODE = [-38, -80]       // 阴极小盘中心(斜屏左下端处)
const BEAM_P0 = [-37, -78.5]     // 束迹起点(阴极/斜屏左下端)
const BEAM_P1 = [57, -112.1]     // 束迹终点(斜屏右上端, clip 于管腔)
const BEND_MAX = 26              // 弯高上限(px, strength=1)
const DECAY = 120                // 距离衰减尺度(构建方核算: clamp(1-d/120,0,1))
const AXIS_A = [TIP_X, TY]       // 管轴段(电子飞行路径)左端(芯柱口 x=-113)
const AXIS_B = [APEX_X, TY]      // 管轴段右端(圆钝封口 x=120); 磁铁距离量测目标(构建方二次核算)

function rot(x, y, ang) {
  return [x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang)]
}

// 管腔轮廓(玻璃内腔; clipPath 用, id 带 entity.id 保证唯一)
function cavityPath() {
  return `M${TIP_X} ${TY - 5}L${NOSE_X} ${TY - RH}L${END_X} ${TY - RH}`
    + `A12 ${RH} 0 0 1 ${END_X} ${TY + RH}L${NOSE_X} ${TY + RH}L${TIP_X} ${TY + 5}Z`
}

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

// 磁铁到束迹弦段的最近距离(局部坐标)
function distToSegment(px, py, a, b) {
  const abx = b[0] - a[0]
  const aby = b[1] - a[1]
  const len2 = abx * abx + aby * aby
  let t = len2 > 0 ? ((px - a[0]) * abx + (py - a[1]) * aby) / len2 : 0
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (a[0] + t * abx), py - (a[1] + t * aby))
}

// 束迹三层描边(k=亮度系数: 近阴极段 1, 远段 0.45)
function beamStroke(pathD, k) {
  return add(svg('g'),
    svg('path', {d: pathD, fill: 'none', stroke: GLOW, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: (.16 * k).toFixed(3)}),
    svg('path', {d: pathD, fill: 'none', stroke: GLOW_MID, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: (.45 * k).toFixed(3)}),
    svg('path', {d: pathD, fill: 'none', stroke: GLOW_CORE, 'stroke-width': 1.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: (.95 * k).toFixed(3)}),
  )
}

// 束迹路径(strength=0 → 直迹; 否则 Q 弓形, 弯向由 pole 决定), t=0.5 拆两段
function beamHalves(strength, pole) {
  const p0 = BEAM_P0
  const p1 = BEAM_P1
  const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]
  const dx = p1[0] - p0[0]
  const dy = p1[1] - p0[1]
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  // 与弦垂直的单位法向中指向"上(y 分量为负)"的一支 = 斜屏上方向(左上)
  const nx = ux < 0 ? -uy : uy
  const ny = ux < 0 ? ux : -ux
  const h = BEND_MAX * clamp01(strength)
  const dir = pole >= 0 ? 1 : -1 // N→斜屏上方向; S→相反
  const cx = mid[0] + 2 * h * dir * nx
  const cy = mid[1] + 2 * h * dir * ny
  if (h < 1e-6) {
    return [`M${p0[0]} ${p0[1]}L${mid[0]} ${mid[1]}`, `M${mid[0]} ${mid[1]}L${p1[0]} ${p1[1]}`]
  }
  // de Casteljau t=0.5
  const ax = (p0[0] + cx) / 2
  const ay = (p0[1] + cy) / 2
  const bx = (cx + p1[0]) / 2
  const by = (cy + p1[1]) / 2
  const m0x = (p0[0] + 2 * cx + p1[0]) / 4
  const m0y = (p0[1] + 2 * cy + p1[1]) / 4
  return [
    `M${p0[0]} ${p0[1]}Q${ax.toFixed(2)} ${ay.toFixed(2)} ${m0x.toFixed(2)} ${m0y.toFixed(2)}`,
    `M${m0x.toFixed(2)} ${m0y.toFixed(2)}Q${bx.toFixed(2)} ${by.toFixed(2)} ${p1[0]} ${p1[1]}`,
  ]
}

export function renderDeflectionTube(entity, state = {}, context = {}) {
  const group = svg('g')
  const world = context.world || {}

  //  -  状态推导(构建方契约) - 
  const coil = world['induction-coil-1']
  const powered = Boolean(coil && coil.valve_open) && (coil && coil.connected_to) === 'crt-strip-1'
  const self = selfScreen(context, entity)
  const magnet = world['bar-magnet-1']
  const mpos = screenOf(world, 'bar-magnet-1')
  let strength = 0
  let pole = 1
  if (magnet && mpos && magnet.visible !== false) {
    const mx = mpos.x - self.x
    const my = mpos.y - self.y
    const d = distToSegment(mx, my, AXIS_A, AXIS_B)
    strength = clamp01(1 - d / DECAY)
    pole = magnet.valve_open ? -1 : 1
  }

  add(group, shadow(0, 2.5, 62, 7))

  //  -  黑色圆盘底座(frame-002 亮面黑) - 
  add(group,
    svg('ellipse', {cx: 0, cy: -6, rx: 58, ry: 8, fill: BASE_BLACK_DEEP, stroke: '#000', 'stroke-width': 1.3}),
    svg('ellipse', {cx: 0, cy: -13, rx: 51, ry: 8, fill: BASE_BLACK, stroke: '#000', 'stroke-width': 1.1}),
    svg('path', {d: 'M-44 -16Q-20 -23 8 -20', fill: 'none', stroke: 'rgb(255 255 255 / 38%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
    svg('ellipse', {cx: 0, cy: -19, rx: 26, ry: 5, fill: BASE_BLACK_LIT, stroke: '#000', 'stroke-width': 1}),
  )
  //  -  立柱(frame-002 黑色立柱带高光) - 
  add(group,
    svg('rect', {x: -7, y: -80, width: 14, height: 62, rx: 2, fill: PILLAR, stroke: '#000', 'stroke-width': 1.2}),
    svg('line', {x1: -3.4, y1: -22, x2: -3.4, y2: -74, stroke: 'rgb(255 255 255 / 28%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
  )
  //  -  玻璃泡+右支臂+金属电极(frame-002 立柱顶端玻璃泡带侧臂) - 
  add(group,
    svg('path', {d: 'M8 -70Q20 -70 30 -67', fill: 'none', stroke: GLASS_EDGE, 'stroke-width': 7.4, 'stroke-linecap': 'round', opacity: .28}),
    svg('path', {d: 'M8 -70Q20 -70 30 -67', fill: 'none', stroke: GLASS_EDGE, 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    svg('circle', {cx: 0, cy: -72, r: 11, fill: GLASS_FILL, stroke: GLASS_EDGE, 'stroke-width': 1.4}),
    svg('path', {d: 'M-6.5 -78.5A8.5 8.5 0 0 1 4 -80.6', fill: 'none', stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('rect', {x: 30, y: -70.5, width: 7, height: 7, rx: 1.6, fill: STRAP, stroke: STRAP_EDGE, 'stroke-width': 1}),
    svg('line', {x1: 37, y1: -67, x2: 41, y2: -67, stroke: STRAP_EDGE, 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
  )

  //  -  管内: 斜置荧光屏(先画, clip 于管腔; frame-002 米色对角条屏) - 
  const clipId = `crt-strip-cavity-${(entity && entity.id) || 'crt-strip-1'}`
  const defs = svg('defs')
  const clip = svg('clipPath', {id: clipId})
  clip.append(svg('path', {d: cavityPath()}))
  defs.append(clip)
  group.append(defs)
  const inner = svg('g', {'clip-path': `url(#${clipId})`})
  const corners = [[-SC_L, -SC_W], [SC_L, -SC_W], [SC_L, SC_W], [-SC_L, SC_W]]
    .map(([lx, ly]) => {
      const [rx, ry] = rot(lx, ly, SC_ANG)
      return `${(SC[0] + rx).toFixed(1)} ${(SC[1] + ry).toFixed(1)}`
    })
  add(inner,
    svg('path', {d: `M${corners[0]}L${corners[1]}L${corners[2]}L${corners[3]}Z`, fill: SCREEN_FACE, stroke: SCREEN_EDGE, 'stroke-width': 1.2, 'stroke-linejoin': 'round'}),
    svg('line', {
      x1: (SC[0] + rot(-SC_L, SC_W * .55, SC_ANG)[0]).toFixed(1), y1: (SC[1] + rot(-SC_L, SC_W * .55, SC_ANG)[1]).toFixed(1),
      x2: (SC[0] + rot(SC_L, SC_W * .55, SC_ANG)[0]).toFixed(1), y2: (SC[1] + rot(SC_L, SC_W * .55, SC_ANG)[1]).toFixed(1),
      stroke: 'rgb(0 0 0 / 8%)', 'stroke-width': 2.4, 'stroke-linecap': 'round',
    }),
  )
  //  -  管内: 阴极杆+斜置阴极小盘(frame-004 抱箍下杆+斜盘) - 
  add(inner,
    svg('line', {x1: COLLAR_X, y1: TY - RH + 1, x2: COLLAR_X, y2: CATHODE[1] + 1, stroke: STEEL_STEM, 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
    svg('path', {
      d: `M${(CATHODE[0] - 5).toFixed(1)} ${(CATHODE[1] + rot(5, 0, SC_ANG)[1] - 3.2).toFixed(1)}`
        + `L${(CATHODE[0] + 5).toFixed(1)} ${(CATHODE[1] + rot(-5, 0, SC_ANG)[1] - 3.2).toFixed(1)}`
        + `L${(CATHODE[0] + 5).toFixed(1)} ${(CATHODE[1] + rot(-5, 0, SC_ANG)[1] + 3.2).toFixed(1)}`
        + `L${(CATHODE[0] - 5).toFixed(1)} ${(CATHODE[1] + rot(5, 0, SC_ANG)[1] + 3.2).toFixed(1)}Z`,
      fill: STEEL, stroke: '#23272b', 'stroke-width': 1, 'stroke-linejoin': 'round',
    }),
  )

  //  -  束迹与阴极辉光(powered; 画在屏之后, 玻璃高光之前, clip 于管腔) - 
  if (powered) {
    add(inner,
      svg('circle', {cx: BEAM_P0[0], cy: BEAM_P0[1], r: 7, fill: GLOW, opacity: .26}),
      svg('circle', {cx: BEAM_P0[0], cy: BEAM_P0[1], r: 4, fill: GLOW_MID, opacity: .5}),
      svg('circle', {cx: BEAM_P0[0] - 1, cy: BEAM_P0[1], r: 1.8, fill: GLOW_CORE, opacity: .95}),
    )
    const halves = beamHalves(strength, pole)
    add(inner, beamStroke(halves[0], 1), beamStroke(halves[1], .45))
  }
  group.append(inner)

  //  -  玻璃管身(锥形收口+圆柱+圆钝封口; frame-002/003) - 
  group.append(svg('path', {
    d: cavityPath(),
    fill: GLASS_FILL, stroke: GLASS_EDGE, 'stroke-width': 1.8, 'stroke-linejoin': 'round',
  }))
  // 左端阴极芯柱尖(frame-002 左端细尖)
  group.append(svg('line', {x1: TIP_X - 1, y1: TY, x2: TIP_X - 9, y2: TY, stroke: STRAP_EDGE, 'stroke-width': 2.2, 'stroke-linecap': 'round'}))
  //  -  金属抱箍 ×2(上下电极端口; frame-002/004) - 
  add(group,
    svg('rect', {x: COLLAR_X - 3.5, y: TY - RH - 10, width: 7, height: 11, rx: 1.6, fill: STRAP, stroke: STRAP_EDGE, 'stroke-width': 1.1}),
    svg('line', {x1: COLLAR_X - 1.4, y1: TY - RH - 8, x2: COLLAR_X - 1.4, y2: TY - RH - 1, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
    svg('rect', {x: COLLAR_X - 3.5, y: TY + RH - 1, width: 7, height: 11, rx: 1.6, fill: STRAP, stroke: STRAP_EDGE, 'stroke-width': 1.1}),
  )
  //  -  玻璃高光(沿圆柱上缘+锥口短高光+右端弧, 画最上层) - 
  add(group,
    svg('line', {x1: -80, y1: TY - 12.6, x2: 98, y2: TY - 12.6, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    svg('path', {d: `M${TIP_X + 6} ${TY - 8.5}L${NOSE_X - 8} ${TY - 13.8}`, fill: 'none', stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('path', {d: `M${END_X + 3} ${TY - 12}A10 13 0 0 1 ${END_X + 3} ${TY + 12}`, fill: 'none', stroke: 'rgb(255 255 255 / 30%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
  )

  group.append(label(entity.label, 0, 16))
  return group
}
