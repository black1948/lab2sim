import {add, label, markings, shadow, svg} from './svg.js'

function withLabel(group, entity, y) {
  group.append(label(entity.label, 0, y))
  return group
}

export function renderWallBracket(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 12, 36, 7),
    svg('path', {d: 'M-30-8H-8V8H-12V12H30V-12H-26Z', class: 'metal-bracket'}),
    svg('path', {d: 'M0 12Q0 20 8 20Q8 28 0 28', class: 'metal-bracket-hook'}),
    svg('circle', {cx: -18, cy: -4, r: 2, class: 'screw'}),
    svg('circle', {cx: -18, cy: 6, r: 2, class: 'screw'}),
  )
  return withLabel(group, entity, 42)
}

export function renderWeight(entity, state) {
  const group = svg('g')
  const forceN = Number(state.force_n || 0)
  add(group,
    shadow(0, 20, 16, 5),
    svg('path', {d: 'M-12-16H12V10Q12 16 6 16H-6Q-12 16-12 10Z', class: 'weight-body'}),
    svg('path', {d: 'M-8-16H8V-12H-8Z', class: 'weight-top'}),
    svg('path', {d: 'M-3-16V-22Q-3-26 0-26Q3-26 3-22V-16', class: 'weight-hook'}),
  )
  if (forceN > 0) {
    const txt = svg('text', {x: 0, y: 4, 'text-anchor': 'middle', class: 'force-label'})
    txt.textContent = forceN.toFixed(1) + 'N'
    group.append(txt)
  }
  return withLabel(group, entity, 30)
}

export function renderString(entity, state) {
  const group = svg('g')
  const tension = Number(state.tension_n || 0)
  add(group,
    svg('line', {x1: 0, y1: -30, x2: 0, y2: 30,
      stroke: tension > 0 ? '#333' : '#888',
      'stroke-width': 1.5 + Math.min(2, tension * 0.3),
      'stroke-linecap': 'round', class: 'string-line'}),
  )
  return group
}

export function renderRubberBand(entity, state) {
  const group = svg('g')
  const ext = Math.max(0, Math.min(1, Number(state.extension || 0)))
  const baseLen = 50
  const totalLen = baseLen * (1 + ext * 0.8)
  const segs = 6
  let d = 'M0 -25'
  for (let i = 1; i <= segs; i++) {
    const y = -25 + (totalLen * i / segs)
    const xOff = (i % 2 === 0 ? 1 : -1) * (6 - ext * 4)
    d += ` Q${xOff} ${y - totalLen / segs / 2} 0 ${y}`
  }
  add(group,
    svg('path', {d, fill: 'none', stroke: '#e06040', 'stroke-width': 3, 'stroke-linecap': 'round', class: 'rubber-band'}),
  )
  return group
}

export function renderSpringScale(entity, state) {
  const group = svg('g')
  const forceN = Number(state.force_n || state.tension_n || 0)
  add(group,
    shadow(0, 44, 14, 5),
    svg('path', {d: 'M-10-42H10V36Q10 42 6 42H-6Q-10 42-10 36Z', class: 'glass-body'}),
    svg('path', {d: 'M-6-32V32', class: 'scale-markings'}),
    svg('rect', {x: -7, y: -4, width: 14, height: 8, rx: 2, class: 'scale-window'}),
    svg('path', {d: 'M-3-42V-50Q-3-54 0-54Q3-54 3-50V-42', class: 'scale-hook'}),
    svg('path', {d: 'M-3 42V50Q-3 54 0 54Q3 54 3 50V42', class: 'scale-hook'}),
  )
  const txt = svg('text', {x: 0, y: 3, 'text-anchor': 'middle', class: 'scale-reading'})
  txt.textContent = forceN.toFixed(1) + 'N'
  group.append(txt)
  return withLabel(group, entity, 64)
}

export function renderPulley(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 2, 22, 5),
    svg('circle', {cx: 0, cy: 0, r: 16, class: 'pulley-wheel'}),
    svg('circle', {cx: 0, cy: 0, r: 14, fill: 'none', stroke: '#556', 'stroke-width': 2}),
    svg('circle', {cx: 0, cy: 0, r: 3, class: 'pulley-axle'}),
    svg('path', {d: 'M0-16V-24L-6-30H6Z', class: 'metal-bracket'}),
  )
  return withLabel(group, entity, 36)
}

// 力矢量箭头.IR 实体 visual 可选声明教学矢量图增强(缺省完全向后兼容): 
//   {symbol: 'F₁', color: '#1f6fd6', px_per_n: 30, max_px: 110}
// - symbol: 箭头加粗, 标签改为F₁ 2.9N并置于箭头尖端外侧(无 symbol 时维持居中数值标签)
// - 平行四边形分解作图: 合力箭头 state 携带两个分力矢量(para1_len/para1_angle, para2_len/para2_angle, 
//   由规则效果写入, 随数值补间从 0 生长), 画分力尖端 → 合力尖端虚线.
//   虚线端点与分力/合力箭头共用同一缩放公式, 保证平行四边形始终闭合; 
//   同一张力图的合力/分力箭头应声明相同 px_per_n/max_px.
export function renderForceArrow(entity, state) {
  const group = svg('g')
  const visual = entity?.visual || {}
  const length = Number(state.arrow_length || state.force_n || 0)
  const angle = Number(state.arrow_angle || state.angle_deg || 0)
  const pxPerN = Number(visual.px_per_n || 20)
  const maxLen = Number(visual.max_px || 80)
  const scaleLen = value => Math.min(maxLen, value * pxPerN)
  const scaledLen = scaleLen(length)
  const color = visual.color || '#d03030'
  const symbol = typeof visual.symbol === 'string' ? visual.symbol.trim() : ''
  const rad = angle * Math.PI / 180
  const endX = scaledLen * Math.cos(rad)
  const endY = -scaledLen * Math.sin(rad)
  const headLen = symbol ? 11 : 8
  const headAng = 0.4
  for (const n of [1, 2]) {
    const paraLen = Number(state['para' + n + '_len'] || 0)
    const paraAngle = state['para' + n + '_angle']
    if (!paraLen || paraAngle === undefined || paraAngle === null) continue
    const paraRad = Number(paraAngle) * Math.PI / 180
    const paraScaled = scaleLen(paraLen)
    add(group, svg('line', {
      x1: paraScaled * Math.cos(paraRad), y1: -paraScaled * Math.sin(paraRad),
      x2: endX, y2: endY,
      stroke: '#5b6b76', 'stroke-width': 1.6, 'stroke-dasharray': '5 4', opacity: 0.9,
      'stroke-linecap': 'round',
    }))
  }
  add(group,
    svg('line', {x1: 0, y1: 0, x2: endX, y2: endY,
      stroke: color, 'stroke-width': symbol ? 3.4 : 3, 'stroke-linecap': 'round'}),
    svg('polygon', {
      points: `${endX},${endY} ${endX - headLen * Math.cos(rad - headAng)},${endY + headLen * Math.sin(rad - headAng)} ${endX - headLen * Math.cos(rad + headAng)},${endY + headLen * Math.sin(rad + headAng)}`,
      fill: color,
    }),
  )
  if (length > 0) {
    if (symbol) {
      // 符号+数值标签置于尖端外侧(沿箭头方向再延伸 16px), 颜色跟随箭头便于区分 F/F₁/F₂; 
      // 白描边光晕保证标签落在器材(如木管)上时仍可读
      const txt = svg('text', {
        x: endX + 16 * Math.cos(rad), y: endY - 16 * Math.sin(rad),
        'text-anchor': 'middle', class: 'force-label', 'font-weight': 700, 'font-size': 12,
        style: `fill: ${color}; paint-order: stroke; stroke: #ffffff; stroke-width: 3.5px; stroke-linejoin: round`,
      })
      txt.textContent = `${symbol} ${length.toFixed(1)}N`
      group.append(txt)
    } else {
      const txt = svg('text', {x: endX / 2, y: endY / 2 - 8, 'text-anchor': 'middle', class: 'force-label'})
      txt.textContent = length.toFixed(1) + 'N'
      group.append(txt)
    }
  }
  return group
}

export function renderPhysicsBoard(entity, state) {
  const group = svg('g')
  const lines = []
  for (let i = 0; i <= 10; i++) lines.push(svg('line', {x1: -120 + i * 24, y1: -90, x2: -120 + i * 24, y2: 90, class: 'grid-line'}))
  for (let i = 0; i <= 8; i++) lines.push(svg('line', {x1: -120, y1: -90 + i * 24, x2: 120, y2: -90 + i * 24, class: 'grid-line'}))
  add(group,
    svg('rect', {x: -120, y: -90, width: 240, height: 180, rx: 4, class: 'physics-board'}),
    ...lines,
  )
  return withLabel(group, entity, 100)
}

export function renderAngleIndicator(entity, state) {
  const group = svg('g')
  const angle = Number(state.angle_deg || 0)
  const rad = angle * Math.PI / 180
  const r = 30
  const endX = r * Math.cos(-rad)
  const endY = r * Math.sin(-rad)
  const largeArc = angle > 180 ? 1 : 0
  add(group,
    svg('path', {d: `M${r} 0 A${r} ${r} 0 ${largeArc} 0 ${endX} ${endY}`, fill: 'none', stroke: '#3070d0', 'stroke-width': 2}),
  )
  if (angle > 0) {
    const txt = svg('text', {x: r * 0.6 * Math.cos(-rad / 2), y: r * 0.6 * Math.sin(-rad / 2) + 4, 'text-anchor': 'middle', class: 'angle-label'})
    txt.textContent = angle.toFixed(0) + '\u00b0'
    group.append(txt)
  }
  return group
}

