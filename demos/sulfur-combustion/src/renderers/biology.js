import {add, label, shadow, svg} from './svg.js'

function withLabel(group, entity, y) {
  group.append(label(entity.label, 0, y))
  return group
}

function colonyOverlay(group, state, cx, cy, radius) {
  const count = Number(state.colony_count || 0)
  if (count <= 0) return group
  const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }
  const rand = rng(Math.abs(cx * 1000 + cy) || 42)
  const maxShow = Math.min(count, 30)
  for (let i = 0; i < maxShow; i++) {
    const angle = rand() * Math.PI * 2
    const dist = rand() * radius * 0.78
    const x = cx + Math.cos(angle) * dist
    const y = cy + Math.sin(angle) * dist
    const r = 1.2 + rand() * 2.0
    const opacity = 0.55 + rand() * 0.35
    group.append(svg('circle', {
      cx: x, cy: y, r,
      fill: state.contaminated ? '#8B4513' : '#F5DEB3',
      stroke: state.contaminated ? '#654321' : '#DAA520',
      'stroke-width': 0.3,
      opacity,
      class: 'colony',
    }))
  }
  if (count > 30) {
    group.append(label(`${count}+`, cx, cy + radius + 8, 'colony-count-label'))
  }
  return group
}

export function renderBench(entity) {
  const group = svg('g')
  add(group,
    shadow(0, 16, 42, 9),
    svg('rect', {x: -42, y: -12, width: 84, height: 24, rx: 3, class: 'metal'}),
    svg('rect', {x: -40, y: -10, width: 80, height: 2, fill: 'rgb(255 255 255 / 20%)', rx: 1}),
  )
  return withLabel(group, entity, 32)
}

export function renderPetriDish(entity, state) {
  const group = svg('g')
  const sealed = state.sealed
  add(group,
    shadow(0, 8, 38, 6),
    svg('ellipse', {cx: 0, cy: 0, rx: 36, ry: 34, class: 'petri-dish-base'}),
    svg('ellipse', {cx: 0, cy: -2, rx: 34, ry: 32, fill: '#FFF8F0', stroke: '#E8D5B8', 'stroke-width': 0.5, class: 'agar-layer'}),
    svg('ellipse', {cx: 0, cy: -4, rx: 33, ry: 31, fill: 'none', stroke: '#DDD0C0', 'stroke-width': 0.3, class: 'agar-surface'}),
  )
  if (!sealed) {
    add(group,
      svg('ellipse', {cx: 0, cy: -8, rx: 35, ry: 33, fill: 'none', stroke: '#B8C8D8', 'stroke-width': 1.2, 'stroke-dasharray': '4 2', opacity: 0.6, class: 'lid-offset'}),
      svg('path', {d: 'M-35-8Q-38-20-20-28', fill: 'none', stroke: '#C0D0E0', 'stroke-width': 0.8, opacity: 0.5}),
    )
  } else {
    add(group,
      svg('ellipse', {cx: 0, cy: -6, rx: 36, ry: 34, fill: 'none', stroke: '#90C8A0', 'stroke-width': 1.5, class: 'seal-ring'}),
      svg('path', {d: 'M-30-6Q0-12 30-6', fill: 'none', stroke: '#70B880', 'stroke-width': 0.8, opacity: 0.7}),
    )
  }
  colonyOverlay(group, state, 0, 0, 28)
  if (state.sterilized) {
    add(group,
      svg('circle', {cx: 0, cy: 0, r: 38, fill: 'none', stroke: '#4FC3F7', 'stroke-width': 0.8, opacity: 0.5, class: 'sterile-glow'}),
    )
  }
  return withLabel(group, entity, 48)
}

export function renderInoculationLoop(entity, state) {
  const group = svg('g')
  const sterilized = state.sterilized
  add(group,
    svg('path', {d: 'M0-52L0-10', stroke: '#888', 'stroke-width': 2.5, 'stroke-linecap': 'round', class: 'loop-handle'}),
    svg('path', {d: 'M0-10Q12-10 12 2Q12 14 0 14Q-12 14-12 2Q-12-10 0-10', fill: 'none', stroke: sterilized ? '#FF6B35' : '#999', 'stroke-width': 1.8, class: 'loop-wire'}),
    svg('circle', {cx: 0, cy: 2, r: 10, fill: 'none', stroke: sterilized ? '#FF8C42' : '#AAA', 'stroke-width': 1, opacity: 0.6, class: 'loop-tip'}),
  )
  if (sterilized) {
    add(group,
      svg('circle', {cx: 0, cy: 2, r: 14, fill: '#FF6B35', opacity: 0.15, class: 'sterile-heat'}),
      svg('circle', {cx: 0, cy: 2, r: 18, fill: '#FF4500', opacity: 0.08, class: 'sterile-heat-outer'}),
    )
  }
  return withLabel(group, entity, 68)
}

