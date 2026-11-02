import {add, label, liquidColor, liquidRatio, markings, shadow, svg} from './svg.js'

function withLabel(group, entity, y) {
  group.append(label(entity.label, 0, y))
  return group
}

const REACTION_PHASES = {
  mixing: {class: 'reacting mixing', bubbles: 4},
  changing: {class: 'reacting changing', bubbles: 6},
  settling: {class: 'reacting settling', bubbles: 3},
}

function reactionOverlay(state, width, top, bottom) {
  const overlay = svg('g', {class: 'reaction-layer'})
  const info = state.__reaction
  if (!info || !info.running) return overlay
  const phase = REACTION_PHASES[info.phase] || REACTION_PHASES.mixing
  overlay.setAttribute('data-phase', info.phase || 'mixing')
  for (let index = 0; index < phase.bubbles; index += 1) {
    const x = -width / 2 + (index / Math.max(1, phase.bubbles - 1)) * width
    overlay.append(svg('circle', {class: 'reaction-bubble', cx: x, cy: bottom, style: `--d:${0.3 + ((index * 37) % 40) / 100}s;--x:${(index % 3 - 1) * width * 0.22}`}))
  }
  return overlay
}

function reactingGroup(state, className = '') {
  const reacting = Boolean(state.__reaction && state.__reaction.running)
  return svg('g', {class: reacting ? `${className} reacting`.trim() : (className || undefined)})
}

// 气体积聚层(0..1): 比空气重的气体(CO₂ 等)自容器底部积起的半透明雾层.
// gas_level 为通用状态字段; co2_level 是早期案例(倾倒二氧化碳)的字段名, 作别名兼容.
export function gasLevel(state) {
  const value = Number(state.gas_level ?? state.co2_level ?? 0)
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0
}

// 容器雾层绘制: body(fogTop) 返回雾体内壁路径, topLine(fogTop) 返回雾面描线.
// 与液体层同构但更淡(先画雾层, 再画液层, 液面在雾面之上时自然覆盖).
export function vesselGasLayer(state, bottomY, span, body, topLine) {
  const level = gasLevel(state)
  if (!(level > 0)) return []
  const fogTop = bottomY - level * span
  return [
    svg('path', {d: body(fogTop), fill: 'rgb(213 233 240 / 40%)', class: 'gas-layer'}),
    svg('path', {d: topLine(fogTop), fill: 'none', stroke: 'rgb(150 185 196 / 50%)', 'stroke-width': 1.2, class: 'gas-layer-top'}),
  ]
}

export function renderBench(entity) {
  // 台面颜色可由 IR entity.properties.color 覆盖(如蓝色实验垫); 缺省保持灰色金属台
  const matColor = entity?.properties?.color
  const plate = matColor
    ? svg('rect', {x: -42, y: -12, width: 84, height: 24, rx: 3, fill: matColor, stroke: '#5b6a6d', 'stroke-width': 2, class: 'bench-plate'})
    : svg('rect', {x: -42, y: -12, width: 84, height: 24, rx: 3, class: 'metal'})
  // 台面是大倍数缩放的场景件(如 scale 5): 标签字号与描边按 scale 反向补偿, 避免渲染成巨字
  const scale = Math.max(1, Number(entity?.visual?.scale || 1))
  if (scale === 1) return withLabel(add(svg('g'), shadow(0, 16, 42, 9), plate), entity, 32)
  const text = label(entity.label, 0, 32 / scale, 'apparatus-label')
  text.setAttribute('style', `font-size: ${(13 / scale).toFixed(2)}px; stroke-width: ${(5 / scale).toFixed(2)}px`)
  return add(add(svg('g'), shadow(0, 16, 42, 9), plate), text)
}

// 未溶解的固体颗粒堆(salt_mass_g>0 且未 dissolved 时显示于杯底)
function undissolvedPile(state) {
  const mass = Number(state.salt_mass_g || 0)
  if (!(mass > 0) || state.dissolved) return null
  const count = Math.max(6, Math.min(18, Math.round(mass * 4)))
  const nodes = []
  for (let index = 0; index < count; index += 1) {
    const t = count === 1 ? 0.5 : index / (count - 1)
    nodes.push(svg('circle', {
      cx: -15 + 30 * t,
      cy: 31 - Math.sin(t * Math.PI) * 3.5 - (index % 3),
      r: 1.4 + (index % 3) * 0.45,
      fill: '#cfc2a6',
      stroke: '#b3a482',
      'stroke-width': 0.4,
      class: 'salt-grain',
    }))
  }
  return nodes
}

// 固体颗粒堆(solid_g>0 时显示于容器底部; 大理石碎块等, 米黄色调区别于盐粒)
function solidPile(state, halfWidth = 24, baseY = 39) {
  const mass = Number(state.solid_g || 0)
  if (!(mass > 0)) return null
  const count = Math.max(6, Math.min(16, Math.round(mass * 1.6)))
  const nodes = []
  for (let index = 0; index < count; index += 1) {
    const t = count === 1 ? 0.5 : index / (count - 1)
    nodes.push(svg('circle', {
      cx: -halfWidth + halfWidth * 2 * t,
      cy: baseY - Math.sin(t * Math.PI) * 3.5 - (index % 3),
      r: 1.8 + (index % 3) * 0.6,
      fill: '#dccbaa',
      stroke: '#b3a482',
      'stroke-width': 0.4,
      class: 'salt-grain',
    }))
  }
  return nodes
}

