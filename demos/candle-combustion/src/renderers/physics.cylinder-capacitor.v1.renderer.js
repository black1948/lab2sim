import {add, shadow, svg} from './svg.js'

//  -  圆筒电容器(kind=cylinder_capacitor, station B) - 
// 证据帧: frame-014(白顶盖 + 顶盖红色接线端 + 透明圆筒立于绝缘底座, 筒中心金属杆); 
//          frame-015/016(未充电: 筒内白色菱形细屑杂乱散布); frame-018/019(充电后: 
//          细屑自中心杆沿半径成水平辐射链 - 筒内"刺猬"态).
// 复用否决理由: physics.graduated-cylinder(量筒: 刻度+倾倒嘴, 无中心杆/顶盖/状态语义, 
//          属"形似而功能不同"禁止替用); physics.test-tube*(试管族), 
//          chemistry.gas-collector-tube(集气瓶)均不符; 可信源发现运行无评分通过文件
//          (discover_apparatus.py "no scored vector file matched", trace
//          assets/discover-cylinder_capacitor), 故代码原生生成.
// 风格基础: chemistry.test-tube-layered.v1 的玻璃圆筒画法(glass-body 筒身 + 玻璃高光 +
//          椭圆口沿)与 physics.demo-track.v1 通用约定(apparatus-shadow + 内联配色); 
//          白顶盖/白底白 (236,235,227) → #ecebe3; 中心杆银灰 class metal; 红接线
//          #c23a2a(与 electrode-panel 引线同族).配色内联, 不新增 class.
// 状态语义: state.alignment ∈ 0..1(缺省 0)→ 约 30 枚白色菱形细屑: alignment=0 杂乱
//          散布筒内(确定性 seed=entity.id); alignment=1 落到中心杆两侧水平辐射链
//          (x 距杆量化 4 档 8/17/26/35 成链, y 按 seed 分布 - frame-018/019"刺猬"态); 
//          state.connected(bool, 缺省 false)→ 白顶盖引出红色短引线(IR assumptions
//          "连接导线简化为引出短引线").
// 关键尺寸(局部原点=底座底面中心=台面接触点, y 向下为正): 
//   底座椭圆 rx34/ry7 于 (0,-2) + 透明绝缘颈 x∈[-9,9], y∈[-26,-4]; 筒壁 x∈[-33,33], 
//   y∈[-136,-26](glass-body 半透明, 4 根竖向金属杆 x=±31/±14); 白底盘椭圆
//   rx30/ry7 于 (0,-28); 白顶盖椭圆 rx33/ry8 于 (0,-136) + 红接线端; 中心杆 x∈[-2,2], 
//   y∈[-132,-30] + 顶球 r3.5.总高约 145px.细屑菱形 10.8×6.4(30 枚).
// 证据不清处: frame-014 顶盖上红件为接线端子(红导线连顶盖) - 细部按示意画; 筒壁
//   金属杆数在低照度帧不可数(目测 3~4 根, 取 4 根对称).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/cylinder-capacitor'
//   (import {renderCylinderCapacitor} from './physics.cylinder-capacitor.v1.renderer.js').

const CAP_WHITE = '#ecebe3'
const CAP_EDGE = '#b9b3a4'
const WIRE_RED = '#c23a2a'
const CHIP_FILL = '#f4f1e8'
const CHIP_EDGE = '#b9b3a4'
const CHIP_COUNT = 30
const BANDS = 4

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

export function renderCylinderCapacitor(entity, state = {}, context = {}) {
  const group = svg('g')
  const connected = Boolean(state.connected)
  const t = Math.max(0, Math.min(1, Number(state.alignment || 0)))
  add(group, shadow(0, 3, 38, 6))
  // 绝缘底座: 深色椭圆脚 + 透明颈
  add(group,
    svg('ellipse', {cx: 0, cy: -2, rx: 34, ry: 7, fill: '#2e383b', stroke: '#172023', 'stroke-width': 1.6}),
    svg('rect', {x: -9, y: -26, width: 18, height: 22, rx: 2, fill: 'rgb(221 245 249 / 45%)', stroke: '#41626b', 'stroke-width': 1.4}),
  )
  // 白色底盘(筒底)
  add(group, svg('ellipse', {cx: 0, cy: -28, rx: 30, ry: 7, fill: CAP_WHITE, stroke: CAP_EDGE, 'stroke-width': 1.6}))
  // 筒壁(半透明玻璃筒)+ 纵向高光
  add(group,
    svg('rect', {x: -33, y: -136, width: 66, height: 108, fill: 'rgb(221 245 249 / 30%)', stroke: '#41626b', 'stroke-width': 2}),
    svg('line', {x1: -24, y1: -130, x2: -24, y2: -34, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
  )
  // 筒内菱形细屑: 杂乱 → 中心杆水平辐射链(frame-018/019)
  for (let i = 0; i < CHIP_COUNT; i += 1) {
    const sx = -26 + hash01(entity.id, i * 7 + 1) * 52
    const sy = -128 + hash01(entity.id, i * 7 + 2) * 92
    const srot = -180 + hash01(entity.id, i * 7 + 3) * 360
    const side = i % 2 === 0 ? -1 : 1
    const band = Math.min(BANDS - 1, Math.floor(hash01(entity.id, i * 7 + 4) * BANDS))
    const ax = (8 + band * 9) * side
    const ay = -126 + hash01(entity.id, i * 7 + 5) * 88
    const x = lerp(sx, ax, t)
    const y = lerp(sy, ay, t)
    const rot = lerp(srot, 0, t)
    group.append(chipNode(x, y, rot))
  }
  // 筒壁竖向金属杆(玻璃筒前侧, 压住细屑表示"筒内")
  add(group,
    svg('line', {x1: -31, y1: -136, x2: -31, y2: -26, class: 'stand'}),
    svg('line', {x1: -14, y1: -134, x2: -14, y2: -28, stroke: '#8a929a', 'stroke-width': 2, 'stroke-linecap': 'round'}),
    svg('line', {x1: 14, y1: -134, x2: 14, y2: -28, stroke: '#8a929a', 'stroke-width': 2, 'stroke-linecap': 'round'}),
    svg('line', {x1: 31, y1: -136, x2: 31, y2: -26, class: 'stand'}),
  )
  // 中心金属杆(内极杆)+ 顶球
  add(group,
    svg('rect', {x: -2, y: -132, width: 4, height: 102, rx: 1.5, class: 'metal'}),
    svg('circle', {cx: 0, cy: -132, r: 3.5, fill: '#8f959c', stroke: '#5b6a6d', 'stroke-width': 1.2}),
  )
  // 白色顶盖 + 顶盖红接线端(frame-014)
  add(group,
    svg('ellipse', {cx: 0, cy: -136, rx: 33, ry: 8, fill: CAP_WHITE, stroke: CAP_EDGE, 'stroke-width': 1.6}),
    svg('ellipse', {cx: 0, cy: -136, rx: 26, ry: 5.5, fill: 'none', stroke: CAP_EDGE, 'stroke-width': 0.9, opacity: .7}),
  )
  if (connected) {
    add(group,
      svg('line', {x1: 0, y1: -142, x2: -12, y2: -150, stroke: WIRE_RED, 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
      svg('circle', {cx: -14.5, cy: -151.5, r: 2.6, fill: 'none', stroke: WIRE_RED, 'stroke-width': 1.4}),
    )
  }
  return group
}
