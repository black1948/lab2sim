import {add, label, shadow, svg} from './svg.js'

//  -  支架框架(109-物体的动能: 金属/玻璃 Π 形框架, 摆线系于顶部横杆) - 
// 视觉依据: frame-004/012/042 全景(Π 形框架: 左柱为浅蓝玻璃平板叠白色厘米刻度条+
//           深红滑块, 右柱为窄玻璃/金属立柱, 顶部金属横杆, 底部绿色玻璃底座托住双柱); 
//           frame-027 近景(摆线以小金属夹系于横杆左段); frame-023(两摆锤并挂于横杆
//           左段两个悬挂点).frame-012 采样: 柱玻璃 (152,153,155), 滑块 (57,28,30), 
//           底座绿 (16,48,47), 横杆金属 (124,116,114) - 低照度归一化到实验室浅色主题.
// 复用审查否决记录: physics.iron-stand.v1(chemistry/iron-stand: 独杆+铸铁座+夹持爪)与
//           physics.truss-stand.v1(桁架支架)形状语义均不符(观察对象是双柱+横杆的 Π 形
//           框架, 横杆系摆线, 左柱带厘米刻度与红滑块); 可信源发现命中 twbs/icons
//           person-standing-dress(人形 glyph, 'stand' 词元误配), 已回滚.
// 风格依据: physics.js renderWallBracket 的 metal-bracket/screw 金属件画法(直接复用既有
//           class), chemistry.js 玻璃器皿的透明体块描边约定(glass 透明填充+缘线, 内联), 
//           physics.demo-track.v1.renderer.js 的接地阴影与白高光线约定.配色全部内联, 
//           不新增 styles.css class.
// 局部几何(y 向下, (0,0)=左柱底部=桌面线; 与契约逐条一致): 
//   绿色玻璃底座 x∈[-12,246], y∈[-13,1]; 左柱(玻璃平板)x∈[-2,38], y∈[-177,-6]; 
//   白色刻度条 x∈[6,30], y∈[-132,-2](30cm, 4.4px/cm); 
//   红标记 "10" 在 y=-44, "20" 在 y=-88(契约), 红色滑块在 y=-88; 
//   右柱 x∈[224,240], y∈[-177,-6]; 金属横杆 x∈[-6,242], y∈[-183,-171]; 
//   摆线悬挂小夹两只: x=27 与 x=40(=IR anchors.pivot 27px / pivot_small 40px 的悬挂点, 
//   亦即 bob-large-1 / bob-small-1 的 pivot_dx_px).
// 状态契约: 静态器材, 无状态绑定(IR state_bindings empty).摆锤几何由
//   physics.pendulum-bob.v1.renderer.js 读 world["frame-1"] 自行换算悬点.
// 证据不清处: ① 刻度条数字在原始分辨率仅可辨 5/10/15/20 的轮廓, 0/25/30 为按厘米尺
//   惯例补全; ② 底座绿玻璃内的深色压条为玻璃夹层结构示意; ③ 横杆两端与立柱的连接件
//   被虚焦截断, 按角部螺钉示意.
// 集成: renderer 键 physics/support-frame(index.js 的 import/注册由构建方完成: 复制本文件
//   到 src/renderers/ 并在 index.js 注册 'physics/support-frame').

const GLASS_FILL = 'rgb(196 218 226 / 45%)'   // 玻璃平板(frame-012 柱玻璃归一化)
const GLASS_EDGE = '#7fa2ad'
const BASE_GREEN = '#2c5f52'                  // 底座绿(frame-012 采样归一化)
const BASE_GREEN_TOP = '#3d7a6a'
const BASE_EDGE = '#1c4438'
const STRIP = '#f2efe6'                       // 刻度条白
const STRIP_EDGE = '#b9b3a4'
const TICK = '#6b7278'                        // 厘米刻度
const MARK_RED = '#c23a2a'                    // 10/20 红标记线
const SLIDER_RED = '#8f2a22'                  // 红色滑块(frame-012 采样归一化)
const SLIDER_DEEP = '#5c1a15'
const CM = 4.4                                // 左柱刻度比例: 10cm=44px, 20cm=88px(契约)

