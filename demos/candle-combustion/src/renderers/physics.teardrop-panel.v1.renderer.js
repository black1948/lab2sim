import {add, shadow, svg} from './svg.js'

//  -  泪滴导体显示板(带闭合丝圈, kind=teardrop_panel, station C) - 
// 证据帧: frame-020/022(同一亚克力展示板式样: 板前黄铜丝弯成的闭合泪滴圈 - 圆部 +
//          两条切线收拢到尖端, 尖端有接线端子); frame-023/025(未充电/充电中: 丝圈外
//          白色菱形细屑沿轮廓法向辐射成链, 尖端处最密; 丝圈内细屑保持杂乱); 
//          frame-024(实心泪滴导体装进丝圈后: 圈内被导体覆盖, 圈外细屑辐射); 
//          frame-027/028(取下导体后的对照态: 圈内外细屑分布直接可见).
// 复用否决理由: 四域注册表无导体显示板/丝圈类条目; physics.graph-board(白板), 
//          physics.film-strip(胶片条), physics.ring-vessel(环形容器)形状语义均不符; 
//          可信源发现运行无评分通过文件(discover_apparatus.py "no scored vector file
//          matched", trace assets/discover-teardrop_panel), 故代码原生生成.
// 风格基础: physics.electrode-panel.v1 同款板式(亚克力板 + 透明支脚 + glass-body) - 
//          frame-020/022 显示两站为同一块展示板换装不同导体; 黄铜丝配色取 frame-021
//          采样归一化 (127,112,79) → #c9ae74/#7d6a42(teardrop-conductor 同族); 
//          细屑白 #f4f1e8.配色内联, 不新增 class.
// 状态语义: state.alignment ∈ 0..1(缺省 0)→ 圈外 24 枚细屑自全板杂乱散布插值到"沿
//          泪滴轮廓法向辐射"位姿(法向偏距量化 3 档 6/13/20 成链; 轮廓参数按 pow(h,0.7)
//          向尖端偏置 - 尖端最密, frame-025); 圈内 10 枚细屑始终保持杂乱(丝圈内部
//          无电场, frame-027/028 对照态).state.conductor_mounted(bool, 缺省 false)
//          → 不画圈内细屑(实心导体覆盖圈内, frame-024); state.connected(bool, 缺省
//          false)→ 尖端端子引出红色短引线(IR assumptions"连接导线简化为引出短引线").
// 关键尺寸(局部原点=底座底面中心=台面接触点, y 向下为正): 
//   亚克力板 x∈[-78,78], y∈[-146,-26]; 透明支脚 x∈[-76,-64]/[64,76], y∈[-30,0]; 
//   泪滴丝圈: 圆部圆心 (-18,-86), r=30, 尖端 (46,-86)(切线长 56.5, 切点角 ±62.1°), 
//   丝径 3.2, 尖端接线端子 r2.5; 细屑菱形 10.8×6.4(圈外 24 + 圈内 10).总高 146px.
//   泪滴轮廓以 40 段圆弧折线 + 2 条切线段解析生成(圆角处无 arc 命令, 全部坐标确定性
//   推导), 法向场数值求出.
// 证据不清处: 圈外细屑确切枚数不可数(目测 20~30, 取 24); 圈内"保持杂乱"为教学结论
//   (frame-027/028 圈内碎屑无明显取向); 尖端端子形状按示意画.
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/teardrop-panel'
//   (import {renderTeardropPanel} from './physics.teardrop-panel.v1.renderer.js').
//   注意: teardrop-conductor 实体停靠本板的 anchors.loop-center 时应落在本板局部
//   (-18,-86) 附近(丝圈圆心); IR 当前 anchors.loop-center 为 {0,0}(面板原点=底座
//   中心) - 渲染器不读 anchors, 请构建方核对停靠落位, 否则实心导体会落到板底.

const BRASS_WIRE = '#a8895a'
const BRASS_WIRE_DARK = '#7d6a42'
const BRASS_LIGHT = '#c9ae74'
const CHIP_FILL = '#f4f1e8'
const CHIP_EDGE = '#b9b3a4'
const WIRE_RED = '#c23a2a'
const LOOP_CX = -18
const LOOP_CY = -86
const LOOP_R = 30
const TIP_X = 46
const TIP_Y = -86
const OUTSIDE_CHIPS = 24
const INSIDE_CHIPS = 10
const NORM_BANDS = 3

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

// 泪滴轮廓: 圆部(远尖端一侧 235.8° 圆弧)+ 两条切线收拢到尖端.
// 返回 {d: 路径字符串, pts: [{x,y,nx,ny} 逆时针自上切点经左侧到下切点再到尖端]}
function teardropOutline() {
  const dxT = TIP_X - LOOP_CX
  const beta = Math.acos(LOOP_R / Math.hypot(dxT, TIP_Y - LOOP_CY)) // 切点角 62.1°
  const pts = []
  const N_ARC = 40
  for (let k = 0; k <= N_ARC; k += 1) {
    const a = (beta + (2 * Math.PI - 2 * beta) * (k / N_ARC)) // +62.1° → +297.9°(经 180°)
    const x = LOOP_CX + LOOP_R * Math.cos(a)
    const y = LOOP_CY - LOOP_R * Math.sin(a)
    pts.push({x, y, nx: Math.cos(a), ny: -Math.sin(a)}) // 圆弧段外法向 = 径向朝外
  }
  const N_LINE = 12
  const lower = pts[pts.length - 1] // 圆弧终点 = 下切点
  for (let k = 1; k <= N_LINE; k += 1) {
    const f = k / N_LINE
    const x2 = lerp(lower.x, TIP_X, f)
    const y2 = lerp(lower.y, TIP_Y, f)
    // 切线段外法向: 垂直于段方向, 背向圆心一侧
    let nx = -(TIP_Y - lower.y)
    let ny = TIP_X - lower.x
    const len = Math.hypot(nx, ny) || 1
    nx /= len
    ny /= len
    const toC = (LOOP_CX - x2) * nx + (LOOP_CY - y2) * ny
    if (toC > 0) {
      nx = -nx
      ny = -ny
    }
    pts.push({x: x2, y: y2, nx, ny})
  }
  const d = [
    `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`,
    ...pts.slice(1).map(p => `L${p.x.toFixed(2)} ${p.y.toFixed(2)}`),
    'Z',
  ].join('')
  return {d, pts}
}

