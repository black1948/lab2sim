import {add, label, shadow, svg} from './svg.js'

//  -  台式数字温度计(米白主机箱 + 红色七段 LED 读数 + 缆线连手持钢针测温探针) - 
// 视觉依据: frame-006/007/008 特写(卧式长方体米白机箱; 正面大面积黑色显示窗, 红色七段
// 读数 54.8/58.5/62.2, 右上角 °C 角标; 窗顶一排细刻度与 2 处白色小标记; 窗右侧竖排两组
// 小端子/开关刻痕; 面板下部浅色条带: 左起两只小旋钮 + 黑色插座×2 + 红色插座(缆线插在
// 红座上垂到台面右侧)+ 白色小圆钮 + 丝印文字行; 右侧板上有圆形凸起物 - 分辨率不足未绘制); 
// frame-002/003/004 整机坐台面(机宽≈烧杯宽 2.7 倍, 整机≈1.7:1 卧式长方体, 坐姿略高于杯底); 
// frame-009 显示窗熄灭态.探针: 深色手持杆 + 钢针, 缆线深红细线自面板红座绕一个圈后连到探杆.
// 风格依据: 机箱米白塑料沿用 biology.test-tube-rack.v1 的塑料族配色(PLASTIC #efeadd /
// PLASTIC_TOP #f7f4ea / PLASTIC_EDGE #c6c0ae / HOLE #b9b2a0 / HOLE_DEEP #7d7666; 证据帧暗光
// 采样 #797a72~#888074 归一化到该族), 2.5D 顶面斜折同该架/physics.ring-vessel 画法; 电子设备
// 机箱/暗显示窗/发光读数/旋钮插座排布语言参照 circuits.js renderMultimeter(dmm-lcd 暗窗 +
// 读数 + jack)与 chemistry.js renderElectronicScale(台面电子仪器 + 读数窗); 钢针金属色取
// styles.css .metal 既有族 #b4c0c2/#5b6a6d; 七段红取实拍发光红归一化 #ff4a33(暗段残影
// #3a201a, 实拍暗段在黑窗上仍有可辨残影).配色全部内联, 不新增 styles.css class.
// 运行时绑定: state.display_c(number, 如 9.6 / 62.2; 数字字符串兼容)→ 窗内红色七段读数, 
// 固定一位小数, 整数部分两位前导零(frame-004 实拍显示 09.6), 值不可用(NaN/undefined/null)
// 显示 "--"; 不实现熄屏变暗变体(frame-009 熄屏态按契约以 "--" 表达).
// 位姿绑定: state.above(引擎吸附时写入目标实体 id 的字符串, 未吸附为 null)切换两套探针位姿 - 
//   未吸附(静止): 探针经缆线垂在主机右下方, 针尖 (104, 80); 
//   吸附(docked): 探针总成改从主机底沿垂下, 针轴竖直 x=20, 针尖 (20, 110), 缆线收在主机背后
//   (先于机箱绘制被遮挡).落位核算(anchored_gap=0.06 → 原点在杯口沿上方 30px, 实体 scale 1.15): 
//   针尖吸附后落在杯口中心右侧 20×1.15≈23px(口沿半宽 ≈34px 之内), 口沿下方
//   110×1.15−30≈96px - 处于液面(口沿下 50px)与烧杯内底(口沿下 113px)之间; 主机底沿
//   (local+2×1.15)距口沿上方 ≈27.7px 不重叠.docked 位姿同时隐去接地阴影(主机悬空于杯口上方).
// 局部几何(y 向下, (0,0)=主机底缘中心/台面接触线): 
//   主机外接框 x -85..85, y -94..+2(宽 170 × 高 96, 含支脚; 前脸 170×90); 
//   探针尖: 未吸附 (104, 80) / 吸附 (20, 110)(构建方据此声明探针 snap 锚点; 注意 app.js
//   snapPointFor 按 y 向下口径读 IR anchors, 场景 y 向上语义需取反号); 
//   七段数码单元 14×24, 线宽 3(等效字号 ≈26px), 窗内左起 x=-64, 单元顶端 y=-58; 
//   °C 角标 font-size 13 @ (35, -41); 器械标签 label(entity.label, 0, -112)(机箱上方外侧).
// 证据不清处: ① 机箱丝印 CETI 品牌字样在特写中可辨, 为避免商标具体化未复刻, 以两道文字线 +
// 浅绿小方块示意(同 chemistry.beaker-inverted.v1 标签贴先例); ② 窗顶 2 处白色小标记按可见
// 绘制, 语义不明; ③ 右侧板圆形凸起物(疑似绕线轴/提手)在 352×288 原帧不可辨, 未绘制; 
// ④ 读数小数点位置在原帧为中等置信, 按构建方契约固定一位小数.
// 导出签名与 chemistry.js 一致: renderDigitalThermometer(entity, state).
// 集成: renderer 键 chemistry/digital-thermometer(index.js 的 import/注册由构建方完成).

