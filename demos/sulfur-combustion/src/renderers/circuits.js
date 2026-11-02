import {add, label, shadow, svg} from './svg.js'

//  -  29-集成运算放大电路(μA741 反相比例放大)电路域渲染器  - 
// 舞台 1000×560px(scene x∈[0,1]→x*1000, y∈[0,1]→560-y*500), 本文件全部为器材局部坐标.
// 视觉依据: frame-001/006/013(实验箱浅色面板 + 青蓝装饰色带 + 深藏蓝小块), frame-006/010 旁白
// (芯片插在管座上, 豁口朝左, 左下角圆点, 管脚经插孔引出), frame-008 管脚图(②反相 ③同相 ④V−
// ⑥输出 ⑦V+, ①⑤调零 ⑧空脚), 旁白(信号源在箱右上角 -12V~+12V 连续可调, 下排一排地线插孔).

function txt(content, x, y, className, attributes = {}) {
  const node = svg('text', {x, y, 'text-anchor': 'middle', class: className, ...attributes})
  node.textContent = content
  return node
}

// 插座区占位检测: 世界状态里 above === 本区 的器材(电阻/导线/表笔落位后由此点亮占位反馈)
function occupantOf(context, zoneId) {
  const world = context?.world || {}
  return Object.values(world).find(item => item && item.above === zoneId) || null
}

// ── 电子技术实验箱(大盘面, 680×340)──
// 面板只画结构件: 机壳, 标题带, 功能区底板, IC 插座与管脚引出插孔.
// ±15V 电源 / 信号源 / 输出端 / 接地排 / 电阻支路座等功能块由 socket_zone 实体各自渲染, 
// 避免面板与功能区两处绘制互相错位.
export function renderTrainer(entity) {
  const group = svg('g')
  const pinY = [-51, -37, -23, -9] // ④③②①(左列自上而下)＝⑤⑥⑦⑧(右列自上而下)
  const jacks = []
  const traces = []
  pinY.forEach(y => {
    traces.push(
      svg('line', {x1: -62, y1: y, x2: -70, y2: y, class: 'circuit-trace'}),
      svg('line', {x1: 62, y1: y, x2: 70, y2: y, class: 'circuit-trace'}),
    )
    jacks.push(
      svg('circle', {cx: -74, cy: y, r: 4.5, class: 'circuit-jack'}),
      svg('circle', {cx: 74, cy: y, r: 4.5, class: 'circuit-jack'}),
    )
  })
  add(group,
    shadow(0, 172, 340, 10),
    svg('rect', {x: -340, y: -170, width: 680, height: 340, rx: 12, class: 'circuit-chassis'}),
    svg('rect', {x: -326, y: -156, width: 652, height: 312, rx: 8, class: 'circuit-face'}),
    // 顶部青蓝标题带(frame-006 面板实测青蓝色带 rgb(80,126,138))
    svg('path', {d: 'M-326 -148a8 8 0 0 1 8-8h636a8 8 0 0 1 8 8v26h-652Z', class: 'circuit-band'}),
    txt('Electronics trainer box - integrated operational amplifier circuit', 0, -133, 'circuit-title'),
    // 功能区底板: 左电源区 / 右信号源区 / 下部接线工作区
    svg('rect', {x: -334, y: -124, width: 128, height: 118, rx: 6, class: 'circuit-region'}),
    svg('rect', {x: 206, y: -124, width: 128, height: 118, rx: 6, class: 'circuit-region'}),
    svg('rect', {x: -334, y: 26, width: 668, height: 136, rx: 6, class: 'circuit-region'}),
    // IC 插座区(frame-006/010 旁白: 芯片插在管座上, 管脚通过插孔引出)
    txt('IC Socket (pins routed to side jacks)', 0, -66, 'circuit-silk'),
    svg('rect', {x: -62, y: -58, width: 124, height: 56, rx: 4, class: 'circuit-socket'}),
    ...traces,
    ...jacks,
    svg('circle', {cx: -318, cy: -148, r: 3, class: 'circuit-screw'}),
    svg('circle', {cx: 318, cy: -148, r: 3, class: 'circuit-screw'}),
    svg('circle', {cx: -318, cy: 148, r: 3, class: 'circuit-screw'}),
    svg('circle', {cx: 318, cy: 148, r: 3, class: 'circuit-screw'}),
  )
  return group
}

// ── μA741(DIP-8, 豁口朝左, ①脚左下带圆点, 逆时针编号)──
// 芯片实体位于插座中心; inspected(双击观察后)显示管脚功能标注.
export function renderOpAmpDip8(entity, state) {
  const group = svg('g')
  const rows = [{y: 21, left: 1, right: 8}, {y: 7, left: 2, right: 7}, {y: -7, left: 3, right: 6}, {y: -21, left: 4, right: 5}]
  const pins = []
  const nums = []
  rows.forEach(({y, left, right}) => {
    pins.push(
      svg('rect', {x: -54, y: y - 2.5, width: 10, height: 5, class: 'dip-pin'}),
      svg('rect', {x: 44, y: y - 2.5, width: 10, height: 5, class: 'dip-pin'}),
    )
    nums.push(
      txt(String(left), -60, y + 2.5, 'dip-num', {'font-size': 7}),
      txt(String(right), 60, y + 2.5, 'dip-num', {'font-size': 7}),
    )
  })
  add(group,
    shadow(0, 34, 44, 6),
    svg('rect', {x: -44, y: -28, width: 88, height: 56, rx: 3, class: 'dip-body'}),
    svg('path', {d: 'M-44 -8a8 8 0 0 0 0 16Z', class: 'dip-notch'}),
    svg('circle', {cx: -36, cy: 21, r: 2.5, class: 'dip-dot'}),
    txt('μA741', 0, -3, 'dip-silk'),
    txt('OP-AMP', 0, 10, 'dip-silk-sub'),
    ...pins,
    ...nums,
  )
  if (state.inspected) {
    // frame-008 管脚图: ②反相输入 ③同相输入 ④V−(−15V) ⑥输出 ⑦V+(+15V); ①⑤调零 ⑧空脚
    add(group, txt('②IN⁻  ③IN⁺  ④V⁻  ⑥OUT  ⑦V⁺', 0, 44, 'dip-func'))
  } else {
    add(group, txt('(double-click to view pin functions)', 0, 44, 'circuit-silk'))
  }
  if (state.saturated) {
    const badge = svg('g', {transform: 'translate(34 -36)'})
    add(badge,
      svg('rect', {x: -20, y: -9, width: 40, height: 18, rx: 4, class: 'dip-badge'}),
      txt('Saturated', 0, 4, 'dip-badge-text'),
    )
    group.append(badge)
  }
  return group
}

// ── 轴向电阻(色环按标称阻值计算: 10kΩ=棕黑橙, 100kΩ=棕黑黄)──
const BAND_COLORS = ['#111111', '#7a4526', '#d03030', '#e68a2a', '#d8c020', '#3a8a3a', '#2a6ad0', '#8a3a9a', '#7a7a7a', '#cfcfcf']

