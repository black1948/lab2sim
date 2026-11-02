import {svg} from './svg.js'

//  -  高压导线(鳄鱼夹一对)(kind=hv_lead_pair, case 139 电子束在磁场中偏转) - 
// 视觉依据: frame-002(长管端电极上的鳄鱼夹与引线); frame-007(全景: 感应圈与长管之间
//           两根导线 - 一根偏红, 一根偏深色, 自然下垂弧, 线圈端红/深两只鳄鱼夹分别夹在
//           左右放电杆顶端, 另一端夹住长管左端电极); frame-014(暗室: 烧瓶管颈端引线, 
//           红线自左杆, 深线自右杆引出垂向右侧).
// 复用否决: physics.clip-lead.v1(读其 renderer 源码证实线端硬编码气轨小车坐标
//           'M-5 2Q-118 36 -230 -86', 构建方否决成立 - 本案另立 hv_lead_pair, 一端动态
//           回连感应圈端子, 另一端随实体落点); circuits.patch-lead(电路箱香蕉插头跳线, 
//           单色直插头, 插座插接语义)不符"鳄鱼夹高压导线".可信源发现无命中(trace
//           assets/discover-hv_lead_pair), 故代码原生生成.
// 风格基础: 鳄鱼夹钳口画法参照 physics.clip-lead.v1.renderer.js 的 jaws(银色钳体+双钳口
//           线)但重新布线并加导线色绝缘柄套; 导线沿 physics.js renderString 细线画法
//           (描边线+圆线帽); 红线 #c04030/深灰蓝 #4a5560 为构建方契约给定(frame-007
//           采样归一化同族).配色内联, 不新增 class.
// 状态契约(从 world 推导, 构建方运行时依赖; 渲染器只画几何, 连接语义由规则层管): 
//   局部 (0,0)=夹接端(clips 落点)中点; 另一端永远回连感应圈输出端子 - 
//   coil=world['induction-coil-1'], 线圈端子屏幕位=(coil.x*1000±78, 560-coil.y*500-30)
//   换算到局部作为两根线的固定端(红线接 -78 端子, 深线接 +78 端子).
//   state.above/attached_to 非空 ⇒ 两夹并拢夹住电极(落点对向小钳口); 否则两夹微张松垂.
//   若 world['induction-coil-1']?.connected_to 与本实体 attached_to 不一致(被改接), 仍按
//   本实体位置画线.
//   world 无感应圈时回退: 固定端按局部 (-96,-34)/(-76,-30) 示意(preview/冒烟兜底).
// 证据不清处: ① frame-007 实拍夹子夹在放电杆顶端, 构建方契约改定夹接视觉端点为箱侧端子
//   (±78,-30)(与 physics/induction-coil 端钮一致), 以契约为准; ② 落点钳口的夹持朝向与
//   目标电极几何相关(长管左端芯柱/烧瓶颈端帽), 渲染器按落点对向 schematic 处理; ③ 导
//   线垂弧的松紧随两端距离自适应(下垂量=距离×0.22, 钳制 8..46px).
// 集成: 复制本文件到 src/renderers/ 并在 index.js import {renderHvLeadPair} 后注册
//   'physics/hv-lead-pair'.z 序: 导线在感应圈/管件之上(构建方 scene 排序).不画 label, 
//   不画接地阴影(悬浮线件, clip-lead 先例).

const RED = '#c04030'          // 红导线(frame-007 偏红一根)
const DARK = '#4a5560'         // 深灰蓝导线(frame-007 偏深一根)
const JAW = '#9aa2ab'          // 钳体金属
const JAW_EDGE = '#565e66'

