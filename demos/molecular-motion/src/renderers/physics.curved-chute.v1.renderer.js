import {add, label, shadow, svg} from './svg.js'

//  -  弧形斜槽(109-物体的动能: 蓝色四分之一圆弧滑槽, 钢球沿弧面滚下) - 
// 视觉依据: frame-004/012/042 全景(浅蓝四分之一圆弧滑槽面板: 弧缘自槽口向左上收拢, 
//           面板沿桌面贴放, 弧缘外侧有红色小旗刻度 20(up)/10(down), frame-012 逐列扫描
//           蓝色边界拟合圆心/半径与构建方契约的四分之一圆几何同构); frame-016 近景左下
//           蓝舌(#8ba1ae→归一化 #b7d3de 族).
// 复用审查否决记录: physics.slope.v1 / physics.incline.prop.v1 均为直斜面(无弧, 无刻度, 
//           木质), 不得顶替; 可信源发现命中 twbs/icons file-earmark-slides-fill(幻灯片文件
//           glyph), 形状语义与风格双重不符, 已回滚.
// 风格依据: physics.demo-track.v1.renderer.js 的板件+接地阴影+白高光线约定, physics.js
//           renderBall 的 apparatus-shadow 用法; 配色取 frame-012/016 实拍浅蓝族低照度采样
//           (#8ba1ae/#878d90)归一化到实验室浅色主题, 红刻度取域内红族 #c23a2a(先例
//           physics.clip-lead.v1).配色全部内联, 不新增 styles.css class.
// 局部几何(y 向下, (0,0)=槽口=桌面线, 与契约逐条一致): 
//   四分之一圆 R=130, 圆心局部 (0,-130); 弧参数角 β(圆心到弧点, 屏幕系): 
//     β=90° → 槽口 (0,0)(切线水平, 贴桌面); β=180° → 顶端 (-130,-130)(切线竖直).
//   面板=弧缘, 桌面线与左缘 x=-130 围成的四分圆板(frame-012 实测: 左缘全高, 向槽口
//   收窄成楔, 与该几何一致).
//   红色刻度小旗: β=160° → "20"(局部 -122,-86, 即 20cm 释放高度线), β=135° → "10"
//   (局部 -92,-38, 即 10cm 释放高度线); 旗自弧缘沿法线外侧(圆心方向)伸出, 
//   与 frame-012 红旗姿态一致(20 旗近水平向右, 10 旗斜向右上).
//   槽口平贴段: 槽口向右 14px, 高 4px 的薄唇(frame-012 槽口右侧沿桌面的蓝色平贴带).
// 状态契约: 静态器材, 无状态绑定(IR state_bindings empty).钢球滚落路径由
//   physics.ramp-ball.v1.renderer.js 按 roll_p 三段映射驱动, 本渲染器只画槽体.
// 证据不清处: ① 弧缘上的红旗数字在原始分辨率不可辨读("20"/"10" 依构建方契约标注, 
//   frame-012 另见更低的 5/0 两旗, 契约未要求, 未绘制); ② 面板上的对角浅色反光带为
//   玻璃夹层反光, 属光照不属器材, 未复刻.
// 集成: renderer 键 physics/curved-chute(index.js 的 import/注册由构建方完成: 复制本文件
//   到 src/renderers/ 并在 index.js 注册 'physics/curved-chute').

const R = 130                 // 弧半径(契约)
const CX = 0                  // 圆心局部 x
const CY = -130               // 圆心局部 y(槽口正上方)
const FACE = '#b7d3de'        // 面板主色(frame-016 蓝舌采样归一化)
const FACE_DEEP = '#9cc0cf'   // 面板下段压深
const EDGE = '#4f7c90'        // 弧缘描边
const EDGE_BAND = '#7fa8ba'   // 弧缘内侧深度带
const MARK_RED = '#c23a2a'    // 红色刻度旗
const MARK_DEEP = '#8f2a22'

// 弧上点: β 单位度, 屏幕系 y 向下
function arcPoint(betaDeg) {
  const rad = betaDeg * Math.PI / 180
  return {x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad)}
}

