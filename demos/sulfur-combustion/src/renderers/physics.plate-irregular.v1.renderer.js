import {add, label, shadow, svg} from './svg.js'

//  -  不规则薄板(kind=thin_plate 的非默认变体, 118-用悬挂法确定薄板的重心; scene
// renderer=physics/plate-irregular, 实体 plate-irregular; physics.plate-triangle.v1 仍为
// kind=thin_plate 的 default) - 
// 视觉依据: frame-011 近景演示图(不规则"豆形"硬纸板: 左侧圆肚, 右上尖叶, 右缘深缺口, 
//           右下鼓部; 两条悬挂迹线过孔交于重心, 红点标重心) - 外轮廓按 frame-011 逐行
//           剪影采样归一(≈211×210px, 42 点多边形); frame-012 全景(先挂非叶尖孔); frame-013
//           宽景实拍; frame-014 近景实拍(挂叶尖孔, 重垂线垂在板前).板面采样 (183,174,157)/
//           (186,177,160) - 低照度归一化为板面 #f3efe3, 板缘 #b9b2a2(与三角形薄板一致).
// 复用审查否决记录: 注册表内无可复用的板/卡片类资产(无薄板语义); 本变体不设
//           default_for_kind(variant 抢默认会覆盖 kind 解析, 先例 physics.laser-source.v1).
// 风格依据: 与 physics.plate-triangle.v1 同一套板面画法(fill+深描边+白高光内联), 
//           string-line 细线, apparatus-shadow 接地阴影, apparatus-label 标签; 红点/红字
//           #c23a2a 一族(support-frame.v1 先例).所有配色内联, 不新增 styles.css class.
// 局部几何(y 向下, 比例 1:1px; 与契约逐条一致): 
//   (0,0)=重心(两条迹线交点, frame-011 实测 (432,345) 归一).外轮廓多边形 42 点
//   (frame-011 剪影采样, 右上尖叶 (117.4,-67.5), 右缘缺口最深处 x≈51 于 y≈-21~-29, 
//   右下鼓部 (93.5,70.4), 底部 y≈126), 外接 ≈211 宽 × 210 高.两孔(自轮廓向重心内缩
//   ~20px 冲孔): 孔 1=(88.9,66.4)(frame-012 先挂的非叶尖孔), 孔 2=(112.6,-64.7)
//   (frame-011 标架姿态右上叶尖孔); 孔到重心距离 d1≈111.0 / d2≈129.8px(校准
//   anchors.face 用).悬孔 k 平衡旋转角 a_k=atan2(-hx,-hy): a1=-126.75°, a2=-60.11°.
//   孔位编号说明(契约偏差, 如实记录): 契约称"1=左上(frame-014 先挂), 2=右上(frame-011)", 
//   但像素比对(frame-014 悬点与 frame-011 叶尖缺口映射到同一位置, 反向映射不可能)表明
//   frame-014 所挂即 frame-011 的右上叶尖孔 - 契约两条归属互斥.本渲染器按可同时满足的
//   语义锚点编号: 1=先挂孔(frame-012), 2=标架姿态右上叶尖孔(frame-011); "2=右上"与
//   "1=先挂"两条均成立.若构建方坚持 frame-014=孔 1, 交换 HOLES 两项即可(不影响重心
//   几何, 仅影响动作编排标签).
// 状态契约(逐条照契约实现, 与 plate-triangle 同一套): 
//   state.hole=0: 桌上平放 - 原点=重心, 无旋转, 画接地阴影.
//   state.hole=k>=1: 挂在销钉上 - 原点=孔 k(销钉头在原点), 整板旋转 a_k−θ, 静止时
//     重心位于孔正下方.
//   state.swing_p: 缺省(未写)=悬挂静止; 1=静止; 0..1(含 0)渲染器接管
//     (physics.pendulum-bob.v1 swing_p 先例, 但 p=0 为释放瞬间, 必须接管): 
//     θ0=properties.release_angle_deg(缺省 22; IR 已写 22), p∈[0,0.68]
//     θ=−θ0 - cos((π/2) - (p/0.68)); p∈(0.68,1] q=(p−0.68)/0.32, θ=+θ0 - 0.25 - sin(πq)(1−q); 
//     p=0 自左偏 θ0 释放.板 transform=rotate(a_k−θ)(SVG rotate(+θ)=屏幕顺时针).
//   state.traced_1..2: 过孔 k 与重心的直线, 延伸到板轮廓为止(clipPath id 前缀 entity.id); 
//     线色按 黑+蓝: 孔 1=#3a3f45, 孔 2=#33518e(与三角形板同一约定; frame-011 近景中
//     一线偏蓝一线深色, 哪条为蓝在 352×288 下不可分辨到孔级, 按编号顺序分配).
//   state.cg_found: 重心处红点(#c23a2a)+ 直立"Center of mass"文字(不随板转动, 板旁跟随重心).
//   properties 只读 release_angle_deg; 无外部状态硬编码.
// 证据不清处: ① 片源板轮廓边缘在低照度下有虚焦晕边, 采样轮廓已向内收半像素级(±2px); 
//   ② 重心位置取两迹线交点(frame-011 实测), 未做物理形心积分 - 演示图本身即以迹线交点
//   为重心, 与教学法一致; ③ 悬挂销在 frame-014 中为细线挂线+销钉, 契约简化为销钉穿孔.
// 集成: renderer 键 physics/plate-irregular(index.js 的 import/注册由构建方完成: 复制本
//   文件到 src/renderers/ 并注册 'physics/plate-irregular').上下文 visual 可忽略.

