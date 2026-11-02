import {add, label, shadow, svg} from './svg.js'

//  -  洛伦兹力实验仪主机 DJ3025-1(kind=lorentz_demonstrator, case 138 电子束在匀强磁场中的圆周运动) - 
// 视觉依据: frame-001/002(全景: 立式机箱, 上室为浅色立柱边框围成的深色开口(容纳球管与线圈, 
//           顶部有金属提手), 下层面板浅灰绿; frame-001 特写: 前环下沿在球泡颈前, 上沿被球泡
//           遮挡); frame-005(面板特写: 左 V 表窗+右 A 表窗(白表盘+弧形刻度+黑指针), 中央
//           红色型号印刷 "DJ3025-1 洛伦兹力实验仪"+红色电源指示灯, 一排 4 只黑色滚花旋钮
//           (旋钮 1 外围弧形刻度 0/100/200/300/350V, 旋钮 3 刻度 0..3A), 底部红黑接线柱排); 
//           frame-006/014(通电暗室: 中央红灯点亮带光晕).
// 复用审查否决(注册表无 lorentz_demonstrator 条目): physics.cathode-ray-tube.v1=卧式水平玻璃
//           射线管(瓷座+偏转极板+喇叭荧光屏), 与本机立式机箱形状/功能皆不符; physics.crt-demo-
//           console.v1=楔形底座+V 形遮光屏斜面板, 无双表头无上室开口框架; physics.power-supply.v1
//           =学生电源平面机箱(单圆表+黄绿指示灯+开/关钮), 与本机(双方形表窗 V/A+中央红灯+
//           4 旋钮排+上室开口框架)面板布局/功能不符 - 三者均禁止顶替.可信源发现命中 feathericons
//           youtube.svg('tube' 词元误配的视频品牌 logo 线稿)已回滚(trace assets/rollback-
//           lorentz_demonstrator), 故代码原生生成.
// 风格基础: 机身体块+顶面斜折+接地阴影沿 physics.power-supply.v1.renderer.js 先例(面板浅灰
//           #b9bcb4 族, 顶盖 #d3d5cd, 描边 #55584f); 表窗白盘+弧形刻度沿 power-supply 电压表画法; 
//           旋钮凸座黑 #232326 族沿 crt-demo-console KNOB 画法; 红印刷/红端钮 #a83a2e/#c23a2c
//           沿 power-supply RED 同族; 配色全部内联, 不新增 styles.css class.
// 关键尺寸(局部原点=机箱底面中点=落地线, y 向下为正, 本体向 −y 生长): 
//   面板 240×120(x∈[-120,120], y∈[-120,0])+顶面斜折至 y=-128; 上室浅色立柱边框至 y=-190
//   (立柱 x∈[±98,±120], 顶梁 y∈[-190,-176], 深色开口 x∈[-98,98] y∈[-176,-128], 顶提手
//   y∈[-198,-190]); 左 V 表窗中心 (-55,-85), 右 A 表窗中心 (+55,-85)(窗 44×34); 中央红灯
//   (0,-75) r4; 4 旋钮凸座 x∈{-87,-29,29,87} y=-35(座圈 r15+裙边 r18 - 凸座画在本机渲染器, 
//   旋钮本体为独立实体 physics.panel-knob.v1 叠上); 旋钮 1 外围弧形刻度(0/100/200/300/350V
//   点位)在 x=-87, 旋钮 3 刻度(0/1/2/3A 点位, 1/2 仅刻度点)在 x=+29; 底部红黑接线柱 4 对.
//   总高约 190px, 总宽 240px.
// 状态契约(读实体自身 state): state.powered(bool, 缺省 false)=中央红灯亮(亮=#ff5a3c+光晕+
//           高光点, 灭=暗 #6e3a32, frame-014 点亮); state.meter_u_norm(0..1)=V 表指针自左端
//           (-60°) 偏转至 +60°; state.meter_i_norm(0..1)=A 表指针同规则.缺省/越界/非数值按 0 处理.
// 证据不清处: ① 表盘小刻度数字在 352×288 原帧不可辨→只画刻度线不造字, 仅表窗单位字母 V/A
//           (frame-005 可辨); ② 旋钮 1 弧形刻度数字 0/100/200/300/350V 与旋钮 3 端点 0/3A
//           在 frame-005 特写可辨故照录(字号 4.2 示意), 旋钮 3 中间档 1/2 不可辨→只画刻度点; 
//           ③ 旋钮下功能印刷小字(加速电压/励磁电流等)与面板左下小开关在原帧不可辨→不绘制; 
//           ④ 上室内部纵深(后壁/滑轨)帧内不可辨→按契约只画深色开口, 深度遮挡交由其他实体.
// 集成: 复制本文件到模板 src/renderers/ 并在 index.js 注册 'physics/lorentz-demonstrator'
//           (import {renderLorentzDemonstrator} from './physics.lorentz-demonstrator.v1.renderer.js').
//           场景落位(构建方契约): 主机 (0.5,0.10)→屏幕 px (500,510), scale 1.15; 球管 (0.5,0.384), 
//           两线圈 (0.5,0.574), 加速电压旋钮 (0.40,0.18), 励磁旋钮 (0.533,0.18)(旋钮本体落位于
//           本机凸座 x=-87/x=+29 的屏幕投影上).z 序: 本机最低层, 球管/线圈/旋钮叠于其上.

