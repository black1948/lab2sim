import {svg} from './svg.js'

//  -  鳄鱼夹导线(红/蓝一对) - 
// 视觉依据: frame-009/011(线圈引出端红/蓝鳄鱼夹导线), frame-016(导线留在固定立柱上, 
// 另端鳄鱼夹张开 - 滑行中被拖脱后的断电态), frame-008(立柱侧红色引线).
// 复用审查否决记录: circuits/patch-lead 为电路箱单根跳线(单色直插头, 语义为插座插接, 
// 且属 circuits 域渲染器); 本器材是双线+鳄鱼夹的电磁铁供电引线.无诚实复用, 生成.
// 风格依据: physics.js renderString 线件画法(描边线+线帽), 夹体参照 renderWallBracket
// 金属小件; inline 配色红 #d04030 / 蓝 #3060c0.
// 状态语义: state.detached=false(接通)两线自立柱端子绷向左侧小车线圈方向(下垂弧, 
// 端点≈小车局部 (−232,−88)/(−224,−80) 即线圈位置); true(断开)两线松垂挂在立柱旁.
// 锚点: 局部 (0,0)=立柱端子处(吸附点下方 15px, anchored_gap=0.03).
function jaws(x, y, angle) {
  const g = svg('g', {transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle})`})
  g.append(
    svg('path', {d: 'M-2 -7L4 -5L4 5L-2 7Z', fill: '#9aa2ab', stroke: '#565e66', 'stroke-width': 1.3}),
    svg('line', {x1: 4, y1: -3, x2: 9, y2: -1.5, stroke: '#565e66', 'stroke-width': 1.8, 'stroke-linecap': 'round'}),
    svg('line', {x1: 4, y1: 3, x2: 9, y2: 1.5, stroke: '#565e66', 'stroke-width': 1.8, 'stroke-linecap': 'round'}),
  )
  return g
}

export function renderClipLead(entity, state = {}) {
  const group = svg('g')
  const detached = Boolean(state.detached)
  const red = detached
    ? {d: 'M-5 3Q-30 42 -24 74', end: [-24, 76], angle: 80}
    : {d: 'M-5 2Q-118 36 -230 -86', end: [-233, -89], angle: -38}
  const blue = detached
    ? {d: 'M5 5Q14 48 20 80', end: [20, 82], angle: 86}
    : {d: 'M5 5Q-108 54 -222 -78', end: [-225, -81], angle: -34}
  group.append(
    svg('path', {d: red.d, fill: 'none', stroke: '#d04030', 'stroke-width': 3.4, 'stroke-linecap': 'round', opacity: 0.95}),
    svg('path', {d: blue.d, fill: 'none', stroke: '#3060c0', 'stroke-width': 3.4, 'stroke-linecap': 'round', opacity: 0.95}),
  )
  group.append(jaws(0, 0, detached ? 95 : -150))
  group.append(jaws(red.end[0], red.end[1], red.angle))
  group.append(jaws(blue.end[0], blue.end[1], blue.angle))
  return group
}
