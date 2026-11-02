import {add, label, shadow, svg} from './svg.js'

//  -  感应圈高压电源(kind=induction_coil, case 139 电子束在磁场中偏转) - 
// 视觉依据: frame-001(正面全景: 象牙白木箱底座+箱上卧放米色圆筒次级线圈(两端深色端板), 
//           线圈上左右各一支带球端金属放电杆(黑色锥形绝缘座+金属杆+顶端小球+水平指向内
//           侧的尖针), 箱正面红框面板: 左右两金属旋钮+中央黑色旋钮开关(上方弧形刻度)+
//           顶部印刷字与中央小红件+下方印刷字牌, 箱左侧黑色电源线拖出); frame-014(暗室
//           同机位: 轮廓一致, 高压导线自箱侧引出).
// 复用否决: 注册表无 induction_coil 条目; 最近邻 physics.wimshurst-generator.v1(手摇静电
//           起电机: 双转盘+摇柄+莱顿瓶), physics.helmholtz-coil.v1 / physics.suspended-coil.v1
//           (环形/悬挂线圈)形状功能均不符; 可信源发现命中 twbs/icons brightness-alt-high-fill
//           (16px 单色"屏幕亮度"UI 图标, 'high' 词元误配+单色线稿与域内 2.5D 体块风格断裂), 
//           已回滚删 svg(trace assets/discover-induction_coil), 故代码原生生成.
// 风格基础: 象牙白箱体沿 physics.cathode-ray-tube.v1 CERAMIC #ece9df/#b5ae9d 同族; 米色线圈筒
//           取 frame-001 采样归一化暖米色; 面板米白+黑旋钮沿 physics.power-supply.v1
//           FACE/KNOB 画法(滚花短线+弧形刻度); 金属件沿 physics.cathode-ray-tube.v1 STRAP
//           金属族.配色内联, 不新增 styles.css class.
// 关键尺寸(局部 (0,0)=底座底边中点=台面接触线, y 向下为正, 总宽约 170px, 总高约 153px): 
//   底座箱 x∈[-85,85] y∈[-46,0](顶面斜折至 -50); 支脚 x=±52; 线圈筒轴 y=-92, 半径 40, 
//   x∈[-65,65], 两端深色端板 x∈[-75,-63]/[63,75]; 放电杆 x=±40(锥座 y∈[-131,-108], 
//   杆至 -146, 球心 -148 r4.5, 水平尖针指向内侧至 x=±18); 红框面板 x∈[-43,43] y∈[-40,-7].
// 状态契约(读实体自身 state): state.valve_open(bool 缺省 false)=中央旋钮开关的指示位置 - 
//   off=指示标记斜下, on=指向接通刻度(竖直向上指弧形刻度中点)+面板中央小指示区加浅红
//   点缀(帧内无指示灯证据, 克制处理); 旋钮本体不转, 只动指示标记.
//   高压接线端子: 局部 (±78,-30) 箱侧金属端钮(构建方契约的导线夹接视觉端点; frame-007/014
//   实拍导线夹在放电杆顶端, 见 design_notes 证据不清处③).
// 证据不清处: ① 面板印刷字 352×288 源不可辨 - 只画刻线/字牌色条不造字; ② 面板顶部中央
//   红色小件帧内可见但功能不可辨 - 按静态小红椒件绘制(不随状态变化); ③ 导线夹接点按
//   构建方契约落在箱侧端钮 (±78,-30), 非放电杆顶端(帧内所见); ④ 放电杆顶端为"小球+水平
//   尖针"组合(frame-001 特写), 针指向内侧(相对).
// z 序: 低于管件(构建方 scene 排序).集成: 复制本文件到 src/renderers/ 并在 index.js
//   import {renderInductionCoil} 后注册 'physics/induction-coil'.

const BOX = '#ece9df'          // 底座箱象牙白(cathode-ray-tube CERAMIC 同族)
const BOX_EDGE = '#b5ae9d'
const BOX_TOP = '#f4f1e8'
const BOX_SHADE = '#d8d3c4'
const DRUM = '#e9e2cc'         // 次级线圈筒米色(frame-001 采样归一化)
const DRUM_EDGE = '#b3a98c'
const DRUM_SHADE = '#d6cbb0'
const ENDPLATE = '#38322b'     // 线圈筒深色端板
const ENDPLATE_EDGE = '#211d18'
const METAL = '#9aa2ab'        // 放电杆金属
const METAL_EDGE = '#565e66'
const INSULATOR = '#26262a'    // 锥形绝缘座/中央旋钮黑
const FACE = '#eae8dc'         // 面板米白(power-supply FACE 同族)
const RED_FRAME = '#c05246'    // 面板红框(frame-001 红橙细框)
const RED_LAMP = '#c23a2c'     // 顶部小红椒件
const RED_SOFT = '#e08a7a'     // on 态浅红点缀(克制)
const PRINT = '#6b6a5f'        // 印刷字刻线灰橄榄
const KNOB_METAL = '#b4c0c2'   // 侧旋钮金属(STRAP 同族)
const KNOB_METAL_EDGE = '#5b6a6d'
const CORD = '#1f1d1a'         // 电源线

