import {add, label, shadow, svg} from './svg.js'

//  -  形变演示器主机(kind=deformation_demonstrator, 116-用形变演示器演示形变产生弹力) - 
// 视觉依据: frame-015/021(象牙白面板+红色弧形刻度扇+红色大箭头指针+深色金属连杆), 
//           frame-025/026(挂码稳态指针保持偏转); frame-021 采样低照度面板 (218,214,203)
//           → 归一化象牙白 #ece9df/#f2efe6, 刻度/指针红 (155,42,34) → 域红族 #c23a2a/#8f2a22.
// 风格依据: physics.js renderSpringScale 的表窗/刻度/指针画法, renderWallBracket/renderWeight
//           的金属件与体块画法 + apparatus-shadow 接地阴影; 配色 inline, 不新增 styles.css class.
// 局部原点 = 底座底边中点((0,0)=底座底边中点, +y 向下).
// 几何: 底座 120x26(y -26..0)→ 壳体 x±58(y -175..-26, 象牙白前面板)→ 顶机头 x±60
//       (y -201..-175)+ 导孔衬套 x±7(y -175..-161, 孔口暗椭圆: 演示杆由此穿过悬挂).
//       壳体前面板导槽 x±3.5(y -160..-88): 杆被下拉时在其内滑动(rest 态被杆 z=20 盖住).
// 表盘: Ø68 圆心 (-16,-112).圆心左移依据: 杆悬挂于本机 x=0 且杆 z=20 > 本机 z=18, 
//       表盘左置使刻度扇与指针(最右 x≈-6.4)不被杆(x±5)遮挡, 亦同 frame-015/021
//       刻度在杆左侧的构图.0-5 单位共 11 个红色刻度(半档间隔=deg_per_unit/2, 
//       整数档长刻度), 指针自竖直方向顺时针 SVG rotate(deg), 原点=表盘圆心; 
//       随动小单位弧标 = 指针当前角处 ±半档 的亮色短弧(r33, 随 deg 旋转).
// 指针角度状态推导(任务契约公式, 勿在场景层重复实现): 
//   REST_Y = 0.45(常量, 与 IR loading-rod 悬挂位 y=0.45 对应)
//   pull_disp = max(0, REST_Y - world[rod_ref].y)        // 杆被下拉量(scene 单位)
//   load      = world[weight_ref].attached_to === rod_ref ? load_deg : 0
//   deg       = min(max_units*deg_per_unit, pull_gain_deg_per_unit*pull_disp + load)
//   全部参数读 entity/visual 的 visual.pointer(IR/scene 下发; 缺省回退 IR 声明值); 
//   rod_ref/weight_ref 可由 visual.pointer.rod_ref/weight_ref 覆盖, 缺省 'loading-rod'/'weight-1'.
// 与 IR anchors 配合: 本机 snap_anchor=pull=(0,-0.19) → 杆顶下拉吸附点=本机位+(0,+95px), 
//   即 pulled 态杆顶在本机局部 y=-95(导槽下端 -88 附近); rest 态(rod y=0.45)杆顶在
//   局部 y≈-165, 处于衬套(-175..-161)内=导孔内隐藏段, rod 渲染画到其原点即止.
// 导出签名与模板一致: renderDeformDemoBody(entity, state, context).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/deform-demo-body'
//   (import {renderDeformDemoBody} from './physics.deform-demo-body.v1.renderer.js').

const REST_Y = 0.45 // 与 IR loading-rod 悬挂位(position/initial y=0.45)对应
const DIAL = {cx: -16, cy: -112, r: 34}
const TICK_OUTER = 31
const TICK_INTO_LONG = 19
const TICK_INTO_SHORT = 24
const NEEDLE_LEN = 26

const DARK_METAL = {fill: '#33393f', edge: '#4a525a', stroke: '#14181c'}
const RED = {main: '#c23a2a', deep: '#8f2a22', edge: '#7a1f16', follow: '#d94a35'}