export function renderProtractor(entity, state) {
  const group = svg('g')
  const ticks = []
  for (let i = 0; i < 7; i++) {
    const a = i * 30 * Math.PI / 180
    ticks.push(svg('line', {x1: 44 * Math.cos(a), y1: -44 * Math.sin(a), x2: 50 * Math.cos(a), y2: -50 * Math.sin(a), stroke: '#556', 'stroke-width': 1}))
  }
  add(group,
    svg('path', {d: 'M-50 0A50 50 0 0 1 50 0Z', class: 'protractor-body'}),
    svg('path', {d: 'M-50 0A50 50 0 0 1 50 0Z', fill: 'none', stroke: '#445', 'stroke-width': 2}),
    svg('circle', {cx: 0, cy: 0, r: 2, fill: '#556'}),
    ...ticks,
  )
  return withLabel(group, entity, 12)
}

// 斜面: 右直角三角形斜劈, angle_deg 驱动整体绕右下支点旋转.
// 用于力的分解示意(重力分解为沿斜面/垂直斜面两个分力).
export function renderSlope(entity, state) {
  const group = svg('g')
  const angle = clampSlopeAngle(Number(state.angle_deg ?? entity?.properties?.angle_deg ?? 30))
  const pivotX = 108, baseY = 30, baseHalf = 110, height = 96
  const rad = angle * Math.PI / 180
  const topX = pivotX - height / Math.tan(rad)
  const topY = baseY - height
  add(group,
    shadow(0, baseY + 4, baseHalf, 6),
    svg('polygon', {points: `${topX},${topY} ${pivotX},${baseY} ${pivotX - baseHalf * 2},${baseY}`, class: 'slope-body'}),
    svg('line', {x1: topX, y1: topY, x2: pivotX, y2: baseY, class: 'slope-surface'}),
    svg('line', {x1: pivotX - baseHalf * 2, y1: baseY, x2: pivotX, y2: baseY, class: 'slope-base'}),
    svg('line', {x1: topX, y1: topY, x2: pivotX - baseHalf * 2, y2: baseY, class: 'slope-back'}),
    svg('circle', {cx: pivotX, cy: baseY, r: 3, class: 'screw'}),
  )
  return withLabel(group, entity, baseY + 22)
}

function clampSlopeAngle(angle) {
  return Math.max(8, Math.min(70, Number.isFinite(angle) ? angle : 30))
}

