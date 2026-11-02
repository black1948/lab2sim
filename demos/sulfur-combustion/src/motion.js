// 通用动作动画层(motion layer): 让“拖拽→吸附→执行”不再是瞬时可步.
// 设计约束(泛化性优先, 不绑定任何具体案例): 
// 1. 不改变 engine 语义  -  动画只是 commit 前的视觉预演: 先 dispatch 拿到 outcome, 
//    再逐帧把手势姿态 + 状态数值补间画出来, 最后一次性提交 outcome.state.
// 2. 姿态原语(pour/drip/stir/settle)按 action.type 与器材 kind 给默认值
//    (滴管/移液管/滴定管默认垂直 drip), 可被 IR 动作级 motion 字段覆盖
//    ({kind,duration_ms,tilt_deg,revs,lift,stream,easing}, kind:'none' 关闭; 
//    easing 仅作用于数值补间: linear/ease-in-out/back-out, 缺省 linear).
// 3. 数值补间是通用的: 对 dispatch 前后状态做结构化 diff, 数字与同格式 hex 颜色逐帧插值, 
//    布尔/字符串等不可插值字段在 commit 时跳变(与旧行为一致).
// 4. 延时反应(pending batches)期间, result_effects 中可插值字段按反应进度推进, 
//    让“液面下降/固体析出”跟随进度条而非结束后瞬变.
// 5. prefers-reduced-motion: reduce 时整体旁路, 回退到瞬时可步.

import {liquidRatio, svg} from './renderers/svg.js'

// 运行时读取(而非模块加载时快照): headless Chrome 默认 prefers-reduced-motion: reduce, 
// 验证/自动化可通过 Emulation 或 setMotionOverride(false) 显式启用动画.
let motionOverride = null
export function setMotionOverride(value) { motionOverride = value }

export function motionEnabled() {
  if (motionOverride !== null) return motionOverride
  return !(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
}

export const STREAM_WINDOW = {from: 0.28, to: 0.85}

const easeInOutCubic = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const easeOutCubic = p => 1 - Math.pow(1 - p, 3)

// 数值补间缓动: 默认 linear(与旧行为一致); IR 动作 motion.easing 可按需声明 - 
// 物理受载类过程用 back-out(轻微过冲后回落)表达弹性形变的加载感.
// 姿态原语(pourPose/settlePose 等)自带包络, 不经过这里.
export const EASINGS = {
  linear: p => p,
  'ease-in-out': p => easeInOutCubic(p),
  'back-out': p => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2)
  },
}

export function applyEasing(name, p) {
  const fn = EASINGS[name] || EASINGS.linear
  return fn(clamp01(p))
}