function pointerParams(entity, context) {
  const visual = (context && context.visual) || entity.visual || {}
  const p = (visual.pointer && typeof visual.pointer === 'object') ? visual.pointer : {}
  return {
    gain: Number(p.pull_gain_deg_per_unit ?? 48.6),
    loadDeg: Number(p.load_deg ?? 5.1),
    degPerUnit: Number(p.deg_per_unit ?? 3.4),
    maxUnits: Number(p.max_units ?? 5),
    rodRef: typeof p.rod_ref === 'string' && p.rod_ref ? p.rod_ref : 'loading-rod',
    weightRef: typeof p.weight_ref === 'string' && p.weight_ref ? p.weight_ref : 'weight-1',
  }
}

// 指针偏角(度): 由演示杆下拉量 + 是否挂码推导(契约公式)
export function pointerDeflectionDeg(entity, state = {}, context = {}) {
  const world = context.world || {}
  const p = pointerParams(entity, context)
  const rodY = Number(world[p.rodRef]?.y ?? REST_Y)
  const pullDisp = Math.max(0, REST_Y - rodY)
  const load = world[p.weightRef]?.attached_to === p.rodRef ? p.loadDeg : 0
  return Math.min(p.maxUnits * p.degPerUnit, p.gain * pullDisp + load)
}

function dialScale(entity, context) {
  const p = pointerParams(entity, context)
  const g = svg('g')
  const maxDeg = p.maxUnits * p.degPerUnit
  const ticks = svg('g')
  const count = Math.round(p.maxUnits * 2) // 0-5 单位共 11 刻度(半档)
  for (let i = 0; i <= count; i += 1) {
    const a = (maxDeg * i) / count
    const rad = a * Math.PI / 180
    const long = i % 2 === 0
    const r0 = long ? TICK_INTO_LONG : TICK_INTO_SHORT
    const dx = Math.sin(rad)
    const dy = -Math.cos(rad)
    ticks.append(svg('line', {
      x1: (DIAL.cx + r0 * dx).toFixed(2), y1: (DIAL.cy + r0 * dy).toFixed(2),
      x2: (DIAL.cx + TICK_OUTER * dx).toFixed(2), y2: (DIAL.cy + TICK_OUTER * dy).toFixed(2),
      stroke: RED.main, 'stroke-width': long ? 2 : 1.2, 'stroke-linecap': 'round',
    }))
  }
  g.append(ticks)
  // 0数字标注(17° 扇形过窄, 末档 5 无法并排排版, 仅标 0 同 frame 证据)
  const zero = svg('text', {
    x: DIAL.cx - TICK_INTO_LONG - 3.5, y: DIAL.cy + 2.2,
    'text-anchor': 'end', 'font-size': 5.6, 'font-weight': 650, fill: RED.deep,
  })
  zero.textContent = '0'
  g.append(zero)
  return g
}

function dialNeedle(deg, entity, context) {
  const p = pointerParams(entity, context)
  const g = svg('g', {transform: `rotate(${deg.toFixed(2)} ${DIAL.cx} ${DIAL.cy})`})
  // 随动小单位弧标: 指针当前角处 ±半档 的亮色短弧(r33, 与刻度同扇, 随指针旋转)
  const half = (p.degPerUnit / 2) * Math.PI / 180
  const rad = 0 * Math.PI / 180
  const r = 33
  const a1 = rad - half
  const a2 = rad + half
  const x1 = (DIAL.cx + r * Math.sin(a1)).toFixed(2)
  const y1 = (DIAL.cy - r * Math.cos(a1)).toFixed(2)
  const x2 = (DIAL.cx + r * Math.sin(a2)).toFixed(2)
  const y2 = (DIAL.cy - r * Math.cos(a2)).toFixed(2)
  g.append(svg('path', {
    d: `M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}`,
    stroke: RED.follow, 'stroke-width': 2.4, 'stroke-linecap': 'round', fill: 'none', opacity: .95,
  }))
  // 红色箭头指针(frame-015/021 大箭头造型): 自竖直方向起, rotate(deg) 顺时针偏转
  g.append(svg('path', {
    d: `M${DIAL.cx - 1.7} ${DIAL.cy + 3}L${DIAL.cx - 1.7} ${DIAL.cy - 19}L${DIAL.cx - 3.6} ${DIAL.cy - 19}L${DIAL.cx} ${DIAL.cy - NEEDLE_LEN}L${DIAL.cx + 3.6} ${DIAL.cy - 19}L${DIAL.cx + 1.7} ${DIAL.cy - 19}L${DIAL.cx + 1.7} ${DIAL.cy + 3}Z`,
    fill: RED.main, stroke: RED.edge, 'stroke-width': .8, 'stroke-linejoin': 'round',
  }))
  g.append(svg('circle', {cx: DIAL.cx, cy: DIAL.cy + 6.5, r: 2.4, fill: RED.deep}))
  return g
}

