import {add, shadow, svg} from './svg.js'

//  -  手摇交流发电机(kind=ac_generator, 本案 112用发光二极管观察交流电主机) - 
// 证据帧: frame-003(整机结构近景: 白色双层长底座, 左传动轮 + 中 U 形白框发电机本体 +
//          右 LED 显示板共用底座); frame-008/009(本体近景: 框内左侧扁平铜色绕组线圈, 
//          中悬红/蓝竖条转子 - frame-009 红窄条在蓝宽面左侧; 顶梁白色, 梁上印红色左向
//          箭头; 框底小带轮经淡黄皮带连向左侧传动轮); frame-001/002/012(顶轴轴端 4 瓣
//          淡蓝半透明伞状叶轮); frame-014/015/016(转子转动时红/蓝两面换位 - frame-015
//          蓝宽面+红窄边, frame-014/016 红蓝各半并排); 底座前小铭牌(frame-003/009).
// 复用否决理由: physics-core 71 条 + circuits-core 16 条无 generator/dynamo 类条目; 
//          physics.wimshurst-generator.v1(韦氏感应起电机: 双透明盘+莱顿瓶+放电球, 产生
//          静电高压)与本案手摇交流发电机(U 形框+旋转两极转子+线圈, 输出交流)是不同
//          仪器, 不得顶替; physics.metronome/test-table 形状语义不符.可信源发现两轮: 
//          第 1 轮命中 twbs/icons hand-index-fill(手型 UI 图标, 语义/风格双重否决, 注册
//          副作用已清理); 第 2 轮 query=alternating current generator demonstration 无评
//          分通过文件(trace assets/discover-ac_generator), 故代码原生生成.
// 风格基础: physics.wimshurst-generator.v1(整机+状态驱动动画先例: 底座受光条/金属件
//          class metal/screw/白高光线/接地阴影 apparatus-shadow)+ 白件 #ecebe3/#b9b3a4
//          描边族(wimshurst CAP_WHITE/CAP_EDGE).配色取帧低照度采样归一化: 
//          frame-009 皮带淡黄 (214,203,148) → #d6cb94/#b3a878; frame-008/009 线圈铜色
//          (150,96,52)/(196,150,90) → #966034/#c49a5e(边 #5f3a1a); frame-003 转子红
//          (172,44,40) → #c8432f(域红族 #c23a2a 同源, 边 #8f2a1c), 转子蓝 (52,88,158)
//          → #4a76c9(域蓝族 #2e56a8/#3f6ac2 同源); frame-001 叶轮淡蓝 (190,224,228) →
//          rgb(190 224 228 / 48%)(wimshurst 透明盘 DISC_FILL 同族).配色内联, 不新增
//          class.
// 状态语义: state.rotor_angle_deg(数值, 缺省 0, 可无限累加, 不取模)驱动 - 
//          ① 转子条红/蓝两面随角度换位: rad=deg - π/180, 红面权重 clamp(0.25,1,|cos|), 
//          蓝面权重 clamp(0.25,1,|sin|), 两面按权重归一后并排占满转子宽 34px(权重小者
//          即"窄边侧面"); cos≥0 时红面在右, cos<0 时红面在左(frame-003 红窄条居左 /
//          frame-015 红窄边居右的换位).两面接缝画暗缝线, 转子顶画深色顶帽(3D 厚度).
//          ② 顶轴叶轮组(4 瓣淡蓝半透明伞状叶轮)以 rotor_angle_deg 绕轴端在画面平面内
//          旋转(rotate(deg 0 -138)).
// 关键尺寸(局部原点=底座底面中心=台面接触点, y 向下为正, 本体向 −y 生长): 
//   下层基托 x∈[-210,210] y∈[-8,0]; 上层台面 x∈[-196,196] y∈[-20,-8](总长 420, 容纳
//   左侧转轮位与右侧显示板位); U 形框: 左右立柱 x∈[-52,-38]/[38,52] y∈[-90,-20], 顶梁
//   x∈[-52,52] y∈[-104,-90](梁右侧 4px 侧棱表现厚度); 梁下细轴 (8,-90)→(8,-84) 悬转子; 
//   转子 x∈[-9,25] y∈[-84,-30](宽 34); 铜色绕组线圈 x∈[-36,-19] y∈[-88,-30](顶部亮铜
//   盖 y∈[-88,-84]); 框底带轮 (14,-24) r6.5; 淡黄皮带自带轮 Q 控制点 (−56,−13) 到
//   (−114,−21)(端头画 wrap 椭圆, 指向左侧转轮位); 顶轴 (0,-104)→(0,-134); 叶轮组 hub
//   (0,-138), 4 瓣椭圆 rx13 ry8(瓣心距 hub 15.5, 瓣面外倾 32°); 铭牌: 台面右前
//   x∈[40,68] y∈[-18,-12], 基托前中 x∈[-24,28] y∈[-6,-1.5].总高约 160px(叶轮顶 ≈
//   -160)落在台面立式器材 100~170 约定内.
// 证据不清处: frame-003/009 视角下叶轮相对本体很大(近景透视), 受 ~170px 总高约束按比
//   例压缩, 构建方如需更大叶轮可用 visual.scale 放大整机; 线圈绕线纹理在原始分辨率不可
//   逐条计数, 取间距 2.8px 示意; 转子两面宽度换位用 |cos|/|sin| 归一近似(真实透视两面
//   宽度和略随角度变化, 帧内不可测); 铭牌文字不可读, 画素色小牌.
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/ac-generator'
//   (import {renderAcGenerator} from './physics.ac-generator.v1.renderer.js').
//   场景建议: crank_disc 实体局部原点(盘心)放在本机局部 (−150,−34)(盘心到底面 14px, 
//   台面顶 −20 → 盘心 y=−34, 下层盘缘 r40 右缘 x=−110 与皮带端 (−114,−21) 相接); 
//   led_indicator_panel 实体局部原点(板底面中心)放在本机局部 (+150,−20).渲染器不读
//   anchors, 落位由场景处理, 请构建方核对.

