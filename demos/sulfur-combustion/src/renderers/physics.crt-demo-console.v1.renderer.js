import {add, label, shadow, svg} from './svg.js'

//  -  阴极射线演示器主机(kind=crt_demo_console, case 137) - 
// 证据帧: frame-003/005(全景: 浅灰绿金属楔形底座主机, 顶面斜面板上从左到右: 大黑色调节
//          旋钮, 中央白色拨动开关, 大黑色调节旋钮, 右侧红色小拨杆位(杆本体为独立实体
//          panel_lever, 此处只画杆座/字牌); 底座下缘深绿色; 主机背后立两块深色遮光屏板
//          组成敞开 V 形暗背景; 左后方黑色电源线拖在台面); frame-004(面板特写: 旋钮滚花, 
//          面板印刷字迹不可辨).
// 复用否决: 注册表无 crt_demo_console 条目; physics.power-supply.v1(学生电源: 平面板+
//          电压表+指示灯机箱)与本品(楔形斜面板+双遮光屏+管支座)形状语义不同, 普通电源
//          ≠该演示器主机, 禁止顶替; 可信源发现命中 twbs/icons power.svg(电源符号 glyph)
//          已回滚出注册表并删除 svg(trace assets/discover-crt_demo_console, 
//          assets/rollback-crt_demo_console), 故代码原生生成.
// 风格基础: 机身体块+顶面斜折画法沿 physics.ticker-timer.v1.renderer.js / power-supply 先例
//          (面板浅灰绿 #b7beb2 族, 描边 #565e52, 深绿底带 #3c5a46 依 frame-005 采样归一化); 
//          旋钮黑 #26262a+滚花刻度(power-supply KNOB 画法); 接地阴影 apparatus-shadow; 
//          配色全部内联, 不新增 styles.css class.
// 状态契约: state.power_on(bool, 缺省 false)→中央白色拨杆倾角随通断切换(on=上倾/off=下倾); 
//          面板无可见电源指示灯(frame-003~006 均未见点亮指示), 故不绘制指示灯(证据不清处); 
//          面板旋钮全程未被操作, 画静态.遮光屏由本渲染器一并绘出(组内先屏后机身, 屏在管
//          后方).
// 关键尺寸(局部原点=底面中心=台面接触点, y 向下为正, 本体向 −y 生长): 
//   机身 x∈[-80,80] y∈[-46,0]; 深绿底带 y∈[-13,0]; 顶面唇缘 y∈[-50,-46](支座落地线); 
//   斜面板 x∈[-72,72] y∈[-42,-16]; 旋钮 A (-50,-29)/旋钮 B (34,-29) r8+裙边 r10.5; 白拨杆
//   (-8,-27); 杆座板 (55~69,-36~-24); 遮光屏(frame-005 网格实测比例): 左屏宽幅背景板
//   底边 x∈[-58,16] 顶边 x∈[-64,10] y≈-154, 右屏较矮靠右 底边 x∈[30,72] 顶边 x∈[36,80]
//   y≈-146, 底缘 y=-44 隐入机身顶面.总高约 156px(左屏顶).
// 证据不清处: ① 面板印刷字(旋钮/开关功能名)在 352×288 源不可辨, 以刻度点+空白字牌示意, 
//          不造字; ② 电源指示灯不可见, 不画; ③ 遮光屏开合角度按 frame-005 目测(左屏左倾
//          约 12°, 右屏右倾约 8°)示意; ④ 电源线出线位置在机身左后方, 按 frame-003 画向左
//          拖出短段.
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/crt-demo-console'
//          (import {renderCrtDemoConsole} from './physics.crt-demo-console.v1.renderer.js').
//          z 序: 本机(含遮光屏)为三件套最低层 - 遮光屏须在管后方先画, 且管支座落地叠于
//          顶面唇缘之上; 杆座局部坐标 (62,-29) 供 panel_lever 实体落位(scene anchors).

