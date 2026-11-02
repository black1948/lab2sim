import {add, label, shadow, svg} from './svg.js'

//  -  数字计时仪 + 剪式升降台(121-用数字计时仪测气垫导轨上滑块的即时速度) - 
// 视觉依据: frame-019/020 特写(米白偏暖机箱坐剪式升降台平台上; 顶上白色遮光罩罩过
//           机身, 左侧罩布垂角; 正面左侧深色显示窗, 红色数码管读数; 窗右竖排刻痕与
//           小圆孔; 右下浅色方形按钮; 下沿深色饰带+浅色丝印行); frame-022/023(读数
//           31.8, 数字后两枚红色小点=单位指示); frame-028/029/030/031(读数 24.7, 
//           同一版位); frame-004/016/017/018 全景(整机在导轨后方剪式升降台上: X 形
//           交叉金属腿+中央枢轴钮+顶平台+下搁板, 台面藏于导轨后).
// 复用审查否决记录: physics.ticker-timer.v1(119 灰机身电磁打点计时器, 机械打点, 无
//           数码管), physics.ticker-timer-disc.v1(120 黑底座复写纸盘打点计时器), 
//           physics.galvanometer.v1(指针电流计), physics.power-supply.v1(直流电源), 
//           circuits.oscilloscope(示波器)均不同物, 不得顶替.
//           chemistry.digital-thermometer.v1(米白机箱+红色七段读数台式仪器)仅作七段
//           数码画法骨架参考, 探针/温度语义与本片无关, 不复用条目.
//           可信源发现(scripts/discover_apparatus.py --kind digital_timer --label
//           数字计时器)返回 "no scored vector file matched"(tabler/twbs 单色线稿图标, 
//           风格断裂), 按规程代码原生生成.
// 风格依据: 机箱暖米白塑料沿用 chemistry.digital-thermometer.v1 塑料族归一化(frame-028
//           暗光采样 #b9b19a→浅主题 #ded7c2/#efe9d6); 深显示窗+红色七段读数+暗段残影
//           语言沿用同文件(WINDOW_BG/LED_LIT 族, skewX 斜体七段); 金属剪叉沿用
//           physics.ac-generator.v1 支架铬件族(#b9bcbf/#7d8288); 接地阴影同域约定.
//           配色全部内联, 不新增 styles.css class.
// 锚点: 局部 (0,0)=剪式升降台底脚与台面接触线中心(y 向下).剪叉腿 y∈[-52,-6], 
//           顶平台 y∈[-58,-46]; 计时仪机箱 x∈[-75,75], y∈[-126,-56](宽 150 × 高 70), 
//           遮光罩顶 y=-134; 整机总高约 134px.场景建议放导轨后方(z_index=20, IR 已
//           声明), x 位居导轨左段上方(frame-016 计时器正对导轨左段/光电门侧).
// 状态契约(scene visual.state_bindings 已声明 powered→power.on, display_text→
//           display.text, 渲染器直接读 state.powered / state.display_text): 
//   state.display_text(字符串, 如 "0.00"/"31.8"/"24.7")→ 显示窗内七段数码读数, 字符
//     逐字上屏(数字 0-9, 小数点, 负号; 其余字符按暗段画); powered=false → 显示窗熄灭
//     (暗底, 不画读数与红晕, 契约"熄灭(暗底)"); powered=true 且无 display_text →
//     画 "--".数字右侧两枚红色单位指示点(frame-022/023 数字后的冒号样红点)与按钮
//     旁通电指示点随 powered 点亮/熄灭.
// 契约参数: 无外部参数.
// 证据不清处: ① 遮光罩形制(软质罩布/硬质罩壳)不可辨, 按罩顶+左侧垂片补形; ② 面板
//           丝印文字(frame-019 下沿浅色行)不可辨读, 按两道文字线示意(同
//           digital-thermometer 避免商标具体化先例); ③ 电源线出线位置帧内不可辨, 
//           未绘制; ④ 窗右小圆孔/竖排刻痕按可见位置绘制, 语义不明.
// 导出签名与模板一致: renderDigitalTimer(entity, state, context).
// 集成: renderer 键 physics/digital-timer(index.js 的 import/注册由构建方完成: 复制本
//           文件到 src/renderers/ 并在 index.js 注册 'physics/digital-timer').