function screenOf(world, id) {
  const s = world && world[id]
  if (!s) return null
  const x = Number(s.x)
  const y = Number(s.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return {x: x * 1000, y: 560 - y * 500}
}

function selfScreen(context, entity) {
  const t = (context && context.visual && context.visual.transform)
    || (entity && entity.visual && entity.visual.transform) || {}
  const x = Number(t.x)
  const y = Number(t.y)
  return {x: (Number.isFinite(x) ? x : 0.5) * 1000, y: 560 - (Number.isFinite(y) ? y : 0.35) * 500}
}

// 鳄鱼夹(clip-lead jaws 画法重新布线; boot=导线色绝缘柄套)
function jaws(x, y, angle, boot) {
  const g = svg('g', {transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})`})
  g.append(
    svg('rect', {x: -7.6, y: -2.6, width: 6.2, height: 5.2, rx: 1.6, fill: boot, stroke: 'rgb(0 0 0 / 25%)', 'stroke-width': .8}),
    svg('path', {d: 'M-2 -7L4 -5L4 5L-2 7Z', fill: JAW, stroke: JAW_EDGE, 'stroke-width': 1.3, 'stroke-linejoin': 'round'}),
    svg('line', {x1: 4, y1: -3, x2: 9, y2: -1.5, stroke: JAW_EDGE, 'stroke-width': 1.8, 'stroke-linecap': 'round'}),
    svg('line', {x1: 4, y1: 3, x2: 9, y2: 1.5, stroke: JAW_EDGE, 'stroke-width': 1.8, 'stroke-linecap': 'round'}),
  )
  return g
}

// 自然下垂弧(三次贝塞尔; 垂弧量随距离自适应并钳制; T/E 为 {x,y} 局部坐标)
function droop(T, E, sagK) {
  const dx = E.x - T.x
  const dy = E.y - T.y
  const dist = Math.hypot(dx, dy)
  const sag = Math.min(46, Math.max(8, dist * sagK))
  const c1 = [T.x + dx * .3, T.y + dy * .3 + sag]
  const c2 = [T.x + dx * .7, T.y + dy * .7 + sag]
  const d = `M${T.x.toFixed(1)} ${T.y.toFixed(1)}C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${E.x.toFixed(1)} ${E.y.toFixed(1)}`
  // 线圈端钳口朝向: 沿线末端切线的外向(夹住端子)
  const angle = Math.atan2(T.y - c2[1], T.x - c2[0]) * 180 / Math.PI
  return {d, angle}
}

export function renderHvLeadPair(entity, state = {}, context = {}) {
  const group = svg('g')
  const world = context.world || {}

  //  -  线圈端子 → 局部坐标(构建方契约; world 缺感应圈时兜底示意位) - 
  const self = selfScreen(context, entity)
  const cpos = screenOf(world, 'induction-coil-1')
  const termA = cpos
    ? {x: cpos.x - 78 - self.x, y: cpos.y - 30 - self.y}
    : {x: -96, y: -34}
  const termB = cpos
    ? {x: cpos.x + 78 - self.x, y: cpos.y - 30 - self.y}
    : {x: -76, y: -30}

  const attached = Boolean(state.above || state.attached_to)
  // 落点: 并拢夹住(两夹对向钳口)或微张松垂
  const endA = attached ? {x: -5, y: 0} : {x: -5.5, y: -1.5}
  const endB = attached ? {x: 5, y: 0} : {x: 6.5, y: 2}

  //  -  两根导线(红/深, w3 圆头, 自然下垂弧) - 
  const wireA = droop(termA, endA, .22)
  const wireB = droop(termB, endB, .27)
  group.append(
    svg('path', {d: wireA.d, fill: 'none', stroke: RED, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .95}),
    svg('path', {d: wireB.d, fill: 'none', stroke: DARK, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .95}),
  )

  //  -  鳄鱼夹 ×4: 线圈端子两只(常夹)+ 落点两只(随 above/attached_to) - 
  group.append(jaws(termA.x, termA.y, wireA.angle + 8, RED))
  group.append(jaws(termB.x, termB.y, wireB.angle - 8, DARK))
  if (attached) {
    group.append(jaws(endA.x, endA.y, 0, RED))
    group.append(jaws(endB.x, endB.y, 180, DARK))
  } else {
    group.append(jaws(endA.x, endA.y, -125, RED))
    group.append(jaws(endB.x, endB.y, -60, DARK))
  }
  return group
}