export function renderAlcoholLamp(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 32, 18, 5),
    svg('path', {d: 'M-14 18Q-16 28-12 32H12Q16 28 14 18Z', class: 'lamp-base'}),
    svg('rect', {x: -12, y: -8, width: 24, height: 28, rx: 4, fill: '#E8E0D8', stroke: '#C8C0B8', 'stroke-width': 0.8, class: 'lamp-body'}),
    svg('ellipse', {cx: 0, cy: -6, rx: 12, ry: 3, fill: '#D0C8C0', stroke: '#B8B0A8', 'stroke-width': 0.5, class: 'lamp-rim'}),
    svg('rect', {x: -3, y: -22, width: 6, height: 16, rx: 2, fill: '#F5F0E8', stroke: '#D8D0C8', 'stroke-width': 0.5, class: 'wick'}),
  )
  add(group,
    svg('path', {d: 'M0-38Q-6-28-4-22Q-2-18 0-20Q2-18 4-22Q6-28 0-38Z', fill: '#FF6B00', class: 'flame-outer'}),
    svg('path', {d: 'M0-35Q-3-28-2-22Q0-18 2-22Q3-28 0-35Z', fill: '#FFD700', class: 'flame-inner'}),
    svg('path', {d: 'M0-32Q-1.5-28-1-24Q0-22 1-24Q1.5-28 0-32Z', fill: '#FFFACD', class: 'flame-core'}),
  )
  return withLabel(group, entity, 48)
}

export function renderBunsenBurner(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 38, 20, 5),
    svg('path', {d: 'M-18 32Q-20 38-16 40H16Q20 38 18 32Z', class: 'burner-base'}),
    svg('rect', {x: -6, y: -20, width: 12, height: 54, rx: 2, fill: '#A0A0A0', stroke: '#808080', 'stroke-width': 0.8, class: 'burner-tube'}),
    svg('rect', {x: -8, y: -22, width: 16, height: 6, rx: 2, fill: '#B0B0B0', stroke: '#909090', 'stroke-width': 0.5, class: 'burner-collar'}),
    svg('ellipse', {cx: 0, cy: 16, rx: 10, ry: 2, fill: '#888', class: 'gas-inlet'}),
  )
  add(group,
    svg('path', {d: 'M0-42Q-8-28-5-22Q-2-18 0-20Q2-18 5-22Q8-28 0-42Z', fill: '#2196F3', class: 'bunsen-flame-outer'}),
    svg('path', {d: 'M0-38Q-4-28-2-22Q0-18 2-22Q4-28 0-38Z', fill: '#64B5F6', class: 'bunsen-flame-inner'}),
    svg('path', {d: 'M0-35Q-1.5-28-1-24Q0-22 1-24Q1.5-28 0-35Z', fill: '#BBDEFB', class: 'bunsen-flame-core'}),
  )
  return withLabel(group, entity, 55)
}

export function renderTestTube(entity, state) {
  const group = svg('g')
  const hasLiquid = Number(state.volume_ml || 0) > 0
  const liquidColor = state.color || '#B8D8E8'
  const slantAngle = state.slant || 0
  add(group,
    shadow(0, 62, 16, 5),
    svg('path', {d: 'M-10-52H10L9 54Q9 62 0 62Q-9 62-9 54Z', class: 'glass-body'}),
    svg('path', {d: 'M-12-52H12M-9-48Q0-45 9-48', class: 'glass-rim'}),
    svg('path', {d: 'M-4-46V46', class: 'glass-highlight'}),
  )
  if (hasLiquid) {
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
  if (slantAngle !== 0) {
    const slantY = -20 + slantAngle * 30
    add(group,
      svg('path', {
        d: `M-7 ${slantY}L7 ${slantY - 20}L7 ${slantY - 18}L-7 ${slantY + 2}Z`,
        fill: '#F5E6D3',
        stroke: '#E0D0C0',
        'stroke-width': 0.3,
        class: 'slant-surface',
      }),
    )
  }
  return withLabel(group, entity, 78)
}

export function renderSlantCulture(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 62, 16, 5),
    svg('path', {d: 'M-10-52H10L9 54Q9 62 0 62Q-9 62-9 54Z', class: 'glass-body'}),
    svg('path', {d: 'M-12-52H12M-9-48Q0-45 9-48', class: 'glass-rim'}),
    svg('path', {d: 'M-4-46V46', class: 'glass-highlight'}),
  )
  add(group,
    svg('path', {
      d: 'M-7-10L7-35L7-33L-7-8Z',
      fill: '#F5E6D3',
      stroke: '#E0D0C0',
      'stroke-width': 0.3,
      class: 'agar-slant',
    }),
    svg('path', {
      d: 'M-6.5-9L6.5-34L6-33.5L-6-8.5Z',
      fill: '#E8DCC8',
      opacity: 0.6,
      class: 'slant-surface',
    }),
  )
  if (state.colony_count > 0) {
    const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }
    const rand = rng(77)
    for (let i = 0; i < Math.min(state.colony_count, 15); i++) {
      const t = 0.15 + rand() * 0.7
      const x = -5 + t * 10
      const y = -10 + t * (-25)
      add(group, svg('circle', {
        cx: x + rand() * 2, cy: y + rand() * 2,
        r: 0.8 + rand() * 1.2,
        fill: '#F5DEB3', stroke: '#DAA520', 'stroke-width': 0.2,
        opacity: 0.6 + rand() * 0.3,
        class: 'colony',
      }))
    }
  }
  return withLabel(group, entity, 78)
}

