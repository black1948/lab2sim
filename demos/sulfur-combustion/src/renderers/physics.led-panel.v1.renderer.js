import {add, shadow, svg} from './svg.js'

//  -  发光二极管显示板(kind=led_indicator_panel, 本案 112 红/绿 LED 交流显示板) - 
// 证据帧: frame-003/004(白色立板立于底座右端, 板面竖排两颗半球 LED - 上绿下红, 左右
//          各一颗小银色螺丝钉); frame-009(双 LED 近景: 板底左下角引出暗红导线弯向左
//          侧发电机, 已预接线); frame-012/015/016(绿亮红灭, 亮时带辉光); frame-014
//          (红亮绿灭) - 两管随交流正负半周轮流发光.
// 复用否决理由: 四域注册表无 LED 显示板条目; physics.screen(光学屏), 
//          physics.graph-board(白板), physics.electrode-panel(静电细屑显示板, 无 LED
//          语义)形状语义均不符.可信源发现两轮: 第 1 轮命中
//          ExperienceLovelace/ha-floorplan light_off.svg(Home Assistant 平面图示例工程
//          文件, 语义/风格双重否决, 已清理注册副作用); 第 2 轮 query=led diode
//          indicator board 无评分通过文件(trace assets/discover-led_indicator_panel), 
//          故代码原生生成.
// 风格基础: physics.electrode-panel.v1 / physics.strip-tassel.v1(面板/板上状态显示先
//          例: 立板受光高光线 + 状态驱动的板上发光件 + 引出短引线画法)+ 白件
//          #ecebe3/#b9b3a4 描边族(wimshurst)+ 螺丝 class screw.LED 亮色按任务规格取
//          饱和不过曝 #37c837(绿)/ #e03325(红)(frame-009/016 亮绿, frame-014 亮红
//          采样归一后同族); 灭态暗色底 #1f4d24/#571712; 导线暗红 #7a1f16(frame-009
//          采样 (122,36,30) 归一化).配色内联, 不新增 class, 辉光用同心圆叠加(不用
//          defs 渐变, 避免多实例 id 冲突, 先例 wimshurst 电弧辉光晕).
// 状态语义: state.ac_phase_deg(数值, 缺省 0, 可无限累加)→ rad=deg - π/180; 
//          red 亮度 = max(0, sin(rad)), green 亮度 = max(0, −sin(rad))(∈0..1, 互补于
//          正弦半周, 对应 frame-012 绿亮/frame-014 红亮轮流发光).亮度驱动: 
//          ① LED 填充色在灭态暗色与亮色间插值; ② 亮时叠加同心圆径向辉光光晕
//          (r20/16/12.5/9.5/7, opacity 0.05/0.08/0.11/0.14/0.18 × 亮度, 近似径向渐变)
//          + 高光点增亮; ③ 完全灭(亮度<0.02)
//          只画暗色底.接线语义=已预接线: 板底左下角恒画一根暗红导线弯向左侧(贝塞尔, 
//          弦长约 70px), 不设接线状态字段.
// 关键尺寸(局部原点=板底面中心=台面接触点, y 向下为正, 板向 −y 生长): 
//   白色立板 x∈[-28,28] y∈[-110,0](56×110); 顶面斜切 + 右侧 4px 侧棱表现厚感; 银色
//   螺丝 r1.7 于 (±18,-58); 绿 LED(上)半球 r9 圆心 (0,-72), 红 LED(下)(0,-38)(平底
//   半球=上半圆弧+平口); 暗红导线自 (−22,−4) 出板, C/S 弯至 (−72,−6)(指向左侧发电机).
//   总高 110px.
// 证据不清处: LED 半球确切直径按帧比例估读(板宽 ~1/3 → r9); 螺丝确切高度按目测板中
//   部偏上; 导线在 frame-009 呈 S 形垂到台面再弯向左, 渲染器取贴板下行的近似曲线; 板面
//   无印刷文字/刻度(帧内不可辨), 保持素白.
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/led-panel'
//   (import {renderLedPanel} from './physics.led-panel.v1.renderer.js').场景建议: 本件
//   局部原点放在发电机(physics/ac-generator 局部系)(+150,−20)(台面右端), 导线端点
//   (−72,−6) 落在台面上方指向发电机; 渲染器不读 anchors, 请构建方核对.