const CASE = '#efeadd'          // 机箱前脸(米白塑料, 同 biology.test-tube-rack PLASTIC)
const CASE_TOP = '#f7f4ea'      // 2.5D 顶面斜折(受光)
const CASE_EDGE = '#c6c0ae'     // 塑料描边/缝线
const CASE_DETAIL = '#b9b2a0'   // 端子刻痕/丝印底(HOLE 族)
const CASE_DEEP = '#7d7666'     // 深刻痕(HOLE_DEEP)
const FOOT = '#6d675a'          // 支脚
const WINDOW_BG = '#17120e'     // 显示窗近黑
const LED_LIT = '#ff4a33'       // 七段点亮红
const LED_UNLIT = '#3a201a'     // 七段暗段残影
const LED_DEG = '#c23a28'       // °C 角标(较暗红)
const METAL = '#b4c0c2'         // 钢针(styles.css .metal 族)
const METAL_EDGE = '#5b6a6d'
const GRIP = '#2e2a26'          // 探针手持杆深色
const GRIP_EDGE = '#17140f'
const CABLE = '#6e322a'         // 缆线深红(frame-006 实拍暗红细缆)
const JACK_RED = '#c0392b'      // 红色插座(circuits dmm-jack-red 族)
const JACK_RED_EDGE = '#7e241a'

// 七段数码管: 段位 → 单元(14×24, 线宽 3)局部路径
const SEG_PATHS = {
  a: 'M2.2 1.6H11.8',
  b: 'M12.4 3V10.4',
  c: 'M12.4 13.6V21',
  d: 'M2.2 22.4H11.8',
  e: 'M1.6 13.6V21',
  f: 'M1.6 3V10.4',
  g: 'M2.2 12H11.8',
}
const SEGMENT_DIGITS = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
  '-': ['g'],
}
const DIGIT_ADVANCE = 19 // 14 单元宽 + 5 间距
const DOT_ADVANCE = 7

// 读数格式化: 固定一位小数; 整数部分不足两位补前导零(frame-004 实拍 09.6); 
// 负号/三位整数不补零; 不可用 → "--"(契约)
export function formatReading(value) {
  // null/undefined/空串都视为"值不可用"(Number(null)=0 会把缺省读数伪装成 0.0)
  if (value === null || value === undefined || value === '') return '--'
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return '--'
  const clamped = Math.max(-99.9, Math.min(999.9, parsed))
  const [integer, decimal] = (Math.round(clamped * 10) / 10).toFixed(1).split('.')
  const head = integer.startsWith('-') || integer.length > 2 ? integer : integer.padStart(2, '0')
  return `${head}.${decimal}`
}

function sevenSegChar(char, x) {
  const cell = svg('g', {transform: `translate(${x} 0)`})
  if (char === '.') {
    cell.append(svg('circle', {cx: 2.6, cy: 22.4, r: 1.9, fill: LED_LIT}))
    return cell
  }
  const lit = SEGMENT_DIGITS[char] || []
  for (const [name, d] of Object.entries(SEG_PATHS)) {
    const on = lit.includes(name)
    if (on) cell.append(svg('path', {d, fill: 'none', stroke: LED_LIT, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.26}))
    cell.append(svg('path', {d, fill: 'none', stroke: on ? LED_LIT : LED_UNLIT, 'stroke-width': 3, 'stroke-linecap': 'butt'}))
  }
  return cell
}

// 读数组: 左对齐排入显示窗(frame-006 读数居窗左侧, °C 在右侧)
function ledReading(text) {
  const group = svg('g', {transform: 'translate(-64 -58) skewX(-8)'})
  let cursor = 0
  for (const char of text) {
    group.append(sevenSegChar(char, cursor))
    cursor += char === '.' ? DOT_ADVANCE : DIGIT_ADVANCE
  }
  return group
}

