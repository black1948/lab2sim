import {add, label, shadow, svg} from './svg.js'

//  -  检偏器(可转动偏振片大圆盘, 13 案例光的偏振现象二) - 
// 视觉依据: frame-012/018(特写: 大直径纯黑圆盘, 盘径约占画面高 55%, 实测盘半径 215/786
// 视高; 盘心一个圆形偏振膜区, 膜径≈盘径 0.29 - 两偏振片平行时膜区呈亮白暖光, 可见后面灯丝
// 轮廓 #e7eada/#b8baa3, 正交消光时暗灰绿 #596044, 几乎不透光); frame-018(盘左侧竖直支杆经
// 水平夹具夹持盘缘, 夹具旋钮清晰); frame-014/015(手握盘缘整体转动).
// 注意: 本片圆盘无刻度, 无方形膜盒, 无透振方向指针 - 不得照抄 physics.js renderPolarizer
// 的拨盘样式(0/90 刻度+奶白方膜盒+金属棍均为 12 案例器材, 本片证据一一缺席).
// 证据帧取色: 盘面近黑 #070401(frame-012), 亮态膜区 #e7eada/#e3e8ca, 灯丝剪影 #b8baa3, 
// 暗态膜区 #596044/#5a6144(frame-018/024, 与 renderPolarizer 膜面 #46584e 同族).
// 状态绑定(IR visual.state_bindings): state.angle_deg=检偏器转角(度) - 盘面组(盘+膜区)
// 绕盘心整体 SVG rotate, 支杆与夹具不转(圆盘轮廓旋转本身不可见, 可视反馈由膜区亮度承担); 
// state.intensity=透射相对光强 0..0.5(马吕斯 0.5 - cos²θ), 归一化 t=min(1,intensity/0.5): 
// 膜区亮度 #46584e→#fffdf0 连续渐变, t<0.05 近乎全暗, 亮端外圈加暖光晕+灯丝剪影(frame-012).
// 锚点: 局部 (0,0)=盘心=膜心, 落在光轴上; 局部盘半径 65×scale1.9≈世界 r123, 与 IR
// hit_shape circle r=0.13(130px)吻合.风格依据: physics.js renderPolarizer 膜面配色
// #46584e, iron-stand 的 clamp/clamp-knob 画法, physics.js 立柱 #9aa6aa 画法; 
// 金属杆/夹具沿用 metal-bracket/clamp-knob class, inline 配色不新增 styles.css class.
const R = 65          // 盘半径(世界 r≈123, frame-012 特写比例)
const FILM_R = 19     // 膜区半径(膜径≈盘径 0.29, frame-012 实测 0.30)
const ROD_X = -81     // 竖直支杆中心 x(盘左缘外 16)
const ROD_BOTTOM = 98 // 支杆落地 y(接地阴影所在)
const DARK = '#46584e'    // 暗端膜色(任务书/renderPolarizer 膜面同族)
const BRIGHT = '#fffdf0'  // 亮端膜色(暖白发光)

function mix(a, b, t) {
  const ca = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16))
  const cb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16))
  return `#${ca.map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`
}

function withLabel(group, entity, y) {
  group.append(label(entity.label, 0, y))
  return group
}

export function renderPolarizerDisc(entity, state = {}) {
  const group = svg('g')
  const angle = Number(state.angle_deg || 0)
  const t = Math.max(0, Math.min(1, Number(state.intensity ?? 0.5) / 0.5))
  const dark = t < 0.05 ? '#39443d' : DARK
  const filmFill = mix(dark, BRIGHT, t)

  // 支杆(盘左侧竖直杆, frame-018: 杆在盘左, 上下贯穿)+ 接地阴影
  add(group,
    shadow(0, ROD_BOTTOM, 26, 6),
    svg('rect', {x: ROD_X - 3.5, y: -(R + 26), width: 7, height: ROD_BOTTOM + R + 26, rx: 2.5, fill: '#9aa6aa', stroke: '#5b6a6d', 'stroke-width': 1.4}),
  )

  // 水平夹具: 旋钮 + 夹臂 + 盘缘夹爪(frame-018 左侧夹具; 不随盘转动)
  add(group,
    svg('circle', {cx: ROD_X, cy: 0, r: 5.5, class: 'clamp-knob'}),
    svg('path', {d: `M${ROD_X + 3} -5H${-R - 6}L${-R - 2} 5H${ROD_X + 3}Z`, class: 'metal-bracket'}),
    svg('rect', {x: -R - 8, y: -9, width: 8, height: 18, rx: 2, class: 'metal-bracket'}),
  )

  // 盘面组: 盘+膜区随转角整体旋转(支杆/夹具在组外不转)
  const carrier = svg('g', {transform: `rotate(${angle.toFixed(1)})`})
  add(carrier,
    // 大直径纯黑圆盘(frame-012 盘面近黑 #070401, 左上微弱环境反光)
    svg('circle', {cx: 0, cy: 0, r: R, fill: '#101312', stroke: '#05070a', 'stroke-width': 2}),
    svg('path', {d: `M${-R * 0.72} ${-R * 0.4}A${R - 6} ${R - 6} 0 0 1 ${-R * 0.18} ${-R * 0.86}`, fill: 'none', stroke: '#232a27', 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: .55}),
    svg('circle', {cx: 0, cy: 0, r: R - 3, fill: 'none', stroke: '#1b201d', 'stroke-width': 1.2}),
    // 盘心圆形偏振膜区: 亮度=暗灰绿→暖白(t 驱动), 细膜缘
    svg('circle', {cx: 0, cy: 0, r: FILM_R, fill: filmFill, stroke: '#20281f', 'stroke-width': 1}),
  )
  if (t >= 0.05) {
    // 亮端暖光晕(外圈暖光, 仅透射升高时出现)
    add(carrier,
      svg('circle', {cx: 0, cy: 0, r: FILM_R + 14, fill: '#ffe9b8', opacity: (0.1 * t).toFixed(3)}),
      svg('circle', {cx: 0, cy: 0, r: FILM_R + 9, fill: '#ffe9b8', opacity: (0.14 * t).toFixed(3)}),
      svg('circle', {cx: 0, cy: 0, r: FILM_R + 4, fill: '#fff3c4', opacity: (0.2 * t).toFixed(3)}),
    )
  }
  if (t > 0.55) {
    // 透射升高后膜区内可见后面灯丝剪影(frame-012 曲折灯丝轮廓)
    add(carrier,
      svg('path', {d: 'M-8 3q5 -8 9 -3t8 -2', fill: 'none', stroke: '#b8baa3', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: ((t - 0.55) * 1.4).toFixed(3)}),
    )
  }
  group.append(carrier)

  // 标注置于盘轮廓之外(盘上方, 避开下方夹具与支杆)
  return withLabel(group, entity, -(R + 44))
}