const WHITE = '#ecebe3'
const WHITE_EDGE = '#b9b3a4'
const WHITE_SIDE = '#d8d5ca'
const WHITE_DECK = '#f0eee6'
const PLINTH = '#e2e0d6'
const BELT = '#d6cb94'          // 淡黄皮带(frame-009 采样归一化)
const BELT_EDGE = '#b3a878'
const COPPER = '#966034'        // 线圈绕组铜色(frame-008/009 采样归一化)
const COPPER_LIGHT = '#c49a5e'
const COPPER_EDGE = '#5f3a1a'
const ROTOR_RED = '#c8432f'     // 转子红面(域红族)
const ROTOR_RED_EDGE = '#8f2a1c'
const ROTOR_BLUE = '#4a76c9'    // 转子蓝面(域蓝族)
const ROTOR_BLUE_EDGE = '#2e56a8'
const PETAL_FILL = 'rgb(190 224 228 / 48%)' // 叶轮淡蓝半透明(frame-001 同族)
const PETAL_EDGE = '#8fb9bf'
const ARROW_RED = '#c23a2a'     // 顶梁红色左向箭头(frame-008/009/015/016)
const ROTOR_W = 34

function clamp01(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function rotorFaces(angleDeg) {
  // 转子红/蓝两面: 权重 = clamp(0.25, 1, |cos|/|sin|), 归一后并排占满 ROTOR_W.
  // 权重小的一面即透视上的"窄边侧面"; cos 定红面左右侧(换位).
  const rad = angleDeg * Math.PI / 180
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  const rw = clamp01(Math.abs(c), 0.25, 1)
  const bw = clamp01(Math.abs(s), 0.25, 1)
  const redW = ROTOR_W * rw / (rw + bw)
  const blueW = ROTOR_W - redW
  const redSide = c >= 0 ? 1 : -1 // 红面在右(+1)或在左(-1)
  const cx = 8
  const left = cx - ROTOR_W / 2 // 两面自左缘起并排铺满, 无缝隙
  let blueX
  let redX
  if (redSide >= 0) {
    blueX = left
    redX = left + blueW
  } else {
    redX = left
    blueX = left + redW
  }
  const seam = left + (redSide >= 0 ? blueW : redW)
  const group = svg('g')
  group.append(svg('rect', {
    x: blueX.toFixed(2), y: -84, width: blueW.toFixed(2), height: 54,
    rx: 2.5, fill: ROTOR_BLUE, stroke: ROTOR_BLUE_EDGE, 'stroke-width': 1.2,
  }))
  group.append(svg('rect', {
    x: redX.toFixed(2), y: -84, width: redW.toFixed(2), height: 54,
    rx: 2.5, fill: ROTOR_RED, stroke: ROTOR_RED_EDGE, 'stroke-width': 1.2,
  }))
  // 两面接缝暗缝 + 转子顶帽(3D 厚度)
  group.append(svg('line', {
    x1: seam.toFixed(2), y1: -83, x2: seam.toFixed(2), y2: -31,
    stroke: 'rgb(0 0 0 / 20%)', 'stroke-width': 1,
  }))
  group.append(svg('rect', {x: -9, y: -86.5, width: ROTOR_W, height: 4, rx: 1.6, fill: '#3a2f28', opacity: .85}))
  return group
}

function impeller(angleDeg) {
  // 4 瓣淡蓝半透明伞状叶轮(frame-001/002/012), 绕轴端 (0,-138) 在画面平面内旋转
  const group = svg('g', {transform: `rotate(${(angleDeg % 360).toFixed(2)} 0 -138)`})
  for (let i = 0; i < 4; i += 1) {
    group.append(svg('ellipse', {
      cx: 15.5, cy: -130, rx: 13, ry: 8,
      transform: `rotate(${(32 + 90 * i).toFixed(2)} 0 -138)`,
      fill: PETAL_FILL, stroke: PETAL_EDGE, 'stroke-width': 1.3,
    }))
  }
  group.append(svg('circle', {cx: 0, cy: -138, r: 3.2, fill: '#cfd6da', stroke: '#8f959c', 'stroke-width': 1.2}))
  group.append(svg('circle', {cx: 0, cy: -138, r: 1.1, class: 'screw'}))
  return group
}

export function renderAcGenerator(entity, state = {}, context = {}) {
  const group = svg('g')
  const raw = Number(state.rotor_angle_deg)
  const angle = Number.isFinite(raw) ? raw : 0
  add(group, shadow(0, 2, 204, 6))
  // 白色双层底座(frame-003/009: 下层基托更宽, 上层台面内收)+ 台面受光条
  add(group,
    svg('rect', {x: -210, y: -8, width: 420, height: 8, rx: 2.5, fill: PLINTH, stroke: WHITE_EDGE, 'stroke-width': 1.6}),
    svg('rect', {x: -196, y: -20, width: 392, height: 12, rx: 2.5, fill: WHITE, stroke: WHITE_EDGE, 'stroke-width': 1.6}),
    svg('rect', {x: -196, y: -20, width: 392, height: 4, rx: 2, fill: WHITE_DECK}),
    svg('line', {x1: -188, y1: -18.2, x2: 184, y2: -18.2, stroke: 'rgb(255 255 255 / 35%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
  )
  // 框底带轮 + 指向左下方转轮位的淡黄皮带(frame-003/009: 皮带自轮缘走向左侧传动轮)
  add(group,
    svg('path', {d: 'M8 -22.5Q-56 -11.5 -114 -19.5', fill: 'none', stroke: BELT_EDGE, 'stroke-width': 4.6, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M8 -25.5Q-56 -14.5 -114 -22.5', fill: 'none', stroke: BELT, 'stroke-width': 3.4, 'stroke-linecap': 'round'}),
    svg('ellipse', {cx: -114, cy: -21, rx: 3, ry: 5, fill: BELT, stroke: BELT_EDGE, 'stroke-width': 1}),
    svg('circle', {cx: 14, cy: -24, r: 6.5, fill: '#8f959c', stroke: '#5b6a6d', 'stroke-width': 1.4}),
    svg('circle', {cx: 14, cy: -24, r: 1.6, class: 'screw'}),
  )
  // 铜色绕组线圈(frame-008/009: 框内左侧扁平绕线包 + 顶部亮铜盖)+ 竖向绕线纹理
  const coil = svg('g')
  coil.append(svg('rect', {x: -36, y: -84, width: 17, height: 54, rx: 1.5, fill: COPPER, stroke: COPPER_EDGE, 'stroke-width': 1.4}))
  for (let x = -33.2; x <= -21; x += 2.8) {
    coil.append(svg('line', {
      x1: x.toFixed(1), y1: -82, x2: x.toFixed(1), y2: -32,
      stroke: COPPER_EDGE, 'stroke-width': 1, opacity: .45,
    }))
  }
  add(coil,
    svg('rect', {x: -37, y: -88, width: 19, height: 5, rx: 1.2, fill: COPPER_LIGHT, stroke: COPPER_EDGE, 'stroke-width': 1.2}),
    svg('line', {x1: -33.5, y1: -82, x2: -33.5, y2: -34, stroke: 'rgb(255 255 255 / 25%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
  )
  group.append(coil)
  // 红/蓝两极竖条转子(state.rotor_angle_deg 驱动换位)
  add(group, svg('line', {x1: 8, y1: -90, x2: 8, y2: -84, stroke: '#4a5257', 'stroke-width': 2}))
  group.append(rotorFaces(angle))
  // U 形白框: 立柱 + 顶梁(梁右侧 4px 侧棱表现厚度)+ 梁上红色左向箭头
  add(group,
    svg('rect', {x: -56, y: -90, width: 4, height: 70, fill: WHITE_SIDE, stroke: WHITE_EDGE, 'stroke-width': 1}),
    svg('rect', {x: -52, y: -90, width: 14, height: 70, fill: WHITE, stroke: WHITE_EDGE, 'stroke-width': 1.5}),
    svg('rect', {x: 38, y: -90, width: 14, height: 70, fill: WHITE, stroke: WHITE_EDGE, 'stroke-width': 1.5}),
    svg('rect', {x: -52, y: -104, width: 104, height: 14, rx: 1.5, fill: WHITE, stroke: WHITE_EDGE, 'stroke-width': 1.5}),
    svg('rect', {x: 52, y: -103, width: 4, height: 12, rx: 1, fill: WHITE_SIDE}),
    svg('line', {x1: -50, y1: -102.2, x2: 48, y2: -102.2, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
    svg('line', {x1: -38, y1: -86, x2: -38, y2: -24, stroke: 'rgb(0 0 0 / 8%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
    svg('line', {x1: 38, y1: -86, x2: 38, y2: -24, stroke: 'rgb(0 0 0 / 8%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
    // 红色左向箭头(梁面印刷, frame-008/009/015/016)
    svg('line', {x1: -4, y1: -97, x2: -18, y2: -97, stroke: ARROW_RED, 'stroke-width': 2, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-18 -97L-13.5 -99.6L-13.5 -94.4Z', fill: ARROW_RED}),
  )
  // 顶轴 + 4 瓣叶轮(随 rotor_angle_deg 旋转)
  add(group,
    svg('circle', {cx: 0, cy: -104, r: 3, fill: '#8f959c', stroke: '#5b6a6d', 'stroke-width': 1}),
    svg('line', {x1: 0, y1: -104, x2: 0, y2: -134, stroke: '#9aa2a8', 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
    svg('line', {x1: -0.6, y1: -106, x2: -0.6, y2: -132, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 0.8, 'stroke-linecap': 'round'}),
  )
  group.append(impeller(angle))
  // 小铭牌(frame-003/009: 台面右前 + 基托前中, 文字不可读故画素色)
  add(group,
    svg('rect', {x: 40, y: -18, width: 28, height: 6, rx: 1, fill: '#6a6f74', stroke: '#3f4448', 'stroke-width': 0.8}),
    svg('line', {x1: 43, y1: -15, x2: 65, y2: -15, stroke: 'rgb(255 255 255 / 30%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
    svg('rect', {x: -24, y: -6, width: 52, height: 4.5, rx: 1, fill: '#f4f2ea', stroke: WHITE_EDGE, 'stroke-width': 0.8}),
  )
  return group
}