const FACE = '#bfc2b6'        // 面板(frame-001 暗光采样归一化, power-supply PANEL 同族)
const FACE_TOP = '#d3d5cd'    // 顶面斜折受光(power-supply PANEL_TOP 同族)
const EDGE = '#55584f'        // 描边
const POST = '#d6d7cc'        // 上室浅色立柱边框(frame-001 立柱受光)
const POST_EDGE = '#6a6e60'
const CHAMBER = '#14171c'     // 上室深色开口(暗室观察, frame-006 近黑)
const CHAMBER_DEEP = '#0b0d11'
const DIAL = '#f2f0e4'        // 表盘米白(power-supply FACE 同族)
const DARKTEXT = '#3f423c'    // 刻度/印刷深灰
const NEEDLE = '#1c1c1e'      // 黑指针(frame-005)
const RED_PRINT = '#a83a2e'   // 型号印刷红(frame-005)
const LAMP_LIT = '#ff5a3c'    // 红灯亮(frame-014)
const LAMP_OFF = '#6e3a32'    // 红灯灭
const BOSS = '#17171a'        // 旋钮凸座座圈
const BOSS_SKIRT = '#232326'  // 旋钮凸座裙边
const POST_RED = '#c23a2c'    // 红接线柱(power-supply RED 同族)
const POST_DARK = '#26262a'   // 黑接线柱
const KNOB_X = [-87, -29, 29, 87]