export function renderCandle(entity, state) {
  // 短蜡烛: 烛体 + 烛芯 + 点燃时的三层火焰(复用酒精灯火焰配色与 flicker 动画)
  const group = svg('g')
  const lit = Boolean(state.lit)
  add(group,
    shadow(0, 23, 15, 4),
    svg('path', {d: 'M-9.5 19.5Q-11 20.5-11 17L-10-8Q-10-12-7-12H7Q10-12 10-8L11 17Q11 20.5 9.5 19.5Z', class: 'candle-wax'}),
    svg('path', {d: 'M-7-12Q-5-16-2.5-12M2.5-12Q5-15 7-11', class: 'candle-drip'}),
    svg('rect', {x: -1.3, y: -18, width: 2.6, height: 7, rx: 1.2, class: 'candle-wick'}),
    lit ? svg('path', {d: 'M0-40Q-5.5-31-3.6-24Q-2-20 0-21.5Q2-20 3.6-24Q5.5-31 0-40Z', fill: '#ff8f3d', class: 'flame-outer'}) : null,
    lit ? svg('path', {d: 'M0-36.5Q-2.8-30.5-1.7-25.5Q-0.8-23 0-24.2Q0.8-23 1.7-25.5Q2.8-30.5 0-36.5Z', fill: '#ffd54d', class: 'flame-inner'}) : null,
    lit ? svg('path', {d: 'M0-32Q-1.4-28.6-0.8-26.2Q-0.4-25 0-25.8Q0.4-25 0.8-26.2Q1.4-28.6 0-32Z', fill: '#fff8d6', class: 'flame-core'}) : null,
  )
  // 标签放到烛体下方, 烧杯底缘之外, 避免被前方玻璃罩住
  return withLabel(group, entity, 60)
}

export function renderSteppedStand(entity) {
  // 阶梯状白铁皮架: 两级台阶承托蜡烛, 背板伸出杯口作持拿柄(与视频 frame-003/006 对应)
  const group = svg('g')
  add(group,
    shadow(0, 34, 58, 6),
    svg('path', {d: 'M24 31V-82Q24-86 28-86Q32-86 32-82V31Z', class: 'stand-sheet'}),
    svg('path', {d: 'M-26 25H26V31H-23Q-26 31-26 28Z', class: 'stand-sheet'}),
    svg('path', {d: 'M-2 1H26V7H1Q-2 7-2 4Z', class: 'stand-sheet'}),
    svg('path', {d: 'M-24 26.5H24M0 2.5H24M26-80V28', class: 'stand-sheet-edge'}),
  )
  return withLabel(group, entity, 108)
}

export function renderGlassPlate(entity) {
  // 玻璃片: 盖在集气烧杯口的长条玻璃, 视频中的盖片带淡绿色边(frame-003)
  const group = svg('g')
  add(group,
    shadow(0, 5, 40, 3),
    svg('rect', {x: -40, y: -4, width: 80, height: 6, rx: 2, class: 'glass-body'}),
    svg('rect', {x: -40, y: -4, width: 80, height: 6, rx: 2, fill: 'none', stroke: '#5f8f7c', 'stroke-width': 1.6, class: 'glass-plate-edge'}),
    svg('path', {d: 'M-30 0H16', class: 'glass-highlight'}),
  )
  return withLabel(group, entity, -14)
}

export function renderLighter(entity, state) {
  // 打火机: 机身 + 金属机头 + 打火轮, lit 时出火(视频中点火源被手遮挡, 见 IR assumptions)
  const group = svg('g')
  const lit = Boolean(state.lit)
  add(group,
    shadow(0, 30, 14, 4),
    svg('path', {d: 'M-9-2Q-9-8-4-8H4Q9-8 9-2V22Q9 28 4 28H-4Q-9 28-9 22Z', class: 'lighter-body'}),
    svg('path', {d: 'M-6-8V-22Q-6-26-2-26H2Q6-26 6-22V-8Z', class: 'lighter-cap'}),
    svg('circle', {cx: 0, cy: -24, r: 3.4, class: 'lighter-wheel'}),
    svg('rect', {x: -1.2, y: -21, width: 2.4, height: 5, rx: 1, class: 'candle-wick'}),
    lit ? svg('path', {d: 'M0-38Q-4.5-31-3-25.5Q-1.8-22.5 0-24Q1.8-22.5 3-25.5Q4.5-31 0-38Z', fill: '#ff8f3d', class: 'flame-outer'}) : null,
    lit ? svg('path', {d: 'M0-35Q-2.3-30.4-1.4-26.6Q-0.7-24.6 0-25.7Q0.7-24.6 1.4-26.6Q2.3-30.4 0-35Z', fill: '#ffd54d', class: 'flame-inner'}) : null,
  )
  return withLabel(group, entity, 44)
}

