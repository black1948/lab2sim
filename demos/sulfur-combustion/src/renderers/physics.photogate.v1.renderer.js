import {add, label, shadow, svg} from './svg.js'

//  -  光电门(121-用数字计时仪测气垫导轨上滑块的即时速度: 架在导轨左段的光电门) - 
// 视觉依据: frame-019/028 特写放大(轨面上方米白/浅色立柱: 窄立柱+顶部圆头光电头, 
//           头部一道横向深色光缝窗, 柱身中段微凸, 底部小夹座跨在轨缘, 夹下可见滚花
//           紧定螺钉); frame-023(同柱近景+轨缘夹持与螺钉清晰); frame-005/006 广角
//           (导轨左段的白色门形立件, 滑块 U 形挡光片从门内穿过); frame-004/016/017/018
//           全景(左段立件呈白色门柱剪影).352×288 暗光帧分辨率不足以辨内部光路, 
//           按通用光电门形制补形: 立柱+光电头+光缝窗+挡光指示灯.
// 复用审查否决记录: physics-core.json 全表(99 条)与 discovered/ 无任何光电门/门形支架
//           条目 - physics.led-panel=发电机 LED 显示立板, physics.screen=光学屏, 
//           physics.graph-board=白板, physics.contact-post=接线柱, 均不同物, 不得顶替.
//           可信源发现(scripts/discover_apparatus.py --kind photogate --label 光电门)
//           返回 "no scored vector file matched"(tabler/tabler-icons, twbs/icons 单色
//           线稿图标库, 形状语义与本片 2.5D 体块风格断裂), 按规程代码原生生成.
// 风格依据: 米白/浅色塑料件配色沿用 physics.led-panel.v1 白件族(#ece7d8/#b9b3a4)与
//           chemistry.digital-thermometer.v1 塑料族归一化(暗光采样 #b9b19a→浅主题
//           #e7e1cf); 立柱+头部体块 2.5D 画法沿用 physics.ticker-timer.v1.renderer.js
//           (顶面斜折/左侧受光高光/右侧暗部); 指示灯点亮语言沿用 physics.led-panel.v1
//           (多层同心圆辉光叠加, 不用 defs 渐变避免多实例 id 冲突); 接地阴影同域约定.
//           配色全部内联, 不新增 styles.css class.
// 锚点: 局部 (0,0)=立柱夹座在轨面(白色滑行面顶线)上的落点中心.立柱 x∈[-7,7], 
//           y∈[-46,0]; 光电头 x∈[-11,11], y∈[-70,-44](光缝窗 y∈[-60,-52] 横贯头部, 
//           滑块 U 形挡光片两条挡光沿在此穿过); 夹座/滚花螺钉 y∈[0,10](骑跨轨缘, 
//           frame-023).总高约 70px.
// 状态契约(本资产无 state_bindings, 挡光指示灯派生自 world['glider-1'], 构建方契约): 
//   lit = world['air-track-1'] 在场 且 world['air-source-1'] 在场(气源/导轨不在场一律
//         按熄灭) 且 glider-1.sliding 为真 且 glider 轨局部 x 落入门窗 ±gate_window_px: 
//   glider 轨局部 x = glider_start_x_px + glider_run_span_px  -  p(p=clamp01(glider-1
//     .run_progress), 匀速线性律, 与 physics/air-glider-vane.v1 的映射逐字一致 - 两处
//     必须同步修改; 缺省 240 + (-478) - p, 即右端 +240 滑到 -238).
//   门窗中心 = 光电门轨局部 x: world['photogate-1'] 与 world['air-track-1'] 均在场时按
//     两者 world x 差×1000 求取, 否则回退 gate_track_x_px(缺省 -154, 构建方契约值).
// 契约参数(context.visual, 全带缺省): gate_track_x_px=-154, gate_window_px=14, 
//           glider_start_x_px=240, glider_run_span_px=-478.
// 证据不清处: ① 光电头内部光路/发射-接收窗结构不可辨, 按一道横向深色光缝窗示意; 
//           ② 指示灯在帧内无法确认真位置(暗光下不可辨), 按通用形制画在光电头右下, 
//           挡光时点亮; ③ 夹座细部(滚花螺钉)依 frame-023 轨缘下的圆形凸起补形.
// 导出签名与模板一致: renderPhotogate(entity, state, context).
// 集成: renderer 键 physics/photogate(index.js 的 import/注册由构建方完成: 复制本文件到
//           src/renderers/ 并在 index.js 注册 'physics/photogate').

const POST = '#e7e1cf'        // 立柱/光电头米白塑料(暗光采样归一化浅主题)
const POST_LIT = '#f4efe0'    // 受光面
const POST_EDGE = '#a89f86'   // 塑料描边
const POST_DARK = '#c6bda4'   // 背光缝/夹座
const SLIT = '#2b2e31'        // 光缝窗(深色横缝)
const EDGE = '#6d675a'        // 深描边(夹座金属)
const METAL = '#9aa0a8'       // 滚花螺钉
const LED_OFF = '#4a4e54'     // 指示灯熄灭
const LED_ON = '#ff4a33'      // 指示灯点亮(同域发光红, digital-thermometer 族)