// 力的分解演示器(26-力的分解): 立柱+底座+横杆+橡皮筋一体式复合器材.
// 局部坐标原点取横杆转轴(立柱上的夹持点): 横杆沿 +x 伸出, angle_deg>0 自由端下垂; 
// 橡皮筋自立柱顶端锚点连到横杆自由端, 长度与倾角随横杆转角由几何推出(刚性杆+固定锚点).
// extension>0 时在橡皮筋上以刻度线标出原长位置, 其后的增粗段即伸长量(视频实测 187→216px, +15.5%); 
// compression_n>0 时横杆中段下弯(ASR: "下面横杆弯曲"), 弯度随压力增大.
export function renderForceDecomposer(entity, state) {
  const group = svg('g')
  const tilt = Number(state.angle_deg || 0)
  const ext = Math.max(0, Math.min(1, Number(state.extension || 0)))
  const compression = Number(state.compression_n || 0)
  const H = 146                       // 立柱顶端(转轴上方高度)
  const L = 118                       // 横杆长
  const rad = tilt * Math.PI / 180
  const ax = 0, ay = -143             // 橡皮筋立柱顶锚点
  const bx = L * Math.cos(rad), by = L * Math.sin(rad)   // 横杆自由端(悬挂点)
  const ux = (bx - ax) / Math.hypot(bx - ax, by - ay)
  const uy = (by - ay) / Math.hypot(bx - ax, by - ay)
  const restLen = Math.hypot(L, 143)                    // 未受载橡皮筋原长
  const rx = ax + ux * restLen, ry = ay + uy * restLen   // 原长刻度位置
  const bandDeg = Math.atan2(uy, ux) * 180 / Math.PI     // 橡皮筋与水平方向夹角
  add(group,
    shadow(0, 144, 42, 7),
    svg('path', {d: 'M-42 142H42L30 118H-30Z', class: 'metal-bracket'}),          // 底座楔块
    svg('rect', {x: -8, y: -H, width: 16, height: H + 118, rx: 2, class: 'metal-bracket'}),
    svg('line', {x1: -3.5, y1: -H + 8, x2: -3.5, y2: 100, stroke: '#e6edee', 'stroke-width': 1.6}),
    svg('line', {x1: 3.5, y1: -H + 8, x2: 3.5, y2: 100, stroke: '#e6edee', 'stroke-width': 1.6}),
    svg('circle', {cx: 0, cy: -H + 3, r: 3, class: 'screw'}),                      // 立柱顶端
    // 橡皮筋与水平方向夹角弧(虚线为水平参考线)
    svg('line', {x1: ax, y1: ay, x2: ax + 32, y2: ay, stroke: '#3070d0', 'stroke-width': 1.2, 'stroke-dasharray': '4 3'}),
    svg('path', {d: `M${ax + 24} ${ay}A24 24 0 0 1 ${(ax + ux * 24).toFixed(1)} ${(ay + uy * 24).toFixed(1)}`, fill: 'none', stroke: '#3070d0', 'stroke-width': 1.8}),
  )
  const arcText = svg('text', {
    x: (ax + 18 * Math.cos(bandDeg * Math.PI / 360)).toFixed(1),
    y: (ay + 18 * Math.sin(bandDeg * Math.PI / 360) + 4).toFixed(1),
    'text-anchor': 'middle', class: 'angle-label',
  })
  arcText.textContent = bandDeg.toFixed(0) + '°'
  // 横杆: 受压时中段下弯(教学近似挠度, 最大 7)
  const sag = compression > 0 ? 3 + 4 * Math.min(1.2, compression / 1.6) : 0
  const axis = `M0 0Q${(bx / 2).toFixed(1)} ${(by / 2 + sag).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`
  add(group,
    svg('path', {d: axis, fill: 'none', stroke: '#8fa3ab', 'stroke-width': 5.4, 'stroke-linecap': 'round'}),
    svg('path', {d: axis, fill: 'none', stroke: '#d7e2e5', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    // 橡皮筋: 原长段细线, 受载后原长刻度→自由端的增粗段即伸长量
    svg('path', {d: `M${ax} ${ay}L${bx.toFixed(1)} ${by.toFixed(1)}`, fill: 'none', stroke: ext > 0 ? '#c9563b' : '#e06040', 'stroke-width': ext > 0 ? 2.6 : 3, 'stroke-linecap': 'round', class: 'rubber-band'}),
    svg('circle', {cx: ax, cy: ay, r: 3, fill: 'none', stroke: '#b04a30', 'stroke-width': 1.6}),
  )
  if (ext > 0) {
    add(group,
      svg('line', {x1: (rx - uy * 5).toFixed(1), y1: (ry + ux * 5).toFixed(1), x2: (rx + uy * 5).toFixed(1), y2: (ry - ux * 5).toFixed(1), stroke: '#8a4a38', 'stroke-width': 1.4}),
      svg('path', {d: `M${rx.toFixed(1)} ${ry.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`, fill: 'none', stroke: '#ff7a50', 'stroke-width': 4.4, 'stroke-linecap': 'round'}),
    )
  }
  add(group,
    // 转轴夹持块(横杆穿过其后方)
    svg('rect', {x: -12, y: -9, width: 24, height: 18, rx: 3, class: 'metal-bracket'}),
    svg('circle', {cx: 0, cy: 0, r: 3, class: 'screw'}),
    // 悬挂点: 连接环 + 挂钩
    svg('circle', {cx: bx.toFixed(1), cy: by.toFixed(1), r: 4.6, fill: '#f2f0e6', stroke: '#46575f', 'stroke-width': 2}),
    svg('path', {d: `M${bx.toFixed(1)} ${(by + 4.6).toFixed(1)}q0 7 6 7`, fill: 'none', stroke: '#46575f', 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
    arcText,
  )
  return withLabel(group, entity, 160)
}

// 球(正圆): 第二例斜面+挡板对球的重力分解中的球体(frame-016~023).
export function renderBall(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 18, 14, 4),
    svg('circle', {cx: 0, cy: 0, r: 16, class: 'ball-body'}),
    svg('circle', {cx: -5, cy: -6, r: 4, class: 'ball-highlight'}),
  )
  return withLabel(group, entity, 30)
}

// 挡板: 垂直于斜面的挡板(第二例), force_n>0 时显示受压厚度提示.
export function renderStopBoard(entity, state) {
  const group = svg('g')
  const force = Number(state.force_n || 0)
  add(group,
    shadow(0, 44, 10, 4),
    svg('path', {d: 'M-6-40H6V44H-6Z', class: 'stop-board'}),
    svg('path', {d: 'M-2-40H2V44H-2Z', class: 'stop-board-face'}),
  )
  if (force > 0) {
    const txt = svg('text', {x: 0, y: -48, 'text-anchor': 'middle', class: 'force-label'})
    txt.textContent = force.toFixed(1) + 'N'
    group.append(txt)
  }
  return withLabel(group, entity, 58)
}

// ── 24-初速度为零的匀加速直线运动 ─────────────────────────────────────────────
// 斜面轨道几何: 舞台表面长 560px 对应 L=1.2m, 倾角 20°(视频实测 19.9°).
// renderIncline 与 renderCart 共享同一组常量, 小车车轮始终贴在轨道表面; 
// 50px 为 place_above 吸附间隙(0.1 场景单位) - 实体原点在轨道表面上方 50px.
const TRACK = {length_px: 560, angle_deg: 20, contact_offset_px: 50}

// 演示斜面(带支架的木质轨道板): 局部原点取斜面顶端(=吸附锚点 top), 
// 轨道自原点向右下延伸 length_px, 顶端立柱与末端短脚都落到同一基座上.
export function renderIncline(entity, state) {
  const group = svg('g')
  const angle = Number(state.angle_deg ?? entity?.properties?.angle_deg ?? TRACK.angle_deg)
  const rad = angle * Math.PI / 180
  const dx = TRACK.length_px * Math.cos(rad)
  const dy = TRACK.length_px * Math.sin(rad)
  const baseY = 240                                    // 基座顶面(桌面)
  add(group,
    shadow(dx / 2, baseY + 14, dx / 2 + 60, 7),
    svg('rect', {x: -46, y: baseY, width: dx + 92, height: 12, rx: 3, class: 'incline-base'}),
    svg('rect', {x: -8, y: 8, width: 16, height: baseY - 8, class: 'incline-leg'}),
    svg('rect', {x: (dx - 8).toFixed(1), y: dy + 6, width: 16, height: baseY - dy - 6, class: 'incline-leg'}),
  )
  // 轨道板(绕原点旋转 angle): 上缘即小车行走面
  const plank = svg('g', {transform: `rotate(${angle})`})
  add(plank,
    svg('rect', {x: 0, y: -7, width: TRACK.length_px, height: 14, rx: 2, class: 'incline-track'}),
    svg('line', {x1: 0, y1: -7, x2: TRACK.length_px, y2: -7, class: 'incline-surface'}),
  )
  add(group, plank)
  // 末端倾角标注: 水平虚线 + 圆弧 + 度数
  add(group,
    svg('line', {x1: dx - 66, y1: dy + 7, x2: dx + 10, y2: dy + 7, stroke: '#3070d0', 'stroke-width': 1.2, 'stroke-dasharray': '4 3'}),
    svg('path', {d: `M${(dx - 40).toFixed(1)} ${dy + 7}A40 40 0 0 0 ${(dx - 40 * Math.cos(rad)).toFixed(1)} ${(dy + 7 - 40 * Math.sin(rad)).toFixed(1)}`, fill: 'none', stroke: '#3070d0', 'stroke-width': 1.8}),
  )
  const angleText = svg('text', {x: (dx - 52).toFixed(1), y: dy + 22, 'text-anchor': 'middle', class: 'angle-label'})
  angleText.textContent = `${angle.toFixed(0)}°`
  group.append(angleText)
  return withLabel(group, entity, baseY + 34)
}

// 小车: 局部原点在轨道表面上方 50px(吸附间隙), 车轮接触点由 run_progress 二次映射
// s = L - p²(引擎把 run_progress 在 2T=1.36s 内线性插值, 渲染器做平方 - 线性插值+二次渲染=匀加速).
// 车体随轨道倾角旋转; 第1响/第2响徽标在小车经过 s₁=L/4 与 L 时出现(对应节拍器两声拍).
// 进度仅在车吸附于斜面(above=incline-1)时生效: 跑完一轮后把车拖离斜面, above 被运行时清空, 
// 车体不再带 s=560px 的轨道偏移渲染, 而是画在拖放点; 重新吸附时 release-cart 派发即复位重跑.
export function renderCart(entity, state, context = {}) {
  const group = svg('g')
  const angle = Number(state.angle_deg ?? TRACK.angle_deg)
  const rad = angle * Math.PI / 180
  const onTrack = state.above === 'incline-1'
  // 预览(器材库图标)冻结在静止位: 缩略图不随运行进度缩放跳动, 位置状态由舞台呈现
  const progress = !context.preview && onTrack ? Math.max(0, Math.min(1, Number(state.run_progress || 0))) : 0
  const s = TRACK.length_px * progress * progress
  const tx = s * Math.cos(rad)
  const ty = TRACK.contact_offset_px + s * Math.sin(rad)
  const body = svg('g', {transform: `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) rotate(${angle})`})
  add(body,
    svg('ellipse', {cx: 0, cy: 3, rx: 33, ry: 5, class: 'apparatus-shadow'}),
    svg('line', {x1: -19, y1: -8, x2: 19, y2: -8, class: 'cart-axle'}),
    svg('circle', {cx: -19, cy: -8, r: 8, class: 'cart-wheel'}),
    svg('circle', {cx: 19, cy: -8, r: 8, class: 'cart-wheel'}),
    svg('circle', {cx: -19, cy: -8, r: 2.6, class: 'cart-hub'}),
    svg('circle', {cx: 19, cy: -8, r: 2.6, class: 'cart-hub'}),
    svg('rect', {x: -33, y: -33, width: 66, height: 22, rx: 3, class: 'cart-body'}),
    svg('rect', {x: -33, y: -33, width: 66, height: 5, rx: 2, class: 'cart-stripe'}),
  )
  add(group, body)
  // 实时读数(水平不随车旋转): s=1.2p² m, v=a - t=1.30×1.36p m/s
  const readout = svg('text', {x: tx.toFixed(1), y: (ty - 46).toFixed(1), 'text-anchor': 'middle', class: 'cart-readout'})
  readout.textContent = `s = ${(1.2 * progress * progress).toFixed(2)} m   v = ${(1.768 * progress).toFixed(2)} m/s`
  group.append(readout)
  // 响声徽标: p≥0.5(第1响, 过 s₁=L/4 处小旗), p≥1(第2响, 到斜面末端)
  const badge = (sx, bx, by, text) => {
    const g = svg('g', {transform: `translate(${bx.toFixed(1)} ${by.toFixed(1)})`})
    add(g, svg('rect', {x: -30, y: -11, width: 60, height: 22, rx: 4, class: 'tick-badge'}))
    const t = svg('text', {y: 4.5, 'text-anchor': 'middle', class: 'tick-badge-text'})
    t.textContent = text
    g.append(t)
    return g
  }
  if (progress >= 0.5) group.append(badge(140, 140 * Math.cos(rad), 50 + 140 * Math.sin(rad) + 34, '1st tick'))
  if (progress >= 1) group.append(badge(560, 560 * Math.cos(rad) + 58, 50 + 560 * Math.sin(rad) - 36, '2nd tick'))
  if (state.verified) {
    const ok = svg('g', {transform: `translate(${tx.toFixed(1)} ${(ty - 66).toFixed(1)})`})
    add(ok, svg('rect', {x: -34, y: -11, width: 68, height: 22, rx: 4, class: 'verified-badge'}))
    const t = svg('text', {y: 4.5, 'text-anchor': 'middle', class: 'verified-badge-text'})
    t.textContent = '✓ 1:4'
    ok.append(t)
    group.append(ok)
  }
  return withLabel(group, entity, ty + 44)
}

// 机械节拍器(金字塔形): ticking 时摆锤经 data-swing 由 app.js 的 rAF 驱动往返摆动
// (周期 2T=1.36s, 每到达一次摆幅端点响一声), 右上角 data-pulse 圆点按 T=0.68s 闪烁标记响声.
// 静止时摆锤停在手拨角度(attribute transform, CSS 动画开启后会被 style.transform 覆盖).
export function renderMetronome(entity, state) {
  const group = svg('g')
  const interval = Number(state.interval_s || 0.68)
  add(group,
    shadow(0, 82, 52, 7),
    svg('path', {d: 'M-46 64L-24 -62L24 -62L46 64Z', class: 'metronome-body'}),
    svg('rect', {x: -52, y: 64, width: 104, height: 14, rx: 3, class: 'metronome-base'}),
    svg('rect', {x: -5.5, y: -50, width: 11, height: 104, rx: 3, class: 'metronome-slot'}),
    markings(-8, -40, 52, 6, -1),
  )
  const pivot = svg('g', {transform: 'translate(0 50)'})
  const pendulum = svg('g', {class: 'pendulum', transform: 'rotate(10)'})
  if (state.ticking) pendulum.setAttribute('data-swing', String(Math.round(interval * 2 * 1000)))
  add(pendulum,
    svg('line', {x1: 0, y1: 0, x2: 0, y2: -98, class: 'pendulum-rod'}),
    svg('rect', {x: -10, y: -34, width: 20, height: 15, rx: 2, class: 'slider-weight'}),
    svg('rect', {x: -5, y: -100, width: 10, height: 12, rx: 2, class: 'pendulum-bob'}),
  )
  pivot.append(pendulum)
  group.append(pivot)
  const readout = svg('text', {x: 0, y: -74, 'text-anchor': 'middle', class: 'metronome-readout'})
  readout.textContent = `T = ${interval.toFixed(2)}s`
  group.append(readout)
  if (state.ticking) {
    const flash = svg('g', {transform: 'translate(40 -74)'})
    flash.setAttribute('data-pulse', String(Math.round(interval * 1000)))
    add(flash, svg('circle', {r: 10, class: 'tick-flash'}))
    const t = svg('text', {y: 4, 'text-anchor': 'middle', class: 'tick-flash-text'})
    t.textContent = 'tick'
    flash.append(t)
    group.append(flash)
  }
  return withLabel(group, entity, 98)
}

// 标记小旗: 立在轨道上的红色三角旗, confirmed 时旗顶显示 ✓.
export function renderFlag(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 3, 10, 3),
    svg('ellipse', {cx: 0, cy: 0, rx: 7, ry: 2.5, class: 'flag-foot'}),
    svg('line', {x1: 0, y1: 0, x2: 0, y2: -46, class: 'flag-pole'}),
    svg('path', {d: 'M0 -46L28 -39L0 -32Z', class: 'flag-pennant'}),
  )
  if (state.confirmed) {
    const check = svg('text', {x: 18, y: -50, 'text-anchor': 'middle', class: 'flag-confirmed'})
    check.textContent = '✓'
    group.append(check)
  }
  return withLabel(group, entity, 18)
}

