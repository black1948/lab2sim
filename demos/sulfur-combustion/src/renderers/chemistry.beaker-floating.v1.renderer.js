import {add, label, liquidColor, liquidRatio, markings, shadow, svg} from './svg.js'

//  -  盛水烧杯 - 水面浮蜡变体(白色蜡片漂浮在液面上 - "密度比水小"的证据表达) - 
// 视觉依据: frame-008(蜡屑自玻璃片倒入盛水烧杯); frame-009/010/011/012(白色蜡片漂浮在
// 液面高度处, 随水面分布, 关键: 蜡片在水面上, 不在杯底 - 不得画成沉底).水量约 150 mL
// (刻度目测, IR initial_state volume_ml=150; 标称 200 mL capacity_ml).
// 其余画法与 chemistry.js renderBeaker 完全一致: glass-body 杯体路径, glass-rim 口沿+导流嘴, 
// vesselGasLayer 雾层, liquid/meniscus 液层(liquidRatio 液位算法同式), measure-marks 刻度, 
// glass-highlight 竖向高光, reaction-overlay 反应气泡, apparatus-shadow 接地阴影, 标签 y=55.
// vesselGasLayer/reactionOverlay 在 chemistry.js 内未以可导入粒度提供, 按其原实现模块内重写
// (同 chemistry.beaker-inverted.v1 / chemistry.test-tube-layered.v1 的本地重写先例).
// 与 chemistry.beaker.v1 的关系: undissolvedPile 是"杯底盐粒堆", 与"液面浮蜡"位置/语义均
// 不同, 不能顶替; 故按 IR visual.asset_ref 另立渲染键 chemistry/beaker-floating.
// 状态绑定: state.floating_wax>0 且液位>0 → 液面 4 片白色小蜡片(任务规范 3~5 片, 确定性
// 坐标, 骑在随 volume_ml 移动的液面线上, 底缘略沉入液面下表达"漂浮"); floating_wax=0 或
// 无液(liquidRatio=0, 液面不存在)→ 一个蜡片节点都不画(无液时蜡片悬空属虚假画面).
// 蜡片配色: 白色系 fill #f6f3ea / 描边 #cfc4a8(candle-wax #f4ecd8/#d3c39c 同族蜡质色, 
// 提亮一档贴合 frame-009 白蜡片), 片上高光弧 #ffffff; crystal class 携带 crystal-grow
// 状态变化动画(倒入时的出现观感, cotton-wool.v1 同用法).

function gasLevel(state) {
  const value = Number(state.gas_level ?? state.co2_level ?? 0)
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0
}

function vesselGasLayer(state, bottomY, span, body, topLine) {
  const level = gasLevel(state)
  if (!(level > 0)) return []
  const fogTop = bottomY - level * span
  return [
    svg('path', {d: body(fogTop), fill: 'rgb(213 233 240 / 40%)', class: 'gas-layer'}),
    svg('path', {d: topLine(fogTop), fill: 'none', stroke: 'rgb(150 185 196 / 50%)', 'stroke-width': 1.2, class: 'gas-layer-top'}),
  ]
}

function reactionOverlay(state, width, top, bottom) {
  const overlay = svg('g', {class: 'reaction-layer'})
  const info = state.__reaction
  if (!info || !info.running) return overlay
  const phase = {mixing: 4, changing: 6, settling: 3}[info.phase] || 4
  overlay.setAttribute('data-phase', info.phase || 'mixing')
  for (let index = 0; index < phase; index += 1) {
    const x = -width / 2 + (index / Math.max(1, phase - 1)) * width
    overlay.append(svg('circle', {class: 'reaction-bubble', cx: x, cy: bottom, style: `--d:${0.3 + ((index * 37) % 40) / 100}s;--x:${(index % 3 - 1) * width * 0.22}`}))
  }
  return overlay
}

// 液面浮蜡: 4 片确定性坐标白蜡片骑在液面线上(cy 略高于液面, 底缘沉入液面下)
const WAX_CHIPS = [
  {cx: -19, r: 4.6},
  {cx: -7, r: 5.4},
  {cx: 5, r: 4.2},
  {cx: 16, r: 5.0},
]

function floatingWax(liquidTop) {
  const chips = svg('g')
  WAX_CHIPS.forEach(({cx, r}) => {
    const cy = liquidTop - 0.8
    chips.append(
      svg('ellipse', {cx, cy, rx: r, ry: r * 0.42, fill: '#f6f3ea', stroke: '#cfc4a8', 'stroke-width': 0.7, class: 'crystal'}),
      svg('path', {d: `M${cx - r * 0.45} ${(cy - r * 0.16).toFixed(2)}q${(r * 0.45).toFixed(2)} ${(-r * 0.34).toFixed(2)} ${(r * 0.9).toFixed(2)} 0`, fill: 'none', stroke: '#ffffff', 'stroke-width': 0.8, opacity: 0.85}),
    )
  })
  return chips
}

export function renderBeakerFloating(entity, state) {
  // .reacting 的 CSS shake 动画会覆盖 SVG transform 属性, 抖动须放在内层组, 外层组保留 renderStage 定位
  const group = svg('g')
  // reactingGroup(state, state.turbid ? 'is-turbid' : '') 的本地等价实现(保持 class 拼接一致)
  const running = Boolean(state.__reaction && state.__reaction.running)
  const reactingClass = running ? `reacting ${state.turbid ? 'is-turbid' : ''}`.trim() : (state.turbid ? 'is-turbid' : undefined)
  const reacting = svg('g', {class: reactingClass})
  const ratio = liquidRatio(entity, state)
  const liquidTop = 30 - ratio * 66
  add(reacting,
    shadow(0, 38, 35, 8),
    svg('path', {d: 'M-31-35H31L27 29Q26 35 19 35H-19Q-26 35-27 29Z', class: 'glass-body'}),
    ...vesselGasLayer(state, 30, 62,
      fogTop => `M-27 ${fogTop}Q0 ${fogTop - 3} 27 ${fogTop}V29Q26 33 19 33H-19Q-26 33-27 29Z`,
      fogTop => `M-27 ${fogTop}Q0 ${fogTop - 4} 27 ${fogTop}`),
    ...(ratio > 0 ? [
      svg('path', {d: `M-26 ${liquidTop}Q0 ${liquidTop - 3} 26 ${liquidTop}V29Q25 32 19 32H-19Q-25 32-25 29Z`, fill: liquidColor(state), class: 'liquid'}),
      svg('path', {d: `M-25 ${liquidTop}Q0 ${liquidTop - 4} 25 ${liquidTop}`, class: 'meniscus'}),
    ] : []),
    // 浮蜡替代 renderBeaker 的杯底盐粒堆: 骑在随 volume_ml 移动的液面线上
    Number(state.floating_wax) > 0 && ratio > 0 ? floatingWax(liquidTop) : null,
    svg('path', {d: 'M-32-35H33M-31-31Q-25-28-19-31', class: 'glass-rim'}),
    markings(22, -21, 20, 8, -1),
    svg('path', {d: 'M-19-28V24', class: 'glass-highlight'}),
    reactionOverlay(state, 46, liquidTop, 28),
  )
  group.append(reacting)
  return withLabel(group, entity, 55)
}

function withLabel(group, entity, y) {
  group.append(label(entity.label, 0, y))
  return group
}
