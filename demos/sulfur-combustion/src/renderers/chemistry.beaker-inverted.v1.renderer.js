import {add, label, shadow, svg} from './svg.js'

//  -  干燥烧杯(100 mL)倒扣变体: 杯口朝下罩住火焰  - 
// 视觉依据: frame-010(倒扣烧杯罩向火焰: 杯口朝下, 杯底封闭端在视觉上方, 刻度数字随杯体
// 上下颠倒); frame-016/018(罩住燃烧中: 刻度 20/40/60/80/100 自封闭端向杯口递增, 数字
// 旋转 180°, 杯底端右侧有白色磨砂标签贴, 口沿左侧有微小导流嘴, 杯内自封闭端向下积雾/
// 内壁凝水珠为 IR 声明的教材结论可视化, 见 experiment.json assumptions - 全分辨率帧未见
// 明确水雾特写).无液层(initial_state 无 volume, 干杯).
// 风格依据: chemistry.js renderBeaker 的玻璃画法整体翻转复用 - glass-body 杯体, glass-rim
// 口沿, glass-highlight 竖向高光, apparatus-shadow 接地阴影; 雾层按 vesselGasLayer 同构
// 路径镜像(gas_level 0..1 自封闭端即视觉上方向下积累, 配色/class 与 vesselGasLayer 一致: 
// fill rgb(213 233 240 / 40%) class gas-layer, 界线 rgb(150 185 196 / 50%) class gas-layer-top); 
// 刻度线沿用 measure-marks 既有 class, 倒置数字为 inline 配色(无既有刻度数字 class, 
// 不新增 styles.css class).器械标签保持正立, 置于杯底(封闭端)一端外侧.
// 与既有 chemistry.beaker.v1 的关系: 同一器材的正立渲染器不能诚实表达倒扣态(雾层积累
// 方向, 刻度/标签朝向, 水珠挂壁位置均烘焙在局部坐标中, transform 旋转 180° 会反写标签并
// 左右镜像丝印), 故按 IR visual.asset_ref 另立渲染键 chemistry/beaker-inverted.
// 状态约定: state.gas_level(兼容 co2_level)0..1 → 雾层自封闭端(视觉上方)向下积累; 
// state.condensed=true → 内壁 3~5 颗 glistening 水珠(实现 4 颗, 位置确定性排布); 
// 不渲染液层(volume_ml 有意忽略 - 干燥烧杯).
// 导出签名与 chemistry.js 一致: renderBeakerInverted(entity, state, context).

// gas_level 0..1(与 chemistry.js gasLevel 同语义的本地实现, 保持模块自包含; 
// 集成进 chemistry.js 时可直接换用其导出的 gasLevel)
function gasLevel(state) {
  const value = Number(state.gas_level ?? state.co2_level ?? 0)
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0
}

// 内壁水珠(glistening droplets): 杯体倒置后水珠挂在封闭端附近的玻璃内壁两侧, 
// 确定性坐标(渲染结果可复现, 便于测试与截图比对)
function wallDroplets() {
  const drops = [
    {cx: -22.5, cy: -6, r: 2.0},
    {cx: 22, cy: -14, r: 1.7},
    {cx: -20.5, cy: 9, r: 1.9},
    {cx: 23, cy: 3, r: 1.6},
  ]
  return drops.map(({cx, cy, r}) => {
    const drop = svg('g')
    drop.append(
      svg('circle', {cx, cy, r, fill: 'rgb(240 250 253 / 88%)', stroke: 'rgb(125 165 178 / 55%)', 'stroke-width': 0.6}),
      svg('circle', {cx: cx - r * 0.3, cy: cy - r * 0.35, r: r * 0.28, fill: '#ffffff', opacity: 0.95}),
    )
    return drop
  })
}

export function renderBeakerInverted(entity, state = {}) {
  const group = svg('g')
  const level = gasLevel(state)
  const fogBottom = -29 + level * 58 // 雾层下边界: 0=贴封闭端(不画), 1=接近杯口内壁
  add(group,
    shadow(0, 40, 33, 7),
    // 杯体: renderBeaker 杯体路径整体翻转(杯口朝下 ±31, 封闭端在视觉上方)
    svg('path', {d: 'M-31 35H31L27-29Q26-35 19-35H-19Q-26-35-27-29Z', class: 'glass-body'}),
    // 雾层: vesselGasLayer 同构路径的镜像 - 自封闭端(视觉上方)向下积累
    level > 0 ? svg('path', {
      d: `M-27 ${fogBottom}Q0 ${fogBottom + 3} 27 ${fogBottom}V-29Q26-33 19-33H-19Q-26-33-27-29Z`,
      fill: 'rgb(213 233 240 / 40%)', class: 'gas-layer',
    }) : null,
    level > 0 ? svg('path', {
      d: `M-27 ${fogBottom}Q0 ${fogBottom + 4} 27 ${fogBottom}`,
      fill: 'none', stroke: 'rgb(150 185 196 / 50%)', 'stroke-width': 1.2, class: 'gas-layer-top',
    }) : null,
    // 内壁水珠(condensed)
    state.condensed ? wallDroplets() : null,
    // 口沿(renderBeaker rim 镜像: 开口在下方)+ 导流嘴小尖(frame-016 口沿左侧)
    svg('path', {d: 'M-32 35H33M-31 31Q-25 28-19 31', class: 'glass-rim'}),
    svg('path', {d: 'M-31 35Q-36 35.5-38 32.5', class: 'glass-rim'}),
  )
  // 刻度: 量值随倒置自封闭端向杯口递增(20 在上, 100 靠近杯口, frame-016), 
  // 数字随杯体旋转 180°("20"读作"02")
  const marks = svg('g', {class: 'measure-marks'})
  const DIGITS = [20, 40, 60, 80, 100]
  DIGITS.forEach((value, index) => {
    const y = -20 + index * 10
    marks.append(svg('path', {d: `M21 ${y}H28`}))
    if (index < DIGITS.length - 1) marks.append(svg('path', {d: `M21 ${y + 5}H25.5`}))
    const digit = svg('text', {
      x: 14, y: y + 2.3, 'text-anchor': 'middle',
      transform: `rotate(180 14 ${y + 2.3})`,
      fill: '#4c6b74', opacity: 0.9,
      'font-family': 'ui-sans-serif, system-ui, sans-serif', 'font-size': 6.5, 'font-weight': 600,
    })
    digit.textContent = String(value)
    marks.append(digit)
  })
  group.append(marks)
  add(group,
    // 磨砂标签贴(frame-010/016 杯底端右侧白色贴片; 贴上文字在 640x360 证据帧中不可辨, 
    // 以两道浅色文字线示意)
    svg('rect', {x: 7, y: -34, width: 18, height: 10, rx: 1.5, fill: 'rgb(250 253 254 / 82%)', stroke: 'rgb(160 180 186 / 60%)', 'stroke-width': 0.8}),
    svg('path', {d: 'M10-30.5H22M10-27.5H19', fill: 'none', stroke: '#9fb3ba', 'stroke-width': 1}),
    // 竖向高光(renderBeaker highlight 镜像)
    svg('path', {d: 'M-19 28V-24', class: 'glass-highlight'}),
  )
  // 器械标签保持正立, 置于杯底(封闭端)一端外侧
  group.append(label(entity.label, 0, -55))
  return group
}
