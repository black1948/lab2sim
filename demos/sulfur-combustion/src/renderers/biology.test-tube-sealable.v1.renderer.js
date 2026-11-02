//  -  可封口试管(biology.test-tube.v1 的封口/光照变体, 有状态视觉) - 
// 视觉依据: frame-005/013/014/015(细长玻璃试管, 管内清水约 1/3, 管口包半透明封口膜并
// 沿茎周收拢, 膜缘微超出管口); frame-038/039(实验后两管液位可对比, 封口膜仍在管口); 
// frame-019/021/024(户外阳光直射: 器身受暖光, 左侧受光面发亮).
// 风格依据: biology.js renderTestTube 的 svg-2.5d 玻璃画法原样承接(glass-body 杯体 /
// glass-rim 口沿 / glass-highlight 竖向高光 / liquid 液层 / meniscus 弯月面 /
// apparatus-shadow 接地阴影), 液位比例口径与既有 renderTestTube 一致
// (level = clamp(volume_ml/50, 0.2, 0.85), 液底 y=52, 液面 y=52-level*92); 
// 封口膜画法参照 physics.ring-vessel.v1 的覆口膜(glass-body 半透明膜面 + 淡高光); 
// 暖色光晕参照 biology.js renderIncubator 的 warm-glow/sterile-glow 低透明叠加画法.
// 状态绑定(IR visual.state_bindings): 
//   state.volume_ml → 液位(口径同 renderTestTube; 缺省 0=空管不画液体)
//   state.color     → 液体色(缺省 #B8D8E8)
//   state.sealed=true  → 管口覆盖半透明封口膜(包住管口沿, 膜缘微超出管壁, 
//                        中心收拢皱褶 - 茎为独立实体, 由场景 z 序叠在膜上方, frame-013)
//   state.in_sun=true  → 器身暖色光晕(左上受光晕圈 + 玻璃左壁暖光带, 低调不抢主体)
//   (state.observed 为检查器读数标记, 不落器身视觉, 与既有 renderTestTube 口径一致)
// 导出签名沿用既有模块先例: export function renderSealableTestTube(entity, state) 返回 SVG
// group; svg()/add()/label()/shadow() 在模块内自含最小实现(不 import biology.js).

const NS = 'http://www.w3.org/2000/svg'

function svg(tag, attributes = {}) {
  const node = document.createElementNS(NS, tag)
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value))
  })
  return node
}

function add(parent, ...children) {
  children.flat().filter(Boolean).forEach(child => parent.append(child))
  return parent
}

function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

function shadow(cx = 0, cy = 0, rx = 28, ry = 7) {
  return svg('ellipse', {cx, cy, rx, ry, class: 'apparatus-shadow'})
}

export function renderSealableTestTube(entity, state = {}) {
  const group = svg('g')
  const hasLiquid = Number(state.volume_ml || 0) > 0
  const liquidColor = state.color || '#B8D8E8'
  const sealed = Boolean(state.sealed)
  const inSun = Boolean(state.in_sun)

  add(group,
    shadow(0, 62, 16, 5),
    // 玻璃管体/口沿/高光: 与 biology.js renderTestTube 同一几何
    svg('path', {d: 'M-10-52H10L9 54Q9 62 0 62Q-9 62-9 54Z', class: 'glass-body'}),
    svg('path', {d: 'M-12-52H12M-9-48Q0-45 9-48', class: 'glass-rim'}),
    svg('path', {d: 'M-4-46V46', class: 'glass-highlight'}),
  )
  if (hasLiquid) {
    // 液位比例口径与既有 renderTestTube 完全一致
    const liquidLevel = Math.max(0.2, Math.min(0.85, Number(state.volume_ml || 0) / 50))
    const liquidBottom = 52
    const liquidTop = liquidBottom - liquidLevel * 92
    add(group,
      svg('path', {
        d: `M-8 ${liquidTop}Q0 ${liquidTop - 2} 8 ${liquidTop}V${liquidBottom - 6}Q8 ${liquidBottom} 0 ${liquidBottom}Q-8 ${liquidBottom} -8 ${liquidBottom - 6}Z`,
        fill: liquidColor,
        opacity: 0.7,
        class: 'liquid',
      }),
      svg('path', {d: `M-8 ${liquidTop}Q0 ${liquidTop - 3} 8 ${liquidTop}`, class: 'meniscus'}),
    )
  }
  if (inSun) {
    // 阳光直射: 左上暖色晕圈 + 玻璃左壁暖光带(frame-019/021 受光面发亮, 低调叠加)
    add(group,
      svg('ellipse', {cx: -7, cy: -18, rx: 26, ry: 44, fill: '#FFD54F', opacity: 0.12, class: 'sun-glow-outer'}),
      svg('ellipse', {cx: -6, cy: -16, rx: 16, ry: 32, fill: '#FFC64D', opacity: 0.12, class: 'sun-glow-inner'}),
      svg('path', {d: 'M-8 -44V40Q-8 48 -3 52L-1 52Q-5 46 -5 40L-5 -44Z', fill: '#FFC64D', opacity: 0.16, class: 'sun-glow-wall'}),
      svg('path', {d: 'M-12 -52H4', stroke: '#FFD180', 'stroke-width': 1, opacity: 0.7, 'stroke-linecap': 'round', class: 'sun-glow-rim'}),
    )
  }
  if (sealed) {
    // 管口封口膜: 半透明膜面包住口沿, 膜缘微超出管壁(±13.5 vs 管壁 ±10), 中心沿茎收拢
    add(group,
      svg('rect', {x: -13.5, y: -59, width: 27, height: 12.5, rx: 4, class: 'glass-body'}),
      svg('path', {d: 'M-13.5 -46.5Q0 -42.5 13.5 -46.5', fill: 'none', stroke: '#c3d4d9', 'stroke-width': 1, opacity: 0.85}),
      svg('path', {d: 'M-10 -56.5Q-4 -54.5 2 -56M4 -55.5Q8 -54 11 -55.5', fill: 'none', stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 0.9}),
      svg('ellipse', {cx: 0, cy: -52.5, rx: 4.6, ry: 2.8, fill: 'rgb(255 255 255 / 55%)', stroke: '#9fb6bd', 'stroke-width': 0.6}),
    )
  }
  return withLabel(group, entity, 78)
}

function withLabel(group, entity, y) {
  group.append(label(entity.label, 0, y))
  return group
}