export function renderAutoclave(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 42, 35, 8),
    svg('rect', {x: -32, y: -30, width: 64, height: 65, rx: 6, fill: '#E0E0E0', stroke: '#B0B0B0', 'stroke-width': 1, class: 'autoclave-body'}),
    svg('rect', {x: -30, y: -28, width: 60, height: 55, rx: 4, fill: '#F0F0F0', stroke: '#D0D0D0', 'stroke-width': 0.5, class: 'autoclave-door'}),
    svg('circle', {cx: 22, cy: 0, r: 5, fill: '#C0C0C0', stroke: '#A0A0A0', 'stroke-width': 0.8, class: 'autoclave-handle'}),
    svg('rect', {x: -28, y: -38, width: 56, height: 10, rx: 3, fill: '#D8D8D8', stroke: '#B8B8B8', 'stroke-width': 0.5, class: 'autoclave-lid'}),
    svg('circle', {cx: 0, cy: -33, r: 3, fill: '#FF5252', class: 'pressure-indicator'}),
    svg('rect', {x: -25, y: 25, width: 14, height: 10, rx: 2, fill: '#FFA726', stroke: '#F57C00', 'stroke-width': 0.5, class: 'temp-display'}),
  )
  if (state.sterilized) {
    add(group,
      svg('rect', {x: -32, y: -30, width: 64, height: 65, rx: 6, fill: '#4FC3F7', opacity: 0.15, class: 'sterile-active'}),
      svg('circle', {cx: 0, cy: -33, r: 4, fill: '#4CAF50', class: 'pressure-active'}),
    )
  }
  return withLabel(group, entity, 58)
}

export function renderIncubator(entity, state) {
  const group = svg('g')
  const temp = Number(state.incubation_temp || 0)
  add(group,
    shadow(0, 48, 42, 10),
    svg('rect', {x: -40, y: -38, width: 80, height: 80, rx: 5, fill: '#F5F5F5', stroke: '#D0D0D0', 'stroke-width': 1.2, class: 'incubator-body'}),
    svg('rect', {x: -36, y: -34, width: 72, height: 64, rx: 3, fill: '#FAFAFA', stroke: '#E0E0E0', 'stroke-width': 0.5, class: 'incubator-door'}),
    svg('rect', {x: -30, y: -28, width: 60, height: 50, rx: 2, fill: '#FFF8E1', stroke: '#FFE0B2', 'stroke-width': 0.5, class: 'incubator-window'}),
    svg('rect', {x: -30, y: 26, width: 60, height: 14, rx: 2, fill: '#37474F', stroke: '#263238', 'stroke-width': 0.5, class: 'control-panel'}),
    svg('rect', {x: -22, y: 28, width: 20, height: 10, rx: 1, fill: '#1A237E', class: 'temp-screen'}),
  )
  const tempText = svg('text', {
    x: -12, y: 36, fill: '#4FC3F7', 'font-size': '7', 'font-family': 'monospace', 'text-anchor': 'middle',
  })
  tempText.textContent = `${temp}°C`
  group.append(tempText)
  if (temp > 0) {
    add(group,
      svg('rect', {x: -30, y: -28, width: 60, height: 50, rx: 2, fill: '#FFF3E0', opacity: 0.4, class: 'warm-glow'}),
    )
  }
  if (state.incubation_time_h > 0) {
    const timeText = svg('text', {
      x: 12, y: 36, fill: '#FFD54F', 'font-size': '6', 'font-family': 'monospace', 'text-anchor': 'middle',
    })
    timeText.textContent = `${state.incubation_time_h}h`
    group.append(timeText)
  }
  return withLabel(group, entity, 65)
}

export function renderInoculationBox(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 35, 45, 10),
    svg('rect', {x: -44, y: -28, width: 88, height: 62, rx: 4, fill: '#E8F5E9', stroke: '#A5D6A7', 'stroke-width': 1, class: 'box-body'}),
    svg('rect', {x: -40, y: -24, width: 80, height: 48, rx: 2, fill: '#F1F8F2', stroke: '#C8E6C9', 'stroke-width': 0.5, class: 'work-area'}),
    svg('rect', {x: -44, y: -32, width: 88, height: 8, rx: 3, fill: '#B0BEC5', stroke: '#90A4AE', 'stroke-width': 0.5, class: 'hood-top'}),
    svg('circle', {cx: 0, cy: -28, r: 2, fill: '#66BB6A', class: 'uv-indicator'}),
  )
  if (state.sterilized) {
    add(group,
      svg('rect', {x: -40, y: -24, width: 80, height: 48, rx: 2, fill: '#E8F5E9', opacity: 0.5, class: 'uv-active'}),
      svg('circle', {cx: 0, cy: -28, r: 3, fill: '#4CAF50', class: 'uv-active-dot'}),
    )
  }
  return withLabel(group, entity, 52)
}

