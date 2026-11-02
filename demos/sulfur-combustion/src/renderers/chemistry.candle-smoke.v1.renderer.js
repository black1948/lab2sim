import {add, label, shadow, svg} from './svg.js'

//  -  蜡烛 - 白烟与火焰分层标注变体  - 
// 视觉依据: frame-019/020(燃着蜡烛: 亮黄三层火焰; frame-020 叠加橙底白字小标签 外焰/内焰/
// 焰心 + 细引线: 外焰指火焰外层上部, 内焰指中层, 焰心指底部内芯); frame-035(刚熄灭: 烛芯
// 余光, 烟未起); frame-036/037(一缕蜿蜒上升的白烟自烛芯升起, 浓度/长度随时间衰减).
// 烛体/烛芯/三层火焰画法 1:1 沿用 chemistry.js renderCandle(candle-wax 烛体, candle-drip
// 蜡泪, candle-wick 烛芯, flame-outer #ff8f3d / flame-inner #ffd54d / flame-core #fff8d6
// 三层焰 + flicker 既有动画, 标签 y=60 烛体下方).与 chemistry.candle.v1 的关系: 正立渲染
// 器无 smoke/zone_labels 状态分支, 不能诚实表达白烟复燃与火焰分层教学标注, 故按 IR
// visual.asset_ref 另立渲染键 chemistry/candle-smoke.
// 白烟画法: 三道不透明度递升的蜿蜒上升曲线(宽→窄)+ 顶部弥散光斑 - 分层低不透明度叠层
// 惯例同 biology.glowing-splint.v1 余烬光斑 / chemistry.copper-spiral.v1 红热辉光, inline
// 配色不新增 styles.css class; 烟色取 #eef2f4/#dde4e8/白(frame-036 白烟, 浅色主题下压灰
// 一档保持可见).无既有 smoke 动画 class, 烟为状态驱动的静态形态(reduced-motion 友好).
// 状态绑定: state.lit=true → 三层火焰(同 renderCandle); state.smoke(0..1 数字)>0 → 自
// 烛芯向上的白色烟缕, 浓度(组不透明度 0.3+0.6*smoke)与长度(30+40*smoke)随值缩放, 
// smoke=0/缺省/非数值 → 一个烟节点都不画; state.zone_labels=true 且 lit → 火焰旁三个橙色
// 标注框 + 引线(lit 守卫: 标注指向火焰各层, 无焰时标注属虚假画面 - 防兄弟规则状态泄漏).
// 火焰与白烟渲染端互斥: 复燃会立即置 smoke=0, 但熄灭批次的 12s 衰减插值仍在跑, 若不
// 加 !lit 守卫, 点燃态会残留一缕半透明烟(验证 MINOR#3), 故 lit=true 时不画烟.

function smokeLevel(state) {
  const value = Number(state.smoke)
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0
}