//  -  器材几何锚点(局部坐标, 与 renderers 的绘制坐标一致; surfaceY 为液面局部高度) - 
// spout 是液流起点: 倾倒类器材取口/嘴中心(对左右两个倾斜方向对称), 垂直滴加类取出口尖端.
// level 液面随体积变化时给 {top, span}(与渲染器同一公式); 固定液柱(瓶/滴管/移液管)span 给 0, 
// surfaceY 恒等于所画液柱顶.vertical: true 表示靠出口垂直出液(默认 drip 手势, 不整体倾斜).
const GEOMETRY = {
  beaker: {mouth: {x: 0, y: -35}, spout: {x: 31, y: -30}, halfWidth: 25, level: {top: 30, span: 66}},
  conical_flask: {mouth: {x: 0, y: -48}, spout: {x: 14, y: -30}, halfWidth: 30, level: {top: 37, span: 58}},
  cylinder: {mouth: {x: 0, y: -52}, spout: {x: 16, y: -46}, halfWidth: 12, level: {top: 46, span: 91}},
  test_tube: {mouth: {x: 0, y: -52}, spout: {x: 10, y: -46}, halfWidth: 8, level: {top: 42, span: 82}},
  reagent_bottle: {mouth: {x: 0, y: -43}, spout: {x: 0, y: -43}, halfWidth: 28, level: {top: 8, span: 0}},
  burette: {mouth: {x: 0, y: 91}, spout: {x: 0, y: 91}, halfWidth: 13, level: {top: 43, span: 113}, vertical: true},
  dropper: {mouth: {x: 0, y: 44}, spout: {x: 0, y: 44}, halfWidth: 7, level: {top: -17, span: 0}, vertical: true},
  pipette: {mouth: {x: 0, y: 51}, spout: {x: 0, y: 51}, halfWidth: 7, level: {top: -37, span: 0}, vertical: true},
  watch_glass: {mouth: {x: 0, y: -6}, spout: {x: 26, y: -4}, halfWidth: 24, surfaceY: -2},
  evaporating_dish: {mouth: {x: 0, y: -10}, spout: {x: 28, y: -8}, halfWidth: 28, surfaceY: -6},
  funnel: {mouth: {x: 0, y: -18}, halfWidth: 26, surfaceY: -12},
  // 球形分液漏斗: 活塞开启后自管腿尖端垂直滴加(不整体倾斜), level 与渲染器同一公式
  separating_funnel: {mouth: {x: 0, y: -76}, spout: {x: 0, y: 128}, halfWidth: 30, level: {top: 42, span: 86}, vertical: true},
  electronic_scale: {mouth: {x: 0, y: -24}, halfWidth: 19, surfaceY: -24},
  alcohol_lamp: {mouth: {x: 0, y: -16}, halfWidth: 12, surfaceY: -14},
  evap_stand: {mouth: {x: 0, y: 0}, halfWidth: 18, surfaceY: 0},
  glass_rod: {mouth: {x: 0, y: 0}, halfWidth: 30, surfaceY: 0},
  // 324 案例器材: C 管/离心管/试剂瓶随体积变液位(level 与渲染器同一公式), 
  // 滤网落点取锥面筛网, 仪器类取插槽口
  c_tube: {mouth: {x: 0, y: -30}, spout: {x: 0, y: -30}, halfWidth: 15, level: {top: 28, span: 54}},
  centrifuge_tube: {mouth: {x: 0, y: -48}, spout: {x: 0, y: -48}, halfWidth: 11, level: {top: 54, span: 96}},
  reagent_vial: {mouth: {x: 0, y: -24}, spout: {x: 0, y: -24}, halfWidth: 10, level: {top: 22, span: 40}},
  cell_strainer: {mouth: {x: 0, y: -16}, halfWidth: 24, surfaceY: -4},
  tissue_dissociator: {mouth: {x: 0, y: -24}, halfWidth: 14, surfaceY: -24},
  tube_rotator: {mouth: {x: 0, y: -33}, halfWidth: 12, surfaceY: -33},
  centrifuge: {mouth: {x: 0, y: -30}, halfWidth: 15, surfaceY: -30},
  tissue_sample: {mouth: {x: 0, y: -8}, halfWidth: 10, surfaceY: 0},
}
const DEFAULT_GEOMETRY = {mouth: {x: 0, y: -20}, spout: {x: 20, y: -16}, halfWidth: 20, surfaceY: 0}

export function geometryFor(kind, entity, state) {
  const geo = GEOMETRY[kind] || DEFAULT_GEOMETRY
  if (!geo.level) return geo
  // 与渲染器同一液面公式(liquidRatio), 保证流点/落点贴合真实液位
  const ratio = liquidRatio(entity, state)
  return {...geo, surfaceY: geo.level.top - ratio * geo.level.span}
}

//  -  手势规划: action.type + 器材 kind → 姿态原语; IR action.motion 可整体覆盖  - 
// 介质(medium)与姿态解耦: 倾倒液体/颗粒/气体是同一个手臂动作, 不同的介质语义.
// 介质解析优先级: IR motion.stream.medium 显式声明 > 器材 properties.physical_state > 旧启发式
// (体积<=0 且为表面皿/盐类 → granular, 否则 liquid).
export const MEDIUMS = ['liquid', 'granular', 'gas', 'mist']