const BODY = '#b7beb2'          // 机身浅灰绿(frame-005 采样归一化)
const BODY_EDGE = '#565e52'
const PANEL_FACE = '#c6ccbd'    // 斜面板(受光略亮)
const LIP = '#cdd2c4'           // 顶面唇缘
const BASE_GREEN = '#3c5a46'    // 底座深绿下缘(frame-005)
const BASE_GREEN_EDGE = '#26392c'
const KNOB = '#26262a'          // 黑色调节旋钮
const KNOB_SKIRT = '#9aa393'
const TOGGLE_WHITE = '#f2f0e6'  // 中央白色拨杆
const TOGGLE_BASE = '#8f938a'
const SCREEN_DARK = '#22262a'   // 遮光屏深炭色(frame-003/005)
const SCREEN_EDGE = '#0f1114'
const SCREEN_SHEEN = '#343a3f'  // 屏内面微光
const LEVER_PLATE_RED = '#8a4a3a' // 杆座红缘(frame-004/005 红拨杆位)
const TOGGLE_CAP_EDGE = '#b5ae9d' // 拨杆帽描边(象牙白同族)

function knob(cx, cy) {
  // 大黑色调节旋钮: 裙边+滚花旋钮身+指示刻线(frame-004/005; 全程静态)
  const group = svg('g')
  const ticks = []
  for (let index = 0; index < 8; index += 1) {
    const rad = index * Math.PI / 4
    ticks.push(svg('line', {
      x1: (cx + 5.6 * Math.cos(rad)).toFixed(1), y1: (cy + 5.6 * Math.sin(rad)).toFixed(1),
      x2: (cx + 7.6 * Math.cos(rad)).toFixed(1), y2: (cy + 7.6 * Math.sin(rad)).toFixed(1),
      stroke: '#4a4a46', 'stroke-width': 1,
    }))
  }
  add(group,
    svg('circle', {cx, cy, r: 10.5, fill: KNOB_SKIRT, stroke: BODY_EDGE, 'stroke-width': 1.2}),
    svg('circle', {cx, cy, r: 7.6, fill: KNOB, stroke: '#0e0e10', 'stroke-width': 1.2}),
  )
  ticks.forEach(t => group.append(t))
  add(group,
    svg('line', {x1: cx, y1: cy, x2: cx + 4.6, y2: cy - 4.6, stroke: '#b9bfb2', 'stroke-width': 1.5, 'stroke-linecap': 'round'}),
    svg('circle', {cx: cx - 2.4, cy: cy - 2.8, r: 1.3, fill: 'rgb(255 255 255 / 28%)'}),
  )
  return group
}