function chipNode(x, y, rotationDeg) {
  return add(svg('g', {transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotationDeg.toFixed(1)})`}),
    svg('path', {d: 'M0 -3.2L5.4 0L0 3.2L-5.4 0Z', fill: CHIP_FILL, stroke: CHIP_EDGE, 'stroke-width': 0.7}),
    svg('circle', {cx: 0, cy: 0, r: 0.9, fill: CHIP_EDGE}),
  )
}

export function renderTeardropPanel(entity, state = {}, context = {}) {
  const group = svg('g')
  const connected = Boolean(state.connected)
  const mounted = Boolean(state.conductor_mounted)
  const t = Math.max(0, Math.min(1, Number(state.alignment || 0)))
  const outline = teardropOutline()
  add(group, shadow(0, 3, 82, 6))
  // 透明亚克力支脚 + 显示板(与 electrode-panel 同款板式, frame-020/022)
  add(group,
    svg('rect', {x: -76, y: -30, width: 12, height: 30, rx: 2, fill: 'rgb(221 245 249 / 45%)', stroke: '#41626b', 'stroke-width': 1.4}),
    svg('rect', {x: 64, y: -30, width: 12, height: 30, rx: 2, fill: 'rgb(221 245 249 / 45%)', stroke: '#41626b', 'stroke-width': 1.4}),
    svg('rect', {x: -78, y: -146, width: 156, height: 120, rx: 3, class: 'glass-body'}),
    svg('line', {x1: -72, y1: -140, x2: 64, y2: -140, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
  )
  // 圈外细屑: 杂乱 → 沿轮廓法向辐射(尖端偏置最密)
  const total = outline.pts.length
  for (let i = 0; i < OUTSIDE_CHIPS; i += 1) {
    const sx = -64 + hash01(entity.id, i * 7 + 1) * 128
    const sy = -134 + hash01(entity.id, i * 7 + 2) * 100
    const srot = -180 + hash01(entity.id, i * 7 + 3) * 360
    const idx = Math.min(total - 1, Math.floor(total * Math.pow(hash01(entity.id, i * 7 + 4), 0.7)))
    const p = outline.pts[idx]
    const band = Math.min(NORM_BANDS - 1, Math.floor(hash01(entity.id, i * 7 + 5) * NORM_BANDS))
    const off = 6 + band * 7
    const ax = Math.max(-74, Math.min(74, p.x + p.nx * off))
    const ay = Math.max(-140, Math.min(-32, p.y + p.ny * off))
    const rot = Math.atan2(p.ny, p.nx) * 180 / Math.PI
    group.append(chipNode(lerp(sx, ax, t), lerp(sy, ay, t), lerp(srot, rot, t)))
  }
  // 圈内细屑: 始终杂乱(丝圈内部无电场); 导体装入后不画(被覆盖)
  if (!mounted) {
    for (let i = 0; i < INSIDE_CHIPS; i += 1) {
      const ang = hash01(entity.id, 500 + i * 7 + 1) * 2 * Math.PI
      const rr = 4 + hash01(entity.id, 500 + i * 7 + 2) * 17
      const rot = -180 + hash01(entity.id, 500 + i * 7 + 3) * 360
      group.append(chipNode(LOOP_CX + Math.cos(ang) * rr, LOOP_CY + Math.sin(ang) * rr, rot))
    }
  }
  // 黄铜丝泪滴圈(双描边出丝径质感)+ 尖端接线端子
  add(group,
    svg('path', {d: outline.d, fill: 'none', stroke: BRASS_WIRE_DARK, 'stroke-width': 3.4, 'stroke-linejoin': 'round'}),
    svg('path', {d: outline.d, fill: 'none', stroke: BRASS_WIRE, 'stroke-width': 1.9, 'stroke-linejoin': 'round'}),
  )
  add(group,
    svg('circle', {cx: TIP_X, cy: TIP_Y, r: 2.8, fill: BRASS_LIGHT, stroke: BRASS_WIRE_DARK, 'stroke-width': 1.2}),
    svg('circle', {cx: LOOP_CX, cy: LOOP_CY - LOOP_R, r: 1.6, fill: '#8f959c', stroke: '#5b6a6d', 'stroke-width': 0.9}),
  )
  if (connected) {
    add(group,
      svg('line', {x1: TIP_X + 2.8, y1: TIP_Y - 1, x2: TIP_X + 12, y2: TIP_Y - 7, stroke: WIRE_RED, 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
      svg('circle', {cx: TIP_X + 14.5, cy: TIP_Y - 8.5, r: 2.6, fill: 'none', stroke: WIRE_RED, 'stroke-width': 1.4}),
    )
  }
  return group
}
