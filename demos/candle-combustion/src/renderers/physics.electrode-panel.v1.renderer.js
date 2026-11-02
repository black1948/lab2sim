import {add, shadow, svg} from './svg.js'

//  -  双圆盘电极显示板(kind=electrode_panel, station A) - 
// 证据帧: frame-005/006(板式装置全景: 透明亚克力展示板 + 板前两只黄铜圆盘电极 +
//          板底两侧透明支脚); frame-008/009(接通前: 白色菱形细屑在板面杂乱散布); 
//          frame-010/012(接通后: 细屑在两盘间连成水平链, 两盘周围成辐射链); 
//          frame-013(对齐末态近景: 盘缘辐射状碎屑链清晰可见).
// 复用否决理由: 四域注册表无 electrode/panel 显示板类条目; physics.graph-board(graph-board
//          白板无电极, 无状态语义), physics.fringe-screen(条纹屏), physics.metal-specimen
//          (金属试样块)形状语义均不符; 可信源发现运行无评分通过文件
//          (discover_apparatus.py "no scored vector file matched", trace
//          assets/discover-electrode_panel), 故代码原生生成.
// 风格基础: physics.thin-film.v1(板式器材 + 玻璃质感 class glass-body + 受光高光线)与
//          physics.demo-track.v1 通用约定(apparatus-shadow + 内联配色); 黄铜盘配色取
//          frame-005 采样归一化 (139,124,90) → #b39a63/#c9ae74(与 teardrop 同族); 
//          细屑白 (193,189,186) → #f4f1e8.配色内联, 不新增 class.
// 状态语义: state.connected(bool, 缺省 false)→ 两盘下缘画引出短引线(右盘红 #c23a2a, 
//          左盘深灰 #4a5257, IR assumptions"连接导线简化为引出短引线"); 
//          state.alignment ∈ 0..1(缺省 0)→ 每枚细屑有杂乱散布位姿与对齐位姿两组
//          确定性坐标(seed=entity.id), 按 alignment 线性插值: 对齐位姿按就近盘分配, 
//          辐射角朝对盘 ±72° 张角, 半径量化 5 档(27/35.5/44/52.5/61)成链 - 盘间走廊
//          形成水平链, 盘周形成辐射链(frame-010/012/013).alignment=0 时 36 枚细屑
//          全板杂乱散布.
// 关键尺寸(局部原点=底座底面中心=台面接触点, y 向下为正): 
//   亚克力板 x∈[-78,78], y∈[-146,-26](156×120, rx3); 透明支脚两片 x∈[-76,-64]/[64,76], 
//   y∈[-30,0]; 黄铜盘 r=20 圆心 (±34,-88); 细屑菱形 10.8×6.4(36 枚).总高 146px.
// 证据不清处: 细屑确切枚数在原始分辨率不可数(目测 30~40, 取 36); 盘径/板幅按帧比例
//   估读; 引线颜色为示意(frame-010 接线在板后被遮挡).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/electrode-panel'
//   (import {renderElectrodePanel} from './physics.electrode-panel.v1.renderer.js').

const BRASS = '#b39a63'
const BRASS_LIGHT = '#c9ae74'
const BRASS_EDGE = '#7d6a42'
const CHIP_FILL = '#f4f1e8'
const CHIP_EDGE = '#b9b3a4'
const CHIP_COUNT = 36
const BANDS = 5

