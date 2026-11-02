import {add, label, liquidColor, liquidRatio, markings, shadow, svg} from './svg.js'

//  -  冰水浴烧杯(250 mL 烧杯 + 杯内大块方冰堆积) - 
// 视觉依据: frame-003/005(右侧烧杯内装大块方冰, 冰块自杯底堆积, 冰顶明显高于水面), 
// frame-010(冰水浴中冰块半浸, 液面线穿过冰块); frame-011/013(冰水浴套住球泡使用).
// 杯体画法与 chemistry.js renderBeaker 完全一致: glass-body 杯体路径
// M-31-35H31L27 29Q26 35 19 35H-19Q-26 35-27 29Z, glass-rim 口沿+导流嘴, vesselGasLayer 雾层, 
// liquid/meniscus 液层(liquidRatio 液位算法同式), measure-marks 刻度, glass-highlight 竖向高光, 
// reaction-overlay 反应气泡, apparatus-shadow 接地阴影, 标签 y=55.
// vesselGasLayer/reactionOverlay 在 chemistry.js 内未以可导入粒度提供, 按其原实现模块内重写
// (同 chemistry.beaker-floating.v1 / chemistry.beaker-inverted.v1 的本地重写先例).
// 增量: 冰块 - 与 chemistry.beaker.v1 的 undissolvedPile(salt_mass_g 驱动的杯底盐粒小圆点堆)
// 语义/尺寸均不同, 不能顶替; 此处 5 块确定性坐标的大块方冰(任务规范 3~5 块)自杯底堆叠, 
// 顶部冰块高于水面(frame-003/005/010).配色: fill #f2f7f9 / 描边 #c9dde4 / 白高光弧, 
// 半透明 fill-opacity 0.85(半浸部分透出液层).
// 状态绑定沿用 beaker: volume_ml → liquid.level(liquidRatio), color → liquid.color.
// 守卫: 液位>0 才画冰(无液时冰悬空属虚假画面).

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

// 5 块确定性坐标方冰: 两块沉底 → 一块中层 → 两块上层, 堆顶 y≈-32(水面 150mL/250mL 时
// liquidTop≈-9.6, 冰顶高出约 22px; 即便液位较高也保持冰顶露出).坐标/尺寸/转角全部字面常量.
const ICE_CUBES = [
  {cx: -13, cy: 20.5, s: 19, rot: -9},
  {cx: 6.5, cy: 21.5, s: 18, rot: 7},
  {cx: -3, cy: 4.5, s: 18, rot: 5},
  {cx: 8, cy: -11, s: 17, rot: -8},
  {cx: -5, cy: -24.5, s: 14, rot: 10},
]

// 切角方冰多边形: 八边形近似 + 顶边白高光折线, 整体按 rot 旋转(确定性)
function iceCube({cx, cy, s, rot}) {
  const half = s / 2
  const cut = s * 0.16
  const points = [
    [-half + cut, -half], [half - cut, -half], [half, -half + cut], [half, half - cut],
    [half - cut, half], [-half + cut, half], [-half, half - cut], [-half, -half + cut],
  ].map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const cube = svg('g', {transform: `translate(${cx} ${cy}) rotate(${rot})`, class: 'ice-cube'})
  cube.append(svg('polygon', {points, fill: '#f2f7f9', 'fill-opacity': 0.85, stroke: '#c9dde4', 'stroke-width': 1.1, 'stroke-linejoin': 'round'}))
  cube.append(svg('path', {d: `M${(-half * 0.5).toFixed(2)} ${(-half * 0.55).toFixed(2)}L${(half * 0.4).toFixed(2)} ${(-half * 0.55).toFixed(2)}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 1.4, opacity: 0.85, 'stroke-linecap': 'round'}))
  return cube
}

function iceCubes(ratio) {
  if (!(ratio > 0)) return null
  const cubes = svg('g', {class: 'ice-cubes'})
  ICE_CUBES.forEach(cube => cubes.append(iceCube(cube)))
  return cubes
}

export function renderBeakerIce(entity, state) {
  // .reacting 的 CSS shake 动画会覆盖 SVG transform 属性, 抖动须放在内层组, 外层组保留 renderStage 定位
  const group = svg('g')
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
    // 冰块堆替代 renderBeaker 的杯底盐粒堆: 半浸于液层, 堆顶高于水面
    iceCubes(ratio),
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
