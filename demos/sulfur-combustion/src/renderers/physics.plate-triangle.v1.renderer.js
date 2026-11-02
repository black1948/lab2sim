import {add, label, shadow, svg} from './svg.js'

//  -  三角形薄板(kind=thin_plate 的 default, 118-用悬挂法确定薄板的重心; scene renderer=
// physics/plate-triangle, 实体 plate-triangle) - 
// 视觉依据: frame-001/004 实拍(等腰三角形硬纸板挂于铁架横臂销钉上: 顶孔挂线, 板面
//           预画竖直线; frame-004 顶点实测 A(495,196)/B(387,348)/C(605,288), 板高≈176px); 
//           frame-002/003 演示图(板面三条悬挂迹线交于重心, 其一为蓝色高亮); frame-005
//           (三线交点标重心).frame-004 板面采样 (500,240)=(190,184,172), (470,300)=
//           (185,178,168) - 低照度归一化为板面 #f3efe3, 板缘 #b9b2a2.
// 复用审查否决记录: 注册表内无可复用的板/卡片类资产(physics-core 仅有摆锤/重物/轨道等
//           圆柱与杆件类, 无薄板语义); kind=thin_plate 此前无 default, 本资产为新增默认.
// 风格依据: chemistry.js renderIronStand 的描边体块画法(fill+深色描边+白高光线, 内联)与
//           physics.pendulum-bob.v1 的 string-line 细线画法, apparatus-shadow 接地阴影, 
//           apparatus-label 标签; 支持 frame 预期在 support-frame.v1.renderer.js 的先例
//           (红标 #c23a2a 一族).所有配色内联, 不新增 styles.css class.
// 局部几何(y 向下, 比例 1:1px; 与契约逐条一致): 
//   (0,0)=形心.三顶点(frame-004 归一): 顶孔 A(-1,-94), 左下 B(-126,82), 右 C(127,12)
//    - 外接板高 ≈176px, 宽 ≈253px(frame-002/004 契约尺度).孔在各顶点向形心内缩 7px
//   冲孔, 编号 1=顶孔 / 2=左下 / 3=右(契约).孔心到形心距离 d1≈87.0 / d2≈143.3 /
//   d3≈120.6px(构建方校准 anchors.face 与动作落点用).悬孔 k 平衡时板旋转角
//   a_k=atan2(-hx,-hy): a1=0.61°, a2=123.06°, a3=-95.40°(使形心位于孔正下方).
// 状态契约(逐条照契约实现): 
//   state.hole=0: 桌上平放 - 原点=形心, 无旋转, 画接地阴影(apparatus-shadow).
//   state.hole=k>=1: 挂在销钉上 - 原点=孔 k(销钉头在原点, 渲染器在原点画小销钉头), 
//     整板绕原点旋转 a_k−θ, 使形心(静止时)位于孔正下方.
//   state.swing_p: 缺省(未写)=悬挂静止; 1=静止; 0..1(含 0)渲染器接管摆动(沿用
//     physics.pendulum-bob.v1 的 swing_p 先例与公式, 但 p=0 为释放瞬间, 必须接管): 
//     θ0=properties.release_angle_deg(缺省 24; IR 已写 26), 
//     p∈[0,0.68] θ=−θ0 - cos((π/2) - (p/0.68)); p∈(0.68,1] q=(p−0.68)/0.32, 
//     θ=+θ0 - 0.25 - sin(πq) - (1−q); p=0 即自左偏 θ0 释放.摆动角映射: SVG rotate(+θ)
//     为屏幕顺时针, 板 transform=rotate(a_k−θ)(角度制) - p=0 时形心在悬挂点左偏
//     θ0, 与 pendulum-bob 先例(bobLocal=pivot+L - (sinθ,cosθ), θ<0 在左)同一语义.
//   state.traced_1..3: 迹线为过孔 k 与形心的直线, 两端延伸至板轮廓为止(clipPath 裁剪, 
//     id 前缀 entity.id 防多实例串扰); 线色按契约 黑+蓝+黑: 孔1=#3a3f45, 孔2=#33518e, 
//     孔3=#3a3f45.证据复核: frame-002/003 中蓝线过右顶点(孔3)而非左下(孔2), 且
//     frame-006/007 重绘图蓝线又换一条 - 蓝线是片源场景内"最新迹线"高亮, 帧间不一致; 
//     本渲染器按契约固定 黑+蓝+黑 实现, 若构建方要对齐 frame-002 实拍观感, 交换
//     TRACE_COLORS 中孔 2 / 孔 3 两项即可.
//   state.cg_found: 形心处画红点(#c23a2a), "Center of mass"文字直立, 不随板转动(画在板旁, 
//     跟随形心当前位置).
//   properties 只读 release_angle_deg; 无外部状态硬编码.
// 证据不清处: ① 实拍中三孔均紧贴角部, 与顶点距离在 352×288 分辨率下不可分辨, 按冲孔
//   工艺内缩 7px 示意; ② 迹线在实拍中近深炭色((140,133,123) 系低照度最暗采样), 演示
//   图中为纯深色, 归一化取 #3a3f45; ③ 片源悬挂用细线挂线, 契约简化为销钉穿孔(按契约
//   执行, 集成时挂线动作直接挂孔即可).
// 集成: renderer 键 physics/plate-triangle(index.js 的 import/注册由构建方完成: 复制本
//   文件到 src/renderers/ 并注册 'physics/plate-triangle').上下文 visual 可忽略.