export function renderMicroscopeSlide(entity, state) {
  const group = svg('g')
  add(group,
    svg('rect', {x: -35, y: -6, width: 70, height: 14, rx: 1, fill: '#FAFAFA', stroke: '#E0E0E0', 'stroke-width': 0.8, class: 'slide-body'}),
    svg('rect', {x: -10, y: -4, width: 20, height: 10, rx: 1, fill: '#FFF8E1', stroke: '#FFE0B2', 'stroke-width': 0.5, class: 'slide-sample'}),
  )
  if (state.observed) {
    add(group,
      svg('circle', {cx: 0, cy: 1, r: 8, fill: '#E3F2FD', stroke: '#90CAF9', 'stroke-width': 0.5, class: 'observed-field'}),
      svg('circle', {cx: -2, cy: 0, r: 1.5, fill: '#FFECB3', class: 'observed-cell'}),
      svg('circle', {cx: 2, cy: 2, r: 1.2, fill: '#FFECB3', class: 'observed-cell'}),
      svg('circle', {cx: 0, cy: -1, r: 1, fill: '#FFECB3', class: 'observed-cell'}),
    )
  }
  return withLabel(group, entity, 24)
}

export function renderFlask(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 45, 39, 8),
    svg('path', {d: 'M-12-48H12V-24L37 30Q42 42 29 43H-29Q-42 42-37 30L-12-24Z', class: 'glass-body'}),
    svg('path', {d: 'M-14-48H14M-11-42H11', class: 'glass-rim'}),
    svg('path', {d: 'M-7-38V-20L-28 27', class: 'glass-highlight'}),
  )
  if (Number(state.volume_ml || 0) > 0) {
    const ratio = Math.max(0.1, Math.min(0.85, Number(state.volume_ml || 0) / 250))
    const liquidTop = 37 - ratio * 58
    add(group,
      svg('path', {
        d: `M-32 ${liquidTop}Q0 ${liquidTop - 3} 32 ${liquidTop}L37 31Q40 39 28 40H-28Q-40 39-37 31Z`,
        fill: state.color || '#E8D5B8',
        opacity: 0.7,
        class: 'liquid',
      }),
      svg('path', {d: `M-31 ${liquidTop}Q0 ${liquidTop - 4} 31 ${liquidTop}`, class: 'meniscus'}),
    )
  }
  return withLabel(group, entity, 61)
}

export function renderPipette(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 53, 20, 5),
    svg('path', {d: 'M-6-48Q0-55 6-48L5-4L2 37L0 51L-2 37L-5-4Z', class: 'glass-body'}),
    svg('rect', {x: -5, y: -50, width: 10, height: 8, rx: 3, fill: '#90CAF9', stroke: '#64B5F6', 'stroke-width': 0.5, class: 'pipette-bulb'}),
    svg('path', {d: 'M-2-42V28', class: 'glass-highlight'}),
  )
  if (Number(state.volume_ml || 0) > 0) {
    const ratio = Math.max(0.1, Math.min(0.9, Number(state.volume_ml || 0) / 10))
    const liquidTop = -40 + (1 - ratio) * 75
    add(group,
      svg('path', {
        d: `M-4 ${liquidTop}H4L3 35H-3Z`,
        fill: state.color || '#B8E0E8',
        opacity: 0.7,
        class: 'liquid',
      }),
    )
  }
  return withLabel(group, entity, 68)
}

export function renderForceps(entity, state) {
  const group = svg('g')
  add(group,
    svg('path', {d: 'M-8-50L-3-5L-2 10L0 35L0 50', stroke: '#B0B0B0', 'stroke-width': 2, 'stroke-linecap': 'round', class: 'forceps-arm-left'}),
    svg('path', {d: 'M8-50L3-5L2 10L0 35L0 50', stroke: '#B0B0B0', 'stroke-width': 2, 'stroke-linecap': 'round', class: 'forceps-arm-right'}),
    svg('path', {d: 'M-8-50Q0-55 8-50', fill: 'none', stroke: '#C0C0C0', 'stroke-width': 2, class: 'forceps-hinge'}),
    svg('ellipse', {cx: 0, cy: 50, rx: 4, ry: 6, fill: '#D0D0D0', stroke: '#A0A0A0', 'stroke-width': 0.5, class: 'forceps-tip'}),
  )
  return withLabel(group, entity, 65)
}

export function renderCultureMedium(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 42, 26, 6),
    svg('path', {d: 'M-14-44H14V-30L24-16V26Q24 34 16 34H-16Q-24 34-24 26V-16L-14-30Z', class: 'glass-body'}),
    svg('path', {d: 'M-16-46H16M-12-40H12', class: 'glass-rim'}),
    svg('rect', {x: -20, y: -6, width: 40, height: 12, rx: 2, fill: '#E8D5B8', stroke: '#C8B088', 'stroke-width': 0.5, class: 'medium-layer'}),
    svg('path', {d: 'M-6-42V-30', class: 'glass-highlight'}),
  )
  colonyOverlay(group, state, 0, 0, 16)
  return withLabel(group, entity, 54)
}