export function renderBeaker(entity, state) {
  // .reacting 的 CSS shake 动画会覆盖 SVG transform 属性, 抖动须放在内层组, 外层组保留 renderStage 定位
  const group = svg('g')
  // is-turbid: 通入 CO₂ 后石灰水变浑浊(乳白化由 CSS 过渡呈现)
  const reacting = reactingGroup(state, state.turbid ? 'is-turbid' : '')
  const ratio = liquidRatio(entity, state)
  const liquidTop = 30 - ratio * 66
  // gas_level 0..1: 重气体(如 CO₂)自杯底积聚的雾层, 先于液层绘制, 盖住杯内后景
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
    undissolvedPile(state),
    svg('path', {d: 'M-32-35H33M-31-31Q-25-28-19-31', class: 'glass-rim'}),
    markings(22, -21, 20, 8, -1),
    svg('path', {d: 'M-19-28V24', class: 'glass-highlight'}),
    reactionOverlay(state, 46, liquidTop, 28)
  )
  group.append(reacting)
  return withLabel(group, entity, 55)
}

export function renderConicalFlask(entity, state) {
  // 双层组: 外层定位, 内层承接 .reacting 抖动(CSS transform 动画会覆盖属性 transform)
  const group = svg('g')
  const reacting = reactingGroup(state)
  const ratio = liquidRatio(entity, state)
  const liquidTop = 37 - ratio * 58
  add(reacting,
    shadow(0, 45, 39, 8),
    svg('path', {d: 'M-12-48H12V-24L37 30Q42 42 29 43H-29Q-42 42-37 30L-12-24Z', class: 'glass-body'}),
    ...vesselGasLayer(state, 37, 56,
      fogTop => `M-32 ${fogTop}Q0 ${fogTop - 3} 32 ${fogTop}L37 31Q40 39 28 40H-28Q-40 39-37 31Z`,
      fogTop => `M-31 ${fogTop}Q0 ${fogTop - 4} 31 ${fogTop}`),
    solidPile(state, 24, 40),
    ...(ratio > 0 ? [
      svg('path', {d: `M-32 ${liquidTop}Q0 ${liquidTop - 3} 32 ${liquidTop}L37 31Q40 39 28 40H-28Q-40 39-37 31Z`, fill: liquidColor(state), class: 'liquid'}),
      svg('path', {d: `M-31 ${liquidTop}Q0 ${liquidTop - 4} 31 ${liquidTop}`, class: 'meniscus'}),
    ] : []),
    svg('path', {d: 'M-14-48H14M-11-42H11', class: 'glass-rim'}),
    svg('path', {d: 'M-7-38V-20L-28 27', class: 'glass-highlight'}),
    markings(24, 4, 29, 5, -1),
    reactionOverlay(state, 54, liquidTop, 32)
  )
  group.append(reacting)
  return withLabel(group, entity, 61)
}

export function renderCylinder(entity, state) {
  // 双层组: 外层定位, 内层承接 .reacting 抖动(CSS transform 动画会覆盖属性 transform)
  const group = svg('g')
  const reacting = reactingGroup(state)
  const ratio = liquidRatio(entity, state)
  const liquidTop = 46 - ratio * 91
  add(reacting,
    shadow(0, 57, 25, 6),
    svg('path', {d: 'M-16-52H16L14 46Q14 51 9 51H-9Q-14 51-14 46Z', class: 'glass-body'}),
    ...vesselGasLayer(state, 46, 88,
      fogTop => `M-12 ${fogTop}Q0 ${fogTop - 2} 12 ${fogTop}V46Q12 48 8 48H-8Q-12 48-12 46Z`,
      fogTop => `M-12 ${fogTop}Q0 ${fogTop - 3} 12 ${fogTop}`),
    ...(ratio > 0 ? [
      svg('path', {d: `M-12 ${liquidTop}Q0 ${liquidTop - 2} 12 ${liquidTop}V46Q12 48 8 48H-8Q-12 48-12 46Z`, fill: liquidColor(state), class: 'liquid'}),
      svg('path', {d: `M-12 ${liquidTop}Q0 ${liquidTop - 3} 12 ${liquidTop}`, class: 'meniscus'}),
    ] : []),
    svg('path', {d: 'M-18-52H18M-8 51V55M-25 56H25', class: 'glass-rim'}),
    markings(10, -42, 39, 20, -1),
    svg('path', {d: 'M-7-44V39', class: 'glass-highlight'}),
    reactionOverlay(state, 22, liquidTop, 48)
  )
  group.append(reacting)
  return withLabel(group, entity, 73)
}