export function renderFallback(entity) {
  return withLabel(add(svg('g'), shadow(0, 27, 25, 6), svg('circle', {r: 25, class: 'fallback-body'})), entity, 45)
}

// ---- 01-布氏硬度测试: 数显布氏硬度计 / 升降工作台 / 球压头 / 试样 / 测量显微镜 ----
// 几何约定: 硬度计原点取底座中心, 主轴尖端局部坐标 (-105, -282)(对应锚点 spindle); 
// 球压头装入后由硬度计绘制(安装动作会把独立压头实体隐藏), 球底 y=-264 即接触基准.
export function renderBrinellTester(entity, state, context = {}) {
  const group = svg('g')
  const running = Boolean(state.running)
  const installed = Boolean(state.indenter_installed)
  const forceN = Number(state.force_display || 0)
  const hb = Number(state.hb_result || 0)
  add(group,
    shadow(0, 8, 132, 8),
    svg('rect', {x: -130, y: -18, width: 260, height: 26, rx: 4, class: 'brinell-base'}),
    svg('rect', {x: -40, y: -336, width: 160, height: 320, rx: 6, class: 'brinell-body'}),
    svg('rect', {x: -40, y: -336, width: 160, height: 16, rx: 6, class: 'brinell-body-top'}),
    svg('rect', {x: -118, y: -336, width: 198, height: 38, rx: 8, class: 'brinell-arm'}),
    svg('rect', {x: -118, y: -298, width: 26, height: 16, class: 'brinell-nose'}),
  )
  // 装入主轴的球压头(install-indenter 成功后出现)
  if (installed) {
    add(group,
      svg('rect', {x: -109, y: -300, width: 8, height: 16, rx: 2, class: 'indenter-shank'}),
      svg('circle', {cx: -105, cy: -273, r: 9, class: 'indenter-ball'}),
      svg('ellipse', {cx: -108, cy: -277, rx: 3, ry: 2, class: 'ball-highlight'}),
    )
  }
  // 控制面板: 程序(LCD)/ 试验力 / 硬度结果 / 运行指示灯
  add(group,
    svg('rect', {x: 6, y: -322, width: 108, height: 142, rx: 6, class: 'brinell-panel'}),
    svg('rect', {x: 14, y: -314, width: 92, height: 38, rx: 3, class: 'brinell-lcd'}),
  )
  const program = svg('text', {x: 60, y: -298, 'text-anchor': 'middle', class: 'brinell-lcd-text'})
  program.textContent = String(state.param_text || 'Standby')
  const programSub = svg('text', {x: 60, y: -284, 'text-anchor': 'middle', class: 'brinell-lcd-text'})
  programSub.textContent = running ? 'Loading' : (hb > 0 ? 'Test completed' : 'READY')
  const force = svg('text', {x: 60, y: -256, 'text-anchor': 'middle', class: 'brinell-readout'})
  force.textContent = `F ${forceN.toFixed(1)} N`
  const result = svg('text', {x: 60, y: -232, 'text-anchor': 'middle', class: 'brinell-hb'})
  result.textContent = hb > 0 ? `${Math.round(hb)} HBW` : 'HB --'
  group.append(program, programSub, force, result)
  add(group,
    svg('circle', {cx: 102, cy: -212, r: 5, class: running ? 'brinell-led-on' : 'brinell-led'}),
    svg('rect', {x: 16, y: -218, width: 30, height: 12, rx: 3, class: 'brinell-button'}),
    svg('rect', {x: 52, y: -218, width: 30, height: 12, rx: 3, class: 'brinell-button'}),
  )
  return withLabel(group, entity, 34)
}

// 升降工作台: 手轮丝杆立柱 + 圆形砧座, 原点取底座中心, 砧面局部 y=-62(对应锚点 surface).
export function renderTestTable(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 6, 56, 7),
    svg('rect', {x: -52, y: -6, width: 104, height: 14, rx: 3, class: 'table-base'}),
    svg('rect', {x: -14, y: -48, width: 28, height: 44, class: 'table-column'}),
    svg('circle', {cx: 20, cy: -20, r: 9, class: 'table-wheel'}),
    svg('rect', {x: -60, y: -62, width: 120, height: 14, rx: 3, class: 'table-anvil'}),
  )
  return withLabel(group, entity, 26)
}

// 球压头(Φ1mm 硬质合金球): 原点取球心, 装入主轴时球心恰落主轴尖端锚点.
export function renderBallIndenter(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 10, 10, 3),
    svg('rect', {x: -4, y: -30, width: 8, height: 22, rx: 2, class: 'indenter-shank'}),
    svg('rect', {x: -6, y: -36, width: 12, height: 7, rx: 2, class: 'indenter-cap'}),
    svg('circle', {cx: 0, cy: 0, r: 9, class: 'indenter-ball'}),
    svg('ellipse', {cx: -3, cy: -3.5, rx: 3, ry: 2, class: 'ball-highlight'}),
  )
  return withLabel(group, entity, 24)
}

// 金属试样(灰铸铁圆饼): 原点取底面中心; 压痕形成后顶面画出压痕圆与微凸环.
export function renderMetalSpecimen(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 2, 58, 6),
    svg('rect', {x: -55, y: -26, width: 110, height: 26, class: 'specimen-body'}),
    svg('ellipse', {cx: 0, cy: 0, rx: 55, ry: 8, class: 'specimen-top'}),
    svg('ellipse', {cx: 0, cy: -26, rx: 55, ry: 8, class: 'specimen-top'}),
  )
  if (state.indented) {
    add(group,
      svg('ellipse', {cx: 0, cy: -26, rx: 16, ry: 5.5, class: 'indent-ring'}),
      svg('ellipse', {cx: 0, cy: -26, rx: 12, ry: 4, class: 'indent-dot'}),
    )
  }
  return withLabel(group, entity, 20)
}

// 测量显微镜: 立柱式, 原点取底座中心; 物镜尖端局部 (-10, -48), 对准试样上方(对应锚点 scope).
export function renderMeasuringMicroscope(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 4, 48, 7),
    svg('ellipse', {cx: 0, cy: -4, rx: 44, ry: 9, class: 'scope-base'}),
    svg('rect', {x: -40, y: -14, width: 80, height: 10, rx: 4, class: 'scope-base'}),
    svg('rect', {x: 28, y: -152, width: 14, height: 140, class: 'scope-column'}),
    svg('rect', {x: 14, y: -152, width: 46, height: 38, rx: 5, class: 'scope-head'}),
    svg('circle', {cx: 37, cy: -170, r: 10, class: 'scope-eyepiece'}),
    svg('rect', {x: -14, y: -148, width: 44, height: 24, class: 'scope-arm'}),
    svg('rect', {x: -20, y: -124, width: 20, height: 66, rx: 4, class: 'scope-barrel'}),
    svg('path', {d: 'M-19 -58L-1 -58L-6 -46L-14 -46Z', class: 'scope-objective'}),
  )
  if (state.positioned || Number(state.d1_mm || 0) > 0 || Number(state.d2_mm || 0) > 0) {
    add(group, svg('circle', {cx: -10, cy: -38, r: 7, class: 'scope-reticle'}))
    const d1 = Number(state.d1_mm || 0)
    const d2 = Number(state.d2_mm || 0)
    const reading = svg('text', {x: -10, y: -18, 'text-anchor': 'middle', class: 'scope-reading'})
    reading.textContent = d2 > 0 ? `d₂ ${d2.toFixed(4)}` : d1 > 0 ? `d₁ ${d1.toFixed(4)}` : ''
    group.append(reading)
  }
  return withLabel(group, entity, 14)
}

// ---- 06-三角桁架演示力的分解: 支杆式弹簧测力计 / 三角桁架支架 ----
// 支杆测力计(frame-001/002/004/005/010/011): 木管外套 + 灰色刻度套管(红环)+ 内杆.
// 轴向受力时套管沿杆轴滑出(受拉, 管端露出间隙与内杆刻度)或缩回管内(受压), 
// 1 格 = GRID_PX 像素 = 1 倍砝码重力(标定见 frame-004/005 与旁白 22.3-32.0s).
const GRID_PX = 14