const FILL = '#f3efe3'        // 板面(frame-004 采样归一化)
const FILL_SHADE = '#e9e4d4'  // 板面下缘微暗带
const EDGE = '#b9b2a2'        // 板缘
const EDGE_DARK = '#8f8877'   // 板缘描边
const TRACE_DARK = '#3a3f45'  // 迹线-深炭(契约: 黑)
const TRACE_BLUE = '#33518e'  // 迹线-蓝(frame-002 蓝线归一化到实验室蓝族)
const CG_RED = '#c23a2a'      // 重心红点/文字
const HOLE_FILL = '#3a3f45'   // 冲孔
const PIN = '#4a545c'         // 销钉头
const NUM_INK = '#8a8274'     // 孔位编号
const RELEASE_DEFAULT = 24    // 契约缺省释放角(IR 实体已写 26)
const LOW_POINT = 0.68        // 契约: 正摆段占比(pendulum-bob 先例)
const HOLE_INSET = 7          // 孔自顶点向形心内缩量

const VERTICES = [{x: -1, y: -94}, {x: -126, y: 82}, {x: 127, y: 12}]   // 顶孔1/左下2/右3
const TRACE_COLORS = [TRACE_DARK, TRACE_BLUE, TRACE_DARK]               // 契约 黑+蓝+黑

const HOLES = VERTICES.map(v => {
  const d = Math.hypot(v.x, v.y)
  const k = (d - HOLE_INSET) / d
  return {x: v.x * k, y: v.y * k}
})

const polyPoint = points => points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

// 过孔 k 与形心(0,0)的直线, 延长为足够覆盖整板的长线段(由 clipPath 裁到板轮廓)
function traceLine(hole, index, clipId) {
  const len = Math.hypot(hole.x, hole.y)
  const ux = hole.x / len
  const uy = hole.y / len
  const far = 260
  return svg('line', {
    x1: (ux * far).toFixed(1), y1: (uy * far).toFixed(1),
    x2: (-ux * far).toFixed(1), y2: (-uy * far).toFixed(1),
    stroke: TRACE_COLORS[index] || TRACE_DARK,
    'stroke-width': 1.7, 'stroke-linecap': 'round', 'clip-path': `url(#${clipId})`,
  })
}