export function renderBurette(entity, state) {
  const group = svg('g', {class: state.valve_open ? 'valve-open' : ''})
  const ratio = liquidRatio(entity, state)
  const level = Math.max(-70, Math.min(43, 43 - ratio * 113))
  add(group,
    shadow(-5, 88, 42, 7),
    svg('path', {d: 'M-39-86V82M-55 83H12', class: 'stand'}),
    svg('path', {d: 'M-39-37H-11', class: 'clamp'}),
    svg('path', {d: 'M-13-73H13V52Q13 58 7 58H-7Q-13 58-13 52Z', class: 'glass-body'}),
    ...(ratio > 0 ? [
      svg('rect', {x: -10, y: level, width: 20, height: 55 - level, fill: liquidColor(state, '#6bbecb'), class: 'liquid'}),
      svg('path', {d: `M-10 ${level}Q0 ${level - 2} 10 ${level}`, class: 'meniscus'}),
    ] : []),
    markings(8, -65, 44, 25, -1),
    svg('path', {d: 'M-6-66V45', class: 'glass-highlight'}),
    svg('path', {d: 'M0 58V70', class: 'glass-rim'}),
    svg('circle', {cx: 0, cy: 62, r: 8, class: 'valve-hub'}),
    svg('path', {d: 'M-15 62H15', class: 'valve-handle'}),
    svg('path', {d: 'M0 70V82L-3 88H3L1 82', class: 'glass-rim'}),
    // 手势播放期间由 #fx 液流承担出液, 避免与 CSS 滴落双重渲染
    state.valve_open && state.above && !state.__motion ? svg('path', {d: 'M0 91c-4 6-4 9 0 12c4-3 4-6 0-12Z', fill: liquidColor(state), class: 'falling-drop'}) : null
  )
  return withLabel(group, entity, 108)
}

export function renderPipette(entity, state) {
  const group = svg('g')
  const hasLiquid = Number(state.volume_ml || 0) > 0
  add(group,
    shadow(0, 53, 20, 5),
    svg('path', {d: 'M-6-48Q0-55 6-48L5-4L2 37L0 51L-2 37L-5-4Z', class: 'glass-body'}),
    hasLiquid ? svg('path', {d: 'M-4-37H4L2 32H-2Z', fill: liquidColor(state, '#72c5d2'), class: 'liquid'}) : null,
    markings(4, -28, 18, 10, -1),
    svg('path', {d: 'M-2-42V28', class: 'glass-highlight'})
  )
  return withLabel(group, entity, 68)
}

export function renderDropper(entity, state) {
  const group = svg('g')
  const hasLiquid = Number(state.volume_ml || 0) > 0
  add(group,
    shadow(0, 50, 18, 5),
    svg('path', {d: 'M-12-47Q0-61 12-47L8-29H-8Z', class: 'rubber'}),
    svg('path', {d: 'M-6-30H6L4 23L0 44L-4 23Z', class: 'glass-body'}),
    hasLiquid ? svg('path', {d: 'M-3-17H3L2 21H-2Z', fill: liquidColor(state, '#d56f8f'), class: 'liquid'}) : null,
    svg('path', {d: 'M-2-23V18', class: 'glass-highlight'})
  )
  return withLabel(group, entity, 61)
}

export function renderReagentBottle(entity, state) {
  const group = svg('g')
  const color = liquidColor(state, '#b993d7')
  const hasLiquid = Number(state.volume_ml || 0) > 0
  add(group,
    shadow(0, 40, 30, 7),
    svg('path', {d: 'M-16-43H16V-30L28-20V30Q28 36 21 36H-21Q-28 36-28 30V-20L-16-30Z', class: 'glass-body amber-glass'}),
    hasLiquid ? svg('path', {d: 'M-18 8H18V31H-18Z', fill: color, class: 'liquid'}) : null,
    hasLiquid ? svg('path', {d: 'M-18 8Q0 5 18 8', class: 'meniscus'}) : null,
    svg('rect', {x: -18, y: -1, width: 36, height: 18, rx: 2, class: 'bottle-label'}),
    svg('path', {d: 'M-18-50H18V-40H-18Z', class: 'cap'}),
    svg('path', {d: 'M-18-46H18M-12-43V-30', class: 'glass-highlight'})
  )
  const name = label(entity.properties?.contents || entity.label, 0, 11, 'bottle-label-text')
  group.append(name)
  return withLabel(group, entity, 56)
}

export function renderTestTube(entity, state) {
  // 双层组: 外层定位, 内层承接 .reacting 抖动(CSS transform 动画会覆盖属性 transform)
  const group = svg('g')
  const reacting = reactingGroup(state)
  const ratio = liquidRatio(entity, state)
  const liquidTop = 42 - ratio * 82
  add(reacting,
    shadow(0, 62, 16, 5),
    svg('path', {d: 'M-10-52H10L9 54Q9 62 0 62Q-9 62-9 54Z', class: 'glass-body'}),
    ...vesselGasLayer(state, 42, 82,
      fogTop => `M-8 ${fogTop}Q0 ${fogTop - 2} 8 ${fogTop}V54Q8 58 3 59H-3Q-8 58-8 54Z`,
      fogTop => `M-8 ${fogTop}Q0 ${fogTop - 3} 8 ${fogTop}`),
    ...(ratio > 0 ? [
      svg('path', {d: `M-8 ${liquidTop}Q0 ${liquidTop - 2} 8 ${liquidTop}V54Q8 58 3 59H-3Q-8 58-8 54Z`, fill: liquidColor(state), class: 'liquid'}),
      svg('path', {d: `M-8 ${liquidTop}Q0 ${liquidTop - 3} 8 ${liquidTop}`, class: 'meniscus'}),
    ] : []),
    svg('path', {d: 'M-12-52H12M-9-48Q0-45 9-48', class: 'glass-rim'}),
    svg('path', {d: 'M-4-46V46', class: 'glass-highlight'}),
    reactionOverlay(state, 14, liquidTop, 52)
  )
  group.append(reacting)
  return withLabel(group, entity, 78)
}