const CASE = '#ded7c2'        // 机箱前脸(暖米白塑料, frame-028 暗光采样归一化)
const CASE_TOP = '#efe9d6'    // 2.5D 顶面斜折(受光)
const CASE_EDGE = '#a89f86'   // 塑料描边/缝线
const CASE_DETAIL = '#b9b19a' // 面板刻痕/丝印底
const FASCIA = '#8f8871'      // 下沿深色饰带
const HOOD = '#f2efe6'        // 顶部遮光罩(白色)
const HOOD_EDGE = '#c6c0ae'
const WINDOW_BG = '#171310'   // 显示窗近黑
const WINDOW_EDGE = '#0b0906'
const LED_LIT = '#ff4a33'     // 七段点亮红(digital-thermometer 族)
const LED_UNLIT = '#3a201a'   // 七段暗段残影
const LED_OFF = '#8f8871'     // 通电指示熄灭色(饰带同族暗色)
const METAL = '#b9bcbf'       // 剪叉铬件
const METAL_EDGE = '#7d8288'
const BUTTON = '#e8e3d4'      // 浅色方形按钮
const BUTTON_EDGE = '#a89f86'

// 七段数码管: 段位 → 单元(16×26, 线宽 3.2)局部路径(画法沿用
// chemistry.digital-thermometer.v1.renderer.js 的 SEG_PATHS/SEGMENT_DIGITS)
const SEG_PATHS = {
  a: 'M2.6 1.8H13.4',
  b: 'M14 3.4V11',
  c: 'M14 15V22.6',
  d: 'M2.6 24.2H13.4',
  e: 'M2 15V22.6',
  f: 'M2 3.4V11',
  g: 'M2.6 12.9H13.4',
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
const DIGIT_ADVANCE = 21  // 16 单元宽 + 5 间距
const DOT_ADVANCE = 8

function sevenSegChar(char, lit) {
  const cell = svg('g')
  if (char === '.') {
    cell.append(svg('circle', {cx: 2.8, cy: 24.2, r: 2, fill: lit ? LED_LIT : LED_UNLIT}))
    return cell
  }
  const on = SEGMENT_DIGITS[char] || []
  for (const [name, d] of Object.entries(SEG_PATHS)) {
    const isLit = lit && on.includes(name)
    cell.append(svg('path', {d, fill: 'none', stroke: isLit ? LED_LIT : LED_UNLIT, 'stroke-width': 3.2, 'stroke-linecap': 'butt'}))
  }
  return cell
}

// 读数组: 窗内左起排布(frame-022/028 读数居窗左侧, 右留单位指示点)
function ledReading(text) {
  const group = svg('g', {transform: 'translate(-64 -114) skewX(-8)'})
  let cursor = 0
  for (const char of text) {
    const cell = sevenSegChar(char, true)
    cell.setAttribute('transform', `translate(${cursor} 0)`)
    group.append(cell)
    cursor += char === '.' ? DOT_ADVANCE : DIGIT_ADVANCE
  }
  return group
}

export function renderDigitalTimer(entity, state = {}, context = {}) {
  const group = svg('g')
  const powered = Boolean(state.powered)
  // 读数文本: powered 才上屏; 缺省/空 → "--"(契约: display_text 字符串直接上屏)
  const reading = powered
    ? (typeof state.display_text === 'string' && state.display_text.length > 0 ? state.display_text : '--')
    : ''

  //  -  剪式升降台(frame-019: X 形交叉铬腿+中央枢轴钮+顶平台+下搁板) - 
  add(group,
    shadow(0, 3, 52, 7),
    // 底脚(两只短足)
    svg('rect', {x: -40, y: -6, width: 18, height: 6, rx: 1.5, fill: METAL_EDGE}),
    svg('rect', {x: 22, y: -6, width: 18, height: 6, rx: 1.5, fill: METAL_EDGE}),
    // X 形交叉腿(两根铬杆, 外深内浅双层描线)
    svg('line', {x1: -31, y1: -50, x2: 31, y2: -8, stroke: METAL_EDGE, 'stroke-width': 6.4, 'stroke-linecap': 'round'}),
    svg('line', {x1: -31, y1: -50, x2: 31, y2: -8, stroke: METAL, 'stroke-width': 3.6, 'stroke-linecap': 'round'}),
    svg('line', {x1: 31, y1: -50, x2: -31, y2: -8, stroke: METAL_EDGE, 'stroke-width': 6.4, 'stroke-linecap': 'round'}),
    svg('line', {x1: 31, y1: -50, x2: -31, y2: -8, stroke: METAL, 'stroke-width': 3.6, 'stroke-linecap': 'round'}),
    // 中央枢轴滚花钮
    svg('circle', {cx: 0, cy: -29, r: 4.6, fill: METAL, stroke: METAL_EDGE, 'stroke-width': 1.3}),
    svg('circle', {cx: 0, cy: -29, r: 1.6, fill: METAL_EDGE}),
    // 下搁板(X 腿之间的浅台)
    svg('rect', {x: -26, y: -18, width: 52, height: 5, rx: 1.5, fill: METAL, stroke: METAL_EDGE, 'stroke-width': 1.1}),
    // 顶平台(含前缘唇口)
    svg('rect', {x: -46, y: -58, width: 92, height: 7, rx: 1.5, fill: METAL, stroke: METAL_EDGE, 'stroke-width': 1.3}),
    svg('rect', {x: -46, y: -52, width: 92, height: 6, rx: 1.5, fill: '#9aa0a8', stroke: METAL_EDGE, 'stroke-width': 1.1}),
    svg('line', {x1: -42, y1: -56.5, x2: 42, y2: -56.5, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
  )

  //  -  计时仪机箱(150×70) - 
  add(group,
    // 机箱前脸 + 右侧背光暗部 + 顶面斜折
    svg('rect', {x: -75, y: -126, width: 150, height: 70, rx: 4, fill: CASE, stroke: CASE_EDGE, 'stroke-width': 1.8}),
    svg('rect', {x: 63, y: -120, width: 12, height: 60, rx: 3, fill: 'rgb(0 0 0 / 7%)'}),
    svg('path', {d: 'M-75 -119L-68 -126H68L75 -119Z', fill: CASE_TOP, stroke: CASE_EDGE, 'stroke-width': 1.3, 'stroke-linejoin': 'round'}),
    // 下沿深色饰带 + 丝印示意行(frame-019 下沿浅色行, 文字不可辨)
    svg('rect', {x: -75, y: -64, width: 150, height: 8, rx: 2, fill: FASCIA}),
    svg('line', {x1: -60, y1: -60, x2: 22, y2: -60, stroke: 'rgb(255 255 255 / 38%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
    svg('line', {x1: -60, y1: -57.2, x2: 8, y2: -57.2, stroke: 'rgb(255 255 255 / 22%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
  )

  //  -  遮光罩(白色罩顶 + 左侧垂片, frame-019/028 左侧罩布垂下) - 
  add(group,
    svg('path', {d: 'M-82 -122L-78 -134H76L84 -122Z', fill: HOOD, stroke: HOOD_EDGE, 'stroke-width': 1.3, 'stroke-linejoin': 'round'}),
    svg('path', {d: 'M-82 -122L-79 -131L-73 -129L-75 -98L-80 -99Z', fill: HOOD, stroke: HOOD_EDGE, 'stroke-width': 1.1, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -76, y1: -131, x2: 74, y2: -131, stroke: 'rgb(255 255 255 / 60%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )

  //  -  显示窗(深色窗 + 红色七段读数 + 单位指示点) - 
  add(group,
    svg('rect', {x: -70, y: -116, width: 96, height: 36, rx: 3, fill: WINDOW_BG, stroke: WINDOW_EDGE, 'stroke-width': 1.4}),
    // 窗内微弱红晕(powered 时)
    powered ? svg('rect', {x: -66, y: -112, width: 82, height: 27, rx: 2.5, fill: '#2a120c', opacity: 0.45}) : null,
    reading ? ledReading(reading) : null,
    // 数字右侧两枚红色单位指示点(frame-022/023 冒号样红点), powered 点亮
    svg('circle', {cx: 19.5, cy: -106, r: 1.7, fill: powered ? LED_LIT : LED_UNLIT}),
    svg('circle', {cx: 19.5, cy: -98, r: 1.7, fill: powered ? LED_LIT : LED_UNLIT}),
  )

  //  -  窗右面板: 竖排刻痕两组 + 小圆孔(frame-019 窗右细节) - 
  add(group,
    ...[0, 1, 2, 3].map(i => svg('path', {
      d: `M${32 + (i % 2) * 3} ${-112 + i * 4.6}H${46 - (i % 2) * 4}`,
      stroke: CASE_DETAIL, 'stroke-width': 1.1,
    })),
    ...[0, 1, 2].map(i => svg('path', {
      d: `M33 ${-90 + i * 4}H${44 - (i % 2) * 5}`,
      stroke: CASE_DETAIL, 'stroke-width': 1.1,
    })),
    svg('circle', {cx: 56, cy: -108, r: 2.2, fill: '#6d675a', stroke: CASE_EDGE, 'stroke-width': 0.9}),
  )

  //  -  右下浅色方形按钮 + 通电指示(frame-019/028 右下按钮) - 
  add(group,
    svg('rect', {x: 36, y: -78, width: 22, height: 18, rx: 2.5, fill: BUTTON, stroke: BUTTON_EDGE, 'stroke-width': 1.3}),
    svg('rect', {x: 38.5, y: -75.5, width: 17, height: 13, rx: 1.5, fill: 'none', stroke: 'rgb(0 0 0 / 10%)', 'stroke-width': 1}),
    svg('circle', {cx: 28, cy: -70, r: 2.4, fill: powered ? LED_LIT : LED_OFF, stroke: BUTTON_EDGE, 'stroke-width': 0.9}),
  )

  group.append(label(entity.label, 0, 16))
  return group
}
