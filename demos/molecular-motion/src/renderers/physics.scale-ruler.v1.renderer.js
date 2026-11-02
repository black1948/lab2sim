import {add, label, shadow, svg} from './svg.js'

//  -  刻度尺(109-物体的动能: 平放桌面的白色 0-30cm 长条刻度尺, 木块滑行轨道) - 
// 视觉依据: frame-008/016 特写(白色长条尺平放桌面: 红色厘米刻度自上缘垂下, 每 5cm
//           一道通高红粗条+红色数字 0/5/10/15/20/25/30 排于刻度下方; frame-008 采样
//           尺面 (122,118,107), 红刻度 (112,45,37), 低照度归一化为米白+域内红族); 
//           frame-004/012 全景(尺自斜槽槽口右侧一直铺到画面右侧, 木块在尺上滑行).
// 复用审查否决记录: 注册表无任何 ruler/scale 类条目(chemistry.electronic-scale=电子秤, 
//           physics.optical-bench.v1=整台光学导轨, 均不同物); 可信源发现命中 twbs/icons
//           rulers.svg(16x16 单色 L 形双尺 glyph), 语义虽近但风格断裂且无法承载真实
//           0-30 数字刻度, 已回滚.
// 风格依据: physics.js renderIncline 的木质板件+measure-marks 刻度行画法(刻度比例与
//           短/长刻度分层约定参照 svg.js markings()), physics.demo-track.v1.renderer.js
//           的 2.5D 顶面受光条+接地阴影约定.配色全部内联, 不新增 styles.css class.
// 局部几何(y 向下, (0,0)=0cm 端=桌面线, 与契约逐条一致): 
//   尺体 x∈[0,360], y∈[-14,0](长 360px=30cm, 12px/cm 契约值); 2.5D 顶面受光条
//   y∈[-16,-14]; 厘米刻度自上缘垂下(短刻度 4.5px, 5cm 通高粗刻度 10px); 
//   数字 0/5/.../30 排于 y=-3.5.木块(physics/wood-block)叠于尺面之上(IR z 22>10).
// 状态契约: 静态器材, 无状态绑定(IR state_bindings empty); 木块落位由场景/规则驱动
//   (reset-block-a → x=0.243 即 5cm 起点, place-block-b/c → 0.219 即 3cm 处).
// 证据不清处: ① frame-008 尺面在特写里有轻微透视斜置与折痕(实拍为纸折条尺), 舞台
//   画法按平直长条尺处理(与全景帧一致); ② 厘米间毫米刻度在帧内不可辨, 未绘制.
// 集成: renderer 键 physics/scale-ruler(index.js 的 import/注册由构建方完成: 复制本文件
//   到 src/renderers/ 并在 index.js 注册 'physics/scale-ruler').

const LENGTH = 360      // 30cm × 12px/cm(契约)
const CM = 12
const FACE = '#f4f1e8'  // 尺面米白(frame-008 采样归一化)
const FACE_TOP = '#fdfcf8'
const EDGE = '#9a9484'
const TICK_RED = '#c23a2a'
const NUM_RED = '#b03226'

export function renderScaleRuler(entity, state = {}, context = {}) {
  const group = svg('g')
  add(group,
    shadow(180, 2.5, 184, 4.5),
    // 尺体 + 2.5D 顶面受光条
    svg('rect', {x: 0, y: -14, width: LENGTH, height: 14, rx: 1.5, fill: FACE, stroke: EDGE, 'stroke-width': 1.4}),
    svg('rect', {x: 0, y: -16, width: LENGTH, height: 3, rx: 1.5, fill: FACE_TOP, stroke: EDGE, 'stroke-width': 1}),
    svg('line', {x1: 4, y1: -14.6, x2: LENGTH - 4, y2: -14.6, stroke: 'rgb(255 255 255 / 65%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
  )
  // 厘米刻度: 短刻度每 1cm, 5cm 长红粗条(frame-008); 数字排于刻度下方
  for (let k = 0; k <= 30; k += 1) {
    const x = k * CM
    const major = k % 5 === 0
    add(group,
      svg('line', {
        x1: x, y1: -13.2, x2: x, y2: major ? -7.4 : -10,
        stroke: TICK_RED, 'stroke-width': major ? 2.2 : 1.1, 'stroke-linecap': 'round',
      }),
    )
    if (major) {
      const txt = svg('text', {x, y: -1.8, 'text-anchor': 'middle', 'font-size': 6.8, 'font-weight': 'bold', fill: NUM_RED})
      txt.textContent = String(k)
      group.append(txt)
    }
  }
  group.append(label(entity.label, 180, 16))
  return group
}