function shadeScreen(points) {
  // 遮光屏板: 深炭色四边形+顶缘内面微光(frame-003/005 敞开 V 形暗背景; 微光取上缘向下的
  // 内缩四边形, lerp 顶边→底边 t=0.2, 保证不越出屏轮廓)
  const [p0, p1, p2, p3] = points
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
  const q2 = lerp(p2, p0, .2)
  const q3 = lerp(p3, p1, .2)
  const quad = pts => `M${pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join('L')}Z`
  return add(svg('g'),
    svg('path', {d: quad(points), fill: SCREEN_DARK, stroke: SCREEN_EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('path', {d: quad([p2, p3, q3, q2]), fill: SCREEN_SHEEN, opacity: .5}),
  )
}

export function renderCrtDemoConsole(entity, state = {}, context = {}) {
  const group = svg('g')
  const powerOn = Boolean(state.power_on)
  //  -  电源线(frame-003/005, 机身左后方拖出台面) - 
  group.append(svg('path', {d: 'M-76 -18C-94 -16 -102 -9 -114 -7', fill: 'none', stroke: '#1c1e20', 'stroke-width': 3.4, 'stroke-linecap': 'round'}))
  //  -  遮光屏两块(先画: 在管后方, 敞开 V 形; frame-005 网格实测: 左屏为宽幅背景板
  //      x∈[-58,16] 顶缘 y≈-154, 右屏较矮靠右 x∈[30,72] 顶缘 y≈-146, 底缘均隐入机身顶面) - 
  group.append(shadeScreen([[-58, -44], [16, -44], [10, -154], [-64, -154]]))
  group.append(shadeScreen([[30, -44], [72, -44], [80, -146], [36, -146]]))
  //  -  机身(后画: 机身顶缘盖住屏板下沿) - 
  add(group,
    shadow(0, 3, 88, 7),
    svg('rect', {x: -80, y: -46, width: 160, height: 46, rx: 3, fill: BODY, stroke: BODY_EDGE, 'stroke-width': 1.8}),
    svg('rect', {x: -80, y: -13, width: 160, height: 13, rx: 2, fill: BASE_GREEN, stroke: BASE_GREEN_EDGE, 'stroke-width': 1.4}),
    svg('rect', {x: -80, y: -50, width: 160, height: 5, rx: 2, fill: LIP, stroke: BODY_EDGE, 'stroke-width': 1.2}),
    svg('rect', {x: -72, y: -6, width: 12, height: 4, rx: 1.5, fill: '#2a2d2b'}),
    svg('rect', {x: 60, y: -6, width: 12, height: 4, rx: 1.5, fill: '#2a2d2b'}),
  )
  // 斜面板(受光略亮的操作区, 底缘高光线暗示坡面折边)
  add(group,
    svg('rect', {x: -72, y: -42, width: 144, height: 26, rx: 3, fill: PANEL_FACE, stroke: '#6a7264', 'stroke-width': 1.2}),
    svg('line', {x1: -72, y1: -16.8, x2: 72, y2: -16.8, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )
  //  -  面板控制区(frame-004/005: 左→右 大黑旋钮 / 白拨杆 / 大黑旋钮 / 红拨杆位) - 
  group.append(knob(-50, -29))
  // 白色拨动开关(power_on 翻倾: on=上倾 / off=下倾)
  add(group,
    svg('line', {x1: -8, y1: -36, x2: -8, y2: -19, stroke: '#55584f', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
    svg('rect', {x: -13.5, y: -30.5, width: 11, height: 8, rx: 2, fill: TOGGLE_BASE, stroke: BODY_EDGE, 'stroke-width': 1}),
  )
  const tipY = powerOn ? -36.5 : -18.5
  const tipX = powerOn ? -6.6 : -9.4
  add(group,
    svg('line', {x1: -8, y1: -26.5, x2: tipX, y2: tipY, stroke: TOGGLE_WHITE, 'stroke-width': 4, 'stroke-linecap': 'round'}),
    svg('circle', {cx: tipX, cy: tipY, r: 3, fill: '#f7f5ec', stroke: TOGGLE_CAP_EDGE, 'stroke-width': 1}),
  )
  group.append(knob(34, -29))
  //  -  红拨杆座(panel_lever 杆本体为独立实体, 此处只画座板/字牌; frame-004/005) - 
  add(group,
    svg('rect', {x: 55, y: -36, width: 14, height: 12, rx: 2, fill: PANEL_FACE, stroke: LEVER_PLATE_RED, 'stroke-width': 1.2, opacity: .95}),
    svg('rect', {x: 57, y: -30.5, width: 10, height: 3, rx: 1.5, fill: '#2a2d2f'}),
    svg('path', {d: 'M58.5 -38.5Q62 -40.5 65.5 -38.5', fill: 'none', stroke: LEVER_PLATE_RED, 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: .8}),
  )
  // 旋钮下刻度点(面板印刷字迹不可辨→不造字, 以刻度示意; frame-004)
  for (const kx of [-50, 34]) {
    for (let index = -2; index <= 2; index += 1) {
      group.append(svg('circle', {cx: kx + index * 4.2, cy: -19.5, r: .7, fill: '#6a7264'}))
    }
  }
  group.append(label(entity.label, 0, 18))
  return group
}