// 沿 +x 绘制一根支杆测力计: x=0 为远端(立柱/持握端), x=len 为铰接端(套管+端盖).
// deflGrid 为有符号格数: >0 受拉(套管向铰接端滑出), <0 受压(套管缩回木管下, 由上层木管遮盖).
function drawStrutAlongX(group, len, deflGrid) {
  const tubeEnd = len - 78
  const d = deflGrid * GRID_PX
  const sleeveStart = tubeEnd + d
  // 内杆(受拉时间隙中露出, 带格刻度)
  add(group,
    svg('rect', {x: tubeEnd - 2, y: -2.6, width: d > 0 ? d + 4 : 0, height: 5.2, class: 'strut-inner'}),
  )
  for (let g = 1; d > 0 && g <= Math.floor(d / GRID_PX + 1e-6); g++) {
    const x = tubeEnd + g * GRID_PX
    add(group, svg('line', {x1: x, y1: -6, x2: x, y2: 6, class: 'strut-tick'}))
  }
  // 刻度套管(先画, 受压时其起始段被后画的木管遮盖)+ 红环 + 铰接端黑盖
  const bands = [10, 26, 42]
  add(group, svg('rect', {x: sleeveStart, y: -6.5, width: len - 10 - sleeveStart, height: 13, rx: 2, class: 'strut-sleeve'}))
  bands.forEach(offset => {
    if (sleeveStart + offset + 8 < len - 4) {
      add(group, svg('rect', {x: sleeveStart + offset, y: -6.5, width: 8, height: 13, class: 'strut-band'}))
    }
  })
  add(group, svg('rect', {x: len - 12, y: -7.5, width: 8, height: 15, rx: 1.5, class: 'strut-cap'}))
  // 木管(后画, 覆盖缩回段): 管身 + 弹簧观察窗 + 端口
  add(group,
    svg('rect', {x: 0, y: -7, width: tubeEnd, height: 14, rx: 3, class: 'strut-tube'}),
    svg('line', {x1: 4, y1: -3.2, x2: tubeEnd - 6, y2: -3.2, class: 'strut-grain'}),
    svg('rect', {x: 14, y: -3.4, width: 30, height: 6.8, rx: 1.5, class: 'strut-window'}),
    svg('path', {d: `M15 0q3.8 -3 7.6 0t7.6 0t7.6 0t7.6 0`, fill: 'none', class: 'strut-coil'}),
    svg('rect', {x: tubeEnd - 3, y: -8, width: 4, height: 16, class: 'strut-tube-end'}),
  )
  return group
}

function gaugeNote(x, y, text, tone) {
  const txt = svg('text', {x, y, 'text-anchor': 'middle', class: `gauge-note gauge-note-${tone}`})
  txt.textContent = text
  return txt
}