export function renderFunnel(entity, state) {
  const group = reactingGroup(state)
  const residue = Number(state.residue_g || 0)
  const wet = Boolean(state.mixture)
  const info = state.__reaction
  let residueOpacity = 0
  if (residue > 0) {
    residueOpacity = 0.85
  } else if (info && info.running && info.progress >= 55) {
    residueOpacity = Math.min(0.85, ((info.progress - 55) / 45) * 0.85)
  }
  add(group,
    shadow(0, 58, 26, 6),
    svg('path', {d: 'M-30-42H30L4 18H-4Z', class: 'glass-body'}),
    wet ? svg('path', {d: 'M-27-38H27L4 14H-4Z', fill: liquidColor(state, '#cfd8d3'), class: 'liquid'}) : null,
    svg('path', {d: 'M-26-39L26-39L3 14L-3 14Z', fill: '#ffffff', stroke: '#b9c8cc', 'stroke-width': 1, class: 'filter-paper'}),
    (residue > 0 || residueOpacity > 0) ? svg('path', {d: 'M-14-16L14-16L3 12L-3 12Z', fill: '#c9b98f', opacity: residueOpacity, class: 'residue'}) : null,
    svg('path', {d: 'M-32-42H32M-30-39Q0-43 30-39', class: 'glass-rim'}),
    svg('path', {d: 'M-2 18V52Q-2 56 2 56', class: 'glass-rim'}),
    svg('path', {d: 'M-24-34L-3 10', class: 'glass-highlight'}),
    reactionOverlay(state, 34, -30, 10)
  )
  return withLabel(group, entity, 72)
}

// 分液漏斗: 梨形主体 + 旋塞 + 长管腿.旋塞局部坐标对齐滴定管(hub y=62)以复用 .valve-* 样式与双击切换交互
export function renderSeparatingFunnel(entity, state) {
  const group = svg('g', {class: state.valve_open ? 'valve-open' : ''})
  const ratio = liquidRatio(entity, state)
  // 梨形腔半宽(分段线性插值): 颈部 ±9 → 最宽 ±30 → 底尖 ±2
  const widthAt = y => {
    if (y <= -20) return 9 + ((y + 56) / 36) * 21
    if (y <= 10) return 30 - ((y + 20) / 30) * 2
    return 28 - ((y - 10) / 36) * 26
  }
  const level = 42 - ratio * 86
  const w = widthAt(Math.max(-54, Math.min(40, level)))
  const halfBottom = widthAt(42)
  add(group,
    svg('rect', {x: -6, y: -76, width: 12, height: 9, rx: 2, class: 'cap'}),
    svg('path', {d: 'M-9-64H9V-56C28-44 33-16 28 6C24 26 14 40 2 46H-2C-14 40-24 26-28 6C-33-16-28-44-9-56Z', class: 'glass-body'}),
    ...(ratio > 0 && level > -54 ? [
      svg('path', {d: `M${-w} ${level}L${-halfBottom} 42Q0 49 ${halfBottom} 42L${w} ${level}Z`, fill: liquidColor(state, '#d9edf4'), class: 'liquid'}),
      svg('path', {d: `M${-w} ${level}Q0 ${level - 3} ${w} ${level}`, class: 'meniscus'}),
    ] : []),
    svg('path', {d: 'M-12-64H12M-10-60Q0-64 10-60', class: 'glass-rim'}),
    svg('path', {d: 'M-19-38C-24-16-22 8-12 26', class: 'glass-highlight'}),
    svg('circle', {cx: 0, cy: 62, r: 8, class: 'valve-hub'}),
    svg('path', {d: 'M-15 62H15', class: 'valve-handle'}),
    svg('path', {d: 'M-2.5 70V128M2.5 70V128', class: 'glass-rim'}),
    // 旋塞开启且有酸时管腿口滴落(与滴定管同款 CSS drip 动画)
    state.valve_open && !(state.__motion) && Number(state.volume_ml) > 0 ? svg('path', {d: 'M0 130c-4 6-4 9 0 12c4-3 4-6 0-12Z', fill: liquidColor(state), class: 'falling-drop'}) : null
  )
  return withLabel(group, entity, -90)
}