export function renderResistor(entity) {
  const group = svg('g')
  const ohms = Number(entity?.properties?.resistance_ohms || 10000)
  const digits = String(Math.round(ohms)).replace(/e\+.*/, '')
  const d1 = Number(digits[0]) || 0
  const d2 = Number(digits[1]) || 0
  const exp = Math.max(0, digits.length - 2)
  add(group,
    shadow(0, 16, 42, 5),
    svg('line', {x1: -58, y1: 0, x2: -23, y2: 0, class: 'resistor-lead'}),
    svg('line', {x1: 23, y1: 0, x2: 58, y2: 0, class: 'resistor-lead'}),
    svg('rect', {x: -23, y: -11, width: 46, height: 22, rx: 4, class: 'resistor-body'}),
    svg('rect', {x: -13, y: -11, width: 4.4, height: 22, fill: BAND_COLORS[d1]}),
    svg('rect', {x: -6, y: -11, width: 4.4, height: 22, fill: BAND_COLORS[d2]}),
    svg('rect', {x: 1, y: -11, width: 4.4, height: 22, fill: BAND_COLORS[Math.min(exp, 9)]}),
    svg('rect', {x: 11, y: -11, width: 4.4, height: 22, fill: '#caa64b', class: 'resistor-tol'}),
  )
  group.append(label(entity.label, 0, 30))
  return group
}

// ── 导线(电源线=红黑双芯, 信号线=红色单芯, 蓝色跳线=style:'blue'; 两端香蕉插头)──
export function renderPatchLead(entity) {
  const group = svg('g')
  const dual = entity?.visual?.style === 'dual'
  const wireClass = entity?.visual?.style === 'blue' ? 'lead-wire-blue' : 'lead-wire-red'
  const plug = (x, y) => add(svg('g'),
    svg('rect', {x: x - 7, y: y - 5, width: 14, height: 10, rx: 3, class: 'lead-plug'}),
    svg('circle', {cx: x + (x < 0 ? -7 : 7), cy: y, r: 2.6, class: 'lead-pin'}),
  )
  if (dual) {
    add(group,
      shadow(0, 20, 46, 5),
      svg('path', {d: 'M-50 -3C-18 13 18 -11 50 -3', fill: 'none', class: 'lead-wire-red'}),
      svg('path', {d: 'M-50 6C-18 20 18 -2 50 6', fill: 'none', class: 'lead-wire-black'}),
      plug(-50, -3), plug(50, -3), plug(-50, 6), plug(50, 6),
    )
  } else {
    add(group,
      shadow(0, 18, 46, 5),
      svg('path', {d: 'M-50 0C-18 16 18 -12 50 0', fill: 'none', class: wireClass}),
      plug(-50, 0), plug(50, 0),
    )
  }
  group.append(label(entity.label, 0, 30))
  return group
}

// ── 数字万用表(读数=红黑表笔电位差, 实时取自世界状态)──
// 表笔电位查表: 信号源端=source_v, 输出端=output_v, 公共地=0; 任一表笔未落在测试点时显示 OL.
const POTENTIAL_AT = {
  'zone-src': world => Number(world?.['trainer-1']?.source_v || 0),
  'zone-out': world => Number(world?.['opamp-1']?.output_v || 0),
  'gnd-bus': () => 0,
}

function probePotential(context, probeId) {
  const at = context?.world?.[probeId]?.above
  return Object.prototype.hasOwnProperty.call(POTENTIAL_AT, at) ? POTENTIAL_AT[at](context.world) : null
}

export function renderMultimeter(entity, state, context = {}) {
  const group = svg('g')
  const visual = entity?.visual || {}
  const redId = visual.red_probe || 'probe-red'
  const blackId = visual.black_probe || 'probe-black'
  const vRed = probePotential(context, redId)
  const vBlack = probePotential(context, blackId)
  const open = vRed === null || vBlack === null
  const reading = open ? 'OL' : (vRed - vBlack).toFixed(2)
  add(group,
    shadow(0, 86, 54, 8),
    svg('rect', {x: -62, y: -80, width: 124, height: 166, rx: 10, class: 'dmm-body'}),
    svg('rect', {x: -52, y: -70, width: 104, height: 104, rx: 6, class: 'dmm-face'}),
    svg('rect', {x: -42, y: -62, width: 84, height: 34, rx: 3, class: 'dmm-lcd'}),
    txt(open ? 'OL' : reading, open ? 4 : -2, -38, 'dmm-text'),
    txt('V', 36, -38, 'dmm-unit'),
    txt('DC V ⎓', -28, -14, 'dmm-mode'),
    svg('circle', {cx: 8, cy: 26, r: 24, class: 'dmm-dial'}),
    svg('circle', {cx: 8, cy: 26, r: 19, fill: 'none', class: 'dmm-dial-ring'}),
    svg('line', {x1: 8, y1: 26, x2: 8 + 17 * Math.cos(-0.7), y2: 26 + 17 * Math.sin(-0.7), class: 'dmm-pointer'}),
    svg('circle', {cx: 8, cy: 26, r: 4, class: 'dmm-hub'}),
    svg('circle', {cx: -34, cy: 68, r: 7, class: 'dmm-jack-black'}),
    svg('circle', {cx: 34, cy: 68, r: 7, class: 'dmm-jack-red'}),
    txt('COM', -34, 58, 'dmm-jack-label'),
    txt('VΩ', 34, 58, 'dmm-jack-label'),
  )
  group.append(label(entity.label, 0, 102))
  return group
}

// ── 表笔(针尖在原点, 笔杆向上; 吸附落点即针尖搭在测试点上)──
export function renderTestProbe(entity) {
  const group = svg('g')
  const color = entity?.visual?.color || '#c0392b'
  add(group,
    svg('path', {d: 'M0 0L0 -14', class: 'probe-tip'}),
    svg('rect', {x: -7, y: -48, width: 14, height: 36, rx: 4, fill: color, class: 'probe-grip'}),
    svg('rect', {x: -8, y: -110, width: 16, height: 64, rx: 7, class: 'probe-body'}),
    svg('rect', {x: -8, y: -74, width: 16, height: 7, fill: color, class: 'probe-stripe'}),
    svg('path', {d: 'M0 -110C14 -126 30 -120 36 -102', fill: 'none', stroke: color, 'stroke-width': 2.5, class: 'probe-wire'}),
  )
  group.append(label(entity.label, 0, 18))
  return group
}