export function renderDeformDemoBody(entity, state = {}, context = {}) {
  const group = svg('g')
  const deg = pointerDeflectionDeg(entity, state, context)
  add(group,
    shadow(0, 3, 64, 7),
    // 底座(120x26 深色金属 + 顶面受光棱 + 两颗螺钉)
    svg('path', {d: `M-60 -26H60V0H-60Z`, fill: DARK_METAL.fill, stroke: DARK_METAL.stroke, 'stroke-width': 2, 'stroke-linejoin': 'round'}),
    svg('path', {d: `M-60 -26H60V-21H-60Z`, fill: DARK_METAL.edge}),
    svg('rect', {x: 34, y: -21, width: 24, height: 19, fill: '#1d2226', opacity: .5}),
    svg('circle', {cx: -46, cy: -13, r: 2, class: 'screw'}),
    svg('circle', {cx: 46, cy: -13, r: 2, class: 'screw'}),
    // 壳体/立柱(x±58, y -175..-26)+ 右侧背光暗带 + 左受光棱 + 象牙白前面板
    svg('path', {d: `M-58 -175H58V-26H-58Z`, fill: '#3a4147', stroke: DARK_METAL.stroke, 'stroke-width': 2, 'stroke-linejoin': 'round'}),
    svg('path', {d: `M-58 -175H-54V-26H-58Z`, fill: DARK_METAL.edge}),
    svg('path', {d: `M32 -175H58V-26H32Z`, fill: '#1d2226', opacity: .55}),
    svg('path', {d: `M-52 -168H52V-34H-52Z`, fill: '#ece9df', stroke: '#c9c4b4', 'stroke-width': 1.2}),
    // 导槽(杆下拉时的滑动通道; rest 态被杆覆盖)
    svg('rect', {x: -3.5, y: -160, width: 7, height: 72, fill: '#23282e', opacity: .9}),
    // 顶机头(x±60, y -201..-175)+ 导孔衬套(杆从导孔穿过悬挂)
    svg('path', {d: `M-60 -201H60V-175H-60Z`, fill: DARK_METAL.fill, stroke: DARK_METAL.stroke, 'stroke-width': 2, 'stroke-linejoin': 'round'}),
    svg('path', {d: `M-60 -201H60V-196H-60Z`, fill: DARK_METAL.edge}),
    svg('circle', {cx: -48, cy: -186, r: 2, class: 'screw'}),
    svg('circle', {cx: 48, cy: -186, r: 2, class: 'screw'}),
    svg('path', {d: `M-7 -175H7V-161H-7Z`, fill: '#b4c0c2', stroke: '#5b6a6d', 'stroke-width': 1.6}),
    svg('ellipse', {cx: 0, cy: -161, rx: 7, ry: 2.4, fill: '#14181c'}),
    svg('ellipse', {cx: 0, cy: -161, rx: 3.4, ry: 1.2, fill: '#2e353a'}),
    // 圆形表盘(Ø68): 象牙白表盘面 + 刻度扇 + 红指针(角度状态推导)+ 轴帽
    svg('circle', {cx: DIAL.cx, cy: DIAL.cy, r: DIAL.r, fill: '#f2efe6', stroke: '#5b6a6d', 'stroke-width': 2}),
    svg('circle', {cx: DIAL.cx, cy: DIAL.cy, r: 31.5, fill: 'none', stroke: '#d8d3c2', 'stroke-width': 1}),
  )
  group.append(dialScale(entity, context))
  group.append(dialNeedle(deg, entity, context))
  group.append(svg('circle', {cx: DIAL.cx, cy: DIAL.cy, r: 2.8, fill: '#5b6a6d', stroke: '#3f4a52', 'stroke-width': 1}))
  group.append(label(entity.label, 0, 22))
  return group
}