// 双孔塞 + 弯形玻璃导管: 锥形瓶 → 烧杯.conducting 时管内气流虚线流动, 出口冒泡
export function renderDeliveryTube(entity, state) {
  const group = svg('g')
  const conducting = Boolean(state.conducting)
  const glassPath = 'M16-10L34-48Q40-56 50-56L396-56Q410-56 410-42V128'
  add(group,
    svg('path', {d: 'M-22-14H22L16 8H-16Z', fill: '#c9a06a', stroke: '#8a6a42', 'stroke-width': 1.6, class: 'stopper-body'}),
    svg('ellipse', {cx: 0, cy: -3, rx: 3.2, ry: 4.5, fill: '#8a6a42', opacity: 0.55}),
    svg('ellipse', {cx: 16, cy: -4, rx: 3.2, ry: 4.5, fill: '#8a6a42', opacity: 0.55}),
    svg('path', {d: glassPath, class: 'tube-glass'}),
    svg('path', {d: glassPath, class: 'tube-highlight'}),
    // 中段橡胶接段: 琥珀色(与 renderGasHolder 的橡胶管同色系; 证据帧为黄色而非红色)
    svg('path', {d: 'M150-56H206', fill: 'none', stroke: '#c9973f', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.92, class: 'rubber-tube'}),
    svg('path', {d: 'M151-58H205', fill: 'none', stroke: '#e6c088', 'stroke-width': 1.8, 'stroke-linecap': 'round', opacity: 0.8}),
    conducting ? svg('path', {d: glassPath, class: 'tube-flow'}) : null,
    conducting ? [0, 1, 2].map(index => svg('circle', {cx: 410, cy: 122, r: 2.6 - index * 0.5, class: 'tube-bubble', style: `--d:${index * 0.45}s`})) : null
  )
  group.append(label(entity.label, 223, -74))
  return group
}

export function renderGasHolder(entity, state) {
  // 储气瓶(02 一氧化碳燃烧, frame-003~007): 下储水瓶 + 球形储气球(内可见液封)+
  // 侧管玻璃旋塞(valve_open 驱动手柄旋转)+ 乳胶管 + 尖嘴玻璃出口(lit 时浅蓝色 CO 火焰)
  const group = svg('g')
  const open = Boolean(state.valve_open)
  const lit = Boolean(state.lit)
  const handle = svg('g', {transform: `rotate(${open ? 90 : 0} 38 -84)`})
  add(handle,
    svg('path', {d: 'M38 -84L38 -104', class: 'metal-bracket-hook'}),
    svg('circle', {cx: 38, cy: -106, r: 2.8, class: 'metal'}),
  )
  add(group,
    shadow(0, 36, 52, 8),
    // 下瓶: 储水瓶(底部水封)
    svg('path', {d: 'M-30-44L-30 26Q-30 34-22 34L22 34Q30 34 30 26L30-44Q30-50 24-50L-24-50Q-30-50-30-44Z', class: 'glass-body'}),
    svg('path', {d: 'M-26 8H26V26Q26 30 21 30H-21Q-26 30-26 26Z', fill: '#cfe8f0', class: 'liquid'}),
    svg('path', {d: 'M-26 8Q0 5 26 8', class: 'meniscus'}),
    // 中央导管: 伸入水封
    svg('path', {d: 'M-3.5-70V18M3.5-70V18', class: 'tube-glass', 'stroke-width': 2.6}),
    // 瓶颈与磨口塞
    svg('path', {d: 'M-11-70H11L11-50H-11Z', class: 'glass-body'}),
    svg('path', {d: 'M-14-88H14L14-68H-14Z', class: 'glass-body'}),
    svg('path', {d: 'M-14-83H14M-14-78H14M-14-73H14', fill: 'none', stroke: '#41626b', 'stroke-width': 0.8, opacity: 0.45}),
    // 球形储气球(液封约半球, frame-004~007 可见液面)
    svg('path', {d: 'M-40-136A40 40 0 1 0 40-136A40 40 0 0 0-40-136Z', class: 'glass-body'}),
    svg('path', {d: 'M-38-134A38 38 0 0 0 38-134Z', fill: '#cfe8f0', opacity: 0.8, class: 'liquid'}),
    svg('path', {d: 'M-38-134Q0-139 38-134', class: 'meniscus'}),
    // 侧管: 颈侧 → 旋塞壳 → 弯头 → 乳胶管 → 尖嘴玻璃管
    svg('path', {d: 'M11-84H30', class: 'tube-glass'}),
    svg('path', {d: 'M38-95L49-84L38-73L27-84Z', class: 'glass-body'}),
    svg('path', {d: 'M49-84H64Q72-84 76-76L84-60', class: 'tube-glass'}),
    svg('path', {d: 'M84-60Q104-42 106-8', fill: 'none', stroke: '#c9973f', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.92, class: 'rubber-tube'}),
    svg('path', {d: 'M85-62Q102-46 103-14', fill: 'none', stroke: '#e6c088', 'stroke-width': 1.8, 'stroke-linecap': 'round', opacity: 0.8}),
    svg('path', {d: 'M106-8L114-30', class: 'tube-glass', 'stroke-width': 4.5}),
    svg('path', {d: 'M107.5-11L113.5-27', class: 'tube-highlight'}),
    handle,
    // 尖嘴口浅蓝色 CO 火焰(frame-009: 细长, 淡蓝, 微右倾)
    lit ? svg('path', {d: 'M114-30Q107-46 111-58Q113-65 115-58Q120-46 117-34Q116-30 114-30Z', fill: '#7db8ff', opacity: 0.8, class: 'flame-outer'}) : null,
    lit ? svg('path', {d: 'M114-31Q110-42 112.5-50Q114-55 115.5-50Q118-42 116-34Z', fill: '#c9e2ff', class: 'flame-inner'}) : null,
    lit ? svg('path', {d: 'M114-32Q112.5-38 114-43Q115.5-38 114-32Z', fill: '#eef7ff', class: 'flame-core'}) : null,
  )
  return withLabel(group, entity, 58)
}

