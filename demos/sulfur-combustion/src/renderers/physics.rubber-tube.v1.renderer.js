import {svg} from './svg.js'

//  -  乳胶管(kind=rubber_tube; 117-用微小压强计演示超重于失重) - 
// 派生视觉渲染器: 不画自己的"本体几何", 而是每帧按两端实体的实时位置重绘一条贝塞尔
// 软管 - 从压强计右臂下部接口到探头管嘴(renderStage 以 {visual, asset, world: state}
// 调用本渲染器, world 里有各实体实时 x/y; 先例 physics.ramp-ball.v1.renderer.js 读
// context.world 的做法).视觉依据: frame-003(管从压强计侧绕到台面探头), frame-019/031
// (管在探头与压强计之间呈大弧下垂, 探头抬起时弧底接近台面), frame-007/001(乳白/米色
// 管壁质感).暗光采样 #664f25(p90)/#533819 → 归一化乳白米色 #e9e2cf, 描边浅灰褐 #b3aa96.
// 端点计算(全部屏幕像素系, y 向下为正; screenX=x - 1000, screenY=560−y - 500): 
//   from = world[visual.manometer_ref||'manometer-1'] + (visual.from_dx, visual.from_dy)
//   to   = world[visual.probe_ref||'probe-1']            + (visual.to_dx,   visual.to_dy)
//   偏移缺省按两端 design_notes 接口坐标 × 各自实体 scale 预乘(本案 IR 实际 scale: 
//   压强计 1.0, 探头 1.0): from(49,−19), to 探头管嘴 (22,2)→(22,2).任一 world 端缺失
//   (如库房预览/器材未上台)时回退实体自身位置 + 该端偏移, 画出一段松弛短管, 不抛错.
//   自身位置取 world[entity.id], 再缺失回退 visual.transform 的 x/y(缺省 0.5/0.35).
// 下垂弧度: dist=|to−from|, drop=dist - sag - 4(visual.sag 缺省 0.08 → 32% 跨距, 与
//   frame-031 大弧接近); 两个控制点在 30%/70% 处各下沉 drop, 三次贝塞尔近似悬链.
// 契约参数(context.visual, 全带缺省回退 - resolve_assets 只拷白名单键, 缺省值是双保险): 
//   manometer_ref/probe_ref, from_dx=49/from_dy=-19/to_dx=22/to_dy=2, sag=0.08, 
//   tube_px=8(内线宽), show_label=false.
// 风格依据: 模板 tube-glass/rubber 描线语言 + svg.js 工具; 三层同路径描边(外描边 11px
//   浅灰褐, 乳白 8px, 上移 2px 高光 2.5px)表现软管圆柱质感; 两端画抱箍色环; 配色 inline
//   不新增 class.证据不清处: frame-003/019/031 里管沿朝探头那侧臂外侧行走, 与臂的遮挡
//   关系帧间不定(构建方按液面响应裁定右臂=连接臂), 本渲染器端点全参数化, 改走向只需调
//   from_*/to_* 偏移.
// 导出签名与模板一致: renderRubberTube(entity, state, context).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/rubber-tube'
//   (import {renderRubberTube} from './physics.rubber-tube.v1.renderer.js').

function screenOf(world, id) {
  const item = world?.[id]
  if (!item) return null
  return {x: Number(item.x ?? 0.5) * 1000, y: 560 - Number(item.y ?? 0.2) * 500}
}

export function renderRubberTube(entity, state = {}, context = {}) {
  const group = svg('g')
  const visual = context.visual || {}
  const world = context.world || {}
  const manometerRef = typeof visual.manometer_ref === 'string' && visual.manometer_ref ? visual.manometer_ref : 'manometer-1'
  const probeRef = typeof visual.probe_ref === 'string' && visual.probe_ref ? visual.probe_ref : 'probe-1'
  const selfId = entity?.id
  const fromDx = Number(visual.from_dx ?? 49)
  const fromDy = Number(visual.from_dy ?? -19)
  const toDx = Number(visual.to_dx ?? 22)
  const toDy = Number(visual.to_dy ?? 2)

  // 自身屏幕位(派生件通常与探头同位或置于中途; world 缺失逐级回退)
  let self = screenOf(world, selfId)
  if (!self) {
    const t = entity?.visual?.transform || visual.transform || {}
    self = {x: Number(t.x ?? 0.5) * 1000, y: 560 - Number(t.y ?? 0.35) * 500}
  }
  const fromW = screenOf(world, manometerRef)
  const toW = screenOf(world, probeRef)
  const from = {x: (fromW ? fromW.x : self.x) + fromDx - self.x, y: (fromW ? fromW.y : self.y) + fromDy - self.y}
  const to = {x: (toW ? toW.x : self.x) + toDx - self.x, y: (toW ? toW.y : self.y) + toDy - self.y}

  const dist = Math.hypot(to.x - from.x, to.y - from.y)
  const drop = Math.max(14, dist * Number(visual.sag ?? 0.08) * 4)
  const c1 = {x: from.x + (to.x - from.x) * 0.3, y: from.y + (to.y - from.y) * 0.3 + drop}
  const c2 = {x: from.x + (to.x - from.x) * 0.7, y: from.y + (to.y - from.y) * 0.7 + drop}
  const d = `M${from.x.toFixed(1)} ${from.y.toFixed(1)}C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`

  const width = Math.max(4, Number(visual.tube_px ?? 8))
  group.append(
    svg('path', {d, fill: 'none', stroke: '#b3aa96', 'stroke-width': width + 3, 'stroke-linecap': 'round'}),
    svg('path', {d, fill: 'none', stroke: '#e9e2cf', 'stroke-width': width, 'stroke-linecap': 'round'}),
    // 高光: 同路径上移 2px 的细亮线(软管圆柱受光)
    svg('path', {d, fill: 'none', stroke: '#f8f4e6', 'stroke-width': Math.max(1.4, width * 0.3), 'stroke-linecap': 'round', transform: 'translate(0 -2)', opacity: 0.7}),
  )
  // 两端抱箍色环(管口与嘴/玻璃臂衔接处, frame-019 管口略深)
  for (const p of [from, to]) {
    group.append(svg('circle', {cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: (width + 2) / 2 + 1.6, fill: 'none', stroke: '#b3aa96', 'stroke-width': 2.6}))
  }
  if (visual.show_label === true && entity?.label) {
    const mid = {x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + drop / 2 + 16}
    const text = svg('text', {x: mid.x.toFixed(1), y: mid.y.toFixed(1), 'text-anchor': 'middle', class: 'apparatus-label'})
    text.textContent = entity.label
    group.append(text)
  }
  return group
}