//  -  gentleMACS C 管(324 案例新增) - 
// 矮宽无菌离心管 + 可穿隔膜螺旋管盖: 体积(capacity_ml, 默认 10)驱动液位, 
// tissue_added 且解离未完成时管底画组织块, dissociation_programs>0 后组织渐变为悬浮细胞点
export function renderCTube(entity, state) {
  const group = svg('g')
  const capacity = Number(entity.properties?.capacity_ml || 10)
  const volume = Number(state.volume_ml || 0)
  const ratio = Math.max(0.05, Math.min(0.88, volume / Math.max(capacity, 0.1)))
  const liquidBottom = 28
  const liquidTop = liquidBottom - ratio * 54
  const programs = Number(state.dissociation_programs || 0)
  add(group,
    shadow(0, 34, 20, 5),
    svg('path', {d: 'M-15-30H15L13 26Q13 34 0 34Q-13 34-13 26Z', class: 'glass-body'}),
    svg('path', {d: 'M-16-30H16', class: 'glass-rim'}),
    svg('path', {d: 'M-9-24V22', class: 'glass-highlight'}),
  )
  if (volume > 0) {
    add(group,
      svg('path', {
        d: `M-13 ${liquidTop}Q0 ${liquidTop - 2} 13 ${liquidTop}L13 26Q13 33 0 33Q-13 33-13 26Z`,
        fill: state.color || '#D8B84A', opacity: 0.7, class: 'liquid',
      }),
      svg('path', {d: `M-13 ${liquidTop}Q0 ${liquidTop - 3} 13 ${liquidTop}`, class: 'meniscus'}),
    )
  }
  if (state.tissue_added && programs < 3) {
    // 未完全解离: 管底的组织块(随程序数缩小)
    const shrink = 1 - programs * 0.3
    add(group, svg('ellipse', {
      cx: 0, cy: 26, rx: 8 * shrink, ry: 4.5 * shrink,
      fill: '#E8A0A8', stroke: '#C87880', 'stroke-width': 0.6, class: 'tissue-blob',
    }))
  } else if (programs > 0 && volume > 0) {
    // 解离后: 液体中的悬浮细胞(散点)
    const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }
    const rand = rng(31)
    for (let i = 0; i < 14; i++) {
      add(group, svg('circle', {
        cx: -10 + rand() * 20, cy: liquidTop + 4 + rand() * Math.max(2, liquidBottom - liquidTop - 8),
        r: 0.7 + rand() * 0.9, fill: '#F0C0C8', opacity: 0.75, class: 'cell-speck',
      }))
    }
  }
  // 螺旋管盖 + 中央隔膜(酶混液 2 经此加入; 移液器吸头可穿过)
  add(group,
    svg('rect', {x: -17, y: -46, width: 34, height: 17, rx: 3, fill: '#E4E7EA', stroke: '#B4BCC2', 'stroke-width': 1, class: 'ctube-cap'}),
    svg('path', {d: 'M-13-43v11M-6-43v11M6-43v11M13-43v11', stroke: '#C6CCD2', 'stroke-width': 1, fill: 'none'}),
    svg('circle', {cx: 0, cy: -37.5, r: 6, fill: '#9AA6AE', stroke: '#78848C', 'stroke-width': 0.8, class: 'ctube-septum'}),
    svg('path', {d: 'M-3.5-37.5H3.5M0-41V-34', stroke: '#5E6A72', 'stroke-width': 0.7, fill: 'none'}),
  )
  return withLabel(group, entity, 52)
}

//  -  gentleMACS 组织解离器(324 案例新增) - 
// 白色台式仪器: 斜面顶盖中央为 C 管插槽(slot 锚点), 正面屏幕显示当前程序, 运行时 LED 呼吸
export function renderTissueDissociator(entity, state) {
  const group = svg('g')
  const running = Boolean(state.running)
  add(group,
    shadow(0, 40, 48, 9),
    svg('rect', {x: -46, y: -18, width: 92, height: 58, rx: 6, fill: '#F2F4F6', stroke: '#B8C0C6', 'stroke-width': 1.2, class: 'dissociator-body'}),
    svg('path', {d: 'M-46-18L-24-34H24L46-18Z', fill: '#E6EAEE', stroke: '#B8C0C6', 'stroke-width': 1.2, 'stroke-linejoin': 'round', class: 'dissociator-deck'}),
    // 顶盖中央插槽(C 管管盖朝下插入)
    svg('rect', {x: -13, y: -28, width: 26, height: 9, rx: 3, fill: '#3A4148', class: 'dissociator-slot'}),
    svg('rect', {x: -9, y: -26, width: 18, height: 5, rx: 2, fill: '#20262B'}),
  )
  const screen = svg('text', {x: -16, y: 14, fill: '#4FC3F7', 'font-size': '8', 'font-family': 'monospace', 'text-anchor': 'middle', class: 'dissociator-screen-text'})
  screen.textContent = String(state.program || 'standby')
  add(group,
    svg('rect', {x: -38, y: 4, width: 44, height: 15, rx: 2, fill: '#263238', stroke: '#1A2226', 'stroke-width': 0.8, class: 'dissociator-screen'}),
    screen,
    svg('circle', {cx: 30, cy: 10, r: 2.6, fill: running ? '#66BB6A' : '#AEB6BC', stroke: '#78848C', 'stroke-width': 0.6, class: 'dissociator-led'}),
    svg('rect', {x: 22, y: 20, width: 16, height: 9, rx: 2, fill: '#DDE2E6', stroke: '#B4BCC2', 'stroke-width': 0.6}),
    svg('path', {d: 'M-46-14H46', stroke: '#D5DADF', 'stroke-width': 0.8, fill: 'none'}),
  )
  if (running) {
    const led = svg('circle', {cx: 30, cy: 10, r: 5, fill: '#66BB6A', opacity: 0.35, class: 'dissociator-led-glow'})
    led.setAttribute('data-pulse', '900')
    add(group, led)
  }
  return withLabel(group, entity, 62)
}