export function renderMatch(entity, state) {
  // Match(02 一氧化碳燃烧, frame-008~009): 木杆 + 深色火柴头, lit 时头端三层火焰
  const group = svg('g')
  const lit = Boolean(state.lit)
  add(group,
    shadow(0, 22, 12, 3),
    svg('path', {d: 'M-2-6L-2 18Q-2 20 0 20Q2 20 2 18L2-6Z', fill: '#e3c193', stroke: '#b09468', 'stroke-width': 1, class: 'match-stick'}),
    svg('path', {d: 'M-0.6-2V14', fill: 'none', stroke: '#c9a97e', 'stroke-width': 0.8, opacity: 0.9}),
    svg('ellipse', {cx: 0, cy: -8, rx: 3.4, ry: 4.6, fill: '#4a3a33', stroke: '#2e241f', 'stroke-width': 0.8, class: 'match-head'}),
    lit ? svg('path', {d: 'M0-12Q-5.5-20-3.6-27Q-1.8-32.5 0-31Q1.8-32.5 3.6-27Q5.5-20 0-12Z', fill: '#ff9f43', class: 'flame-outer'}) : null,
    lit ? svg('path', {d: 'M0-13Q-3-19-1.8-24Q-0.8-28 0-26.8Q0.8-28 1.8-24Q3-19 0-13Z', fill: '#ffd54d', class: 'flame-inner'}) : null,
    lit ? svg('path', {d: 'M0-15Q-1.4-19-0.8-22Q-0.4-23.6 0-22.8Q0.4-23.6 0.8-22Q1.4-19 0-15Z', fill: '#fff8d6', class: 'flame-core'}) : null,
  )
  return withLabel(group, entity, 34)
}

export function renderElectronicScale(entity, state) {
  const group = svg('g')
  const reading = Number(state.reading_g ?? 0)
  add(group,
    shadow(0, 36, 48, 7),
    svg('rect', {x: -46, y: -4, width: 92, height: 40, rx: 5, class: 'scale-case'}),
    svg('rect', {x: -42, y: 0, width: 84, height: 6, rx: 2, class: 'scale-vent'}),
    svg('ellipse', {cx: 0, cy: -9, rx: 36, ry: 8, class: 'scale-pan'}),
    svg('ellipse', {cx: 0, cy: -11, rx: 30, ry: 6, class: 'scale-pan-top'}),
    svg('rect', {x: -38, y: 16, width: 46, height: 15, rx: 2, class: 'lcd-screen'}),
    svg('rect', {x: 14, y: 16, width: 12, height: 15, rx: 2, class: 'scale-button'}),
    svg('rect', {x: 29, y: 16, width: 12, height: 15, rx: 2, class: 'scale-button alt'}),
  )
  const digits = svg('text', {x: -15, y: 28, 'text-anchor': 'middle', class: 'lcd-text'})
  digits.textContent = reading > 0 ? reading.toFixed(1) : '0.0'
  const unit = svg('text', {x: 2, y: 28, class: 'lcd-unit'})
  unit.textContent = 'g'
  group.append(digits, unit)
  return withLabel(group, entity, 52)
}

export function renderWeighingPaper(entity, state) {
  const group = svg('g')
  const coarse = Number(state.salt_mass_g || 0)
  const refined = Number(state.refined_g || 0)
  add(group,
    shadow(0, 16, 42, 5),
    svg('ellipse', {cx: 0, cy: 4, rx: 42, ry: 13, class: 'paper-sheet'}),
    svg('ellipse', {cx: 0, cy: 1, rx: 42, ry: 13, class: 'paper-rim'}),
  )
  const mass = coarse > 0 ? coarse : refined
  if (mass > 0) {
    const count = Math.min(30, 8 + Math.round(mass * 4))
    for (let index = 0; index < count; index += 1) {
      const angle = (index * 137.5) % 360 * Math.PI / 180
      const radius = (index % 5) * 3.2 + 2
      group.append(svg('circle', {
        cx: Math.cos(angle) * radius * 1.6,
        cy: Math.sin(angle) * radius * 0.55 + 1,
        r: refined > 0 ? 1.9 : 1.5,
        fill: refined > 0 ? '#fbfdff' : '#cfc2a6',
        stroke: refined > 0 ? '#cdd8da' : '#b3a482',
        'stroke-width': 0.5,
        class: refined > 0 ? 'crystal' : 'salt-grain',
      }))
    }
  }
  return withLabel(group, entity, 34)
}

export function renderGlassRod(entity) {
  const group = svg('g')
  add(group,
    shadow(6, 54, 14, 4),
    svg('rect', {x: -2.6, y: -54, width: 5.2, height: 104, rx: 2.6, class: 'glass-body'}),
    svg('path', {d: 'M-0.8-48V42', class: 'glass-highlight'}),
    svg('path', {d: 'M-2.6-52Q0-56 2.6-52M-2.6 48Q0 52 2.6 48', class: 'glass-rim'}),
  )
  return withLabel(group, entity, 70)
}

