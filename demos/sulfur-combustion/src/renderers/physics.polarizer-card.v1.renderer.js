import {add, label, shadow, svg} from './svg.js'

//  -  起偏器(光源前固定偏振片, 最小代表件, 13 案例光的偏振现象二) - 
// 诚实表示声明: 该器材在 352×288(帧文件 960×786 上采样)证据帧中不可直接分辨
// (IR assumptions 已记录: 由两次近消光 frame-018/019, frame-024..026 推断的固定起偏器, 
// medium 置信).本渲染器为两偏振片模型的最小代表件: 小型矩形偏振膜片(深灰绿膜面)+
// 细边框 + 短支杆底座, 静态不可转 - 不画转角, 刻度或透振方向指针(证据帧不存在这些细节).
// 风格依据: physics.js renderPolarizer 膜面深灰绿 #46584e(同族膜色), 细金属框描边
// #7b8a8d, 立柱 #9aa6aa 与 metal-bracket 底座画法.
// 锚点: 局部 (0,0)=膜片中心, 落在光轴上; state 参数不参与渲染(IR: fixed, inserted 恒 true, 
// angle_deg 恒 0 - 按证据如实画成静态件).
const FILM_W = 40
const FILM_H = 32

function withLabel(group, entity, y) {
  group.append(label(entity.label, 0, y))
  return group
}

export function renderPolarizerCard(entity, state = {}) {
  const group = svg('g')
  add(group,
    shadow(0, 54, 20, 5),
    // 短支杆底座(renderPolarizer 立柱画法)
    svg('rect', {x: -2.5, y: 19, width: 5, height: 25, rx: 2, fill: '#9aa6aa', stroke: '#5b6a6d', 'stroke-width': 1.4}),
    svg('path', {d: 'M-15 44H15L11 54H-11Z', class: 'metal-bracket'}),
    // 细边框(薄金属框)
    svg('rect', {x: -23, y: -19, width: 46, height: 38, rx: 2, fill: '#efece0', stroke: '#7b8a8d', 'stroke-width': 1.6}),
    // 深灰绿偏振膜面(renderPolarizer 膜色 #46584e 同族)
    svg('rect', {x: -FILM_W / 2, y: -FILM_H / 2, width: FILM_W, height: FILM_H, rx: 1.5, fill: '#46584e', stroke: '#2c3840', 'stroke-width': 1}),
    // 膜面斜向光泽(偏振膜质感, 静态单侧)
    svg('path', {d: 'M-12 -11L4 13', stroke: '#5d7263', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .55, fill: 'none'}),
    svg('path', {d: 'M-2 -13L10 5', stroke: '#6d8273', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: .45, fill: 'none'}),
  )
  return withLabel(group, entity, 70)
}