//  -  管式旋转仪(MACSmix, 324 案例新增) - 
// 白色底座 + 顶部倾斜滚轮: rotating 时滚轮 data-swing 缓慢摆动(对应 4 RPM 翻滚混合)
export function renderTubeRotator(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 32, 36, 7),
    svg('rect', {x: -30, y: 6, width: 60, height: 26, rx: 6, fill: '#F2F4F6', stroke: '#B8C0C6', 'stroke-width': 1.2, class: 'rotator-base'}),
    svg('circle', {cx: -18, cy: 19, r: 3, fill: '#DDE2E6', stroke: '#B4BCC2', 'stroke-width': 0.6}),
    svg('circle', {cx: -8, cy: 19, r: 3, fill: '#DDE2E6', stroke: '#B4BCC2', 'stroke-width': 0.6}),
    svg('rect', {x: 2, y: 14, width: 18, height: 10, rx: 2, fill: '#263238', class: 'rotator-display'}),
  )
  const temp = svg('text', {x: 11, y: 21.5, fill: '#4FC3F7', 'font-size': '6', 'font-family': 'monospace', 'text-anchor': 'middle'})
  temp.textContent = `${Number(state.temp_c || 0)}°C`
  group.append(temp)
  // 滚轮(圆心平移到局部原点后再 data-swing, 保证绕轮心摆动)
  const wheelMount = svg('g', {transform: 'translate(0 -14)'})
  const wheel = svg('g', {class: 'rotator-wheel'})
  add(wheel,
    svg('circle', {cx: 0, cy: 0, r: 19, fill: '#E6EAEE', stroke: '#9AA4AC', 'stroke-width': 1.6}),
    svg('circle', {cx: 0, cy: 0, r: 6, fill: '#D5DADF', stroke: '#9AA4AC', 'stroke-width': 1}),
  )
  for (let i = 0; i < 6; i += 1) {
    const angle = (i * Math.PI) / 3
    add(wheel, svg('rect', {
      x: -3.4, y: -12.4, width: 6.8, height: 7, rx: 1.5,
      transform: `rotate(${(angle * 180) / Math.PI}) translate(0 -1)`,
      fill: '#F2F4F6', stroke: '#9AA4AC', 'stroke-width': 0.7,
    }))
  }
  if (state.rotating) wheel.setAttribute('data-swing', '3000')
  wheelMount.append(wheel)
  group.append(wheelMount)
  return withLabel(group, entity, 50)
}

//  -  细胞滤网(30 µm strainer, 324 案例新增) - 
// 短粗斗状滤杯: 顶缘宽, 向下收窄到筛网底; filtered 后网上留有结团残留
export function renderCellStrainer(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 22, 24, 5),
    svg('path', {d: 'M-24-16H24L12 6Q10 12 4 12H-4Q-10 12-12 6Z', fill: 'rgb(245 250 252 / 60%)', stroke: '#7E96A2', 'stroke-width': 1.4, 'stroke-linejoin': 'round', class: 'strainer-cup'}),
    svg('ellipse', {cx: 0, cy: -16, rx: 24, ry: 5.5, fill: 'rgb(226 238 244 / 75%)', stroke: '#7E96A2', 'stroke-width': 1.2, class: 'strainer-rim'}),
    // 筛网: 锥底交叉网格
    svg('path', {d: 'M-10 4L10 4M-8 8L8 8M-5 10.5L5 10.5M-6 2L-2 11M0 2L0 11M6 2L2 11', stroke: '#9AB0BC', 'stroke-width': 0.7, fill: 'none', class: 'strainer-mesh'}),
    // 侧翼手持小柄
    svg('rect', {x: 24, y: -19, width: 10, height: 6, rx: 2, fill: '#DCE6EC', stroke: '#7E96A2', 'stroke-width': 1, class: 'strainer-tab'}),
  )
  if (state.filtered) {
    // 过滤后网上残留的组织结团(目标细胞已随悬液通过)
    const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }
    const rand = rng(57)
    for (let i = 0; i < 7; i++) {
      add(group, svg('circle', {
        cx: -7 + rand() * 14, cy: -2 + rand() * 7, r: 1 + rand() * 1.4,
        fill: '#C9A26A', opacity: 0.8, class: 'strainer-residue',
      }))
    }
  }
  return withLabel(group, entity, 34)
}

