import {add, label, shadow, svg} from './svg.js'

//  -  木块(109-物体的动能: 被钢球/摆锤撞击后沿刻度尺滑行的小木质方块) - 
// 视觉依据: frame-007/008/016/039 特写(浅松木小方块, 约 3cm 宽: 正面见水平木纹, 
//           顶面受光更亮, 右侧有背光暗部; frame-016 采样亮部 (151,129,106), 暗部
//           (134,111,93), 低照度归一化为松木色族); frame-008/016(块立於刻度尺上, 
//           下缘压住尺面刻度, 与 IR z 22>10 的层序一致).
// 复用审查否决记录: physics.wooden-box.v1 为 132x50 带盖接缝的标本盒(静物容器), 与
//           36x26 实心滑块在尺寸/语义/命中区上均不符, 不得顶替(仅作配色与 2.5D 画法
//           参照); physics.weight.v1 为金属砝码, physics.stop-board.v1 为竖立挡板, 均
//           不同物.可信源发现命中 cubecubed cube-1080x1080(紫红抽象立方体), 配色与
//           风格双重断裂, 已回滚.
// 风格依据: physics.wooden-box.v1.renderer.js 的 2.5D 顶面斜折面+右侧暗部叠层+木纹淡线
//           画法(同源缩小); physics.js renderWeight 的接地阴影约定.配色全部内联, 
//           不新增 styles.css class.
// 局部几何(y 向下, (0,0)=块体中心, 与契约 36x26 及 block-1.y=0.331(中心离桌面 13px)
//   自洽: 块底 y=+13 恰落在桌面线): 
//   正面 x∈[-18,18], y∈[-13,13](36x26, width_cm=3 契约值); 2.5D 顶面斜折 y∈[-18,-13].
// 状态契约: 接触节拍闩(109 验证轮次要#7: 引擎从反应起点 t0 就线性插值 block.x, 
//   不闩则撞击前木块就提前滑出).sliding 且 state.__reaction.running 时绘制位按
//   接触进度滞后于节点: drawn = base_x + (x−base_x) - easeOut(q), q=(p−contact_p)/(1−contact_p), 
//   p=__reaction.progress/100(引擎对批实体每 tick 更新), contact_p 由各推动规则的
//   立即效果写入(钢球释放 0.66=滚落渲染器段C起点, 摆锤释放 0.68=摆动接触进度, 缺省 0.66).
//   q≤0(接触前)画在 base_x(块静止); q→1 与引擎线性插值合龙(offset→0); 批末
//   sliding=false 直接画节点位(=result_effects 终值), 两段无缝.easeOut=1−(1−q)²
//   使撞击瞬间最快, 摩擦减速停止(frame-008/016 滑行观感).滑行距离读数(cm)由
//   报告/规则层呈现, 渲染器不画读数.
// 证据不清处: ① 块体正面木纹在帧内为竖纹与横纹并存(拍摄角度所致), 按横纹示意; 
//   ② 撞击面上的轻微凹陷/磨损不可辨, 未复刻.
// 集成: renderer 键 physics/wood-block(index.js 的 import/注册由构建方完成: 复制本文件
//   到 src/renderers/ 并在 index.js 注册 'physics/wood-block').

const W = 18        // 半宽(36px)
const H = 13        // 半高(26px)
const FACE = '#c9a273'      // 正面松木色(frame-016 采样归一化)
const FACE_TOP = '#dcb98e'  // 顶面受光
const EDGE = '#7c5a33'
const GRAIN = '#a37b46'

export function renderWoodBlock(entity, state = {}, context = {}) {
  const group = svg('g')
  // 接触节拍闩: 反应期内节点位=引擎线性插值 base+TRAVEL - p, 绘制位=base+TRAVEL - easeOut(q).
  //   渲染器只知道当前位移 travel=TRAVEL - p(x−base_x), 故 offset=drawn−node
  //   =travel - (ease/p − 1)(p>0; p≤contact_p 时 ease=0 → offset=−travel, 恰画在 base_x; 
  //   p→1 时 offset→0 与引擎合龙, 批末 sliding=false 直接画节点位, 两段无缝)
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
    // 正面(36x26)
    svg('rect', {x: -W, y: -H, width: W * 2, height: H * 2, rx: 1.5, fill: FACE, stroke: EDGE, 'stroke-width': 1.6}),
    // 2.5D 顶面斜折(受光)
    svg('path', {d: `M${-W} ${-H}L-12 -18L12 -18L${W} ${-H}Z`, fill: FACE_TOP, stroke: EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -10, y1: -16.4, x2: 10, y2: -16.4, stroke: 'rgb(255 255 255 / 60%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
    // 右侧背光暗部 + 木纹淡线(frame-016 暗部叠层)
    svg('rect', {x: 9, y: -H, width: 9, height: H * 2, rx: 1.5, fill: '#2e2e2d', opacity: 0.16}),
    svg('path', {d: `M${-W + 4} -4h${W * 2 - 12}M${-W + 5} 5h${W * 2 - 14}`, stroke: GRAIN, 'stroke-width': 0.9, opacity: 0.5, fill: 'none'}),
  )
  body.append(label(entity.label, 0, 32))
  group.append(body)
  return group
}