// ── 插座区(实验箱功能块, variant 决定形态)──
// seat=电阻支路座 / power=±15V 电源端子 / source=直流信号源 / terminal=输出端 / bus=接地排
export function renderSocketZone(entity, state, context = {}) {
  const group = svg('g')
  const variant = entity?.visual?.variant || 'seat'
  const occupied = occupantOf(context, entity.id)
  if (variant === 'seat') {
    const pad = svg('rect', {x: -60, y: -42, width: 120, height: 84, rx: 8, class: 'zone-pad' + (occupied ? ' zone-occupied' : '')})
    add(group, pad,
      txt(entity.label, 0, -24, 'zone-title'),
      txt(entity?.visual?.sub || '', 0, -9, 'zone-sub'),
      svg('circle', {cx: -48, cy: 10, r: 5.5, class: 'jack'}),
      svg('circle', {cx: 48, cy: 10, r: 5.5, class: 'jack'}),
    )
  } else if (variant === 'power') {
    const powered = Boolean(context?.world?.['trainer-1']?.powered)
    add(group,
      svg('rect', {x: -60, y: -55, width: 120, height: 110, rx: 8, class: 'zone-pad' + (occupied ? ' zone-occupied' : '')}),
      txt(entity.label, 0, -38, 'zone-title'),
      svg('circle', {cx: 0, cy: -16, r: 5, class: powered ? 'led-on' : 'led'}),
      svg('circle', {cx: -50, cy: 2, r: 9, class: 'post-red'}),
      svg('circle', {cx: 50, cy: 2, r: 9, class: 'post-navy'}),
      txt('+15V', -50, 26, 'zone-sub'),
      txt('−15V', 50, 26, 'zone-sub'),
    )
  } else if (variant === 'source') {
    const sourceV = Number(context?.world?.['trainer-1']?.source_v || 0)
    const clamped = Math.max(-12, Math.min(12, sourceV))
    const knobDeg = -135 + (270 * (clamped + 12)) / 24
    const probed = Boolean(occupied)
    add(group,
      svg('rect', {x: -60, y: -55, width: 120, height: 110, rx: 8, class: 'zone-pad' + (occupied ? ' zone-occupied' : '')}),
      txt(entity.label, 0, -38, 'zone-title'),
      svg('rect', {x: -42, y: -30, width: 84, height: 26, rx: 3, class: 'dmm-lcd'}),
      txt(sourceV.toFixed(2) + 'V', 0, -12, 'dmm-text', {'font-size': 11}),
      svg('circle', {cx: 0, cy: 4, r: 9, class: 'post-red'}),
      probed ? svg('circle', {cx: 0, cy: 4, r: 14, fill: 'none', class: 'probe-ring'}) : null,
      svg('circle', {cx: 0, cy: 34, r: 11, class: 'zone-knob'}),
      svg('line', {
        x1: 0, y1: 34,
        x2: (9 * Math.cos((knobDeg * Math.PI) / 180)).toFixed(2),
        y2: (34 + 9 * Math.sin((knobDeg * Math.PI) / 180)).toFixed(2),
        class: 'zone-knob-pointer',
      }),
      txt('−12V ~ +12V', 0, 52, 'zone-sub', {'font-size': 6.5}),
    )
  } else if (variant === 'terminal') {
    add(group,
      svg('rect', {x: -60, y: -42, width: 120, height: 84, rx: 8, class: 'zone-pad' + (occupied ? ' zone-occupied' : '')}),
      txt(entity.label, 0, -24, 'zone-title'),
      svg('circle', {cx: 0, cy: 4, r: 9, class: 'post-amber'}),
      occupied ? svg('circle', {cx: 0, cy: 4, r: 14, fill: 'none', class: 'probe-ring'}) : null,
      txt(entity?.visual?.sub || '', 0, 30, 'zone-sub'),
    )
  } else if (variant === 'bus') {
    add(group,
      svg('rect', {x: -200, y: -18, width: 400, height: 36, rx: 6, class: 'zone-bus' + (occupied ? ' zone-occupied' : '')}),
      svg('line', {x1: -178, y1: -7, x2: -158, y1: -7, class: 'gnd-glyph'}),
      svg('line', {x1: -173, y1: 0, x2: -163, y1: 0, class: 'gnd-glyph'}),
      svg('line', {x1: -170.5, y1: 7, x2: -165.5, y1: 7, class: 'gnd-glyph'}),
      svg('circle', {cx: -60, cy: 0, r: 4.5, class: 'jack'}),
      svg('circle', {cx: -30, cy: 0, r: 4.5, class: 'jack'}),
      svg('circle', {cx: 0, cy: 0, r: 4.5, class: 'jack'}),
      svg('circle', {cx: 30, cy: 0, r: 4.5, class: 'jack'}),
      svg('circle', {cx: 60, cy: 0, r: 4.5, class: 'jack'}),
      occupied ? svg('circle', {cx: 0, cy: 0, r: 12, fill: 'none', class: 'probe-ring'}) : null,
      txt(entity.label, 140, 4, 'zone-title', {'font-size': 10}),
    )
  }
  return group
}

// ── AM 调幅与解调实验(BCT-01 案例): 以下渲染器由资产子代理生成(registries/discovered/, 
// builtin/MIT, origin=generated; 视觉依据 frame-002..016), builder 集成入本文件并接入波形层.──
// 面板丝印框按实体落位微调: FREQUENCY SELECTOR 框加高容纳旋钮丝印档位(−96..+16), 
// PT1 框缩为标签行(24..54), SINE WAVE GENERATOR 框上移(56..150)容纳 PT2 滑条.

const SILK = '#f2ede4' // 面板白色丝印(frame-005 实测偏暖白)
const SILK_FONT = 'Inter, ui-sans-serif, system-ui, sans-serif'
const SCOPE_MENU_BG = '#16222e'
const SCOPE_MENU_BOX = '#cfe0ec'
const SCOPE_MENU_TEXT = '#1c2b36'
const SCOPE_MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

// 丝印文字(BCT-01 面板用; 与上方通用 txt 区分签名: attributes 直接作第四参)
function silkTxt(content, x, y, attributes = {}) {
  const node = svg('text', {x, y, 'text-anchor': 'middle', fill: SILK, 'font-family': SILK_FONT, ...attributes})
  node.textContent = content
  return node
}

function silkBox(x, y, width, height) {
  return svg('rect', {x, y, width, height, rx: 3, fill: 'none', stroke: SILK, 'stroke-width': 1.3})
}

// 顶部元件排里的一只 DIP IC(黑壳+两侧银色管脚, frame-005 顶部实排)
function dipChip(x, y) {
  const group = svg('g')
  const pins = []
  for (let index = 0; index < 4; index += 1) {
    pins.push(
      svg('rect', {x: x - 16, y: y - 6 + index * 4, width: 4, height: 2, fill: '#c9d2d6'}),
      svg('rect', {x: x + 12, y: y - 6 + index * 4, width: 4, height: 2, fill: '#c9d2d6'}),
    )
  }
  add(group, svg('rect', {x: x - 18, y: y - 8, width: 36, height: 16, rx: 2, fill: '#1d2126', stroke: '#0d1013', 'stroke-width': 1}), ...pins)
  return group
}