export function renderPlateTriangle(entity, state = {}, context = {}) {
  const group = svg('g')
  const props = entity.properties || {}
  const hole = Math.max(0, Math.min(HOLES.length, Math.round(Number(state.hole) || 0)))
  const theta0 = (Number.isFinite(Number(props.release_angle_deg))
    ? Number(props.release_angle_deg) : RELEASE_DEFAULT) * Math.PI / 180
  const hasSwing = state.swing_p !== undefined && state.swing_p !== null && state.swing_p !== ''
  const swingP = Math.max(0, Math.min(1, Number(state.swing_p || 0)))
  const takeOver = !context.preview && hole >= 1 && hasSwing && swingP < 1
  let theta = 0
  if (takeOver) {
    theta = swingP <= LOW_POINT
      ? -theta0 * Math.cos((Math.PI / 2) * (swingP / LOW_POINT))
      : theta0 * 0.25 * Math.sin(Math.PI * (swingP - LOW_POINT) / (1 - LOW_POINT))
        * (1 - (swingP - LOW_POINT) / (1 - LOW_POINT))
  }
  // 悬挂姿态整板旋转角(角度制): a_k − θ; 桌上姿态不旋转
  const v = hole >= 1 ? {x: -HOLES[hole - 1].x, y: -HOLES[hole - 1].y} : null   // 孔→形心
  const rotationDeg = hole >= 1
    ? Math.atan2(v.x, v.y) * 180 / Math.PI - theta * 180 / Math.PI
    : 0
  const clipId = `${entity.id || 'plate-triangle'}-face-clip`

  if (hole === 0) add(group, shadow(0, 88, 96, 7))   // 接地阴影仅桌上姿态(契约)

  // 悬挂姿态原点=孔 k: 多边形(形心系坐标)先平移 −hole 再绕原点旋转 a_k−θ, 
  // 使孔落在组原点(=销钉尖, 与 app transform 对齐), 形心静止时位于孔正下方
  const plate = svg('g', hole >= 1
    ? {transform: `rotate(${rotationDeg.toFixed(2)}) translate(${(-HOLES[hole - 1].x).toFixed(1)} ${(-HOLES[hole - 1].y).toFixed(1)})`}
    : {})
  const defs = svg('defs')
  const clip = svg('clipPath', {id: clipId})
  clip.append(svg('polygon', {points: polyPoint(VERTICES)}))
  defs.append(clip)
  plate.append(defs)
  add(plate,
    svg('polygon', {points: polyPoint(VERTICES), fill: FILL, stroke: EDGE_DARK, 'stroke-width': 1.6, 'stroke-linejoin': 'round'}),
    svg('line', {x1: VERTICES[1].x + 14, y1: VERTICES[1].y - 3, x2: VERTICES[2].x - 16, y2: VERTICES[2].y - 6, stroke: EDGE, 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.8}),
    svg('line', {x1: VERTICES[0].x - 2, y1: VERTICES[0].y + 16, x2: VERTICES[0].x - 2, y2: 40, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
  )
  // 冲孔 + 孔位编号(编号在孔内侧, 随板转动)
  HOLES.forEach((h, i) => {
    const d = Math.hypot(h.x, h.y)
    const nx = h.x - 13 * h.x / d
    const ny = h.y - 13 * h.y / d
    add(plate,
      svg('circle', {cx: h.x.toFixed(1), cy: h.y.toFixed(1), r: 2.6, fill: HOLE_FILL, stroke: '#d8d2c2', 'stroke-width': 1}),
      svg('text', {x: nx.toFixed(1), y: (ny + 2.2).toFixed(1), 'text-anchor': 'middle', 'font-size': 6.5, fill: NUM_INK}),
    )
    plate.lastChild.textContent = String(i + 1)
  })
  // 迹线(过孔 k 与形心, 裁剪到板轮廓)
  HOLES.forEach((h, i) => {
    const key = `traced_${i + 1}`
    if (state[key]) plate.append(traceLine(h, i, clipId))
  })
  // 形心红点(随板/随姿态在正确位置)+ 直立"Center of mass"文字(不随板转动, 板旁)
  const cgFound = Boolean(state.cg_found)
  if (cgFound && hole >= 1) {
    const cx = v.x * Math.cos(rotationDeg * Math.PI / 180) - v.y * Math.sin(rotationDeg * Math.PI / 180)
    const cy = v.x * Math.sin(rotationDeg * Math.PI / 180) + v.y * Math.cos(rotationDeg * Math.PI / 180)
    plate.append(svg('circle', {cx: cx.toFixed(1), cy: cy.toFixed(1), r: 3, fill: CG_RED, stroke: '#f6f2e6', 'stroke-width': 0.9}))
    const text = svg('text', {x: (cx + 12).toFixed(1), y: (cy - 7).toFixed(1), 'text-anchor': 'start', 'font-size': 11, fill: CG_RED, class: 'apparatus-label'})
    text.textContent = 'Center of mass'
    group.append(text)
  } else if (cgFound) {
    plate.append(svg('circle', {cx: 0, cy: 0, r: 3, fill: CG_RED, stroke: '#f6f2e6', 'stroke-width': 0.9}))
    const text = svg('text', {x: 13, y: -8, 'text-anchor': 'start', 'font-size': 11, fill: CG_RED, class: 'apparatus-label'})
    text.textContent = 'Center of mass'
    group.append(text)
  }
  group.append(plate)
  if (hole >= 1) {
    // 销钉穿孔: 原点处小销钉头(契约)
    add(group,
      svg('circle', {cx: 0, cy: 0, r: 2.4, fill: PIN, stroke: '#2f3a3e', 'stroke-width': 0.8}),
      svg('circle', {cx: -0.7, cy: -0.7, r: 0.7, fill: 'rgb(255 255 255 / 55%)'}),
    )
  }
  group.append(label(entity.label, 0, hole === 0 ? 106 : 24))
  return group
}
