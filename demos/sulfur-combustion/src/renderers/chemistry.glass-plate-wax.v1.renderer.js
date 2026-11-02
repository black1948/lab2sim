import {add, label, shadow, svg} from './svg.js'

//  -  玻璃片 - 承托蜡屑变体(切削下的蜡屑暂存于片上, 再倒入盛水烧杯) - 
// 视觉依据: frame-006(玻璃片上几团白色蜡屑卷曲, 位于片上切削处一侧); frame-007/008
// (手持玻璃片倾斜将蜡屑倒入盛水烧杯, 片上蜡屑随之滑落).
// 片体画法 1:1 沿用 chemistry.js renderGlassPlate(80x6 圆角长条 + glass-body 半透明玻璃 +
// glass-plate-edge 淡绿描边 #5f8f7c + glass-highlight 高光 + apparatus-shadow 接地阴影, 
// 标签 y=-14 在条形上方外侧).证据偏差如实记录: 证据帧中玻璃片为方形裁玻片, 场景按该
// kind 既有长条侧视惯例表达(同 chemistry.evap-slide.v1 先例).
// 蜡屑画法: 白色卷曲蜡屑团 - renderWeighingPaper 精盐晶粒白色系(fill #fbfdff / 描边
// #cdd8da, cotton-wool.v1 同源), 每团由主团 + 两侧搭接小团 + 卷曲内弧构成(frame-006 蜡屑
// 呈卷曲状而非砂粒状); 晶粒挂 crystal class(styles.css 既有 crystal-grow 状态变化动画).
// 状态绑定: state.wax_shavings>0 → 片上 4 团确定性坐标蜡屑卷(任务规范 3~5 团); 
// =0/缺省 → 干净玻璃片(一个蜡屑节点都不画).
const CLUSTERS = [
  {cx: -24, r: 2.6, curls: 2},
  {cx: -6, r: 3.0, curls: 3},
  {cx: 10, r: 2.7, curls: 2},
  {cx: 26, r: 2.3, curls: 2},
]

// 一团蜡屑卷: 主团 + 两侧搭接小团(坐在片顶面 y=-4 上)+ 卷曲内弧线
function waxMound({cx, r, curls}) {
  const mound = svg('g')
  mound.append(
    svg('circle', {cx, cy: -4 - r * 0.62, r, fill: '#fbfdff', stroke: '#cdd8da', 'stroke-width': 0.6, class: 'crystal'}),
    svg('circle', {cx: cx - r * 0.9, cy: -4 - r * 0.34, r: r * 0.72, fill: '#fbfdff', stroke: '#cdd8da', 'stroke-width': 0.55, class: 'crystal'}),
    svg('circle', {cx: cx + r * 0.85, cy: -4 - r * 0.4, r: r * 0.66, fill: '#f6f9fa', stroke: '#cdd8da', 'stroke-width': 0.55, class: 'crystal'}),
  )
  for (let index = 0; index < curls; index += 1) {
    mound.append(svg('path', {
      d: `M${(cx - r * 0.5 + index * 2.6).toFixed(2)} ${(-4 - r * 0.25).toFixed(2)}q${(r * 0.5).toFixed(2)} ${(-r * 0.95).toFixed(2)} ${(r * 0.95).toFixed(2)} 0`,
      fill: 'none', stroke: '#dfe6e8', 'stroke-width': 0.7, opacity: 0.9,
    }))
  }
  return mound
}

export function renderGlassPlateWax(entity, state = {}) {
  const group = svg('g')
  const hasShavings = Number(state.wax_shavings) > 0
  add(group,
    shadow(0, 5, 40, 3),
    svg('rect', {x: -40, y: -4, width: 80, height: 6, rx: 2, class: 'glass-body'}),
    svg('rect', {x: -40, y: -4, width: 80, height: 6, rx: 2, fill: 'none', stroke: '#5f8f7c', 'stroke-width': 1.6, class: 'glass-plate-edge'}),
  )
  if (hasShavings) CLUSTERS.forEach(cluster => group.append(waxMound(cluster)))
  add(group,
    svg('path', {d: 'M-30 0H16', class: 'glass-highlight'}),
  )
  group.append(label(entity.label, 0, -14))
  return group
}