// 显示窗: 暗窗 + 窗顶刻度行与白色小标记 + 读数后方的微弱红晕
function displayWindow(reading) {
  const ticks = svg('g')
  for (let index = 0; index <= 19; index += 1) {
    const x = -70 + index * 5.8
    ticks.append(svg('path', {
      d: `M${x} -78.5V${index % 4 === 0 ? -74 : -76}`,
      stroke: 'rgb(255 255 255 / 26%)', 'stroke-width': 1,
    }))
  }
  return add(svg('g'),
    svg('rect', {x: -76, y: -82, width: 120, height: 56, rx: 4, fill: WINDOW_BG, stroke: '#0b0806', 'stroke-width': 1.5}),
    ticks,
    svg('rect', {x: -10, y: -79, width: 4, height: 3.2, fill: 'rgb(255 255 255 / 55%)'}),
    svg('rect', {x: 14, y: -79, width: 4, height: 3.2, fill: 'rgb(255 255 255 / 55%)'}),
    svg('rect', {x: -70, y: -60, width: 86, height: 30, rx: 3, fill: '#2a120c', opacity: 0.5}),
    ledReading(reading),
  )
}

// 面板下部条带: 旋钮/插座/小圆钮/丝印示意(frame-006 自左向右)
function lowerPanel() {
  const legends = svg('g')
  for (let index = 0; index < 7; index += 1) {
    const y = -80 + index * 3.6
    legends.append(svg('path', {d: `M50 ${y}H${index % 2 === 0 ? 71 : 67}`, stroke: CASE_DETAIL, 'stroke-width': 1.1}))
  }
  for (let index = 0; index < 6; index += 1) {
    const y = -50 + index * 3.6
    legends.append(svg('path', {d: `M50 ${y}H${index % 2 === 0 ? 71 : 66}`, stroke: CASE_DETAIL, 'stroke-width': 1.1}))
  }
  legends.append(svg('rect', {x: 56, y: -46, width: 4.5, height: 3.4, fill: CASE_DEEP}))
  return add(svg('g'),
    svg('circle', {cx: -64, cy: -14, r: 4.5, fill: CASE_DEEP, stroke: '#4c463a', 'stroke-width': 1}),
    svg('path', {d: 'M-64 -14L-64 -17.6', stroke: '#26231d', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    svg('circle', {cx: -52, cy: -14, r: 4.5, fill: CASE, stroke: CASE_EDGE, 'stroke-width': 1.2}),
    svg('circle', {cx: -52, cy: -14, r: 1.5, fill: CASE_DEEP}),
    svg('circle', {cx: -40, cy: -14, r: 3, fill: JACK_RED, stroke: JACK_RED_EDGE, 'stroke-width': 1}),
    svg('circle', {cx: -30, cy: -14, r: 2.6, fill: '#fbfaf6', stroke: CASE_EDGE, 'stroke-width': 0.8}),
    // 丝印: 品牌字样可辨(CETI)但避免商标具体化, 以两道文字线 + 浅绿小方块示意
    svg('path', {d: 'M-14 -16H26', stroke: '#8d8570', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-14 -11.5H18', stroke: CASE_DETAIL, 'stroke-width': 1, 'stroke-linecap': 'round'}),
    svg('rect', {x: 32, y: -17, width: 6, height: 4.4, rx: 0.8, fill: '#9fb4a6', opacity: 0.75}),
    legends,
  )
}

// 静止位姿探针(针尖朝下垂在主机右下方)+ 缆线(自面板红座垂到台面, 绕一圈后连到探杆, frame-006 缆线路径)
function probeAssemblyRest() {
  return add(svg('g'),
    svg('path', {
      d: 'M-40 -11C-40 0 -28 10 -8 13C10 15.5 26 14 30 9C33 5 28 3 26 6C24 9 30 13 40 14C58 16 76 18 90 24C97 27 100 24 104 21',
      fill: 'none', stroke: CABLE, 'stroke-width': 1.8, 'stroke-linecap': 'round',
    }),
    // 手持杆 + 杆身高光 + 隔环 + 钢针 + 针尖(针轴竖直 x=104, 尖端 (104, 80))
    svg('rect', {x: 99, y: 18, width: 10, height: 23, rx: 4.5, fill: GRIP, stroke: GRIP_EDGE, 'stroke-width': 1.2}),
    svg('path', {d: 'M101.6 22V37', stroke: 'rgb(255 255 255 / 22%)', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    svg('rect', {x: 100.8, y: 41, width: 6.4, height: 5, rx: 1, fill: '#4a443a', stroke: GRIP_EDGE, 'stroke-width': 1}),
    svg('rect', {x: 102.9, y: 46, width: 2.2, height: 29, fill: METAL, stroke: METAL_EDGE, 'stroke-width': 0.5}),
    svg('path', {d: 'M102.9 75L105.1 75L104 80Z', fill: METAL, stroke: METAL_EDGE, 'stroke-width': 0.5, 'stroke-linejoin': 'round'}),
  )
}

// 吸附位姿缆线: 自面板红座出发走在主机背后(先于机箱绘制而被遮挡), 仅底沿下一小段连到垂下的手持杆
function probeCableDocked() {
  return svg('path', {
    d: 'M-40 -11C-42 0 -24 8 -4 7C10 6.3 18 3 20 -2',
    fill: 'none', stroke: CABLE, 'stroke-width': 1.8, 'stroke-linecap': 'round',
  })
}

// 吸附位姿探针总成: 手持杆贴主机底沿正下(y -2..21), 隔环, 钢针竖直下探(针轴 x=20, y 26..105), 
// 针尖 (20, 110).吸附落位(anchored_gap=0.06, 实体 scale 1.15)核算: 针尖位于杯口中心右
// 20×1.15≈23px(口沿半宽 ≈34px 内), 口沿下方 110×1.15−30≈96px - 处于液面(口沿下 50px)
// 与烧杯内底(口沿下 113px)之间; 主机外接框(x ±85 → 杯口中心 ±97.8px)不与口沿(±34px)重叠.
function probeAssemblyDocked() {
  return add(svg('g'),
    // 手持杆 + 杆身高光 + 隔环 + 钢针 + 针尖(与静止位姿同族件, 尺寸一致)
    svg('rect', {x: 15, y: -2, width: 10, height: 23, rx: 4.5, fill: GRIP, stroke: GRIP_EDGE, 'stroke-width': 1.2}),
    svg('path', {d: 'M17.6 2V17', stroke: 'rgb(255 255 255 / 22%)', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    svg('rect', {x: 17.2, y: 21, width: 5.6, height: 5, rx: 1, fill: '#4a443a', stroke: GRIP_EDGE, 'stroke-width': 1}),
    svg('rect', {x: 18.9, y: 26, width: 2.2, height: 79, fill: METAL, stroke: METAL_EDGE, 'stroke-width': 0.5}),
    svg('path', {d: 'M18.9 105L21.1 105L20 110Z', fill: METAL, stroke: METAL_EDGE, 'stroke-width': 0.5, 'stroke-linejoin': 'round'}),
  )
}

export function renderDigitalThermometer(entity, state = {}) {
  const group = svg('g')
  // 位姿: state.above 为非空字符串(引擎吸附时写入目标实体 id)→ 探针垂入下方容器(docked)
  const docked = typeof state.above === 'string' && state.above.length > 0
  // °C 角标(读数右侧窗内, 较暗红, frame-006/008)
  const unit = svg('text', {x: 35, y: -41, 'text-anchor': 'middle', fill: LED_DEG, 'font-size': 13, 'font-family': 'ui-sans-serif, system-ui, sans-serif', opacity: 0.92})
  unit.textContent = '°C'
  add(group,
    // 接地阴影仅静止位姿绘制(吸附时主机悬于杯口上方, 不再投影台面)
    docked ? null : shadow(0, 3, 96, 8),
    // 吸附位姿缆线走在主机背后(先于机箱绘制被遮挡, 仅底沿下露出连接段)
    docked ? probeCableDocked() : null,
    // 支脚
    svg('rect', {x: -64, y: -4, width: 14, height: 6, rx: 1.5, fill: FOOT}),
    svg('rect', {x: 50, y: -4, width: 14, height: 6, rx: 1.5, fill: FOOT}),
    // 机箱前脸 + 右侧板分缝(2.5D: 右侧稍暗)+ 顶面斜折
    svg('rect', {x: -85, y: -94, width: 170, height: 90, rx: 7, fill: CASE, stroke: CASE_EDGE, 'stroke-width': 2}),
    svg('rect', {x: 77, y: -86, width: 8, height: 82, rx: 3, fill: 'rgb(0 0 0 / 6%)'}),
    svg('path', {d: 'M77 -86V-4', stroke: CASE_EDGE, 'stroke-width': 1.2}),
    svg('path', {d: 'M-85 -87L-78 -94H78L85 -87Z', fill: CASE_TOP, stroke: CASE_EDGE, 'stroke-width': 1.6, 'stroke-linejoin': 'round'}),
    // 显示窗(读数绑定 state.display_c)+ °C 角标
    displayWindow(formatReading(state.display_c)),
    unit,
    lowerPanel(),
    docked ? probeAssemblyDocked() : probeAssemblyRest(),
  )
  group.append(label(entity.label, 0, -112))
  return group
}