//  -  滑块轨局部 x 映射(与 physics/air-glider-vane.v1.renderer.js 逐字一致, 改一处必须
//    同步另一处): 匀速线性律, 禁止 p²  - 
function gliderTrackX(world, visual, gliderState) {
  const p = Math.max(0, Math.min(1, Number((gliderState && gliderState.run_progress) ?? 0)))
  return Number(visual.glider_start_x_px ?? 240) + Number(visual.glider_run_span_px ?? -478) * p
}

function indicatorLit(entity, state, context) {
  const world = context.world || {}
  const track = world['air-track-1']
  if (!track) return false                     // 导轨不在场 → 熄灭
  if (!world['air-source-1']) return false     // 气源不在场 → 熄灭
  const glider = world['glider-1'] || {}
  if (!glider.sliding) return false            // 未在滑行 → 熄灭
  const visual = context.visual || {}
  let gateX = Number(visual.gate_track_x_px ?? -154)
  const self = world[entity?.id]
  if (self) gateX = (Number(self.x ?? 0) - Number(track.x ?? 0)) * 1000
  const gx = gliderTrackX(world, visual, glider)
  return Math.abs(gx - gateX) <= Number(visual.gate_window_px ?? 14)
}

function indicatorLamp(cx, cy, lit) {
  const group = svg('g')
  if (lit) {
    // 多层同心圆辉光(physics.led-panel.v1 先例, 不用 defs 渐变避免多实例 id 冲突)
    for (const [r, op] of [[8, 0.07], [6, 0.1], [4.4, 0.14]]) {
      group.append(svg('circle', {cx, cy, r, fill: `rgb(255 74 51 / ${op})`}))
    }
  }
  group.append(svg('circle', {cx, cy, r: 2.6, fill: lit ? LED_ON : LED_OFF, stroke: EDGE, 'stroke-width': 0.9}))
  if (lit) group.append(svg('circle', {cx: cx - 0.8, cy: cy - 0.9, r: 0.8, fill: 'rgb(255 255 255 / 70%)'}))
  return group
}

export function renderPhotogate(entity, state = {}, context = {}) {
  const group = svg('g')
  const lit = indicatorLit(entity, state, context)
  add(group,
    shadow(0, 2, 16, 4),
    // 夹座: 骑跨轨缘的小鞍座 + 滚花紧定螺钉(frame-023 轨缘下圆形凸起)
    svg('rect', {x: -10, y: -2, width: 20, height: 7, rx: 2, fill: POST_DARK, stroke: POST_EDGE, 'stroke-width': 1.2}),
    svg('rect', {x: -5.5, y: 3, width: 11, height: 6, rx: 1.5, fill: '#8f876f', stroke: EDGE, 'stroke-width': 1}),
    svg('circle', {cx: 0, cy: 7.5, r: 3, fill: METAL, stroke: EDGE, 'stroke-width': 1}),
    svg('line', {x1: -2.2, y1: 6.4, x2: 2.2, y2: 8.6, stroke: EDGE, 'stroke-width': 0.9}),
    // 立柱(x∈[-7,7], y∈[-46,0])+ 左侧受光高光
    svg('rect', {x: -7, y: -46, width: 14, height: 45, rx: 2.5, fill: POST, stroke: POST_EDGE, 'stroke-width': 1.4}),
    svg('line', {x1: -4.2, y1: -42, x2: -4.2, y2: -6, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('rect', {x: 2.5, y: -44, width: 4.5, height: 42, rx: 2, fill: 'rgb(0 0 0 / 7%)'}),
    // 柱身中段微凸(frame-019/028 柱中段鼓形, 线缆盒)
    svg('rect', {x: -8.5, y: -24, width: 17, height: 12, rx: 3, fill: POST, stroke: POST_EDGE, 'stroke-width': 1.2}),
    svg('line', {x1: -6.5, y1: -21, x2: -6.5, y2: -15, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
  )
  // 光电头(x∈[-11,11], y∈[-70,-44]): 圆顶头 + 横贯深色光缝窗
  add(group,
    svg('path', {d: 'M-11 -44L-11 -62Q-11 -70 -3 -70L3 -70Q11 -70 11 -62L11 -44Z', fill: POST, stroke: POST_EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('path', {d: 'M-11 -62Q-11 -70 -3 -70L3 -70Q11 -70 11 -62L11 -58L-11 -58Z', fill: POST_LIT, stroke: POST_EDGE, 'stroke-width': 1}),
    svg('rect', {x: -11, y: -60, width: 22, height: 8, rx: 2.5, fill: SLIT, stroke: EDGE, 'stroke-width': 1}),
    svg('line', {x1: -8.5, y1: -58.6, x2: 8.5, y2: -58.6, stroke: 'rgb(255 255 255 / 22%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
    // 头部右下挡光指示灯(挡光时点亮)
    indicatorLamp(6, -48.5, lit),
    // 头部右侧背光暗部
    svg('rect', {x: 6.5, y: -58, width: 4.5, height: 14, rx: 2, fill: 'rgb(0 0 0 / 8%)'}),
  )
  group.append(label(entity.label, 0, 24))
  return group
}