function hash01(seed, index) {
  // 确定性哈希(FNV-1a + murmur 混合)→ [0,1): 细屑布点禁用 Math.random
  let h = 2166136261 >>> 0
  const s = String(seed)
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  h = (h ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0
  h ^= h >>> 15
  h = Math.imul(h, 2246822519) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 3266489917) >>> 0
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function chipNode(x, y, rotationDeg) {
  return add(svg('g', {transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotationDeg.toFixed(1)})`}),
    svg('path', {d: 'M0 -3.2L5.4 0L0 3.2L-5.4 0Z', fill: CHIP_FILL, stroke: CHIP_EDGE, 'stroke-width': 0.7}),
    svg('circle', {cx: 0, cy: 0, r: 0.9, fill: CHIP_EDGE}),
  )
}

function brassDisc(cx, cy) {
  return add(svg('g'),
    svg('circle', {cx, cy, r: 20, fill: BRASS, stroke: BRASS_EDGE, 'stroke-width': 2}),
    svg('circle', {cx, cy, r: 15, fill: BRASS_LIGHT, stroke: BRASS_EDGE, 'stroke-width': 1, opacity: .85}),
    svg('circle', {cx: cx - 6, cy: cy - 7, r: 4.5, fill: 'rgb(255 255 255 / 30%)'}),
    svg('circle', {cx, cy, r: 2, class: 'screw'}),
  )
}

export function renderElectrodePanel(entity, state = {}, context = {}) {
  const group = svg('g')
  const connected = Boolean(state.connected)
  const t = Math.max(0, Math.min(1, Number(state.alignment || 0)))
  add(group, shadow(0, 3, 82, 6))
  // 透明亚克力支脚(板底两侧)
  add(group,
    svg('rect', {x: -76, y: -30, width: 12, height: 30, rx: 2, fill: 'rgb(221 245 249 / 45%)', stroke: '#41626b', 'stroke-width': 1.4}),
    svg('rect', {x: 64, y: -30, width: 12, height: 30, rx: 2, fill: 'rgb(221 245 249 / 45%)', stroke: '#41626b', 'stroke-width': 1.4}),
  )
  // 亚克力显示板(glass-body 玻璃质感, thin-film 板式先例)
  add(group,
    svg('rect', {x: -78, y: -146, width: 156, height: 120, rx: 3, class: 'glass-body'}),
    svg('line', {x1: -72, y1: -140, x2: 64, y2: -140, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
  )
  // 白色菱形细屑(杂乱 → 盘间链 + 盘缘辐射链)
  for (let i = 0; i < CHIP_COUNT; i += 1) {
    const sx = -64 + hash01(entity.id, i * 7 + 1) * 128
    const sy = -134 + hash01(entity.id, i * 7 + 2) * 100
    const srot = -180 + hash01(entity.id, i * 7 + 3) * 360
    const side = i % 2 === 0 ? -1 : 1
    const discX = 34 * side
    const baseAngle = side === -1 ? 0 : 180
    const ang = baseAngle + (hash01(entity.id, i * 7 + 4) - 0.5) * 144
    const rad = a => a * Math.PI / 180
    const band = Math.min(BANDS - 1, Math.floor(hash01(entity.id, i * 7 + 5) * BANDS))
    const dist = 27 + band * 8.5
    // 对齐位姿限制在板面内(盘缘向外辐射最远到板边内 4px, frame-013 链不越板)
    const ax = Math.max(-74, Math.min(74, discX + Math.cos(rad(ang)) * dist))
    const ay = Math.max(-140, Math.min(-32, -88 + Math.sin(rad(ang)) * dist))
    const x = lerp(sx, ax, t)
    const y = lerp(sy, ay, t)
    const rot = lerp(srot, ang, t)
    group.append(chipNode(x, y, rot))
  }
  // 黄铜圆盘电极压在细屑之上(盘面细屑链在盘周, 不在盘面上)
  add(group, brassDisc(-34, -88), brassDisc(34, -88))
  if (connected) {
    // 引出短引线: 右红左灰(接线简化示意, IR assumptions)
    add(group,
      svg('line', {x1: 34, y1: -68, x2: 34, y2: -54, stroke: '#c23a2a', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
      svg('circle', {cx: 34, cy: -51.5, r: 2.6, fill: 'none', stroke: '#c23a2a', 'stroke-width': 1.4}),
      svg('line', {x1: -34, y1: -68, x2: -34, y2: -54, stroke: '#4a5257', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
      svg('circle', {cx: -34, cy: -51.5, r: 2.6, fill: 'none', stroke: '#4a5257', 'stroke-width': 1.4}),
    )
  }
  return group
}