// 蜿蜒上升路径: 自 (x0,yStart) 向上至 yEnd, 摆动幅度随高度增大(frame-036 烟缕下直上摆)
function wavyPath(x0, yStart, yEnd, amp, segments) {
  let d = `M${x0} ${yStart}`
  const step = (yEnd - yStart) / segments
  for (let index = 1; index <= segments; index += 1) {
    const y = yStart + step * index
    const a = amp * (0.3 + 0.7 * (index / segments))
    const dir = index % 2 === 0 ? 1 : -1
    d += ` Q${(x0 + dir * a).toFixed(2)} ${(y - step / 2).toFixed(2)} ${(x0 + dir * a * 0.45).toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

// 白烟缕: 烛芯顶 (0,-18) 向上, 浓度/长度随 smoke 缩放
function smokePlume(level) {
  const plume = svg('g')
  const top = -18 - (30 + 40 * level) // 长度 30..70
  plume.setAttribute('opacity', (0.3 + 0.6 * level).toFixed(3))
  add(plume,
    svg('path', {d: wavyPath(0, -19, top + 4, 7, 4), fill: 'none', stroke: '#dde4e8', 'stroke-width': 4.6, opacity: 0.45, 'stroke-linecap': 'round'}),
    svg('path', {d: wavyPath(0, -19, top + 2, 5.5, 4), fill: 'none', stroke: '#eef2f4', 'stroke-width': 2.6, opacity: 0.75, 'stroke-linecap': 'round'}),
    svg('path', {d: wavyPath(0, -19, top, 4.5, 4), fill: 'none', stroke: '#ffffff', 'stroke-width': 1.3, opacity: 0.9, 'stroke-linecap': 'round'}),
    svg('ellipse', {cx: 2.4, cy: top, rx: 6.2, ry: 3.6, fill: '#eef2f4', opacity: 0.4}),
  )
  return plume
}

// 火焰分层标注(frame-020): 橙底白字小标签 + 细引线, 指位按三层焰几何(焰顶 -40/中层
// -36.5..-25.5/焰心 -32..-25.8, 同 renderCandle 火焰路径)
const ZONES = [
  {name: 'Outer flame', box: {x: -45, y: -45}, wire: {x2: -4.2, y2: -36}, tip: {x: -3.6, y: -33.5}},
  {name: 'Inner flame', box: {x: 19, y: -33}, wire: {x2: 3.4, y2: -28.5}, tip: {x: 2.2, y: -27}},
  {name: 'Flame core', box: {x: -45, y: -25}, wire: {x2: -2.4, y2: -24.4}, tip: {x: -1.2, y: -25.4}},
]

function flameZoneLabels() {
  const layer = svg('g')
  ZONES.forEach(({name, box, wire, tip}) => {
    const cx = box.x + 13
    const cy = box.y + 5.5
    layer.append(
      svg('path', {d: `M${box.x + 26} ${cy}L${wire.x2} ${wire.y2}`, stroke: '#d0782f', 'stroke-width': 1.1, opacity: 0.9, 'stroke-linecap': 'round'}),
      svg('circle', {cx: tip.x, cy: tip.y, r: 1, fill: '#d0782f', opacity: 0.9}),
      svg('rect', {x: box.x, y: box.y, width: 26, height: 11, rx: 2.5, fill: '#d0782f'}),
    )
    const text = svg('text', {x: cx, y: box.y + 8.3, 'text-anchor': 'middle', fill: '#ffffff', 'font-family': 'ui-sans-serif, system-ui, sans-serif', 'font-size': 8, 'font-weight': 650})
    text.textContent = name
    layer.append(text)
  })
  return layer
}

export function renderCandleSmoke(entity, state) {
  // 短蜡烛: 烛体 + 烛芯 + 点燃时的三层火焰(画法沿用 chemistry.js renderCandle)
  const group = svg('g')
  const lit = Boolean(state.lit)
  const smoke = smokeLevel(state)
  add(group,
    shadow(0, 23, 15, 4),
    svg('path', {d: 'M-9.5 19.5Q-11 20.5-11 17L-10-8Q-10-12-7-12H7Q10-12 10-8L11 17Q11 20.5 9.5 19.5Z', class: 'candle-wax'}),
    svg('path', {d: 'M-7-12Q-5-16-2.5-12M2.5-12Q5-15 7-11', class: 'candle-drip'}),
    svg('rect', {x: -1.3, y: -18, width: 2.6, height: 7, rx: 1.2, class: 'candle-wick'}),
    lit ? svg('path', {d: 'M0-40Q-5.5-31-3.6-24Q-2-20 0-21.5Q2-20 3.6-24Q5.5-31 0-40Z', fill: '#ff8f3d', class: 'flame-outer'}) : null,
    lit ? svg('path', {d: 'M0-36.5Q-2.8-30.5-1.7-25.5Q-0.8-23 0-24.2Q0.8-23 1.7-25.5Q2.8-30.5 0-36.5Z', fill: '#ffd54d', class: 'flame-inner'}) : null,
    lit ? svg('path', {d: 'M0-32Q-1.4-28.6-0.8-26.2Q-0.4-25 0-25.8Q0.4-25 0.8-26.2Q1.4-28.6 0-32Z', fill: '#fff8d6', class: 'flame-core'}) : null,
  )
  if (!lit && smoke > 0) group.append(smokePlume(smoke))
  if (lit && state.zone_labels) group.append(flameZoneLabels())
  // 标签放到烛体下方, 烧杯底缘之外, 避免被前方玻璃罩住(同 renderCandle)
  group.append(label(entity.label, 0, 60))
  return group
}