// 蓝色电解电容(铝壳圆筒+顶部十字, frame-005 右上四连排)
function electroCap(x, y) {
  const group = svg('g')
  add(group,
    svg('rect', {x: x - 11, y: y - 14, width: 22, height: 30, rx: 8, fill: '#2a4fa8', stroke: '#1c3574', 'stroke-width': 1.2}),
    svg('ellipse', {cx: x, cy: y - 14, rx: 11, ry: 3.6, fill: '#3a5fb8', stroke: '#1c3574', 'stroke-width': .8}),
    svg('line', {x1: x - 5, y1: y - 14, x2: x + 5, y2: y - 14, stroke: '#8fa6d8', 'stroke-width': .8}),
  )
  return group
}

// 接地箭头丝印(frame-005 插孔下方 ⏚ 记号)
function gndGlyph(x, y) {
  return svg('g', {},
    svg('line', {x1: x - 5, y1: y, x2: x + 5, y2: y, stroke: SILK, 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('line', {x1: x - 3, y1: y + 3, x2: x + 3, y2: y + 3, stroke: SILK, 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('line', {x1: x - 1, y1: y + 6, x2: x + 1, y2: y + 6, stroke: SILK, 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
  )
}

export function renderAmTrainer(entity, state = {}) {
  const group = svg('g')
  const powered = Boolean(state.powered)

  const parts = []
  // 顶部元件排: 6 只 DIP IC + 电阻排 + 绿色电容 + 4 只蓝色电解电容(frame-004/005 顶部实排)
  ;[-268, -206, -144, -30, 46, 150].forEach(x => parts.push(dipChip(x, -132)))
  for (let index = 0; index < 8; index += 1) {
    parts.push(svg('rect', {x: -122 + index * 12, y: -114, width: 9, height: 4, rx: 1.5, fill: '#c8a05a', stroke: '#9a7638', 'stroke-width': .6}))
  }
  parts.push(
    svg('circle', {cx: -190, cy: -108, r: 5, fill: '#2f7d4a', stroke: '#1c5533', 'stroke-width': 1}),
    svg('circle', {cx: -177, cy: -108, r: 5, fill: '#2f7d4a', stroke: '#1c5533', 'stroke-width': 1}),
  )
  ;[226, 254, 282, 310].forEach(x => parts.push(electroCap(x, -130)))

  add(group,
    shadow(0, 184, 348, 10),
    // 松木箱外壳(frame-002/003: 浅木色箱体, 可见木纹与箱角)
    svg('rect', {x: -348, y: -178, width: 696, height: 356, rx: 14, fill: '#d9c08c', stroke: '#a8834f', 'stroke-width': 3}),
    svg('line', {x1: -336, y1: -166, x2: 336, y2: -166, stroke: '#c9ad78', 'stroke-width': 1.4, opacity: .7}),
    svg('line', {x1: -336, y1: 166, x2: 336, y2: 166, stroke: '#c9ad78', 'stroke-width': 1.4, opacity: .7}),
    // 深红 PCB 面板(frame-005 实测红)
    svg('rect', {x: -330, y: -160, width: 660, height: 320, rx: 6, fill: '#9e2020', stroke: '#701414', 'stroke-width': 2}),
    ...parts,
    // 右上红 LED 电源指示(frame-004/005 点亮态; state.powered 驱动)
    svg('circle', {cx: 312, cy: -134, r: 5, class: powered ? 'led-on' : 'led'}),
    silkTxt('POWER LED', 312, -122, {'font-size': 4.5, opacity: .9}),
    // 四角面板螺丝
    svg('circle', {cx: -318, cy: -148, r: 3, class: 'circuit-screw'}),
    svg('circle', {cx: 318, cy: -148, r: 3, class: 'circuit-screw'}),
    svg('circle', {cx: -318, cy: 148, r: 3, class: 'circuit-screw'}),
    svg('circle', {cx: 318, cy: 148, r: 3, class: 'circuit-screw'}),
    // ── 左列: 频率选择开关 / PT1 / PT2(SINE WAVE GENERATOR)丝印框 ──
    silkBox(-322, -96, 86, 112),
    silkTxt('FREQUENCY', -279, -86, {'font-size': 6}),
    silkTxt('SELECTOR', -279, -78, {'font-size': 6}),
    silkTxt('SWITCH', -279, -70, {'font-size': 6}),
    silkBox(-322, 24, 86, 30),
    silkTxt('PT1', -314, 46, {'font-size': 6.5, 'text-anchor': 'start'}),
    silkBox(-322, 56, 86, 94),
    silkTxt('SINE WAVE', -279, 66, {'font-size': 6}),
    silkTxt('GENERATOR', -279, 74, {'font-size': 6}),
    silkTxt('PT2', -314, 142, {'font-size': 6.5, 'text-anchor': 'start'}),
    // ── 中部: AM MODULATOR(MODULATOR BLOCK + AMPLIFIER BLOCK 虚线框)──
    silkBox(-228, -96, 270, 130),
    svg('rect', {x: -216, y: -88, width: 64, height: 96, rx: 2, fill: 'none', stroke: SILK, 'stroke-width': 1, 'stroke-dasharray': '4 3'}),
    svg('g', {transform: 'translate(-184 -40) rotate(-90)'},
      silkTxt('MODULATOR BLOCK', 0, 2, {'font-size': 6.5})),
    svg('rect', {x: -140, y: -88, width: 64, height: 96, rx: 2, fill: 'none', stroke: SILK, 'stroke-width': 1, 'stroke-dasharray': '4 3'}),
    svg('g', {transform: 'translate(-108 -40) rotate(-90)'},
      silkTxt('AMPLIFIER BLOCK', 0, 2, {'font-size': 6.5})),
    silkTxt('AM MODULATOR', -93, 26, {'font-size': 8, 'font-weight': 700}),
    silkTxt('CARRIER I/P', -206, -78, {'font-size': 4.5}),
    silkTxt('TP1', -192, -68, {'font-size': 4.5}),
    silkTxt('TP2', -214, -4, {'font-size': 4.5}),
    silkTxt('MODULATING', -206, 18, {'font-size': 4.5}),
    silkTxt('I/P', -206, 24, {'font-size': 4.5}),
    silkTxt('TP3', 12, -84, {'font-size': 4.5}),
    silkTxt('AM O/P', 20, -58, {'font-size': 5}),
    gndGlyph(-93, 42),
    // OK TESTED 橙色圆贴(frame-005 实拍贴纸)
    svg('ellipse', {cx: 58, cy: -70, rx: 22, ry: 11, fill: '#e8933a', stroke: '#c67a28', 'stroke-width': 1}),
    silkTxt('OK TESTED', 58, -68, {'font-size': 5.5, 'font-weight': 700}),
    // ── 右侧: AM DEMODULATOR ──
    silkBox(96, -96, 120, 130),
    svg('g', {transform: 'translate(156 -31) rotate(-90)'},
      silkTxt('AM DEMODULATOR', 0, 2, {'font-size': 7, 'font-weight': 700})),
    silkTxt('AM IP', 104, -44, {'font-size': 5, 'text-anchor': 'start'}),
    // AM IP 与解调块之间的二极管丝印(frame-005 绿色插孔右侧 ▷| 记号)
    svg('path', {d: 'M108 -18 L116 -22 L116 -14 Z', fill: SILK}),
    svg('line', {x1: 116, y1: -18, x2: 122, y2: -18, stroke: SILK, 'stroke-width': 1.3}),
    silkTxt('TP4', 204, -84, {'font-size': 4.5}),
    silkTxt('AM-DEMOD', 208, -52, {'font-size': 4.5}),
    silkTxt('O/P', 208, -46, {'font-size': 4.5}),
    // ── 下部: CARRIER GENERATOR(PT3)与 CARRIER 输出丝印 ──
    silkBox(-64, 52, 116, 98),
    svg('g', {transform: 'translate(-52 101) rotate(-90)'},
      silkTxt('CARRIER GENERATOR', 0, 2, {'font-size': 6.5})),
    silkTxt('PT3', 6, 142, {'font-size': 6.5}),
    silkTxt('CARRIER', 104, 96, {'font-size': 6}),
    // ── 右下: TP1-TP4 图例与型号丝印(frame-005 右下角实排)──
    silkTxt('TP1 : Test Point for Carrier Input', 128, 64, {'font-size': 4.5, 'text-anchor': 'start'}),
    silkTxt('TP2 : Test Point for Modulating Input', 128, 72, {'font-size': 4.5, 'text-anchor': 'start'}),
    silkTxt('TP3 : Test Point for AM Modulated Output', 128, 80, {'font-size': 4.5, 'text-anchor': 'start'}),
    silkTxt('TP4 : Test Point for AM Demodulated Output', 128, 88, {'font-size': 4.5, 'text-anchor': 'start'}),
    silkTxt('BCT-01', 122, 122, {'font-size': 9, 'font-weight': 700, 'text-anchor': 'start'}),
    silkTxt('AMPLITUDE MODULATION & DEMODULATION TRAINER', 132, 132, {'font-size': 5.5, 'text-anchor': 'start'}),
  )
  return group
}

//  -  Keysight InfiniiVision DSOX2022A 数字示波器(frame-008/011/012/013/016) - 
// 波形层(builder 接入): CH1=probe-1 黄, CH2=probe-2 绿, 各按探尖钩挂的测试点取信号; 
// 时基 us_per_div×8 格(默认 100µs/div→800µs 窗), CH1 2V/div, CH2 1V/div.
// 测量侧栏数值由所接信号实时算出(频率/峰峰值), 未接探头显示 No signal.

const SCOPE_CH1 = '#e6c229' // frame-008/016 屏上 CH1 黄
const SCOPE_CH2 = '#39a845' // frame-013/016 屏上 CH2 绿

// 侧栏/机身文字(名称左, 数值右的测量行由 measureText 直接成对追加)
function bodyText(content, x, y, attributes = {}) {
  const node = svg('text', {x, y, 'text-anchor': 'middle', 'font-family': SILK_FONT, ...attributes})
  node.textContent = content
  return node
}

function measureText(content, x, y, attributes = {}) {
  const node = svg('text', {x, y, 'font-size': 4.5, 'font-family': SCOPE_MONO, fill: SCOPE_MENU_TEXT, ...attributes})
  node.textContent = content
  return node
}

// 测试点→信号描述(全部取自 trainer 世界状态, engine am_modulation op 维护).
// 实体 id 为本案例约定(与 POTENTIAL_AT 同一先例: 案例接合层放在 circuits.js).
function amSignalDesc(world, zoneId) {
  if (!zoneId) return null
  const t = world?.['am-trainer-1'] || {}
  const fs = Number(t.message_freq_hz || 1996.8)
  const vpp = Number(t.message_amp_vpp || 5.07)
  const es = Number(t.es_v || 0.507)
  const ec = Number(t.ec_v || 1.285)
  if (zoneId === 'zone-tp1') return {kind: 'sine', freq: 44200, vpp: 2 * ec, dc: 0}
  if (zoneId === 'zone-tp2') return {kind: 'sine', freq: fs, vpp, dc: 0}
  if (zoneId === 'zone-tp3') return {kind: 'am', freq: 44200, fs, ec, es}
  // TP4 直读跳线实时位置(世界态): 引擎态 demod_patched 只在派发时刷新, 自由拖开跳线会滞留
  if (zoneId === 'zone-tp4') return world?.['patch-1']?.above === 'zone-am-ip'
    ? {kind: 'sine', freq: fs, vpp: 2 * es, dc: ec}
    : null
  return null
}

function amWaveVolt(desc, tUs) {
  const t = tUs * 1e-6
  if (desc.kind === 'sine') return desc.dc + (desc.vpp / 2) * Math.sin(2 * Math.PI * desc.freq * t)
  // 已调波 v(t)=(Ec+Es - sinωs t) - sinωc t: m>1 时包络自然过零翻转(过调制失真可见)
  const envelope = desc.ec + desc.es * Math.sin(2 * Math.PI * desc.fs * t)
  return envelope * Math.sin(2 * Math.PI * desc.freq * t)
}

function amFormatFreq(hz) {
  return hz >= 1000 ? `${(hz / 1000).toFixed(2)} kHz` : `${Math.round(hz)} Hz`
}

export function renderOscilloscope(entity, state = {}, context = {}) {
  const group = svg('g')
  const readouts = state.readouts || {}
  const ch1On = state.ch1_on !== false
  const ch2On = state.ch2_on !== false

  // 屏幕网格(8×10 分割)与橙色虚线十字游标(frame-008 实测橙黄虚线)
  const grid = svg('g', {stroke: '#223038', 'stroke-width': 1})
  for (let index = 0; index <= 8; index += 1) {
    grid.append(svg('line', {x1: -232 + index * 31.5, y1: -150, x2: -232 + index * 31.5, y2: 136}))
  }
  for (let index = 0; index <= 10; index += 1) {
    grid.append(svg('line', {x1: -232, y1: -150 + index * 28.6, x2: 20, y2: -150 + index * 28.6}))
  }
  const cursors = svg('g', {stroke: '#c87b2e', 'stroke-width': 1.2, 'stroke-dasharray': '5 4'})
  cursors.append(
    svg('line', {x1: -106, y1: -150, x2: -106, y2: 136}),
    svg('line', {x1: -232, y1: -7, x2: 20, y2: -7}),
  )

  // 波形层: 按探头钩挂点取信号画 trace, 并把测量值写入侧栏 readouts
  const world = context?.world
  const windowUs = Number(entity?.properties?.us_per_div || 100) * 8
  const traces = [
    {ch: 1, on: ch1On, probe: 'probe-1', baseline: -88, pxPerVolt: 28.6 / 2, stroke: SCOPE_CH1},
    {ch: 2, on: ch2On, probe: 'probe-2', baseline: 18, pxPerVolt: 28.6 / 1, stroke: SCOPE_CH2},
  ]
  const waveLayer = svg('g')
  for (const trace of traces) {
    const desc = amSignalDesc(world, world?.[trace.probe]?.above)
    if (!trace.on || !desc) continue
    let d = ''
    for (let px = 0; px <= 252; px += 2) {
      const volt = amWaveVolt(desc, (px / 252) * windowUs)
      const y = Math.max(-148, Math.min(134, trace.baseline - volt * trace.pxPerVolt))
      d += `${px ? 'L' : 'M'}${(-232 + px).toFixed(1)} ${y.toFixed(1)}`
    }
    waveLayer.append(svg('path', {d, fill: 'none', stroke: trace.stroke, 'stroke-width': 1.6}))
    const pkp = desc.kind === 'am' ? 2 * (desc.ec + desc.es) : desc.vpp
    Object.assign(readouts, {
      [`freq${trace.ch}`]: amFormatFreq(desc.freq),
      [`pkp${trace.ch}`]: `${pkp.toFixed(2)} V`,
    })
  }
  // 频道接地记号(frame-016 屏左缘 “1⇕ / 2⇕” 彩色小标; 与波形基线 −88/+18 对齐)
  if (ch1On) {
    const mark = svg('text', {x: -226, y: -92, 'font-size': 6, fill: SCOPE_CH1, 'font-family': SCOPE_MONO, 'text-anchor': 'start'})
    mark.textContent = '1'
    waveLayer.append(mark)
  }
  if (ch2On) {
    const mark = svg('text', {x: -226, y: 14, 'font-size': 6, fill: SCOPE_CH2, 'font-family': SCOPE_MONO, 'text-anchor': 'start'})
    mark.textContent = '2'
    waveLayer.append(mark)
  }

  const sidebar = svg('g')
  add(sidebar,
    svg('rect', {x: 26, y: -150, width: 68, height: 286, fill: SCOPE_MENU_BG}),
    // Keysight 红色波形 Logo + 文字(frame-008 侧栏顶部)
    svg('path', {d: 'M32 -136l3 -5 2.5 8 3.5 -11 3 14 3.5 -17 3 19', fill: 'none', stroke: '#d0202e', 'stroke-width': 1.5, 'stroke-linejoin': 'round'}),
    bodyText('KEYSIGHT', 44, -136, {'font-size': 5.5, 'font-weight': 700, fill: '#ffffff', 'text-anchor': 'start'}),
    bodyText('TECHNOLOGIES', 44, -130, {'font-size': 3.8, fill: '#9fb0ba', 'text-anchor': 'start'}),
    // Acquisition 组
    svg('rect', {x: 30, y: -122, width: 60, height: 34, rx: 2, fill: SCOPE_MENU_BOX}),
    // Channels 组(DC 耦合黄/绿双色行)
    svg('rect', {x: 30, y: -82, width: 60, height: 30, rx: 2, fill: SCOPE_MENU_BOX}),
    // Measurements 组(数值由上方波形层实时写入)
    svg('rect', {x: 30, y: -46, width: 60, height: 56, rx: 2, fill: SCOPE_MENU_BOX}),
  )
  sidebar.append(
    measureText('Acquisition', 34, -115, {'text-anchor': 'start', fill: '#3c4a54'}),
    measureText('Normal', 90, -115, {'text-anchor': 'end'}),
    measureText('25.0MSa/s', 90, -107, {'text-anchor': 'end'}),
    measureText('Channels', 34, -75, {'text-anchor': 'start', fill: '#3c4a54'}),
    measureText('DC', 36, -66, {'text-anchor': 'start', fill: SCOPE_CH1}),
    measureText('1.00:1', 86, -66, {'text-anchor': 'end'}),
    measureText('DC', 36, -58, {'text-anchor': 'start', fill: SCOPE_CH2}),
    measureText('1.00:1', 86, -58, {'text-anchor': 'end'}),
    measureText('Measurements', 34, -39, {'text-anchor': 'start', fill: '#3c4a54'}),
    measureText('Freq(1)', 34, -30, {'text-anchor': 'start', fill: '#3c4a54'}),
    measureText(readouts.freq1 || 'No signal', 90, -30, {'text-anchor': 'end'}),
    measureText('Pk-Pk(1)', 34, -21, {'text-anchor': 'start', fill: '#3c4a54'}),
    measureText(readouts.pkp1 || 'No signal', 90, -21, {'text-anchor': 'end'}),
    measureText('Pk-Pk(2)', 34, -12, {'text-anchor': 'start', fill: '#3c4a54'}),
    measureText(readouts.pkp2 || 'No signal', 90, -12, {'text-anchor': 'end'}),
    measureText('Freq(2)', 34, -3, {'text-anchor': 'start', fill: '#3c4a54'}),
    measureText(readouts.freq2 || 'No signal', 90, -3, {'text-anchor': 'end'}),
  )

  // 右侧操控面板(frame-013/016: 两只大旋钮 + 绿色通道 LED 键 + 按钮排 + BNC)
  const controls = svg('g')
  const scopeKnob = (cy) => {
    const deg = -60
    const rad = (deg * Math.PI) / 180
    return [
      svg('circle', {cx: 180, cy, r: 27, fill: '#c6cdd0', stroke: '#87939a', 'stroke-width': 2}),
      svg('circle', {cx: 180, cy, r: 20, fill: '#b4bcbf'}),
      svg('line', {x1: 180, y1: cy, x2: 180 + 16 * Math.sin(rad), y2: cy - 16 * Math.cos(rad), stroke: '#f2f7f7', 'stroke-width': 2.5, 'stroke-linecap': 'round'}),
    ]
  }
  const channelKey = (x, on, text) => {
    const key = svg('g')
    add(key,
      svg('rect', {x, y: 38, width: 14, height: 11, rx: 2.5, fill: on ? '#2fbf62' : '#9aa89e', stroke: on ? '#1f8f48' : '#6d7a72', 'stroke-width': 1}),
    )
    const keyText = svg('text', {x: x + 7, y: 46.5, 'font-size': 5, fill: '#ffffff', 'font-weight': 700, 'text-anchor': 'middle', 'font-family': SILK_FONT})
    keyText.textContent = text
    key.append(keyText)
    return key
  }
  add(controls,
    bodyText('HORIZONTAL', 180, -122, {'font-size': 5, fill: '#55606a'}),
    ...scopeKnob(-92),
    bodyText('VERTICAL', 180, -34, {'font-size': 5, fill: '#55606a'}),
    ...scopeKnob(-4),
    channelKey(160, ch1On, '1'),
    channelKey(180, ch2On, '2'),
  )
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      controls.append(svg('rect', {x: 152 + column * 22, y: 58 + row * 14, width: 17, height: 9, rx: 2, fill: '#cfd6d8', stroke: '#9aa4a8', 'stroke-width': 1}))
    }
  }
  const bnc = (x, text) => {
    const port = svg('g')
    add(port,
      svg('circle', {cx: x, cy: 110, r: 11, fill: '#b8c2c6', stroke: '#6d7a80', 'stroke-width': 2}),
      svg('circle', {cx: x, cy: 110, r: 4.5, fill: '#5b6a6d'}),
      svg('circle', {cx: x, cy: 110, r: 1.6, fill: '#e8eef0'}),
    )
    const portText = svg('text', {x, y: 130, 'font-size': 4.5, fill: '#55606a', 'text-anchor': 'middle', 'font-family': SILK_FONT})
    portText.textContent = text
    port.append(portText)
    return port
  }
  add(controls, bnc(150, 'CH1'), bnc(208, 'CH2'))

  // 底部软键排(frame-008/014 浅蓝软键; 标签尺寸所限只标首个)
  const softkeys = svg('g')
  for (let index = 0; index < 5; index += 1) {
    softkeys.append(svg('rect', {x: -228 + index * 65, y: 112, width: 60, height: 20, rx: 3, fill: SCOPE_MENU_BOX, stroke: '#8fa8b8', 'stroke-width': 1}))
  }
  const softkeyText = svg('text', {x: -198, y: 124, 'font-size': 4.5, 'text-anchor': 'middle', 'font-family': SILK_FONT})
  softkeyText.textContent = 'Channel 1 Menu'
  softkeys.append(softkeyText)

  add(group,
    shadow(0, 212, 245, 10),
    // 浅灰机身(frame-013/016 实测浅灰)+ 底脚
    svg('rect', {x: -250, y: -200, width: 500, height: 400, rx: 18, fill: '#d8dcde', stroke: '#9aa4a8', 'stroke-width': 2.5}),
    svg('rect', {x: -180, y: 196, width: 60, height: 10, rx: 3, fill: '#9aa4a8'}),
    svg('rect', {x: 120, y: 196, width: 60, height: 10, rx: 3, fill: '#9aa4a8'}),
    // 机身铭牌(frame-013 顶部丝印)
    bodyText('InfiniiVision DSOX2022A   Digital Storage Oscilloscope   200 MHz   2 GSa/s', -66, -176, {'font-size': 5.5, fill: '#5d6a72'}),
    // 右上绿色电源键(frame-013 右上绿色发光键)
    svg('circle', {cx: 226, cy: -186, r: 6, fill: '#2fbf62', stroke: '#1f8f48', 'stroke-width': 1.2}),
    // 黑色屏框 + 屏幕
    svg('rect', {x: -242, y: -168, width: 352, height: 312, rx: 10, fill: '#171b20'}),
    svg('rect', {x: -232, y: -150, width: 332, height: 286, fill: '#0c1114'}),
    grid,
    cursors,
    // 顶部状态行(frame-008: 0.0s / 时基 / Auto / 通道 - 量程)
    bodyText('0.0s', -196, -140, {'font-size': 6, fill: '#8fc7dc', 'font-family': SCOPE_MONO, 'text-anchor': 'start'}),
    bodyText(String(Number(entity?.properties?.us_per_div ?? 100)) + 'µs/', -106, -140, {'font-size': 6, fill: '#8fc7dc', 'font-family': SCOPE_MONO}),
    bodyText('Auto', -30, -140, {'font-size': 6, fill: '#8fc7dc', 'font-family': SCOPE_MONO, 'text-anchor': 'start'}),
    bodyText('1   2V', 16, -140, {'font-size': 6, fill: '#8fc7dc', 'font-family': SCOPE_MONO, 'text-anchor': 'end'}),
    waveLayer,
    sidebar,
    softkeys,
    controls,
  )
  group.append(label(entity.label, 0, 228))
  return group
}

//  -  频率选择旋转开关(frame-004/005/006: 黑色旋钮+三档丝印 20Hz/200Hz/2kHz; 指针读 state.angle_deg) - 
export function renderRotarySwitch(entity, state = {}) {
  const group = svg('g')
  const angleDeg = Number(state.angle_deg ?? 0)
  const rad = (angleDeg * Math.PI) / 180
  const detents = entity?.properties?.detents || [-60, 0, 60]
  const detentLabels = entity?.properties?.detent_labels || ['20Hz', '200Hz', '2kHz']

  // 三档丝印刻度与标签(沿 -60/0/+60 度方向)
  const silk = svg('g')
  detents.forEach((detent, index) => {
    const r = (detent * Math.PI) / 180
    const sin = Math.sin(r)
    const cos = -Math.cos(r)
    silk.append(
      svg('line', {x1: 28 * sin, y1: 28 * cos, x2: 34 * sin, y2: 34 * cos, stroke: SILK, 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
      svg('circle', {cx: 27 * sin, cy: 27 * cos, r: 1, fill: SILK}),
    )
    const text = svg('text', {
      x: 42 * sin, y: 42 * cos + 2, 'text-anchor': 'middle', fill: SILK,
      'font-family': SILK_FONT, 'font-size': 6, 'font-weight': 600,
    })
    text.textContent = String(detentLabels[index] ?? '')
    silk.append(text)
  })

  add(group,
    shadow(0, 32, 30, 6),
    // 黑色旋钮主体+边缘滚花(frame-005 实拍: 黑旋钮, 边缘齿纹)
    svg('circle', {cx: 0, cy: 0, r: 25, fill: '#20262b', stroke: '#0d1114', 'stroke-width': 2}),
    svg('circle', {cx: 0, cy: 0, r: 22.5, fill: 'none', stroke: '#3a4147', 'stroke-width': 3, 'stroke-dasharray': '1.6 2.4'}),
    svg('circle', {cx: 0, cy: 0, r: 17, fill: '#2a3138'}),
    // 指针: 白色指示点+短划(state.angle_deg 驱动)
    svg('line', {x1: 0, y1: 0, x2: (14 * Math.sin(rad)).toFixed(2), y2: (-14 * Math.cos(rad)).toFixed(2), stroke: '#f2f4f4', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
    svg('circle', {cx: (19 * Math.sin(rad)).toFixed(2), cy: (-19 * Math.cos(rad)).toFixed(2), r: 2.6, fill: '#f2f4f4'}),
    svg('circle', {cx: 0, cy: 0, r: 5.5, fill: '#14181b', stroke: '#3a4147', 'stroke-width': 1}),
    silk,
  )
  group.append(label(entity.label, 0, 58))
  return group
}

//  -  PT2/PT3 滑动电位器(frame-004/006: 金属支架+竖直黑色滑槽+白色滑块; 位置由 angle_deg −90→+90 驱动) - 
export function renderPotSlider(entity, state = {}) {
  const group = svg('g')
  const angleDeg = Number(state.angle_deg ?? 0)
  const norm = Math.max(0, Math.min(1, (angleDeg + 90) / 180)) // -90→0 底部, +90→1 顶部
  const cy = 34 - norm * 68

  // 固定耳与螺丝(上下横耳, frame-006 金属电位器实排)
  const ears = svg('g')
  ;[-55.5, 55.5].forEach(y => {
    ears.append(
      svg('rect', {x: -25, y: y - 4.5, width: 50, height: 9, rx: 2, fill: '#aeb8bc', stroke: '#6d7a80', 'stroke-width': 1.4}),
      svg('circle', {cx: -17, cy: y, r: 2.2, fill: '#7d8a8e', stroke: '#5b6a6d', 'stroke-width': .8}),
      svg('circle', {cx: 17, cy: y, r: 2.2, fill: '#7d8a8e', stroke: '#5b6a6d', 'stroke-width': .8}),
    )
  })

  const adjustText = svg('text', {x: 0, y: 2, 'text-anchor': 'middle', fill: SILK, 'font-family': SILK_FONT, 'font-size': 5})
  adjustText.textContent = 'AMPLITUDE ADJUST'

  add(group,
    shadow(0, 66, 27, 6),
    ears,
    // 金属支架与内面
    svg('rect', {x: -19, y: -54, width: 38, height: 108, rx: 3, fill: '#b9c2c6', stroke: '#6d7a80', 'stroke-width': 1.8}),
    svg('rect', {x: -15, y: -50, width: 30, height: 100, rx: 2, fill: '#c8d0d3'}),
    // 竖直滑槽(黑色开槽)
    svg('rect', {x: -2.5, y: -42, width: 5, height: 84, rx: 2, fill: '#191f23'}),
    // 白色滑块(位置由 state.angle_deg 归一化驱动)+握纹
    svg('rect', {x: -10, y: cy - 8, width: 20, height: 16, rx: 3, fill: '#f2f4f4', stroke: '#9aa4a8', 'stroke-width': 1.2}),
    svg('line', {x1: -6, y1: cy - 3, x2: 6, y2: cy - 3, stroke: '#b8c0c4', 'stroke-width': 1}),
    svg('line', {x1: -6, y1: cy, x2: 6, y2: cy, stroke: '#b8c0c4', 'stroke-width': 1}),
    svg('line', {x1: -6, y1: cy + 3, x2: 6, y2: cy + 3, stroke: '#b8c0c4', 'stroke-width': 1}),
    // 左侧竖排丝印(frame-004/006 AMPLITUDE ADJUST)
    svg('g', {transform: 'translate(-26 0) rotate(-90)'}, adjustText),
  )
  group.append(label(entity.label, 0, 80))
  return group
}

//  -  示波器探头(frame-013/014/016: 钩形探尖+探身+护套+细同轴线; 颜色读 visual.color, CH1 黄/CH2 绿) - 
export function renderScopeProbe(entity) {
  const group = svg('g')
  const color = entity?.visual?.color || '#e6c229'

  add(group,
    // 钩形金属探尖(尖端在原点, 钩身向上弯; 钩住测试点即原点对位)
    svg('path', {d: 'M0 0 C-1 -6 1 -10 6 -11 C10 -11.5 12 -8 9.5 -5', fill: 'none', stroke: '#c9d2d6', 'stroke-width': 2.6, 'stroke-linecap': 'round'}),
    // 彩色护套锥(颜色=通道色)
    svg('path', {d: 'M-3 -9 L3 -9 L1.8 -22 L-1.8 -22 Z', fill: color, stroke: '#1c232c', 'stroke-width': .8}),
    // 深灰探身
    svg('rect', {x: -6.5, y: -60, width: 13, height: 38, rx: 5.5, fill: '#262d33', stroke: '#14181b', 'stroke-width': 1.4}),
    // 通道色环
    svg('rect', {x: -6.5, y: -46, width: 13, height: 6, fill: color}),
    // 护套尾环
    svg('rect', {x: -4.5, y: -24, width: 9, height: 4, fill: color, opacity: .9}),
    // 细同轴线(拖向右上方, 接示波器 BNC)
    svg('path', {d: 'M0 -60 C10 -74 26 -72 40 -58 C50 -48 58 -50 66 -58', fill: 'none', stroke: '#383f46', 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
  )
  group.append(label(entity.label, 0, 14))
  return group
}

//  -  面板测试点 TP1–TP4(frame-004/005: 银色圆底座+中心针孔; 占用高亮沿 probe-ring 先例) - 
export function renderTestPoint(entity, state = {}, context = {}) {
  const group = svg('g')
  const occupied = Boolean(occupantOf(context, entity.id))

  add(group,
    // 银色圆底座(六角垫圈观感)+针孔+中心测针
    svg('circle', {cx: 0, cy: 0, r: 7.5, fill: '#d3dade', stroke: '#8a959a', 'stroke-width': 1.4}),
    svg('circle', {cx: 0, cy: 0, r: 5.2, fill: '#c2cbd0'}),
    svg('circle', {cx: 0, cy: 0, r: 2.6, fill: '#4a565c'}),
    svg('circle', {cx: 0, cy: 0, r: 1.2, fill: '#e8eef0'}),
    occupied ? svg('circle', {cx: 0, cy: 0, r: 13, fill: 'none', class: 'probe-ring'}) : null,
    occupied ? svg('circle', {cx: 0, cy: 0, r: 9, fill: 'none', stroke: '#3e9b6e', 'stroke-width': 2}) : null,
  )
  group.append(label(entity.label, 0, 24))
  return group
}

//  -  面板香蕉插孔(frame-004/005/007: 彩色塑料环+黑色孔芯; AM IP 绿色, 颜色读 visual.color) - 
export function renderSignalJack(entity, state = {}, context = {}) {
  const group = svg('g')
  const color = entity?.visual?.color || '#2c8a3c'
  const occupied = Boolean(occupantOf(context, entity.id))

  add(group,
    // 镀铬垫圈
    svg('circle', {cx: 0, cy: 0, r: 10.5, fill: '#d9dfe1', stroke: '#8a959a', 'stroke-width': 1.4}),
    // 彩色塑料环(香蕉插孔座)
    svg('circle', {cx: 0, cy: 0, r: 7.5, fill: color, stroke: '#1c232c', 'stroke-width': 1.4}),
    // 黑色孔芯
    svg('circle', {cx: 0, cy: 0, r: 3.4, fill: '#101418'}),
    svg('circle', {cx: 0, cy: 0, r: 1.2, fill: '#2c3438'}),
    occupied ? svg('circle', {cx: 0, cy: 0, r: 15, fill: 'none', class: 'probe-ring'}) : null,
    occupied ? svg('circle', {cx: 0, cy: 0, r: 11.5, fill: 'none', stroke: '#3e9b6e', 'stroke-width': 2}) : null,
  )
  group.append(label(entity.label, 0, 26))
  return group
}