// 厘米刻度条: y0=条底, 高 30cm; k=0..30 自下而上
function columnMarkings() {
  const group = svg('g')
  for (let k = 0; k <= 30; k += 1) {
    const y = -2 - k * CM
    const major = k % 5 === 0
    group.append(svg('line', {
      x1: 6.5, y1: y.toFixed(1), x2: 6.5 + (major ? 6 : 3.2), y2: y.toFixed(1),
      stroke: TICK, 'stroke-width': major ? 1.1 : 0.7,
    }))
    if (major && k > 0) {
      const txt = svg('text', {x: 17.5, y: (y + 2).toFixed(1), 'text-anchor': 'middle', 'font-size': 5.4, fill: '#5d564a'})
      txt.textContent = String(k)
      group.append(txt)
    }
  }
  return group
}

export function renderSupportFrame(entity, state = {}, context = {}) {
  const group = svg('g')
  add(group,
    shadow(117, 4, 128, 6),
    // 绿色玻璃底座(frame-004/012 底部绿玻璃槽)
    svg('rect', {x: -12, y: -13, width: 258, height: 14, rx: 2, fill: BASE_GREEN, stroke: BASE_EDGE, 'stroke-width': 1.6}),
    svg('rect', {x: -12, y: -13, width: 258, height: 4, rx: 2, fill: BASE_GREEN_TOP}),
    svg('line', {x1: -8, y1: -11.4, x2: 242, y2: -11.4, stroke: 'rgb(255 255 255 / 35%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
  )
  // 左柱: 玻璃平板 + 左缘高光
  add(group,
    svg('rect', {x: -2, y: -177, width: 40, height: 171, fill: GLASS_FILL, stroke: GLASS_EDGE, 'stroke-width': 1.6}),
    svg('line', {x1: 0.5, y1: -174, x2: 0.5, y2: -10, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )
  // 白色厘米刻度条 + 10/20 红标记线 + 红色滑块(契约: 滑块在 -88 = 20cm 释放高度线)
  add(group,
    svg('rect', {x: 6, y: -132, width: 24, height: 130, rx: 1, fill: STRIP, stroke: STRIP_EDGE, 'stroke-width': 1}),
    columnMarkings(),
    svg('line', {x1: 4, y1: -44, x2: 32, y2: -44, stroke: MARK_RED, 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    svg('line', {x1: 4, y1: -88, x2: 32, y2: -88, stroke: MARK_RED, 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    svg('rect', {x: 8, y: -96, width: 12, height: 16, rx: 1.5, fill: SLIDER_RED, stroke: SLIDER_DEEP, 'stroke-width': 1.1}),
    svg('line', {x1: 9.5, y1: -93.5, x2: 18.5, y2: -93.5, stroke: 'rgb(255 255 255 / 40%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
  )
  // 右柱: 窄玻璃/金属立柱
  add(group,
    svg('rect', {x: 224, y: -177, width: 16, height: 171, fill: GLASS_FILL, stroke: '#5b6a6d', 'stroke-width': 1.6}),
    svg('line', {x1: 232, y1: -174, x2: 232, y2: -10, stroke: '#8a949c', 'stroke-width': 1.2}),
  )
  // 顶部金属横杆(摆线系杆)+ 角部螺钉 + 两只摆线悬挂小夹
  add(group,
    svg('rect', {x: -6, y: -183, width: 248, height: 12, rx: 2, class: 'metal-bracket'}),
    svg('line', {x1: -2, y1: -180.4, x2: 238, y2: -180.4, stroke: 'rgb(255 255 255 / 60%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
    svg('circle', {cx: 0, cy: -177, r: 2, class: 'screw'}),
    svg('circle', {cx: 230, cy: -177, r: 2, class: 'screw'}),
    svg('rect', {x: 25, y: -171, width: 4.5, height: 6, rx: 1, fill: '#8f959c', stroke: '#5b6a6d', 'stroke-width': 1}),
    svg('rect', {x: 38, y: -171, width: 4.5, height: 6, rx: 1, fill: '#8f959c', stroke: '#5b6a6d', 'stroke-width': 1}),
  )
  group.append(label(entity.label, 117, 24))
  return group
}