function clamp01(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

// 表窗(白表盘+刻度弧+黑指针, frame-005; 指针 -60°..+60° 随 norm 自左端偏转)
function meter(cx, norm, unit) {
  const group = svg('g')
  const cy = -85
  const pivotY = -70.5
  add(group,
    svg('rect', {x: cx - 22, y: cy - 17, width: 44, height: 34, rx: 2.5, fill: DIAL, stroke: EDGE, 'stroke-width': 1.5}),
    svg('rect', {x: cx - 19, y: cy - 14, width: 38, height: 28, rx: 2, fill: 'none', stroke: '#c5c2b2', 'stroke-width': .9}),
  )
  const polar = (deg, r) => {
    const rad = deg * Math.PI / 180
    return {x: cx + r * Math.sin(rad), y: pivotY - r * Math.cos(rad)}
  }
  const from = polar(-60, 16.5)
  const to = polar(60, 16.5)
  group.append(svg('path', {
    d: `M${from.x.toFixed(1)} ${from.y.toFixed(1)}A16.5 16.5 0 0 1 ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
    fill: 'none', stroke: DARKTEXT, 'stroke-width': 1,
  }))
  for (const deg of [-60, -30, 0, 30, 60]) {
    const t1 = polar(deg, 16.5)
    const t2 = polar(deg, 14)
    group.append(svg('line', {
      x1: t1.x.toFixed(1), y1: t1.y.toFixed(1), x2: t2.x.toFixed(1), y2: t2.y.toFixed(1),
      stroke: DARKTEXT, 'stroke-width': 1,
    }))
  }
  // 表窗单位字母(frame-005 可辨; 印刷层, 指针浮于其上)
  const unitText = svg('text', {x: cx, y: cy - 2, 'text-anchor': 'middle', fill: DARKTEXT, 'font-size': 6})
  unitText.textContent = unit
  group.append(unitText)
  const tip = polar(-60 + clamp01(norm) * 120, 19)
  group.append(svg('line', {
    x1: cx, y1: pivotY, x2: tip.x.toFixed(1), y2: tip.y.toFixed(1),
    stroke: NEEDLE, 'stroke-width': 1.6, 'stroke-linecap': 'round',
  }))
  group.append(svg('circle', {cx, cy: pivotY, r: 2, fill: '#3a3d36'}))
  return group
}

// 旋钮外围弧形刻度(frame-005: -60°..+60° 弧+刻度点; labels 非空处照录可辨数字, 空串只画刻度点)
function knobScale(kx, labels) {
  const group = svg('g')
  const cy = -35
  const polar = (deg, r) => {
    const rad = deg * Math.PI / 180
    return {x: kx + r * Math.sin(rad), y: cy - r * Math.cos(rad)}
  }
  const a0 = polar(-60, 26)
  const a1 = polar(60, 26)
  group.append(svg('path', {
    d: `M${a0.x.toFixed(1)} ${a0.y.toFixed(1)}A26 26 0 0 1 ${a1.x.toFixed(1)} ${a1.y.toFixed(1)}`,
    fill: 'none', stroke: DARKTEXT, 'stroke-width': .9, opacity: .8,
  }))
  const last = labels.length - 1
  for (let index = 0; index <= last; index += 1) {
    const deg = -60 + index * 120 / last
    const t1 = polar(deg, 24)
    const t2 = polar(deg, 27.5)
    group.append(svg('line', {
      x1: t1.x.toFixed(1), y1: t1.y.toFixed(1), x2: t2.x.toFixed(1), y2: t2.y.toFixed(1),
      stroke: DARKTEXT, 'stroke-width': 1,
    }))
    if (labels[index]) {
      const p = polar(deg, 32)
      const text = svg('text', {x: p.x.toFixed(1), y: (p.y + 1.5).toFixed(1), 'text-anchor': 'middle', fill: DARKTEXT, 'font-size': 4.2})
      text.textContent = labels[index]
      group.append(text)
    }
  }
  return group
}

export function renderLorentzDemonstrator(entity, state = {}, context = {}) {
  const group = svg('g')
  const powered = Boolean(state.powered)
  // 接地阴影 + 底脚
  add(group,
    shadow(0, 3, 132, 9),
    svg('rect', {x: -104, y: 0, width: 18, height: 2.6, rx: 1.2, fill: '#6f7276'}),
    svg('rect', {x: 86, y: 0, width: 18, height: 2.6, rx: 1.2, fill: '#6f7276'}),
  )
  //  -  上室: 浅色立柱边框 + 深色开口(frame-001; 球管/线圈的深度遮挡交由其他实体) - 
  add(group,
    svg('rect', {x: -26, y: -198, width: 52, height: 8, rx: 3.4, fill: '#8b8f86', stroke: EDGE, 'stroke-width': 1.1}),
    svg('rect', {x: -120, y: -190, width: 240, height: 14, fill: POST, stroke: POST_EDGE, 'stroke-width': 1.4}),
    svg('rect', {x: -120, y: -190, width: 22, height: 62, fill: POST, stroke: POST_EDGE, 'stroke-width': 1.4}),
    svg('rect', {x: 98, y: -190, width: 22, height: 62, fill: POST, stroke: POST_EDGE, 'stroke-width': 1.4}),
    svg('rect', {x: -98, y: -176, width: 196, height: 48, fill: CHAMBER, stroke: CHAMBER_DEEP, 'stroke-width': 1.2}),
    svg('rect', {x: -98, y: -133, width: 196, height: 5, fill: '#1a1e23', opacity: .9}),
  )
  //  -  面板机箱(240×120 + 顶面斜折) - 
  add(group,
    svg('rect', {x: -120, y: -120, width: 240, height: 120, rx: 3, fill: FACE, stroke: EDGE, 'stroke-width': 1.8}),
    svg('path', {d: 'M-120 -120L-112 -128L112 -128L120 -120Z', fill: FACE_TOP, stroke: EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -114, y1: -118.5, x2: 114, y2: -118.5, stroke: 'rgb(255 255 255 / 40%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
  )
  //  -  双表头(左 V=加速电压 / 右 A=励磁电流, frame-005) - 
  group.append(meter(-55, state.meter_u_norm, 'V'))
  group.append(meter(55, state.meter_i_norm, 'A'))
  //  -  中央型号印刷 + 红色电源指示灯(frame-005/014) - 
  const brand = svg('text', {x: 0, y: -95, 'text-anchor': 'middle', fill: RED_PRINT, 'font-size': 6.2, 'font-weight': 700})
  brand.textContent = 'DJ3025-1'
  group.append(brand)
  group.append(svg('path', {d: 'M-19 -91.5Q0 -87.5 19 -91.5', fill: 'none', stroke: RED_PRINT, 'stroke-width': .9, opacity: .65}))
  if (powered) {
    group.append(svg('circle', {cx: 0, cy: -75, r: 9, fill: LAMP_LIT, opacity: .28}))
  }
  group.append(svg('circle', {cx: 0, cy: -75, r: 4, fill: powered ? LAMP_LIT : LAMP_OFF, stroke: powered ? '#8f2c20' : '#4a241d', 'stroke-width': 1.2}))
  if (powered) {
    group.append(svg('circle', {cx: -1.3, cy: -76.4, r: 1.2, fill: '#ffd9c9', opacity: .95}))
  }
  //  -  4 旋钮凸座(旋钮本体为独立实体 physics.panel-knob.v1 叠上) - 
  for (const kx of KNOB_X) {
    add(group,
      svg('circle', {cx: kx, cy: -35, r: 18, fill: BOSS_SKIRT, stroke: '#0f0f11', 'stroke-width': 1.2}),
      svg('circle', {cx: kx, cy: -35, r: 15, fill: BOSS, stroke: '#000000', 'stroke-width': 1}),
      svg('circle', {cx: kx, cy: -35, r: 9, fill: '#101013'}),
    )
  }
  //  -  旋钮 1 / 旋钮 3 外围弧形刻度(frame-005) - 
  group.append(knobScale(-87, ['0', '100', '200', '300', '350V']))
  group.append(knobScale(29, ['0', '', '', '3A']))
  //  -  底部红黑接线柱排(frame-005) - 
  for (const px of [-88, -40, 8, 56]) {
    add(group,
      svg('circle', {cx: px, cy: -9, r: 3, fill: POST_RED, stroke: '#7e241b', 'stroke-width': 1}),
      svg('circle', {cx: px + 11, cy: -9, r: 3, fill: POST_DARK, stroke: '#0c0c0e', 'stroke-width': 1}),
    )
  }
  group.append(label(entity.label, 0, 17))
  return group
}