export function mediumFor(actor, motion) {
  const declared = motion?.stream?.medium
  if (typeof declared === 'string' && MEDIUMS.includes(declared)) return declared
  const physical = actor?.properties?.physical_state
  if (physical === 'gas') return 'gas'
  if (physical === 'mist' || physical === 'aerosol') return 'mist'
  if (physical === 'solid') return 'granular'
  if (physical === 'liquid') return 'liquid'
  return null
}

export function planMotion(ir, action, state) {
  const motion = action.motion || {}
  if (motion.kind === 'none') return null
  const actor = ir.entities.find(item => item.id === action.actor)
  if (!actor) return null
  const kind = actor.kind
  const actorState = state?.[action.actor] || {}
  if (['transfer', 'add_drop', 'dispense'].includes(action.type)) {
    const granular = Number(actorState.volume_ml || 0) <= 0
      && (kind === 'watch_glass' || Number(actorState.salt_g || 0) > 0)
    // 垂直出液器材(GEOMETRY.vertical: 滴管/移液管/滴定管)靠出口悬滴, 不整体倾斜; 倾倒类容器抬升悬停后再倾斜
    const vertical = Boolean((GEOMETRY[kind] || DEFAULT_GEOMETRY).vertical)
    const medium = mediumFor(actor, motion) ?? (granular ? 'granular' : 'liquid')
    // 气体倾倒(如倾倒二氧化碳): 倾角更缓, 动作更慢, 液流为近不可见的雾状流
    const gas = medium === 'gas'
    return {
      kind: motion.kind || (vertical ? 'drip' : 'pour'),
      duration_ms: motion.duration_ms ?? (vertical ? 1200 : gas ? 2000 : granular ? 1500 : 1400),
      tilt_deg: motion.tilt_deg ?? (vertical ? 0 : gas ? 46 : 62),
      lift: motion.lift ?? (vertical ? 0 : gas ? 22 : 16),
      medium,
      // IR 显式 stream 只覆盖其给出的键, 其余用默认(drops 默认跟随垂直手势)
      stream: {
        color: motion.stream?.color || (gas ? '#a9bfca' : granular ? '#e9e2cf' : (actorState.color || '#a9dcea')),
        granular: motion.stream?.granular ?? (medium === 'granular'),
        drops: motion.stream?.drops ?? vertical,
        medium,
      },
    }
  }
  if (action.type === 'place_above') {
    if (motion.kind === 'stir' || kind === 'glass_rod') {
      return {kind: 'stir', duration_ms: motion.duration_ms ?? 2000, revs: motion.revs ?? 2.5, easing: motion.easing}
    }
    return {kind: 'settle', duration_ms: motion.duration_ms ?? 450, easing: motion.easing}
  }
  return null
}

//  -  姿态原语: 返回 {tilt, dx, dy}(renderStage 叠加进 transform) - 
export function pourPose(plan, p, sign = 1) {
  const envelope = p < 0.2 ? easeOutCubic(p / 0.2) : p > 0.82 ? easeInOutCubic((1 - p) / 0.18) : 1
  // 抬升与倾斜共用包络: 边抬边倾, 先回正再落回; anchor.dx 同步包络把器嘴平移到目标口轴线上, 
  // 保证液流从目标口落入而不是斜穿器壁
  const lift = Math.max(Number(plan.lift || 0), Number(plan.anchor?.lift || 0))
  return {tilt: plan.tilt_deg * envelope * sign, dx: Number(plan.anchor?.dx || 0) * envelope, dy: -lift * envelope}
}

// 满倾角时器嘴须高于目标口的最小间隙(舞台单位)
const MOUTH_CLEARANCE = 14

