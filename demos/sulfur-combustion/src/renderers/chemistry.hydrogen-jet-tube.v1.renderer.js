import {add, label, svg} from './svg.js'

//  -  氢气尖嘴导管(细长玻璃导管, 尖嘴口排气/燃烧) - 
// 视觉依据: frame-004(未点燃: 细长玻璃导管自画面左下角以约 30° 斜向右上伸入, 管壁呈两道
// 平行高光, 中央为深色内孔, 右端长段渐缩成尖嘴口, 无任何画面外气源器材); frame-006/008
// (点燃后: 尖嘴口冒出细长淡蓝色火焰, 火焰与管轴同轴, 长度约为管径的 6~7 倍, 安静燃烧, 
// 无橙黄色).氢气气流本身不可见(frame-004/006 均无管外羽流线索), 气流只以管内虚线表达.
// 风格依据: chemistry.js renderDeliveryTube 的玻璃管画法惯例(tube-glass/tube-highlight/
// tube-flow 既有 class, styles.css 已有, 不新增 class); 淡蓝三层火焰配色沿用 renderGasHolder
// 的 #7db8ff(外焰, opacity .8)/#c9e2ff(内焰)/#eef7ff(焰芯) - 氢气在空气中安静燃烧
// 不用橙黄色火焰(flame-outer 默认橙配色的 candle/lighter/match 先例不适用).
// 锚点对齐: IR jet_tip = 场景归一化偏移 (x+0.145, y+0.115)(x 向右, y 向上).渲染器局部坐标
// 换算: local = (anchor.x - 1000/scale, -anchor.y - 500/scale)(app.js screenPoint 口径), scale=1.0
// 时尖嘴口落在局部 (145, -57.5).整个管体画在旋转组 translate(145 -57.5) rotate(60) 内: 
// 组内管轴竖直, 尖嘴口在原点, 火焰沿组内 -y 方向即管轴方向(CSS flame-flicker 的
// transform-box: fill-box 缩放随火焰自身轴, 不随屏幕轴).
// 状态约定: state.conducting=true → 管内 tube-flow 虚线自画外流向尖嘴(沿用模板动画); 
// state.lit=true → 尖嘴口淡蓝三层尾焰(长≈95 局部单位).两状态相互独立, 可同时为真
// (燃烧时氢气持续通入, IR initial_state 即 conducting=true).
// 导出签名与 chemistry.js 一致: renderHydrogenJetTube(entity, state, context).

const TIP_X = 145          // 尖嘴口局部 x = anchor.x - 1000/scale
const TIP_Y = -57.5        // 尖嘴口局部 y = -anchor.y - 500/scale(场景 y 向上 → 局部 y 向下取负)
const AXIS_ROT = 60        // 旋转组角度: 组内 (0,-1) 映射为管轴方向 (cos30°, -sin30°)
const BARREL_HALF = 6      // 管体半宽(frame-004 管径约 16~17 舞台像素, 含壁线描边 ≈14.6)
const TIP_HALF = 1.1       // 尖嘴口半宽(细窄喷口)
const TAPER_LEN = 110      // 渐缩段长度(frame-004 尖嘴长段渐缩约 90~140 舞台像素)
const BARREL_LEN = 700     // 管体延伸长度(伸出舞台左下角, 与 frame-004 一致被视口裁切)

export function renderHydrogenJetTube(entity, state = {}) {
  const group = svg('g')
  const conducting = Boolean(state.conducting)
  const lit = Boolean(state.lit)

  // 管体与火焰同画在旋转组内: 组内坐标管轴竖直, 尖嘴口为原点, 管体伸向 +y(画外左下)
  const tube = svg('g', {transform: `translate(${TIP_X} ${TIP_Y}) rotate(${AXIS_ROT})`})
  add(tube,
    // 内孔微透玻璃底色(inline 配色, 不用 glass-body 以免带上 2px 描边把细管涂死)
    svg('path', {
      d: `M-${BARREL_HALF} ${TAPER_LEN}L-${TIP_HALF} 0L${TIP_HALF} 0L${BARREL_HALF} ${TAPER_LEN}V${BARREL_LEN}H-${BARREL_HALF}Z`,
      fill: 'rgb(221 245 249 / 28%)',
    }),
    // 两道管壁 + 尖嘴渐缩(frame-004 双壁高光滑条), 线帽收圆
    svg('path', {
      d: `M-${BARREL_HALF} ${BARREL_LEN}V${TAPER_LEN}L-${TIP_HALF} 0`,
      class: 'tube-glass',
      'stroke-width': 2.6,
    }),
    svg('path', {
      d: `M${BARREL_HALF} ${BARREL_LEN}V${TAPER_LEN}L${TIP_HALF} 0`,
      class: 'tube-glass',
      'stroke-width': 2.6,
    }),
    // 左壁白色高光滑条(frame-004 玻璃反光)
    svg('path', {d: `M-${BARREL_HALF + 0.6} ${BARREL_LEN - 10}V${TAPER_LEN + 2}`, class: 'tube-highlight'}),
    // 氢气流: 管内虚线自画外流向尖嘴(沿路径正方向移动, 路径终点在尖嘴口)
    conducting ? svg('path', {d: `M0 ${BARREL_LEN}V2`, class: 'tube-flow'}) : null,
    // 尖嘴口淡蓝色三层火焰(frame-006/008: 细长, 与管轴同轴, 安静燃烧) - 
    // 配色沿用 renderGasHolder 淡蓝火焰, 长度约为管径 7 倍(frame-006 量得)
    lit ? svg('path', {
      d: 'M0 2Q-6 -14 -8 -32Q-9.5 -56 0 -95Q9.5 -56 8 -32Q6 -14 0 2Z',
      fill: '#7db8ff', opacity: 0.8, class: 'flame-outer',
    }) : null,
    lit ? svg('path', {
      d: 'M0 -2Q-4.4 -18 -5.6 -38Q-6.4 -58 0 -78Q6.4 -58 5.6 -38Q4.4 -18 0 -2Z',
      fill: '#c9e2ff', class: 'flame-inner',
    }) : null,
    lit ? svg('path', {
      d: 'M0 -5Q-2.4 -18 -3 -30Q-3.4 -42 0 -54Q3.4 -42 3 -30Q2.4 -18 0 -5Z',
      fill: '#eef7ff', class: 'flame-core',
    }) : null,
  )
  add(group, tube)
  // 标签保持正立, 置于管体下方外侧(不进旋转组)
  group.append(label(entity.label, 0, 84))
  return group
}
