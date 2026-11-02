//  -  Test-tube rack(双孔, 白色/浅色塑料架, 静态道具) - 
// 视觉依据: frame-004/005(左右两根立柱 + 上部横梁带插孔 + 底部托板带孔, 奶白色塑料, 
// 圆角, 壁面有淡高光; 试管插在孔中并立 - 试管为独立实体由场景叠放); frame-008/016/036
// (架上双管并立, 试管在横梁前方呈半透明玻璃叠影).
// 风格依据: biology.js code-native 白色器械画法(renderIncubator/renderAutoclave 的浅色
// 体块 + inline 配色 + 圆角描边)+ physics.ring-vessel.v1 的 2.5D 顶面斜折面画法 +
// apparatus-shadow 接地阴影; inline 配色, 不新增 styles.css class.
// 几何锚点: 局部 (0,0)=托板底面中心; 托板 x ±96, 立柱顶 y=-80, 横梁 y -74..-60.
// 双孔中心 x=±50: 与场景 tube-left/right(x 间距 0.10 → 100 舞台像素)对齐, 试管并立
// 孔位正上方(scene z 序: 架(20) < 试管, 试管玻璃叠在横梁前, 与 frame-004/016 一致).
// 证据偏差(design_notes): frame-004 单独特写中架宽约为管间距 7 倍; 场景受 hit_shape
// 0.18x0.12(180x120px)约束, 按管间距 100px 反推架宽 192px(约 1.9 倍管距), 形状语言
// (双立柱/带孔横梁/带孔托板)与证据一致, 比例以场景可读性优先.
// 无状态绑定(IR 无 state_bindings; renderXxx(entity, state) 签名保留 state 形参).
// 导出签名沿用既有模块先例; svg()/add()/label()/shadow() 在模块内自含最小实现.

const NS = 'http://www.w3.org/2000/svg'

function svg(tag, attributes = {}) {
  const node = document.createElementNS(NS, tag)
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value))
  })
  return node
}

function add(parent, ...children) {
  children.flat().filter(Boolean).forEach(child => parent.append(child))
  return parent
}

function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

function shadow(cx = 0, cy = 0, rx = 28, ry = 7) {
  return svg('ellipse', {cx, cy, rx, ry, class: 'apparatus-shadow'})
}

const PLASTIC = '#efeadd'
const PLASTIC_TOP = '#f7f4ea'
const PLASTIC_EDGE = '#c6c0ae'
const HOLE = '#b9b2a0'
const HOLE_DEEP = '#7d7666'

export function renderTestTubeRack(entity, state = {}) {
  const group = svg('g')
  add(group,
    shadow(0, 4, 104, 8),
    // 托板: 前板面 + 2.5D 顶面斜折 + 双孔(frame-004 托板孔承托管底)
    svg('rect', {x: -96, y: -10, width: 192, height: 10, rx: 2, fill: PLASTIC, stroke: PLASTIC_EDGE, 'stroke-width': 1.6}),
    svg('path', {d: 'M-96 -10L-89 -16H89L96 -10Z', fill: PLASTIC_TOP, stroke: PLASTIC_EDGE, 'stroke-width': 1.6, 'stroke-linejoin': 'round'}),
    svg('ellipse', {cx: -50, cy: -13, rx: 10, ry: 3.2, fill: HOLE}),
    svg('ellipse', {cx: -50, cy: -13, rx: 6.2, ry: 1.8, fill: HOLE_DEEP}),
    svg('ellipse', {cx: 50, cy: -13, rx: 10, ry: 3.2, fill: HOLE}),
    svg('ellipse', {cx: 50, cy: -13, rx: 6.2, ry: 1.8, fill: HOLE_DEEP}),
    // 左右立柱(frame-004 圆角立柱, 左缘受光淡高光)
    svg('rect', {x: -96, y: -80, width: 13, height: 70, rx: 4, fill: PLASTIC, stroke: PLASTIC_EDGE, 'stroke-width': 1.6}),
    svg('rect', {x: 83, y: -80, width: 13, height: 70, rx: 4, fill: PLASTIC, stroke: PLASTIC_EDGE, 'stroke-width': 1.6}),
    svg('path', {d: 'M-92 -74V-16M87 -74V-16', stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    // 上横梁 + 双插孔(frame-004 横梁孔在管距位置, 试管由场景叠画在前)
    svg('rect', {x: -90, y: -74, width: 180, height: 14, rx: 3, fill: PLASTIC_TOP, stroke: PLASTIC_EDGE, 'stroke-width': 1.6}),
    svg('path', {d: 'M-86 -71.5H86', stroke: 'rgb(255 255 255 / 80%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('ellipse', {cx: -50, cy: -67, rx: 9, ry: 3.4, fill: HOLE}),
    svg('ellipse', {cx: -50, cy: -67, rx: 5.4, ry: 1.8, fill: HOLE_DEEP}),
    svg('ellipse', {cx: 50, cy: -67, rx: 9, ry: 3.4, fill: HOLE}),
    svg('ellipse', {cx: 50, cy: -67, rx: 5.4, ry: 1.8, fill: HOLE_DEEP}),
  )
  group.append(label(entity.label, 0, 24))
  return group
}