const WHITE = '#ecebe3'
const WHITE_TOP = '#f4f2ea'
const WHITE_SIDE = '#d8d5ca'
const WHITE_EDGE = '#b9b3a4'
const LED_GREEN = '#37c837'     // 亮绿(任务规格级, frame-012/016 同族)
const LED_GREEN_OFF = '#1f4d24'
const LED_RED = '#e03325'       // 亮红(任务规格级, frame-014 同族)
const LED_RED_OFF = '#571712'
const WIRE_DARK = '#7a1f16'     // 暗红导线(frame-009 采样归一化)
const SCREW_RING = '#5b6a6d'

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

function mixColor(offHex, onHex, t) {
  const off = hexToRgb(offHex)
  const on = hexToRgb(onHex)
  const ch = i => Math.round(off[i] + (on[i] - off[i]) * t)
  return `rgb(${ch(0)} ${ch(1)} ${ch(2)})`
}

function ledIndicator(cy, onHex, offHex, brightness) {
  // 半球 LED(上半圆 + 平口), 亮度驱动填充色/辉光/高光
  const r = 9
  const lit = brightness > 0.02
  const group = svg('g')
  if (lit) {
    // 径向辉光光晕: 五层同心圆叠加近似径向渐变(不用 defs 渐变, 避免多实例 id 冲突)
    for (const [radius, base] of [[20, .05], [16, .08], [12.5, .11], [9.5, .14], [7, .18]]) {
      group.append(svg('circle', {cx: 0, cy: cy - 2, r: radius, fill: onHex, opacity: (base * brightness).toFixed(3)}))
    }
  }
  const fill = mixColor(offHex, onHex, brightness)
  const edge = mixColor(offHex, onHex, Math.min(1, brightness * 0.55))
  group.append(svg('path', {
    d: `M${-r} ${cy}A${r} ${r} 0 0 1 ${r} ${cy}Z`,
    fill, stroke: edge, 'stroke-width': 1.3,
  }))
  group.append(svg('ellipse', {
    cx: -3.2, cy: cy - 4.2, rx: 2.4, ry: 1.5,
    fill: '#ffffff', opacity: (0.22 + 0.5 * brightness).toFixed(3),
  }))
  if (lit) {
    group.append(svg('circle', {cx: 0, cy: cy - 3.5, r: 3.4, fill: onHex, opacity: (0.28 * brightness).toFixed(3)}))
  }
  return group
}

export function renderLedPanel(entity, state = {}, context = {}) {
  const group = svg('g')
  const raw = Number(state.ac_phase_deg)
  const phase = Number.isFinite(raw) ? raw : 0
  const rad = phase * Math.PI / 180
  const redBrightness = Math.max(0, Math.sin(rad))
  const greenBrightness = Math.max(0, -Math.sin(rad))
  add(group, shadow(0, 1.5, 30, 4.5))
  // 白色立板: 正面 + 顶面斜切 + 右侧棱(厚感)+ 受光高光线
  add(group,
    svg('path', {d: 'M-28 -110L28 -110L32 -106L-24 -106Z', fill: WHITE_TOP, stroke: WHITE_EDGE, 'stroke-width': 1}),
    svg('path', {d: 'M28 -110L32 -106L32 -4L28 0Z', fill: WHITE_SIDE, stroke: WHITE_EDGE, 'stroke-width': 1}),
    svg('rect', {x: -28, y: -110, width: 56, height: 110, rx: 2, fill: WHITE, stroke: WHITE_EDGE, 'stroke-width': 1.6}),
    svg('line', {x1: -24, y1: -105, x2: 22, y2: -105, stroke: 'rgb(255 255 255 / 50%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )
  // 左右银色螺丝钉(板中部)
  add(group,
    svg('circle', {cx: -18, cy: -58, r: 1.7, class: 'screw'}),
    svg('circle', {cx: 18, cy: -58, r: 1.7, class: 'screw'}),
  )
  // 板底左下角暗红导线弯向左侧发电机(已预接线, 恒画)
  add(group, svg('path', {
    d: 'M-22 -4C-40 -2 -38 -12 -54 -12C-66 -12 -62 -4 -72 -6',
    fill: 'none', stroke: WIRE_DARK, 'stroke-width': 2.4, 'stroke-linecap': 'round',
  }))
  // 中央竖排两颗半球 LED: 上绿下红(state.ac_phase_deg 互补半周轮流发光)
  group.append(ledIndicator(-72, LED_GREEN, LED_GREEN_OFF, greenBrightness))
  group.append(ledIndicator(-38, LED_RED, LED_RED_OFF, redBrightness))
  return group
}