//  -  倾倒锚点: 满倾角时把器嘴对准目标口轴线  - 
// 不修正时器嘴随倾斜横摆(如试剂瓶 58° 摆出 ~40 单位), 液流从器嘴斜落到目标轴心的液面, 
// 中途穿过目标器壁 - 不符合从口倒入的物理常识.dx 抵消横摆; 悬停高度不足时由 lift 补足.
// 返回舞台单位的 {dx, lift}, 由 pourPose 按包络施加.
export function pourAnchor(plan, actorGeo, targetGeo, {sign = 1, gapPx = 0, actorScale = 1, targetScale = 1, targetRotationDeg = 0} = {}) {
  const spout = actorGeo.spout || {x: 20, y: -16}
  const mouth = targetGeo.mouth || {x: 0, y: -20}
  const rad = (Number(plan.tilt_deg || 0) * sign * Math.PI) / 180
  const targetRad = (Number(targetRotationDeg) * Math.PI) / 180
  const spoutX = (spout.x * Math.cos(rad) - spout.y * Math.sin(rad)) * actorScale
  const spoutY = (spout.x * Math.sin(rad) + spout.y * Math.cos(rad)) * actorScale
  const mouthX = (mouth.x * Math.cos(targetRad) - mouth.y * Math.sin(targetRad)) * targetScale
  const mouthY = (mouth.x * Math.sin(targetRad) + mouth.y * Math.cos(targetRad)) * targetScale
  // 局部 y 向下: spoutY > mouthY 说明出口已伸入目标口内(分液漏斗/滴定管等垂直滴加类的
  // 装配态), 液流本就从出口落入容器 - 清障抬升会把器材拔出瓶口, 此时不再补 lift.
  const inserted = spoutY - mouthY > 0
  const liftNeeded = inserted ? 0 : Math.max(0, MOUTH_CLEARANCE - (gapPx + mouthY - spoutY))
  return {dx: mouthX - spoutX, lift: liftNeeded}
}

export function stirPose(plan, p, radius = 16) {
  const theta = 2 * Math.PI * plan.revs * easeInOutCubic(p)
  return {tilt: 6 * Math.sin(theta), dx: radius * Math.cos(theta), dy: 0.32 * radius * Math.sin(theta)}
}

export function settlePose(p) {
  return {dy: -14 * (1 - easeOutCubic(p))}
}

