const NS = 'http://www.w3.org/2000/svg'

export function svg(tag, attributes = {}) {
  const node = document.createElementNS(NS, tag)
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value))
  })
  return node
}

export function add(parent, ...children) {
  children.flat().filter(Boolean).forEach(child => parent.append(child))
  return parent
}

export function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

export function markings(x, top, bottom, count, side = 1) {
  const group = svg('g', {class: 'measure-marks'})
  for (let index = 0; index <= count; index += 1) {
    const y = top + ((bottom - top) * index) / count
    const length = index % 5 === 0 ? 9 : index % 2 === 0 ? 6 : 3.5
    group.append(svg('path', {d: `M${x} ${y}h${side * length}`}))
  }
  return group
}

export function liquidColor(state, fallback = '#55b9cf') {
  const value = state.color
  return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback
}

// 液位比例(0=空, 不画液体; 0.04 是有液体时的可见下限, 防止微量液体不可见)
export function liquidRatio(entity, state) {
  const capacity = Number(entity.properties?.capacity_ml || 50)
  const volume = Number(state.volume_ml || 0) + Number(state.delivered_ml || 0)
  if (!Number.isFinite(volume) || volume <= 0) return 0
  return Math.max(0.04, Math.min(0.9, volume / Math.max(capacity, 1)))
}

export function shadow(cx = 0, cy = 0, rx = 28, ry = 7) {
  return svg('ellipse', {cx, cy, rx, ry, class: 'apparatus-shadow'})
}