// 弧折线 path(β 自 180° 递减到 90°: 顶端 → 槽口; 16 段折线, 弦差 <0.2px 免 sweep-flag 歧义)
function arcPath(radius = R) {
  const points = []
  for (let index = 0; index <= 16; index += 1) {
    const rad = (180 - 90 * index / 16) * Math.PI / 180
    points.push(`${(CX + radius * Math.cos(rad)).toFixed(2)} ${(CY + radius * Math.sin(rad)).toFixed(2)}`)
  }
  return 'M' + points.join('L')
}

// 红色刻度小旗: β 处沿法线外侧伸出, 旗面数字沿旗身方向(frame-012 红旗姿态)
function markFlag(betaDeg, text) {
  const point = arcPoint(betaDeg)
  const rad = betaDeg * Math.PI / 180
  const nx = -Math.cos(rad)   // 法线外侧(指向圆心 C 一侧, 即弧面凹侧)
  const ny = -Math.sin(rad)
  const deg = Math.atan2(nx, -ny) * 180 / Math.PI   // 使旗身局部 -y 对准法线外侧
  const group = svg('g', {transform: `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${deg.toFixed(1)})`})
  add(group,
    svg('rect', {x: -3.5, y: -15, width: 7, height: 15, rx: 1, fill: MARK_RED, stroke: MARK_DEEP, 'stroke-width': 0.8}),
    svg('line', {x1: -3.5, y1: -1, x2: 3.5, y2: -1, stroke: MARK_DEEP, 'stroke-width': 1}),
  )
  const txt = svg('text', {x: 0, y: -6.5, 'text-anchor': 'middle', 'font-size': 6.2, 'font-weight': 'bold', fill: '#ffffff'})
  txt.textContent = text
  group.append(txt)
  return group
}

export function renderCurvedChute(entity, state = {}, context = {}) {
  const group = svg('g')
  // 面板: 弧缘(槽口→顶端)+ 左缘 x=-130 + 桌面线合围
  const outline = []
  for (let index = 0; index <= 16; index += 1) {
    const rad = (180 - 90 * index / 16) * Math.PI / 180
    outline.push(`${(CX + R * Math.cos(rad)).toFixed(2)} ${(CY + R * Math.sin(rad)).toFixed(2)}`)
  }
  const panelPath = 'M' + outline.join('L') + `L${-R} 0L0 0Z`
  add(group,
    shadow(-58, 3.5, 74, 5),
    // 面板主体 + 左缘下段压深(frame-012 面板左下更沉, 双色阶免渐变)
    svg('path', {d: panelPath, fill: FACE, stroke: 'none'}),
    svg('path', {d: `M${-R} ${CY}L${-R} 0L${-R + 26} 0L${-R + 22} ${CY + 16}Z`, fill: FACE_DEEP, opacity: 0.5}),
    // 弧缘内侧深度带(板缘厚度暗示)
    svg('path', {d: arcPath(R + 8), fill: 'none', stroke: EDGE_BAND, 'stroke-width': 5, opacity: 0.4, 'stroke-linecap': 'round'}),
    // 弧缘描边(槽口近唇)+ 白高光
    svg('path', {d: arcPath(), fill: 'none', stroke: EDGE, 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
    svg('path', {d: arcPath(R - 2.2), fill: 'none', stroke: 'rgb(255 255 255 / 50%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
    // 左缘 + 底缘收形
    svg('line', {x1: -R, y1: CY, x2: -R, y2: 0, stroke: EDGE, 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    svg('line', {x1: -R, y1: -0.6, x2: 12, y2: -0.6, stroke: EDGE, 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: 0.8}),
    // 槽口平贴段(frame-012 槽口右侧沿桌面薄唇)
    svg('path', {d: 'M0 0L14 0L14 -4L2.5 -4.6Z', fill: FACE, stroke: EDGE, 'stroke-width': 1.2, 'stroke-linejoin': 'round'}),
    svg('line', {x1: 3, y1: -3.4, x2: 12.5, y2: -2.9, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
  )
  // 红色刻度小旗: 20(up, β=160°), 10(down, β=135°) - 契约释放高度线
  group.append(markFlag(160, '20'), markFlag(135, '10'))
  group.append(label(entity.label, -58, 24))
  return group
}
