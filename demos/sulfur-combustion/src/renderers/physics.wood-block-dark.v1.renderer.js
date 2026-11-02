import {add, label, shadow, svg} from './svg.js'

//  -  木块(深红棕垫块变体; 119-用打点计时器测匀加速直线运动: 斜面木板左端下的垫块) - 
// 视觉依据: frame-002/003 全景(板左端下的深红棕木块: 暗光下正面近酱红, 顶面受光略亮, 
//           右侧背光更暗; 块高与板端厚度相当, 块体敦实).低照度归一化提亮到实验室浅色
//           主题同族: 正面 #9c5140, 顶面 #b06a52, 暗部叠层, 木纹 #7a3a2c.
// 复用审查否决记录(为何不复用 physics.wood-block.v1): 既有条目为 109 案例浅松木小方块
//           (frame-016 采样 #c9a273/#dcb98e 松木黄), 与本案深红棕垫块色差显著(明度/
//           色相双重偏离, 帧并排即穿帮), 不能诚实代表; kind=wood_block 语义一致故出
//           深色变体条目而非新 kind.wooden-box(标本盒)/weight(金属砝码)/stop-board
//           (竖立挡板)均不同物, 一并否决.
// 风格依据: physics.wood-block.v1.renderer.js 的 2.5D 顶面斜折面+右侧暗部叠层+木纹淡线
//           画法(同构重着色; 该渲染器为 109 案例接触节拍闩的既有实现, 变体保留同一段
//           滞后逻辑以在同类推动规则下行为一致, 本案无 __reaction 时自动走直通路径); 
//           physics.js renderWeight 接地阴影约定.配色 inline, 不新增 styles.css class.
// 局部几何: 与松木变体完全一致 - (0,0)=块体中心(y 向下): 正面 36×26(width_cm=3 契约
//           值 ×12px/cm), 2.5D 顶面斜折 y∈[-18,-13], 右侧背光暗部 x∈[9,18], 块底 y=+13
//           恰落支撑面.斜置使用时构建方可经 visual.transform.scale 调外观大小.
// 状态契约: sliding 且 __reaction.running 时的接触节拍闩同松木变体(详见 physics.wood-block.v1
//           design_notes); 本案 119 仅作静置垫块, 无状态绑定.
// 证据不清处: ① 垫块顶面被木板压住不可辨, 顶面色按同族提亮推定; ② 木纹走向帧内不可辨, 
//           按横纹示意.
// 导出签名与模板一致: renderWoodBlockDark(entity, state, context).
// 集成: renderer 键 physics/wood-block-dark(index.js 的 import/注册由构建方完成: 复制本
//           文件到 src/renderers/ 并在 index.js 注册 'physics/wood-block-dark'; 119 场景
//           block-1 应引用本条目, physics.wood-block.v1 保持 default_for_kind 不变).

const W = 18        // 半宽(36px)
const H = 13        // 半高(26px)
const FACE = '#9c5140'      // 正面深红棕(frame-002/003 暗光采样归一化)
const FACE_TOP = '#b06a52'  // 顶面受光
const EDGE = '#4a2018'
const GRAIN = '#7a3a2c'

export function renderWoodBlockDark(entity, state = {}, context = {}) {
  const group = svg('g')
  // 接触节拍闩(同松木变体; 本案静置垫块时 __reaction 缺省走直通)
  const x = Number(state.x ?? 0)
  const travel = x - Number(state.base_x ?? x)
  const react = state.__reaction
  const p = Math.max(0, Math.min(1, Number(react?.progress ?? 0) / 100))
  const cp = Math.max(0, Math.min(0.99, Number(state.contact_p ?? 0.66)))
  const q = Math.max(0, Math.min(1, (p - cp) / (1 - cp)))
  const ease = 1 - (1 - q) * (1 - q)
  const latch = Boolean(state.sliding) && Boolean(react?.running) && travel !== 0 && p > 0
  const offsetX = latch ? travel * (ease / p - 1) * 1000 : 0
  const body = svg('g', offsetX ? {transform: `translate(${offsetX.toFixed(1)} 0)`} : {})
  add(body,
    shadow(0, 15, 22, 4.5),
    // 正面(36×26)
    svg('rect', {x: -W, y: -H, width: W * 2, height: H * 2, rx: 1.5, fill: FACE, stroke: EDGE, 'stroke-width': 1.6}),
    // 2.5D 顶面斜折(受光)
    svg('path', {d: `M${-W} ${-H}L-12 -18L12 -18L${W} ${-H}Z`, fill: FACE_TOP, stroke: EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -10, y1: -16.4, x2: 10, y2: -16.4, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
    // 右侧背光暗部 + 木纹淡线
    svg('rect', {x: 9, y: -H, width: 9, height: H * 2, rx: 1.5, fill: '#2e1410', opacity: 0.28}),
    svg('path', {d: `M${-W + 4} -4h${W * 2 - 12}M${-W + 5} 5h${W * 2 - 14}`, stroke: GRAIN, 'stroke-width': 0.9, opacity: 0.5, fill: 'none'}),
  )
  body.append(label(entity.label, 0, 32))
  group.append(body)
  return group
}