const FILL = '#f3efe3'
const EDGE = '#b9b2a2'
const EDGE_DARK = '#8f8877'
const TRACE_DARK = '#3a3f45'
const TRACE_BLUE = '#33518e'
const CG_RED = '#c23a2a'
const HOLE_FILL = '#3a3f45'
const PIN = '#4a545c'
const NUM_INK = '#8a8274'
const RELEASE_DEFAULT = 22    // 契约缺省释放角(IR 实体已写 22)
const LOW_POINT = 0.68
const TRACE_COLORS = [TRACE_DARK, TRACE_BLUE]   // 契约 黑+蓝

const POLYGON = [
  [117.4, -67.5], [106.0, -81.8], [59.3, -84.1], [-0.6, -83.5], [-51.9, -80.7],
  [-80.4, -75.5], [-89.5, -64.1], [-93.2, -48.4], [-93.5, -29.9], [-91.8, -10.0],
  [-90.6, 10.0], [-89.2, 29.9], [-86.4, 49.9], [-80.4, 67.0], [-71.8, 82.6],
  [-59.8, 96.9], [-44.7, 109.7], [-29.1, 119.7], [-9.1, 124.8], [13.7, 126.3],
  [36.5, 124.0], [55.0, 118.8], [70.7, 108.3], [83.5, 95.5], [90.6, 81.2],
  [93.5, 70.4], [92.3, 58.4], [88.9, 45.6], [83.5, 33.3], [76.4, 22.8],
  [68.4, 12.8], [60.7, 2.8], [54.7, -5.7], [51.0, -14.2], [50.2, -20.8],
  [51.6, -29.4], [55.0, -38.5], [60.7, -46.5], [68.4, -52.7], [79.2, -57.6],
  [93.5, -61.3], [106.3, -64.7],
].map(([x, y]) => ({x, y}))

const HOLES = [{x: 88.9, y: 66.4}, {x: 112.6, y: -64.7}]   // 1=先挂孔 / 2=右上叶尖孔

const polyPoint = points => points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

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

export function renderPlateIrregular(entity, state = {}, context = {}) {
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
  const v = hole >= 1 ? {x: -HOLES[hole - 1].x, y: -HOLES[hole - 1].y} : null   // 孔→重心
  const rotationDeg = hole >= 1
    ? Math.atan2(v.x, v.y) * 180 / Math.PI - theta * 180 / Math.PI
    : 0
  const clipId = `${entity.id || 'plate-irregular'}-face-clip`

  if (hole === 0) add(group, shadow(0, 130, 82, 7))   // 接地阴影仅桌上姿态

  // 悬挂姿态原点=孔 k: 多边形(重心系坐标)先平移 −hole 再绕原点旋转 a_k−θ
  const plate = svg('g', hole >= 1
    ? {transform: `rotate(${rotationDeg.toFixed(2)}) translate(${(-HOLES[hole - 1].x).toFixed(1)} ${(-HOLES[hole - 1].y).toFixed(1)})`}
    : {})
  const defs = svg('defs')
  const clip = svg('clipPath', {id: clipId})
  clip.append(svg('polygon', {points: polyPoint(POLYGON)}))
  defs.append(clip)
  plate.append(defs)
  add(plate,
    svg('polygon', {points: polyPoint(POLYGON), fill: FILL, stroke: EDGE_DARK, 'stroke-width': 1.6, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -80, y1: -60, x2: -30, y2: 96, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
    svg('line', {x1: 60, y1: 110, x2: 84, y2: 40, stroke: EDGE, 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.8}),
  )
  HOLES.forEach((h, i) => {
    const d = Math.hypot(h.x, h.y)
    const nx = h.x - 14 * h.x / d
    const ny = h.y - 14 * h.y / d
    add(plate,
      svg('circle', {cx: h.x.toFixed(1), cy: h.y.toFixed(1), r: 2.6, fill: HOLE_FILL, stroke: '#d8d2c2', 'stroke-width': 1}),
      svg('text', {x: nx.toFixed(1), y: (ny + 2.2).toFixed(1), 'text-anchor': 'middle', 'font-size': 6.5, fill: NUM_INK}),
    )
    plate.lastChild.textContent = String(i + 1)
  })
  HOLES.forEach((h, i) => {
    if (state[`traced_${i + 1}`]) plate.append(traceLine(h, i, clipId))
  })
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
    add(group,
      svg('circle', {cx: 0, cy: 0, r: 2.4, fill: PIN, stroke: '#2f3a3e', 'stroke-width': 0.8}),
      svg('circle', {cx: -0.7, cy: -0.7, r: 0.7, fill: 'rgb(255 255 255 / 55%)'}),
    )
  }
  group.append(label(entity.label, 0, hole === 0 ? 148 : 24))
  return group
}