export function streamProgress(p) {
  const {from, to} = STREAM_WINDOW
  return clamp01((p - from) / (to - from))
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

//  -  状态 diff 与补间: 数字与同格式 hex 颜色可插值, 其余在 commit 时跳变  - 
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export function numericDiffs(before, after) {
  const diffs = []
  for (const [id, entityBefore] of Object.entries(before || {})) {
    const entityAfter = after?.[id]
    if (!entityAfter || typeof entityBefore !== 'object' || typeof entityAfter !== 'object') continue
    for (const [key, value] of Object.entries(entityBefore)) {
      if (key.startsWith('__') || !(key in entityAfter)) continue
      const next = entityAfter[key]
      if (typeof value === 'number' && typeof next === 'number' && value !== next) {
        diffs.push({id, key, from: value, to: next})
      } else if (typeof value === 'string' && typeof next === 'string' && value !== next
        && HEX.test(value) && HEX.test(next) && value.length === next.length) {
        diffs.push({id, key, from: value, to: next, color: true})
      }
    }
  }
  return diffs
}

function hexChannels(value) {
  const raw = value.slice(1)
  const expanded = raw.length <= 4 ? [...raw].map(ch => ch + ch).join('') : raw
  const channels = [0, 2, 4].map(index => parseInt(expanded.slice(index, index + 2), 16))
  channels.push(expanded.length >= 8 ? parseInt(expanded.slice(6, 8), 16) : 255)
  return channels
}

export function lerpHex(a, b, t) {
  const ca = hexChannels(a)
  const cb = hexChannels(b)
  const rgb = ca.slice(0, 3).map((channel, index) => Math.round(channel + (cb[index] - channel) * t))
  const alphaPart = a.length === 9
    ? Math.round(ca[3] + (cb[3] - ca[3]) * t).toString(16).padStart(2, '0')
    : ''
  return `#${rgb.map(channel => channel.toString(16).padStart(2, '0')).join('')}${alphaPart}`
}

export function applyLerp(state, diffs, p) {
  diffs.forEach(diff => {
    const target = state?.[diff.id]
    if (!target || typeof target !== 'object') return
    target[diff.key] = diff.color ? lerpHex(diff.from, diff.to, p) : diff.from + (diff.to - diff.from) * p
  })
}

export function setPath(state, path, value) {
  const parts = path.split('.')
  const leaf = parts.pop()
  const node = parts.reduce((acc, key) => (acc == null ? undefined : acc[key]), state)
  if (node && typeof node === 'object') node[leaf] = value
}

//  -  延时反应的数值推进: 为每个 batch 记录可插值字段的起止值  - 
// starts[path] = {from, to}: 'set' 的 to 即目标值; 'add' 的 to = 当前值 + 增量(增量
// 效果同样随反应进度插值, 且只落地一次 - finalizeReaction 只应用 starts 里登记的字段, 
// 批次边界只应用未登记的布尔/枚举效果, 见 app.js tickReaction; 此前 'add' 不入 starts, 
// 边界与 finalize 各应用一次导致数值被双重扣减(14 案例验证组阻断缺陷).
export function reactionStarts(batches, state) {
  return (batches || []).map(batch => {
    const starts = {}
    batch.effects.forEach(effect => {
      if (effect.op !== 'set' && effect.op !== 'add') return
      const [id, key] = effect.path.split('.')
      const current = state?.[id]?.[key]
      if (typeof effect.value === 'number') {
        const from = Number(current || 0)
        starts[effect.path] = {from, to: effect.op === 'add' ? from + effect.value : effect.value}
      } else if (effect.op === 'set' && typeof effect.value === 'string' && HEX.test(effect.value)
        && typeof current === 'string' && HEX.test(current) && current.length === effect.value.length) {
        starts[effect.path] = {from: current, to: effect.value}
      }
    })
    return {...batch, starts}
  })
}

// ratios 与 batches 同序: 每条 batch 用自己的进度插值
export function interpolateReaction(state, batches, ratios) {
  batches.forEach((batch, index) => {
    const ratio = clamp01(ratios[index] ?? 0)
    Object.entries(batch.starts || {}).forEach(([path, span]) => {
      if (!span || typeof span !== 'object') return
      setPath(state, path, typeof span.from === 'string'
        ? lerpHex(span.from, span.to, ratio)
        : Number(span.from) + (Number(span.to) - Number(span.from)) * ratio)
    })
  })
}

//  -  rAF 时间线(可取消) - 
export function createTimeline(durationMs, onFrame) {
  let cancelled = false
  let handle = 0
  const done = new Promise(resolve => {
    const startedAt = performance.now()
    const tick = now => {
      if (cancelled) return resolve()
      const p = Math.min(1, (now - startedAt) / Math.max(1, durationMs))
      onFrame(p)
      if (p < 1) handle = requestAnimationFrame(tick)
      else resolve()
    }
    handle = requestAnimationFrame(tick)
  })
  return {done, cancel() { cancelled = true; cancelAnimationFrame(handle) }}
}

//  -  #fx 层: 液流/颗粒流  - 
export function clearFx(fxLayer) {
  if (fxLayer) fxLayer.replaceChildren()
}

export function drawStream(fxLayer, from, to, {color = '#a9dcea', granular = false, drops = false, medium} = {}, seconds = 0) {
  if (!fxLayer) return
  clearFx(fxLayer)
  if (medium === 'gas' || medium === 'mist') {
    drawGasStream(fxLayer, from, to, {color, mist: medium === 'mist'}, seconds)
    return
  }
  const dip = {x: from.x + (to.x - from.x) * 0.18, y: from.y + (to.y - from.y) * 0.55}
  const path = `M${from.x.toFixed(1)} ${from.y.toFixed(1)}Q${dip.x.toFixed(1)} ${dip.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`
  const group = svg('g', {class: 'motion-stream'})
  // drops: 逐滴样式(短虚线+圆头线帽呈液滴链, 滴定管/滴管悬滴用)
  group.append(svg('path', {
    d: path, fill: 'none', stroke: color, 'stroke-width': granular ? 5 : drops ? 4.5 : 3.6,
    'stroke-linecap': 'round', opacity: granular ? 0.9 : 0.72,
    'stroke-dasharray': granular ? '2.5 8' : drops ? '4 13' : '11 7',
    'stroke-dashoffset': String(-seconds * (granular ? 70 : drops ? 55 : 120)),
  }))
  if (!granular && !drops) {
    group.append(svg('path', {d: path, fill: 'none', stroke: '#ffffff', 'stroke-width': 1.2, opacity: 0.35, 'stroke-dasharray': '6 9', 'stroke-dashoffset': String(-seconds * 160)}))
  }
  group.append(svg('ellipse', {cx: to.x.toFixed(1), cy: to.y.toFixed(1), rx: (7 + 2.5 * Math.sin(seconds * 7)).toFixed(1), ry: 2.2, fill: color, opacity: 0.4}))
  fxLayer.append(group)
}

// 气体/雾状流: 倾倒比空气重的气体(如 CO₂)时, 流本身近不可见 - 用多层半透明雾带
// 沿同一路径缓慢下坠, 落点处一团扩散的淡雾沉入目标口; 目标内的积聚由 gas_level 状态
// 驱动渲染(跟随手势进度插值), 不在这里画.mist(喷雾/烟)比 gas 稍浓且上飘.
export function drawGasStream(fxLayer, from, to, {color = '#a9bfca', mist = false} = {}, seconds = 0) {
  const group = svg('g', {class: 'motion-stream gas'})
  const dip = {x: from.x + (to.x - from.x) * 0.3, y: from.y + (to.y - from.y) * 0.62}
  const wisps = [
    {w: 7.5, opacity: mist ? 0.26 : 0.18, drift: 12},
    {w: 5, opacity: mist ? 0.34 : 0.24, drift: -9},
    {w: 3, opacity: mist ? 0.42 : 0.3, drift: 6},
  ]
  wisps.forEach(({w, opacity, drift}, index) => {
    const wobble = Math.sin(seconds * 2.2 + index * 2.1) * drift
    const control = {x: dip.x + wobble, y: dip.y + (mist ? -10 : 8) * index}
    const d = `M${from.x.toFixed(1)} ${from.y.toFixed(1)}Q${control.x.toFixed(1)} ${control.y.toFixed(1)} ${(to.x + wobble * 0.3).toFixed(1)} ${to.y.toFixed(1)}`
    group.append(svg('path', {
      d, fill: 'none', stroke: color, 'stroke-width': w,
      'stroke-linecap': 'round', opacity,
      'stroke-dasharray': '2 10',
      'stroke-dashoffset': String(-seconds * 26),
    }))
  })
  // 落点: 一团缓慢起伏的淡雾沉向目标口内(重气体下沉, 雾则略升)
  const hazeY = to.y + (mist ? -4 : 6)
  group.append(svg('ellipse', {
    cx: to.x.toFixed(1), cy: hazeY.toFixed(1),
    rx: (14 + 3 * Math.sin(seconds * 3.1)).toFixed(1), ry: (5.5 + 1.2 * Math.sin(seconds * 2.3)).toFixed(1),
    fill: color, opacity: mist ? 0.3 : 0.22,
  }))
  group.append(svg('ellipse', {
    cx: to.x.toFixed(1), cy: (hazeY + 7).toFixed(1),
    rx: (9 + 2 * Math.sin(seconds * 2.6 + 1.4)).toFixed(1), ry: 3.2,
    fill: color, opacity: 0.14,
  }))
  fxLayer.append(group)
}