export function renderInductionCoil(entity, state = {}, context = {}) {
  const group = svg('g')
  const valveOpen = Boolean(state.valve_open)

  add(group, shadow(0, 2.5, 88, 7))

  //  -  底座箱(象牙白, frame-001) - 
  add(group,
    svg('rect', {x: -85, y: -46, width: 170, height: 46, rx: 3, fill: BOX, stroke: BOX_EDGE, 'stroke-width': 1.6}),
    svg('path', {d: 'M-85 -46L-79 -50L79 -50L85 -46Z', fill: BOX_TOP, stroke: BOX_EDGE, 'stroke-width': 1.2, 'stroke-linejoin': 'round'}),
    svg('rect', {x: 62, y: -44, width: 20, height: 41, rx: 3, fill: BOX_SHADE, stroke: 'none', opacity: .55}),
  )
  // 电源线(frame-001 左侧拖出短段)
  group.append(svg('path', {d: 'M-85 -26Q-98 -23 -103 -12', fill: 'none', stroke: CORD, 'stroke-width': 2.6, 'stroke-linecap': 'round'}))

  //  -  线圈筒支脚(frame-001 两只白色鞍座) - 
  for (const x of [-52, 52]) {
    group.append(svg('rect', {x: x - 6, y: -52, width: 12, height: 8, rx: 2, fill: '#e5e1d2', stroke: BOX_EDGE, 'stroke-width': 1}))
  }

  //  -  次级线圈筒(卧放米色圆筒 r40, frame-001) - 
  add(group,
    svg('rect', {x: -65, y: -132, width: 130, height: 80, rx: 14, fill: DRUM, stroke: DRUM_EDGE, 'stroke-width': 1.6}),
    svg('rect', {x: -65, y: -70, width: 130, height: 18, rx: 9, fill: DRUM_SHADE, stroke: 'none', opacity: .8}),
    svg('line', {x1: -50, y1: -124, x2: 50, y2: -124, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 3, 'stroke-linecap': 'round'}),
    svg('line', {x1: -56, y1: -115, x2: 56, y2: -115, stroke: 'rgb(255 255 255 / 22%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
  )
  // 两端深色端板(frame-001)
  for (const s of [-1, 1]) {
    group.append(svg('rect', {
      x: s === -1 ? -75 : 63, y: -133, width: 12, height: 82, rx: 5,
      fill: ENDPLATE, stroke: ENDPLATE_EDGE, 'stroke-width': 1.2,
    }))
  }

  //  -  放电杆 ×2(黑锥绝缘座+金属杆+球端+内侧水平尖针, frame-001) - 
  for (const s of [-1, 1]) {
    const x = 40 * s
    add(group,
      svg('path', {d: `M${x - 11} -130L${x + 11} -130L${x + 3.2} -108L${x - 3.2} -108Z`, fill: INSULATOR, stroke: '#101012', 'stroke-width': 1.1, 'stroke-linejoin': 'round'}),
      svg('line', {x1: x, y1: -110, x2: x, y2: -146, stroke: METAL, 'stroke-width': 3.6, 'stroke-linecap': 'round'}),
      svg('line', {x1: x - 1, y1: -110, x2: x - 1, y2: -144, stroke: 'rgb(255 255 255 / 35%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
      svg('circle', {cx: x, cy: -148, r: 4.5, fill: METAL, stroke: METAL_EDGE, 'stroke-width': 1.1}),
      svg('circle', {cx: x, cy: -148, r: 1.6, fill: METAL_EDGE}),
    )
    // 水平尖针指向内侧(frame-001 两针相对)
    group.append(svg('path', {
      d: `M${x} -149.6L${x - 20 * s} -148L${x} -146.4Z`,
      fill: METAL, stroke: METAL_EDGE, 'stroke-width': .8, 'stroke-linejoin': 'round',
    }))
  }

  //  -  红框面板(frame-001: 左右旋钮+中央黑旋钮+印刷字刻线) - 
  group.append(svg('rect', {x: -43, y: -40, width: 86, height: 33, rx: 2, fill: FACE, stroke: RED_FRAME, 'stroke-width': 1.5}))
  // 顶部印刷字(不可辨→刻线)+ 中央小红椒件(frame-001 静态)
  group.append(svg('line', {x1: -18, y1: -34.5, x2: 18, y2: -34.5, stroke: PRINT, 'stroke-width': 1.4, 'stroke-dasharray': '7 3.5 11 3.5', 'stroke-linecap': 'round', opacity: .85}))
  group.append(svg('circle', {cx: 0, cy: -30.5, r: 2.4, fill: RED_LAMP, stroke: '#7e241b', 'stroke-width': .9}))
  // 左右印刷字刻线 + 金属旋钮(frame-001)
  for (const s of [-1, 1]) {
    const x = 26 * s
    group.append(svg('line', {x1: x - 7, y1: -27.5, x2: x + 7, y2: -27.5, stroke: PRINT, 'stroke-width': 1.2, 'stroke-dasharray': '5 2.5', 'stroke-linecap': 'round', opacity: .8}))
    add(group,
      svg('circle', {cx: x, cy: -20, r: 4.8, fill: KNOB_METAL, stroke: KNOB_METAL_EDGE, 'stroke-width': 1.2}),
      svg('line', {x1: x - 3.2, y1: -17.6, x2: x + 3.2, y2: -22.4, stroke: KNOB_METAL_EDGE, 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
      svg('circle', {cx: x - 1.4, cy: -21.6, r: 1.1, fill: 'rgb(255 255 255 / 70%)'}),
    )
  }
  // 中央黑色旋钮开关(本体不转; 上方弧形刻度, frame-001)+ 指示标记(state.valve_open)
  add(group,
    svg('path', {d: 'M-7.5 -28.5Q0 -33.5 7.5 -28.5', fill: 'none', stroke: PRINT, 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    svg('circle', {cx: 0, cy: -19, r: 6.4, fill: INSULATOR, stroke: '#0c0c0e', 'stroke-width': 1.2}),
  )
  for (let index = 0; index < 8; index += 1) {
    const rad = index * Math.PI / 4
    group.append(svg('line', {
      x1: (4.7 * Math.cos(rad)).toFixed(1), y1: (-19 + 4.7 * Math.sin(rad)).toFixed(1),
      x2: (6.4 * Math.cos(rad)).toFixed(1), y2: (-19 + 6.4 * Math.sin(rad)).toFixed(1),
      stroke: '#4a4a46', 'stroke-width': 1,
    }))
  }
  // 指示标记: off=斜下(指向右下) / on=竖直向上指向接通刻度
  const tip = valveOpen ? {x: 0, y: -28.2} : {x: 3.4, y: -13.6}
  group.append(svg('line', {x1: 0, y1: -19, x2: tip.x, y2: tip.y, stroke: '#e8e4d8', 'stroke-width': 1.7, 'stroke-linecap': 'round'}))
  if (valveOpen) {
    // on 态浅红点缀(帧内无指示灯证据, 克制)
    group.append(svg('circle', {cx: 6, cy: -26.5, r: 1.7, fill: RED_SOFT, opacity: .8}))
  }
  // 下方印刷字牌(不可辨→刻线行)
  group.append(svg('line', {x1: -30, y1: -11, x2: 30, y2: -11, stroke: PRINT, 'stroke-width': 1.5, 'stroke-dasharray': '8 3 5 3 12 3', 'stroke-linecap': 'round', opacity: .85}))

  //  -  高压接线端子 ×2(构建方契约的导线夹接视觉端点, 局部 ±78,-30) - 
  for (const s of [-1, 1]) {
    const x = 78 * s
    add(group,
      svg('rect', {x: x - 2.6, y: -36, width: 5.2, height: 12, rx: 1.6, fill: KNOB_METAL, stroke: KNOB_METAL_EDGE, 'stroke-width': 1}),
      svg('circle', {cx: x, cy: -30, r: 3.1, fill: KNOB_METAL, stroke: KNOB_METAL_EDGE, 'stroke-width': 1.1}),
      svg('circle', {cx: x, cy: -30, r: 1.1, fill: KNOB_METAL_EDGE}),
    )
  }

  group.append(label(entity.label, 0, 16))
  return group
}