export function renderIronStand(entity) {
  const group = svg('g')
  add(group,
    shadow(0, 68, 66, 7),
    svg('rect', {x: -32, y: 54, width: 64, height: 10, rx: 2, class: 'stand-base'}),
    svg('path', {d: 'M0 54V-74', class: 'stand'}),
    svg('path', {d: 'M0 8H46', class: 'clamp'}),
    svg('circle', {cx: 4, cy: 8, r: 5.5, class: 'clamp-knob'}),
    svg('path', {d: 'M0-26H-32', class: 'clamp'}),
    svg('circle', {cx: -4, cy: -26, r: 5.5, class: 'clamp-knob'}),
    svg('ellipse', {cx: -48, cy: -26, rx: 21, ry: 6, class: 'iron-ring'}),
    svg('ellipse', {cx: -48, cy: -28, rx: 21, ry: 6, fill: 'none', stroke: '#3d4a4d', 'stroke-width': 1, class: 'iron-ring-rim'}),
  )
  return withLabel(group, entity, 86)
}

export function renderEvaporatingDish(entity, state) {
  // 双层组: 外层定位, 内层承接 .reacting 抖动(与模板其余 vessel 渲染器保持一致)
  const group = svg('g')
  const reacting = reactingGroup(state)
  const ratio = liquidRatio(entity, state)
  const crystals = Number(state.crystals_g || 0)
  const info = state.__reaction
  let rows = 0
  if (crystals > 0) {
    rows = 3
  } else if (info && info.running) {
    rows = info.progress >= 85 ? 3 : info.progress >= 65 ? 2 : info.progress >= 45 ? 1 : 0
  }
  const crystalRows = rows => {
    const nodes = []
    if (rows >= 1) nodes.push(svg('ellipse', {cx: 0, cy: -6, rx: 26, ry: 5.5, fill: '#f8fafb', stroke: '#cdd8da', 'stroke-width': 0.8, class: 'ceramic-crystals'}))
    if (rows >= 2) nodes.push(svg('ellipse', {cx: -8, cy: -7, rx: 9, ry: 3, fill: '#ffffff', class: 'ceramic-crystals'}))
    if (rows >= 3) nodes.push(svg('ellipse', {cx: 9, cy: -5, rx: 8, ry: 2.6, fill: '#ffffff', class: 'ceramic-crystals'}))
    return nodes
  }
  add(reacting,
    shadow(0, 16, 40, 5),
    svg('path', {d: 'M-40-14L-36 8Q-34 14-26 14H26Q34 14 36 8L40-14', class: 'ceramic'}),
    svg('path', {d: 'M-42-16Q-44-8-38-9L-36-6Z', class: 'ceramic'}),
    ratio > 0 ? svg('ellipse', {cx: 0, cy: -8, rx: 33, ry: 7, fill: liquidColor(state, '#e6f4f8'), class: 'liquid'}) : null,
    ratio > 0 ? svg('ellipse', {cx: 0, cy: -8, rx: 33, ry: 7, fill: 'none', stroke: 'rgb(34 85 98 / 50%)', 'stroke-width': 1.2, class: 'meniscus'}) : null,
    ...crystalRows(rows),
    svg('ellipse', {cx: 0, cy: -14, rx: 40, ry: 6.5, fill: 'none', stroke: '#b9c2c4', 'stroke-width': 2, class: 'ceramic-rim'}),
    reactionOverlay(state, 52, -16, 8)
  )
  group.append(reacting)
  return withLabel(group, entity, 34)
}

export function renderAlcoholLamp(entity, state) {
  const group = svg('g')
  const lit = Boolean(state.valve_open)
  add(group,
    shadow(0, 34, 22, 5),
    svg('path', {d: 'M-16 20Q-20 30-14 34H14Q20 30 16 20Z', class: 'lamp-base'}),
    svg('path', {d: 'M-14 6Q-18 14-14 20H14Q18 14 14 6Z', fill: 'rgb(200 228 232 / 45%)', stroke: '#5f7d84', 'stroke-width': 1.6, class: 'lamp-tank'}),
    svg('ellipse', {cx: 0, cy: 6, rx: 14, ry: 4, fill: '#cfe4e8', stroke: '#5f7d84', 'stroke-width': 1.4, class: 'lamp-collar'}),
    svg('rect', {x: -3, y: -10, width: 6, height: 16, rx: 2, class: 'wick'}),
    lit ? svg('path', {d: 'M0-30Q-6-20-4-12Q-2-8 0-10Q2-8 4-12Q6-20 0-30Z', fill: '#ff8f3d', class: 'flame-outer'}) : null,
    lit ? svg('path', {d: 'M0-26Q-3-19-2-12Q0-9 2-12Q3-19 0-26Z', fill: '#ffd54d', class: 'flame-inner'}) : null,
    lit ? svg('path', {d: 'M0-21Q-1.5-17-1-13Q0-11.5 1-13Q1.5-17 0-21Z', fill: '#fff8d6', class: 'flame-core'}) : null,
  )
  return withLabel(group, entity, 50)
}

export function renderFallback(entity) {
  return withLabel(add(svg('g'), shadow(0, 27, 25, 6), svg('circle', {r: 25, class: 'fallback-body'})), entity, 45)
}
