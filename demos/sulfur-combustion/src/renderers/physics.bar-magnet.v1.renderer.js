import {add, svg} from './svg.js'

//  -  条形磁铁(kind=bar_magnet, case 139 电子束在磁场中偏转) - 
// 视觉依据: frame-012 特写(手持近景: 长方条磁铁, 红漆半段上印白色S, 另半段深蓝灰
//           金属裸露); frame-014(桌面俯态: 红半段与深色半段相接的条形磁铁平放); frame-
//           020(竖直持握态: 红端在上); frame-022/023(横持态红端朝下前, 深色端朝管).
// 复用否决: physics.horseshoe-magnet.v1 为马蹄形磁铁(开口 C 形, 双臂极面相对), 与本案
//           长方条形磁铁形状不符(构建方否决成立); 注册表无其他磁铁类条目(magnetic-cart
//           为小车).可信源发现无命中(trace assets/discover-bar_magnet: 白名单图标库无
//           bar magnet 矢量件), 故代码原生生成.
// 风格基础: 红漆 #c23b2e 为构建方契约给定色(域内红族 power-supply RED #c23a2c 同族), 
//           深蓝灰 #4a5560 契约给定(域内深金属族); 高光线/分界白线沿域内体块画法
//           (weight-cylinder 高光线, crt-demo-console 白分隔线先例).配色内联, 不新增
//           class.
// 关键尺寸(局部 (0,0)=磁铁几何中心; 竖直立条微倾 8° 像被持握; 宽 22px, 高 86px, 圆角): 
//   上/下半段各 43px, 中缝白细线分界; 红段高光沿左缘+顶缘亮线, 深色段左缘金属高光.
// 状态契约(读实体自身 state): state.valve_open(bool 缺省 false)=极性朝向 - false ⇒ 下端
//   为 N(下半段深色端白字N, 上半段红端标S, frame-012 证红端=S; frame-020 竖持
//   红端在上); true ⇒ 整体翻转(红 S 段在下, 深色 N 段在上), 用 180° rotate 实现, 两态
//   几何完全一致(条形轮廓中心对称); 极名字母不随组翻转(始终直立可读).
//   S丝印有 frame-012 证据; N丝印为按物理惯例的对侧推断补白(可删, 见 design_notes).
// 证据不清处: ① N丝印帧内不可辨(frame-012 仅见红段 S), 按对侧惯例补白; ② 8° 倾角
//   为持握感示意(frame-020 竖持微斜目测); ③ 磁铁被吸附/放置时的姿态由构建方 scene
//   transform(rotation_deg)承担, 渲染器只画自身 8° 持握倾角.
// 集成: 复制本文件到 src/renderers/ 并在 index.js import {renderBarMagnet} 后注册
//   'physics/bar-magnet'.z 序: 手持件最高层(构建方 scene 排序).不画 label(本体宽仅
//   22px, 13px 标签必叠压; 识别由 S/N 丝印与动作 label 承担, panel-lever 不画 label 先例), 
//   不画接地阴影(手持/悬浮件).

const RED = '#c23b2e'          // 红漆半段(构建方契约给定)
const RED_EDGE = '#7e2419'
const STEEL = '#4a5560'        // 深蓝灰金属半段(构建方契约给定)
const STEEL_EDGE = '#2c333b'
const DIVIDER = '#f2f2ee'      // 两段分界白细线
const LETTER = '#f5f2ea'       // 极名白字(frame-012 白色 S)

const W = 11                   // 半宽
const H = 43                   // 半高

function halfPath(sign) {
  // sign=-1 上半段(红); sign=+1 下半段(深色).圆角只在外端两角.
  const tip = H * sign
  const shoulder = (H - 4) * sign
  return `M${-W} 0L${-W} ${shoulder}Q${-W} ${tip} ${-W + 4} ${tip}L${W - 4} ${tip}Q${W} ${tip} ${W} ${shoulder}L${W} 0Z`
}

export function renderBarMagnet(entity, state = {}, context = {}) {
  const group = svg('g')
  const flipped = Boolean(state.valve_open)

  // 持握微倾(frame-020); 翻转用 180° rotate 实现, 两态轮廓几何完全一致
  const tilt = svg('g', {transform: 'rotate(8)'})
  const body = svg('g')
  if (flipped) body.setAttribute('transform', 'rotate(180)')
  add(body,
    svg('path', {d: halfPath(-1), fill: RED, stroke: RED_EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('path', {d: halfPath(1), fill: STEEL, stroke: STEEL_EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    // 红漆高光(左缘+外端亮线)
    svg('line', {x1: -6.2, y1: -38, x2: -6.2, y2: -4, stroke: 'rgb(255 255 255 / 35%)', 'stroke-width': 2.5, 'stroke-linecap': 'round'}),
    svg('line', {x1: -7.5, y1: -40.6, x2: 7.5, y2: -40.6, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
    // 深色段金属高光(左缘亮线)
    svg('line', {x1: -6.2, y1: 4, x2: -6.2, y2: 38, stroke: 'rgb(255 255 255 / 22%)', 'stroke-width': 2.5, 'stroke-linecap': 'round'}),
    // 两段分界白细线
    svg('line', {x1: -W, y1: 0, x2: W, y2: 0, stroke: DIVIDER, 'stroke-width': 1.4}),
  )
  tilt.append(body)
  // 极名字母不随组翻转(始终直立): S 随红段, N 随深色段
  const letter = (text, cy) => {
    const t = svg('text', {x: 0, y: cy + 4.6, 'text-anchor': 'middle', fill: LETTER, 'font-size': 13.5, 'font-weight': 700, 'font-family': "'Segoe UI', system-ui, sans-serif"})
    t.textContent = text
    return t
  }
  tilt.append(letter('S', flipped ? H / 2 : -H / 2))
  tilt.append(letter('N', flipped ? -H / 2 : H / 2))
  group.append(tilt)
  return group
}