//  -  15 mL 锥形离心管(324 案例新增) - 
export function renderCentrifugeTube(entity, state) {
  const group = svg('g')
  const capacity = Number(entity.properties?.capacity_ml || 15)
  const volume = Number(state.volume_ml || 0)
  const ratio = Math.max(0.05, Math.min(0.88, volume / Math.max(capacity, 0.1)))
  const liquidBottom = 54
  const liquidTop = liquidBottom - ratio * 96
  add(group,
    shadow(0, 57, 15, 4),
    svg('path', {d: 'M-11-48H11L11 22L6 46Q4 57 0 57Q-4 57-6 46L-11 22Z', class: 'glass-body'}),
    svg('path', {d: 'M-12-48H12', class: 'glass-rim'}),
    svg('path', {d: 'M-6-44V14', class: 'glass-highlight'}),
  )
  group.append(svg('path', {d: 'M-10-40h6M-10-30h6M-10-20h6M-10-10h6M-10 0h6M-10 10h6', class: 'measure-marks'}))
  if (volume > 0) {
    add(group,
      svg('path', {
        d: `M-10 ${liquidTop}Q0 ${liquidTop - 2} 10 ${liquidTop}L10 21L5 46Q3.5 55 0 55Q-3.5 55-5 46L-10 21Z`,
        fill: state.color || '#E0AEB8', opacity: 0.7, class: 'liquid',
      }),
      svg('path', {d: `M-10 ${liquidTop}Q0 ${liquidTop - 3} 10 ${liquidTop}`, class: 'meniscus'}),
    )
  }
  if (state.pelleted) {
    add(group, svg('path', {
      d: 'M-4.5 49Q0 46 4.5 49Q4 55 0 55.5Q-4 55-4.5 49Z',
      fill: '#D8C0A8', stroke: '#B89A78', 'stroke-width': 0.5, class: 'cell-pellet',
    }))
  }
  if (state.resuspended && volume > 0) {
    const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }
    const rand = rng(97)
    for (let i = 0; i < 16; i++) {
      add(group, svg('circle', {
        cx: -7 + rand() * 14, cy: liquidTop + 5 + rand() * Math.max(2, liquidBottom - liquidTop - 12),
        r: 0.7 + rand() * 0.9, fill: '#F0D0C0', opacity: 0.8, class: 'cell-speck',
      }))
    }
  }
  add(group,
    svg('rect', {x: -10, y: -58, width: 20, height: 11, rx: 2, fill: '#E4E7EA', stroke: '#B4BCC2', 'stroke-width': 0.9, class: 'ctube-cap'}),
    svg('path', {d: 'M-7-56v7M0-56v7M7-56v7', stroke: '#C6CCD2', 'stroke-width': 0.8, fill: 'none'}),
  )
  return withLabel(group, entity, 72)
}

//  -  台式离心机(324 案例新增) - 
export function renderCentrifuge(entity, state) {
  const group = svg('g')
  const running = Boolean(state.running)
  add(group,
    shadow(0, 42, 40, 8),
    svg('rect', {x: -38, y: -34, width: 76, height: 76, rx: 9, fill: '#F2F4F6', stroke: '#B8C0C6', 'stroke-width': 1.2, class: 'centrifuge-body'}),
    svg('path', {d: 'M-34-30H34V-8H-34Z', fill: '#E6EAEE', stroke: '#C2C9CF', 'stroke-width': 0.8, class: 'centrifuge-lid'}),
    svg('ellipse', {cx: 0, cy: -19, rx: 14, ry: 4.5, fill: 'none', stroke: '#9AA4AC', 'stroke-width': 1.4, class: 'centrifuge-handle'}),
  )
  const display = svg('text', {x: -21, y: 18, fill: '#4FC3F7', 'font-size': '7.5', 'font-family': 'monospace', 'text-anchor': 'middle', class: 'centrifuge-display-text'})
  display.textContent = running ? `${Math.round(Number(state.speed_g || 300))} ×g` : 'READY'
  add(group,
    svg('rect', {x: -34, y: 8, width: 30, height: 15, rx: 2, fill: '#263238', stroke: '#1A2226', 'stroke-width': 0.8, class: 'centrifuge-display'}),
    display,
    svg('circle', {cx: 12, cy: 14, r: 3, fill: running ? '#66BB6A' : '#AEB6BC', stroke: '#78848C', 'stroke-width': 0.6, class: 'centrifuge-led'}),
    svg('circle', {cx: 24, cy: 14, r: 3, fill: '#DDE2E6', stroke: '#B4BCC2', 'stroke-width': 0.6}),
    svg('path', {d: 'M-38-4H38', stroke: '#D5DADF', 'stroke-width': 0.8, fill: 'none'}),
  )
  if (running) {
    const led = svg('circle', {cx: 12, cy: 14, r: 5.5, fill: '#66BB6A', opacity: 0.35, class: 'centrifuge-led-glow'})
    led.setAttribute('data-pulse', '600')
    add(group, led)
  }
  return withLabel(group, entity, 62)
}