// 标定用支杆测力计: 竖直持握, 上端细杆, 木管(弹簧观察窗), 刻度套管, 下端挂钩(frame-004/005).
// state.axial_force_g: 轴向外载(G 倍数, 受拉为正); state.calibrated: 标定完成提示.
export function renderTrussStrut(entity, state) {
  const group = svg('g')
  const load = Number(state.axial_force_g || 0)
  const d = load * GRID_PX
  add(group,
    shadow(0, 96, 16, 5),
    svg('rect', {x: -1.6, y: -40, width: 3.2, height: 40, class: 'strut-hold-rod'}),
    svg('circle', {cx: 0, cy: -43, r: 3, class: 'strut-hold-ring'}),
  )
  // 竖直杆 = 沿 +x 绘制后旋转 90°(+x → +y 屏幕向下): 局部原点即木管上端
  const strut = drawStrutAlongX(svg('g'), 118, load)
  strut.setAttribute('transform', 'rotate(90)')
  group.append(strut)
  // 下端挂钩: 套管端盖之后接吊环 + 弯钩
  const hookY = 118 + d
  add(group,
    svg('circle', {cx: 0, cy: hookY, r: 4.2, fill: '#f2f0e6', stroke: '#46575f', 'stroke-width': 2}),
    svg('path', {d: `M0 ${hookY + 4.2}q0 8 7 8`, fill: 'none', stroke: '#46575f', 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
  )
  if (state.calibrated) {
    group.append(gaugeNote(0, hookY + 30, '1  div = G', 'tension'))
  }
  return withLabel(group, entity, hookY + (state.calibrated ? 46 : 30))
}

// 三角桁架支架(一体复合器材, 先例 renderForceDecomposer): 底座 + 立柱 + 两夹持点 +
// 斜杆/横杆两根支杆测力计 + 顶点悬挂钩 + 重垂线 + 顶角弧标注(frame-006/008/012/013).
// 局部坐标原点取顶点悬挂钩; 横杆水平向左, 斜杆以 angle_deg(默认 30°, 与横杆夹角)伸向左上.
// state: loaded / incline_tension_g(受拉格数)/ horizontal_compression_g(受压格数)/ angle_deg.
export function renderTrussStand(entity, state) {
  const group = svg('g')
  const angleDeg = Number(state.angle_deg ?? entity?.properties?.angle_deg ?? 30)
  const theta = Math.max(10, Math.min(70, angleDeg)) * Math.PI / 180
  const L = Number(entity?.properties?.strut_len_px || 150)
  const loaded = Boolean(state.loaded)
  const tG = Number(state.incline_tension_g || 0)
  const cG = Number(state.horizontal_compression_g || 0)
  const columnX = -L - 8
  const baseY = 96
  // 立柱与底座(底座在立柱下端)
  add(group,
    shadow(columnX, baseY + 18, 46, 7),
    svg('path', {d: `M${columnX - 34} ${baseY + 14}H${columnX + 34}L${columnX + 22} ${baseY - 4}H${columnX - 22}Z`, class: 'metal-bracket'}),
    svg('rect', {x: columnX - 8, y: -L * Math.sin(theta) - 22, width: 16, height: baseY + L * Math.sin(theta) + 22, rx: 3, class: 'truss-column'}),
    svg('line', {x1: columnX - 3, y1: -L * Math.sin(theta) - 14, x2: columnX - 3, y2: baseY - 8, stroke: '#e6edee', 'stroke-width': 1.4}),
    svg('circle', {cx: columnX, cy: -L * Math.sin(theta) - 16, r: 3, class: 'screw'}),
  )
  // 夹持块: 横杆夹点(立柱上, 横杆高度)与斜杆夹点(沿斜杆方向上移)
  add(group,
    svg('rect', {x: columnX - 13, y: -10, width: 26, height: 20, rx: 3, class: 'metal-bracket'}),
    svg('circle', {cx: columnX, cy: 0, r: 3, class: 'screw'}),
  )
  // 横杆: 远端在立柱夹点, 沿 +x 到顶点
  const horizontal = drawStrutAlongX(svg('g'), L, loaded ? -cG : 0)
  horizontal.setAttribute('transform', `translate(${columnX + 8} 0)`)
  group.append(horizontal)
  // 斜杆: 长度 L/cosθ, 远端夹在立柱横杆夹点正上方(夹点 y = -L - tanθ), 旋转 theta 后铰接端落在顶点
  const inclineLen = L / Math.cos(theta)
  const incline = drawStrutAlongX(svg('g'), inclineLen, loaded ? tG : 0)
  incline.setAttribute('transform', `translate(${(-L).toFixed(1)} ${(-L * Math.tan(theta)).toFixed(1)}) rotate(${Math.max(10, Math.min(70, angleDeg)).toFixed(1)})`)
  group.append(incline)
  // 顶角弧(斜杆与横杆夹角)与度数标签
  const arcR = 34
  add(group, svg('path', {
    d: `M${-arcR} 0 A${arcR} ${arcR} 0 0 1 ${(-arcR * Math.cos(theta)).toFixed(1)} ${(-arcR * Math.sin(theta)).toFixed(1)}`,
    fill: 'none', stroke: '#3070d0', 'stroke-width': 1.8,
  }))
  const half = theta / 2
  const arcText = svg('text', {
    x: (-26 * Math.cos(half)).toFixed(1), y: (-26 * Math.sin(half) + 4).toFixed(1),
    'text-anchor': 'middle', class: 'angle-label',
  })
  arcText.textContent = `${Number(state.angle_deg ?? entity?.properties?.angle_deg ?? 30).toFixed(0)}°`
  // 顶点悬挂钩 + 重垂线(frame-009/012: 挂钩与铅垂方向标记)
  add(group,
    svg('circle', {cx: 0, cy: 0, r: 4.6, fill: '#f2f0e6', stroke: '#46575f', 'stroke-width': 2}),
    svg('path', {d: 'M0 4.6q0 7 6 7', fill: 'none', stroke: '#46575f', 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
    svg('line', {x1: 0, y1: 12, x2: 0, y2: 64, class: 'plumb-line'}),
    svg('path', {d: 'M0 64L-4 72L4 72Z', class: 'plumb-vane'}),
    arcText,
  )
  // 测力计读数标注: 斜杆受拉(红, 置于斜杆夹点上方空白区, 避让顶角弧与顶点箭头标签), 
  // 横杆受压(蓝, 横杆下方) - 数值来自 truss_strut_load 算子
  group.append(gaugeNote(columnX + 30, -L * Math.sin(theta) - 40, loaded ? `Inclined dynamometer: pull ${tG.toFixed(2)}  div` : 'Inclined dynamometer', 'tension'))
  group.append(gaugeNote(columnX / 2, 34, loaded ? `Horizontal dynamometer: press ${cG.toFixed(2)}  div` : 'Horizontal dynamometer', 'compression'))
  return withLabel(group, entity, baseY + 34)
}

// ---- 12 案例(光的偏振现象): 光具座 / 光源 / 凸透镜 / 偏振片 / 白屏 ----
// 光学链路约定: 光源口径, 透镜心, 偏振片膜心均取各自局部 (0,0), 光轴为过原点的水平线, 
// 传播方向 +x(场景中光源/透镜/偏振片同 y≈0.58 等高, 滑块底统一在局部 y=+70); 
// 白屏中心 y≈0.54 在光轴下方 20px(世界坐标 y_px=560−500y), 光斑画在屏局部
// y=−17.4(=−20px÷1.15 屏 scale)使默认摆位下光斑正对光轴.光具座 y≈0.40, 
// 导轨顶恰在滑块底(局部+70 → 全局 340px)处承接器件; 导轨 z 最低横贯舞台下部.

// 光具座(frame-002/003): 铝型材导轨 + 正面白色标尺条(0-30cm, 每 5cm 主刻度标数字, 
// 每 1cm 短刻度), 两端支脚.局部原点取导轨中心(场景 x=0.5), 20px = 1cm.
export function renderOpticalBench(entity, state) {
  const group = svg('g')
  const half = 15 * 20
  const ticks = []
  for (let cm = 0; cm <= 30; cm += 1) {
    const x = (cm - 15) * 20
    const major = cm % 5 === 0
    ticks.push(svg('line', {x1: x, y1: 11, x2: x, y2: major ? 20 : 16, class: 'scale-markings'}))
    if (major) {
      const txt = svg('text', {x, y: 32, 'text-anchor': 'middle', class: 'scale-reading'})
      txt.textContent = String(cm)
      ticks.push(txt)
    }
  }
  add(group,
    shadow(0, 44, 230, 7),
    svg('rect', {x: -half, y: -12, width: half * 2, height: 20, rx: 2, class: 'metal-bracket'}),
    svg('rect', {x: -half + 8, y: -7, width: half * 2 - 16, height: 5, rx: 2.5, fill: '#8f9fa3'}),
    svg('rect', {x: -half, y: 8, width: half * 2, height: 26, fill: '#f3f0e4', stroke: '#5b6a6d', 'stroke-width': 1.5}),
    ...ticks,
    svg('path', {d: 'M-262 34h32l-7 12h-18Z', class: 'metal-bracket'}),
    svg('path', {d: 'M262 34h-32l7 12h18Z', class: 'metal-bracket'}),
  )
  return withLabel(group, entity, 64)
}

// 光源(frame-002): 银灰色金属灯箱(左后侧四条散热格栅百叶), 前端深色斜面板中央为
// 圆形发光口径(口径心=局部原点, 落在光轴上), 架在导轨滑块上, 尾部垂下电源线; 
// 口径静态发光, 并向右画约 120px 淡光束暗示照明方向(透镜将其会聚为平行光).
export function renderLightSource(entity, state) {
  const group = svg('g')
  const louvers = []
  for (let i = 0; i < 4; i += 1) {
    louvers.push(svg('rect', {x: -30, y: -38 + i * 14, width: 32, height: 8, rx: 4, fill: '#d7e2e5', stroke: '#7b8a8d', 'stroke-width': 1}))
  }
  add(group,
    shadow(0, 72, 46, 7),
    svg('path', {d: 'M28 -6L150 -14L150 14L28 6Z', fill: '#fff3c4', opacity: .16}),
    svg('path', {d: 'M28 -2.6L140 -7.5L140 7.5L28 2.6Z', fill: '#fff3c4', opacity: .22}),
    svg('path', {d: 'M-28 24q-7 24 3 44', fill: 'none', stroke: '#c9a23a', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-34 -44H12L26 -28V20H-34Z', class: 'metal-bracket'}),
    ...louvers,
    svg('path', {d: 'M12 -44L26 -28V20H12Z', fill: '#4a565c', stroke: '#2c3840', 'stroke-width': 1.5, 'stroke-linejoin': 'round'}),
    svg('circle', {cx: 26, cy: 0, r: 14, fill: '#fff3c4', opacity: .35}),
    svg('circle', {cx: 26, cy: 0, r: 10, fill: '#2c3840'}),
    svg('circle', {cx: 26, cy: 0, r: 7, fill: '#ffedb0'}),
    svg('circle', {cx: 26, cy: 0, r: 3.6, fill: '#fffdf0'}),
    svg('rect', {x: -3, y: 20, width: 6, height: 38, rx: 2, fill: '#9aa6aa', stroke: '#5b6a6d', 'stroke-width': 1.4}),
    svg('path', {d: 'M-16 58h32l-6 13h-20Z', class: 'metal-bracket'}),
  )
  return withLabel(group, entity, 84)
}

// 凸透镜(frame-001/006/017): 圆形玻璃透镜镶在金属圆框内, 装在立杆+滑块支架上, 
// 镜心=局部原点落在光轴上(视频中因拍摄角度透镜呈圆形正面像, 按证据帧圆形绘制).
export function renderConvexLens(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 72, 22, 5),
    svg('rect', {x: -3, y: 22, width: 6, height: 36, rx: 2, fill: '#9aa6aa', stroke: '#5b6a6d', 'stroke-width': 1.4}),
    svg('rect', {x: -16, y: 58, width: 32, height: 12, rx: 3, class: 'metal-bracket'}),
    svg('circle', {cx: 0, cy: 0, r: 26, class: 'glass-body'}),
    svg('circle', {cx: 0, cy: 0, r: 26, fill: 'none', stroke: '#8fa2ab', 'stroke-width': 4.5}),
    svg('circle', {cx: 0, cy: 0, r: 28.8, fill: 'none', stroke: '#5b6a6d', 'stroke-width': 1.4}),
    svg('circle', {cx: 0, cy: 0, r: 23.2, fill: 'none', stroke: '#e8f2f4', 'stroke-width': 1.2, opacity: .7}),
    svg('ellipse', {cx: -8, cy: -10, rx: 6, ry: 3.4, fill: '#ffffff', opacity: .6}),
  )
  return withLabel(group, entity, 74)
}

// 偏振片(frame-006/007/008/011/016/017/023): 黑色圆形拨盘(盘面每 10° 刻度线与
// 0/90 数字随盘旋转), 中心奶白色方形膜盒内嵌深色偏振膜, 膜盒顶部金属棍指示透振方向.
// state.angle_deg(0°=竖直向上, 顺时针为正)驱动刻度+膜盒+金属棍整体绕盘心 SVG rotate, 
// 盘心=局部原点落在光轴上; 盘上方固定角度读数(不随盘转, 便于读数).
// state.inserted 本 case 恒 true, 不做特殊渲染(装片流程已按 IR 假设简化).
export function renderPolarizer(entity, state) {
  const group = svg('g')
  const angle = Number(state.angle_deg || 0)
  const ticks = []
  for (let deg = 0; deg < 360; deg += 10) {
    const major = deg % 90 === 0
    const rad = deg * Math.PI / 180
    const r1 = major ? 29 : 32.5
    ticks.push(svg('line', {
      x1: (r1 * Math.sin(rad)).toFixed(2), y1: (-r1 * Math.cos(rad)).toFixed(2),
      x2: (37 * Math.sin(rad)).toFixed(2), y2: (-37 * Math.cos(rad)).toFixed(2),
      stroke: '#cfd8da', 'stroke-width': major ? 2 : 1.1,
    }))
  }
  const zero = svg('text', {x: 0, y: -21, 'text-anchor': 'middle', fill: '#e8eeee', style: 'font: 700 9px/1 ui-monospace, SFMono-Regular, Menlo, monospace', 'pointer-events': 'none'})
  zero.textContent = '0'
  const ninety = svg('text', {transform: 'translate(24 0) rotate(90)', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#e8eeee', style: 'font: 700 9px/1 ui-monospace, SFMono-Regular, Menlo, monospace', 'pointer-events': 'none'})
  ninety.textContent = '90'
  const dial = svg('g', {transform: `rotate(${angle.toFixed(1)})`})
  add(dial,
    svg('circle', {cx: 0, cy: 0, r: 40, fill: '#2e3538', stroke: '#1d2a30', 'stroke-width': 2}),
    ...ticks,
    zero,
    ninety,
    // 膜盒: 奶白方形前置框 + 深色偏振膜(frame-011/016 膜盒正面)
    svg('rect', {x: -15, y: -15, width: 30, height: 30, rx: 3, fill: '#efe8d2', stroke: '#5b6a6d', 'stroke-width': 1.5}),
    svg('circle', {cx: 0, cy: 0, r: 9.5, fill: '#46584e', stroke: '#2c3840', 'stroke-width': 1}),
    // 金属棍: 透振方向指针, 随盘旋转(frame-008/010 特写: 膜盒顶部竖直短棍)
    svg('rect', {x: -1.8, y: -36, width: 3.6, height: 21, rx: 1.8, fill: '#c9d4d8', stroke: '#5b6a6d', 'stroke-width': 1.2}),
  )
  add(group,
    shadow(0, 66, 24, 5),
    svg('rect', {x: -2.5, y: 36, width: 5, height: 24, rx: 2, fill: '#9aa6aa', stroke: '#5b6a6d', 'stroke-width': 1.4}),
    svg('rect', {x: -16, y: 58, width: 32, height: 12, rx: 3, class: 'metal-bracket'}),
    dial,
  )
  const readout = svg('text', {x: 0, y: -48, 'text-anchor': 'middle', class: 'angle-label'})
  readout.textContent = `${angle.toFixed(0)}°`
  group.append(readout)
  return withLabel(group, entity, 84)
}

// 白屏(frame-004/005/017): 竖立白色屏幕面板(左侧淡蓝边条为屏侧框), 光轴高度处呈现
// 圆形透射光斑.state.intensity(0-1 相对光强)驱动光斑半径与不透明度连续缩放: 
// ≥0.4 明亮大斑, ≈0.25 中等, ≈0.05 很暗, <0.01 几乎不可见(消光, 对应 frame-017); 
// state.conclusion_recorded 时面板右上角出现已记录徽标(预览图自动隐藏).
// 场景里屏中心 y≈0.54, 光轴 y≈0.58(光轴在屏中心上方 20px 世界坐标), 
// 光斑画在局部 y=−17.4(=−20px÷1.15 屏 scale), 默认摆位下光斑恰好正对光轴.
export function renderScreen(entity, state) {
  const group = svg('g')
  const intensity = Math.max(0, Math.min(1, Number(state.intensity || 0)))
  const radius = 8 + 20 * Math.sqrt(intensity)
  const opacity = intensity <= 0.01 ? 0.08 : 0.15 + 0.85 * Math.pow(intensity, 0.75)
  add(group,
    shadow(0, 172, 40, 7),
    svg('rect', {x: -36, y: -165, width: 72, height: 332, rx: 4, fill: '#f6f4ec', stroke: '#5b6a6d', 'stroke-width': 2}),
    svg('rect', {x: -36, y: -165, width: 5, height: 332, fill: '#8ea6c8', opacity: .75}),
    svg('path', {d: 'M-28 167h22l-5 11h-13Z', class: 'metal-bracket'}),
    svg('path', {d: 'M28 167h-22l5 11h13Z', class: 'metal-bracket'}),
  )
  const spot = svg('g')
  if (intensity > 0.15) {
    spot.append(svg('circle', {cx: 0, cy: -17.4, r: (radius * 1.6).toFixed(1), fill: '#fff3c4', opacity: (0.3 * intensity).toFixed(3)}))
  }
  spot.append(svg('circle', {cx: 0, cy: -17.4, r: radius.toFixed(1), fill: intensity > 0.3 ? '#fffdf0' : '#f1eeda', opacity: opacity.toFixed(3)}))
  group.append(spot)
  if (state.conclusion_recorded) {
    const badge = svg('g', {transform: 'translate(10 -140)'})
    add(badge, svg('rect', {x: -26, y: -11, width: 52, height: 22, rx: 4, class: 'verified-badge'}))
    const txt = svg('text', {y: 4.5, 'text-anchor': 'middle', class: 'verified-badge-text'})
    txt.textContent = 'Recorded'
    badge.append(txt)
    group.append(badge)
  }
  return withLabel(group, entity, 192)
}

//  -  右手定则案例(49)电磁器材: registries/discovered/physics.*.v1.svg 设计稿的 code-native 实现  - 

// 蹄形磁铁.原点=磁极间隙几何中心, 开口朝 +x, 极隙高 20(y -10..10), 落地约 +35.
// state.flipped=false → 上臂红 N, 下臂蓝 S(磁场经极隙向下); true → 对调.
// 翻转的等效实现: 同一 C 形路径画两遍, 借两个半幅 clipPath 分别填上/下臂颜色, 
// 极面白块与字母随臂换色换字(字母不镜像, 保持可读).
export function renderHorseshoeMagnet(entity, state) {
  const group = svg('g')
  const flipped = state.flipped === true
  const topFill = flipped ? '#2a4d8f' : '#c0392b'
  const topStroke = flipped ? '#152a4e' : '#7e2118'
  const bottomFill = flipped ? '#c0392b' : '#2a4d8f'
  const bottomStroke = flipped ? '#7e2118' : '#152a4e'
  const topLetter = flipped ? 'S' : 'N'
  const bottomLetter = flipped ? 'N' : 'S'
  const topLetterFill = flipped ? '#cdd9f2' : '#f6d9d4'
  const bottomLetterFill = flipped ? '#f6d9d4' : '#cdd9f2'
  const bodyPath = 'M 44 -34 L -20 -34 A 34 34 0 0 0 -54 0 A 34 34 0 0 0 -20 34 L 44 34 L 44 10 L -20 10 A 10 10 0 0 1 -20 -10 L 44 -10 Z'
  const defs = svg('defs')
  const clipTop = svg('clipPath', {id: 'rhr-magnet-clip-top'})
  clipTop.append(svg('rect', {x: -72, y: -56, width: 144, height: 56}))
  const clipBottom = svg('clipPath', {id: 'rhr-magnet-clip-bottom'})
  clipBottom.append(svg('rect', {x: -72, y: 0, width: 144, height: 56}))
  defs.append(clipTop, clipBottom)
  group.append(defs)
  add(group,
    shadow(2, 42, 60, 8),
    svg('path', {d: bodyPath, fill: topFill, stroke: topStroke, 'stroke-width': 2, 'stroke-linejoin': 'round', 'clip-path': 'url(#rhr-magnet-clip-top)'}),
    svg('path', {d: bodyPath, fill: bottomFill, stroke: bottomStroke, 'stroke-width': 2, 'stroke-linejoin': 'round', 'clip-path': 'url(#rhr-magnet-clip-bottom)'}),
    // 顶部与背部柔和高光
    svg('path', {d: 'M -22 -31.5 H 42', stroke: 'rgb(255 255 255 / 35%)', 'stroke-width': 2.4, 'stroke-linecap': 'round', fill: 'none'}),
    svg('path', {d: 'M -51 -14 A 30 30 0 0 1 -46 -24', stroke: 'rgb(255 255 255 / 22%)', 'stroke-width': 2.2, 'stroke-linecap': 'round', fill: 'none'}),
    // 白色极面(相对, 翻转不变)
    svg('rect', {x: 44, y: -34, width: 12, height: 24, rx: 1.5, fill: '#eef0ec', stroke: '#b9bfb6', 'stroke-width': 1.4}),
    svg('rect', {x: 44, y: 10, width: 12, height: 24, rx: 1.5, fill: '#eef0ec', stroke: '#b9bfb6', 'stroke-width': 1.4}),
    svg('rect', {x: 44, y: -34, width: 3.5, height: 24, fill: 'rgb(0 0 0 / 8%)'}),
    svg('rect', {x: 44, y: 10, width: 3.5, height: 24, fill: 'rgb(0 0 0 / 8%)'}),
  )
  const n = svg('text', {x: -32, y: -13, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: topLetterFill})
  n.textContent = topLetter
  const s = svg('text', {x: -32, y: 31, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: bottomLetterFill})
  s.textContent = bottomLetter
  group.append(n, s)
  // 不加台面标签: N/S 字母已自明, 且与下方绝缘支架标签重叠(复审前截图发现)
  return group
}

// 多匝悬吊线圈.原点=线圈框几何中心, 框体 x ±22 / y -28..28, 底边铜条为切割导体(y 22..31), 
// 两根吊线自框顶收拢于悬挂点 (0,-130)(对齐 IR 挂靠几何: hang 锚 -0.26, 挂靠 gap -0.26).
// 引出线红/黑由 assumptions 固化处理, 不画(悬点以上归背景布线).
export function renderSuspendedCoil(entity, state) {
  const group = svg('g')
  add(group,
    svg('path', {d: 'M -13 -25 C -13 -62 -4 -100 0 -130', fill: 'none', stroke: '#8d9499', 'stroke-width': 1.8, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M 13 -25 C 13 -62 4 -100 0 -130', fill: 'none', stroke: '#767d82', 'stroke-width': 1.8, 'stroke-linecap': 'round'}),
    svg('circle', {cx: 0, cy: -130, r: 2.4, fill: '#5b6a6d'}),
    // 多匝绕线框体 + 横向匝线纹理
    svg('rect', {x: -22, y: -28, width: 44, height: 56, rx: 3, fill: '#3b2d27', stroke: '#1c1512', 'stroke-width': 2}),
    svg('path', {d: 'M -20.5 -25 V 24', stroke: 'rgb(255 255 255 / 16%)', 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
    // 顶部奶白扎带(frame-012)
    svg('rect', {x: -22, y: -23, width: 44, height: 7, fill: '#eae2cf', stroke: '#c4b795', 'stroke-width': 1}),
    // 底边切割导体(铜条)
    svg('rect', {x: -23, y: 22, width: 46, height: 9, rx: 3.5, fill: '#b0643a', stroke: '#6e3a1e', 'stroke-width': 1.6}),
    svg('path', {d: 'M -19 24.5 H 19', stroke: 'rgb(255 235 210 / 45%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
  )
  const texture = svg('g', {stroke: '#241b17', 'stroke-width': 1.2, opacity: 0.75})
  for (const y of [-19, -14, -9, -4, 1, 6, 11, 16]) texture.append(svg('path', {d: `M -21 ${y} H 21`}))
  group.append(texture)
  return group
}

// 灵敏电流计.原点=指针转轴(表盘弧心, 表盘中下部), 木壳落地 +42.
// state.needle_pos ∈ [-1,1] 映射指针角 -45°..+45°(负=左偏), 0 位竖直向上; 
// 数值补间由 motion 层 numericDiffs/applyLerp 统一驱动, 渲染器只按当前值摆指针.
export function renderGalvanometer(entity, state) {
  const group = svg('g')
  const needlePos = Math.max(-1, Math.min(1, Number(state.needle_pos || 0)))
  const angle = needlePos * 45
  add(group,
    shadow(0, 44, 44, 6),
    // 木壳箱体 + 顶檐
    svg('rect', {x: -36, y: -64, width: 72, height: 98, rx: 3, fill: '#a96a2b', stroke: '#6b3f16', 'stroke-width': 2}),
    svg('rect', {x: -40, y: -71, width: 80, height: 9, rx: 2, fill: '#b5722f', stroke: '#6b3f16', 'stroke-width': 2}),
    // 观察窗
    svg('rect', {x: -30, y: -60, width: 60, height: 78, rx: 2, class: 'glass-body'}),
    // 窗内下部机芯阴影 + 红色蹄形磁芯剪影(frame-001)
    svg('rect', {x: -29, y: -6, width: 58, height: 23, fill: 'rgb(58 54 48 / 22%)'}),
    svg('path', {d: 'M -13 16 V 2 A 13 13 0 0 1 13 2 V 16 H 4.5 V 4 A 6 6 0 0 0 -4.5 4 L -4.5 16 Z', fill: '#c0392b', opacity: 0.92}),
    svg('path', {d: 'M 4.5 16 V 4 A 6 6 0 0 0 -4.5 4', fill: 'none', stroke: '#8f2a1d', 'stroke-width': 1.2}),
    // 奶白表盘卡
    svg('rect', {x: -29, y: -58, width: 58, height: 46, rx: 2, fill: '#f2ecdb', stroke: '#b8ad92', 'stroke-width': 1}),
  )
  // 刻度: 长划 ±45°/±22.5°/0°, 短划均分
  add(group,
    svg('path', {d: 'M -17 -27 L -20.5 -30.5 M -9.2 -32.3 L -11.1 -36.6 M 0 -34 L 0 -39 M 9.2 -32.3 L 11.1 -36.6 M 17 -27 L 20.5 -30.5', stroke: '#3a3632', 'stroke-width': 1.7, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M -13.5 -30 L -16 -34 M -4.8 -33.6 L -5.7 -38.4 M 4.8 -33.6 L 5.7 -38.4 M 13.5 -30 L 16 -34', stroke: '#3a3632', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: 0.8}),
  )
  for (const [x, y, text, fill] of [[-24.5, -31, '5', '#2f2b26'], [0, -44, '0', '#2f2b26'], [24.5, -31, '5', '#2f2b26'], [0, -19, 'V/A', '#4a453e']]) {
    const t = svg('text', {x, y, 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700, fill})
    t.textContent = text
    group.append(t)
  }
  const needle = svg('polygon', {points: '-1.7,-8.5 1.7,-8.5 0,-38', fill: '#c22a1e', transform: `rotate(${angle.toFixed(2)} 0 -10)`})
  group.append(needle, svg('circle', {cx: 0, cy: -10, r: 2.6, fill: '#8f1f14'}))
  // 下部面板: −/+ 接线柱与中央调零旋钮(frame-008)
  add(group,
    svg('rect', {x: -30, y: 20, width: 60, height: 12, fill: '#e9e2cf', stroke: '#b8ad92', 'stroke-width': 1.2}),
    svg('circle', {cx: -16, cy: 26, r: 3.4, fill: '#c9a24b', stroke: '#8a6a2a', 'stroke-width': 1.4}),
    svg('circle', {cx: 16, cy: 26, r: 3.4, fill: '#c9a24b', stroke: '#8a6a2a', 'stroke-width': 1.4}),
    svg('circle', {cx: 0, cy: 26, r: 2.4, fill: '#2a2e33', stroke: '#101316', 'stroke-width': 1}),
    svg('rect', {x: -40, y: 34, width: 80, height: 8, rx: 2, fill: '#8f5620', stroke: '#6b3f16', 'stroke-width': 2}),
  )
  const minus = svg('text', {x: -23, y: 29, 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 700, fill: '#2f2b26'})
  minus.textContent = '−'
  const plus = svg('text', {x: 23, y: 29, 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 700, fill: '#c22a1e'})
  plus.textContent = '+'
  group.append(minus, plus)
  return withLabel(group, entity, 56)
}

// 干电池组(storage).原点=盒体几何中心附近, 落地 +15; 两节串联横卧于蓝色开口盒.
export function renderDryCell(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 17, 64, 6),
    // 引出线端子(红左黑右, 短引线示意)
    svg('path', {d: 'M -58 -4 C -70 -4 -70 8 -60 11', fill: 'none', stroke: '#c23b2a', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
    svg('circle', {cx: -60, cy: 11, r: 2.6, fill: '#c23b2a'}),
    svg('path', {d: 'M 58 -4 C 70 -4 70 8 60 11', fill: 'none', stroke: '#2e3238', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
    svg('circle', {cx: 60, cy: 11, r: 2.6, fill: '#2e3238'}),
    // 蓝色开口电池盒 + 盒口内腔
    svg('rect', {x: -60, y: -14, width: 120, height: 29, rx: 4, fill: '#4d8ad0', stroke: '#274f86', 'stroke-width': 2}),
    svg('rect', {x: -56, y: -11, width: 112, height: 19, rx: 2.5, fill: '#24507f'}),
    svg('path', {d: 'M -58 -13 H 58', stroke: 'rgb(255 255 255 / 30%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
  )
  for (const x of [-52, 4]) {
    add(group,
      svg('rect', {x, y: -8, width: 48, height: 14, rx: 6.5, fill: '#c6cbd2', stroke: '#7d848d', 'stroke-width': 1.4}),
      svg('rect', {x: x + 45, y: -6.5, width: 3.5, height: 11, rx: 1.4, fill: '#8f979f'}),
      svg('path', {d: `M ${x + 4} -6 H ${x + 40}`, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
      svg('rect', {x: x + 18, y: -8, width: 10, height: 14, fill: 'rgb(47 62 84 / 22%)'}),
    )
  }
  return withLabel(group, entity, 30)
}

// 单刀开关(storage, adjust).原点=底座顶面中点, 落地 +14.
// state.closed=false → 闸刀绕铰轴 (-24,-12) 掀起 40°; true → 水平落入右触刀座.
export function renderKnifeSwitch(entity, state) {
  const group = svg('g')
  add(group,
    shadow(0, 14, 42, 5.5),
    // 黑色底座与脚
    svg('rect', {x: -34, y: -4, width: 68, height: 14, rx: 3, fill: '#23272b', stroke: '#101316', 'stroke-width': 2}),
    svg('rect', {x: -28, y: 10, width: 10, height: 4, rx: 1.5, fill: '#1a1d20'}),
    svg('rect', {x: 18, y: 10, width: 10, height: 4, rx: 1.5, fill: '#1a1d20'}),
    svg('path', {d: 'M -30 -2.5 H 30', stroke: 'rgb(255 255 255 / 14%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    // 左端铰轴立柱 + 右端触刀座立柱
    svg('rect', {x: -28, y: -12, width: 8, height: 9, rx: 1.5, fill: '#c9a24b', stroke: '#8a6a2a', 'stroke-width': 1.4}),
    svg('rect', {x: 21, y: -14, width: 7, height: 11, rx: 1.5, fill: '#c9a24b', stroke: '#8a6a2a', 'stroke-width': 1.4}),
    svg('rect', {x: 20, y: -14, width: 9, height: 2.6, rx: 1.2, fill: '#d9b264'}),
  )
  // 闸刀(闭合 0° / 断开掀起 -40°)
  const blade = svg('g', {transform: `rotate(${state.closed ? 0 : -40} -24 -12)`})
  add(blade,
    svg('rect', {x: -24, y: -14.5, width: 52, height: 5, rx: 2, fill: '#c9a24b', stroke: '#8a6a2a', 'stroke-width': 1.4}),
    svg('path', {d: 'M -20 -13.5 H 22', stroke: 'rgb(255 255 255 / 40%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
    svg('rect', {x: 26, y: -16.5, width: 9, height: 9, rx: 4, fill: '#2a2e33', stroke: '#101316', 'stroke-width': 1.4}),
  )
  group.append(blade)
  add(group,
    svg('circle', {cx: -24, cy: -12, r: 4, fill: '#c9a24b', stroke: '#8a6a2a', 'stroke-width': 1.4}),
    svg('circle', {cx: -24, cy: -12, r: 1.4, fill: '#6f541f'}),
    // 底座接线柱螺丝
    svg('circle', {cx: -34, cy: 0, r: 2.6, fill: '#c9a24b', stroke: '#8a6a2a', 'stroke-width': 1.2}),
    svg('circle', {cx: 34, cy: 0, r: 2.6, fill: '#c9a24b', stroke: '#8a6a2a', 'stroke-width': 1.2}),
  )
  return withLabel(group, entity, 28)
}