//  -  试剂盒溶液小瓶(324 案例新增) - 
export function renderReagentVial(entity, state) {
  const group = svg('g')
  const capacity = Number(entity.properties?.capacity_ml || 2)
  const volume = Number(state.volume_ml || 0)
  const ratio = Math.max(0.08, Math.min(0.9, volume / Math.max(capacity, 0.1)))
  const liquidBottom = 22
  const liquidTop = liquidBottom - ratio * 40
  add(group,
    shadow(0, 26, 13, 4),
    svg('path', {d: 'M-10-24H10L9 20Q9 26 0 26Q-9 26-9 20Z', class: 'glass-body'}),
    svg('path', {d: 'M-11-24H11', class: 'glass-rim'}),
    svg('path', {d: 'M-5-19V14', class: 'glass-highlight'}),
  )
  if (volume > 0) {
    add(group,
      svg('path', {
        d: `M-8 ${liquidTop}Q0 ${liquidTop - 1.5} 8 ${liquidTop}L8 20Q8 25 0 25Q-8 25-8 20Z`,
        fill: state.color || '#E8E0C0', opacity: 0.7, class: 'liquid',
      }),
      svg('path', {d: `M-8 ${liquidTop}Q0 ${liquidTop - 2} 8 ${liquidTop}`, class: 'meniscus'}),
    )
  }
  add(group,
    svg('rect', {x: -8, y: -31, width: 16, height: 8, rx: 1.5, fill: '#37474F', stroke: '#263238', 'stroke-width': 0.7, class: 'vial-cap'}),
    svg('rect', {x: -8.5, y: -8, width: 17, height: 12, rx: 1.5, fill: 'rgb(255 255 255 / 82%)', stroke: '#C8CDD2', 'stroke-width': 0.5, class: 'vial-label'}),
    svg('path', {d: 'M-6-4h12', stroke: String(state.color || '#9AA4AC'), 'stroke-width': 2.2, 'stroke-linecap': 'round', class: 'vial-stripe'}),
  )
  return withLabel(group, entity, 42)
}

//  -  小鼠脑组织样本(324 案例新增) - 
// 双半球粉褐色组织块; weighed 后显示质量角标(与天平读数一致)
export function renderTissueSample(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 13, 17, 4),
    svg('ellipse', {cx: -7, cy: 0, rx: 10, ry: 7.5, fill: '#E8A8B0', stroke: '#C88890', 'stroke-width': 0.9, class: 'brain-lobe'}),
    svg('ellipse', {cx: 7, cy: 0, rx: 10, ry: 7.5, fill: '#E8A8B0', stroke: '#C88890', 'stroke-width': 0.9, class: 'brain-lobe'}),
    svg('path', {d: 'M0-7.5V7.5', stroke: '#C88890', 'stroke-width': 0.7, fill: 'none'}),
    svg('path', {d: 'M-12-2q4-3 8-1M2-4q5-2 9 1M-9 4q4 2 7 0', stroke: '#D898A0', 'stroke-width': 0.6, fill: 'none', class: 'brain-ridges'}),
  )
  if (state.weighed) {
    const tag = svg('text', {x: 0, y: -14, fill: '#37474F', 'font-size': '7', 'font-family': 'monospace', 'text-anchor': 'middle', class: 'tissue-mass-tag'})
    tag.textContent = `${Number(state.mass_g || 0).toFixed(2)} g`
    group.append(tag)
  }
  return withLabel(group, entity, 28)
}

export function renderImageAsset(entity, state, context = {}) {
  const group = svg('g')
  const href = context.asset?.local_path ? `public/${context.asset.local_path}` : ''
  if (href) {
    // assets.json 带原始 viewBox 时按 1:1 摆放(孔距/几何约束类资产不被 meet 收窄); 
    // 旧资产无 viewBox 则保持历史 124x148 视口
    const vb = context.asset?.view_box
    const usable = vb && Number(vb.width) > 0 && Number(vb.height) > 0
    const frame = usable
      ? {x: Number(vb.min_x), y: Number(vb.min_y), width: Number(vb.width), height: Number(vb.height)}
      : {x: -62, y: -74, width: 124, height: 148}
    group.append(svg('image', {
      href,
      ...frame,
      preserveAspectRatio: 'xMidYMid meet',
      class: 'image-apparatus',
    }))
  } else {
    group.append(shadow(0, 27, 25, 6), svg('circle', {r: 25, class: 'fallback-body'}))
  }
  return withLabel(group, entity, 92)
}

export function renderFallback(entity) {
  return withLabel(add(svg('g'), shadow(0, 27, 25, 6), svg('circle', {r: 25, class: 'fallback-body'})), entity, 45)
}
