import {add, shadow, svg} from './svg.js'

//  -  纸条穗(kind=strip_tassel, station D; 一个渲染器读 entity.properties.variant
//   出两变体: variant="ball" 镀铬金属球顶+白纸条 / variant="rod" 金属帽顶+粉红纸条) - 
// 证据帧: frame-030/032(两支纸条穗立在起电机两侧: 左白纸条穗为立柱+顶球式, 右粉红
//          纸条穗为金属杆+黄铜帽顶式); frame-034/036(未充电: 纸条并拢下垂); 
//          frame-037/039(充电后: 纸条沿径向四面张开成星形 - 同种电荷相斥).
// 复用否决理由: 四域注册表无 tassel/纸条类条目; physics.flag(旗杆旗帜语义), 
//          physics.suspended-coil(悬挂线圈)形状语义不符; 可信源发现运行无评分通过
//          文件(discover_apparatus.py "no scored vector file matched", trace
//          assets/discover-strip_tassel), 故代码原生生成(两变体共用一个渲染器, 
//          default_for_kind, 实例由 properties.variant 区分 - 先例 physics.ball-flight).
// 风格基础: 立柱/金属件 class stand/metal/screw(physics.js renderSupportFrame 族)+
//          镀铬球配色 #c9cfd5(physics.pendulum-bob 钢球族)+ 黄铜帽 #c9ae74(本案
//          teardrop 族); 纸条白 (193,189,186) → #f0ece8, 粉红 (127,84,97) 低照度归一
//          → #d98fa6.纸条为二次贝塞尔描边(圆帽), 每 3 条取深一档做层次.配色内联, 
//          不新增 class.
// 状态语义: state.alignment ∈ 0..1(缺省 0)→ 每条纸条自"下垂"(自竖直 ±12° 确定性
//          抖动)插值到"星形径向张开"(全圆均分 + ±10° 抖动, frame-037/039); 
//          state.connected(bool, 缺省 false)→ 立柱中部引出红色短引线(IR assumptions
//          "连接导线简化为引出短引线").properties.variant: 'ball'(缺省)| 'rod'.
// 关键尺寸(局部原点=底座底面中心=台面接触点, y 向下为正): 
//   ball 变体: 深色圆盘底座 r11/y∈[-6,0], 金属立柱 x=0/y∈[-92,-6](class stand), 
//     镀铬球 r9 于 (0,-100), 纸条 13 条自 (0,-92) 挂下, 长 40~52, 总高约 109px.
//   rod 变体: 三脚架叉脚 (0,-16)→(±17,0), 金属杆 x=0/y∈[-88,0](wide 4), 黄铜帽 r5
//     于 (0,-92), 粉纸条 13 条自 (0,-89) 挂下, 长 40~52, 总高约 97px.
// 证据不清处: 纸条确切条数在低照度帧不可数(目测 12~16, 取 13); 立柱高度按帧比例
//   估读; 纸条下垂/张开的中间态为插值示意(原视频为连续摆动).
// 双实例错位(case 110 验证 major #3 修复): 吸附系统每个目标实体只有一个 snap_anchor, 
//   tassel-ball/rod 都吸附到起电机同一接线锚点(原点差仅 6 单位, 白穗被粉穗遮挡).
//   渲染端按 properties.variant 把本体自原点横向错开 ±30px(ball −30 / rod +30, 
//   两穗心距 60px, 各自完整可见); 与 frame-030"分居起电机两侧"相比仍是并排于接线区
//   的妥协(吸附契约限制), 但两实例不再互相遮挡.
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/strip-tassel'
//   (import {renderStripTassel} from './physics.strip-tassel.v1.renderer.js').

const WIRE_RED = '#c23a2a'
const STRIP_WHITE = '#f0ece8'
const STRIP_WHITE_DARK = '#ddd8d2'
const STRIP_PINK = '#d98fa6'
const STRIP_PINK_DARK = '#c97a92'
const STRIP_COUNT = 13

function hash01(seed, index) {
  // 确定性哈希(FNV-1a + murmur 混合)→ [0,1): 纸条布点禁用 Math.random
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

export function renderStripTassel(entity, state = {}, context = {}) {
  const group = svg('g')
  const props = entity.properties || {}
  const variant = props.variant === 'rod' ? 'rod' : 'ball'
  const connected = Boolean(state.connected)
  const t = Math.max(0, Math.min(1, Number(state.alignment || 0)))
  // 双实例错位: ball 穗本体居原点左 30px, rod 穗居右 30px(见头部"双实例错位")
  const bodyX = variant === 'rod' ? 30 : -30
  const body = svg('g', {transform: `translate(${bodyX} 0)`})
  const attachY = variant === 'rod' ? -89 : -92
  const mainColor = variant === 'rod' ? STRIP_PINK : STRIP_WHITE
  const darkColor = variant === 'rod' ? STRIP_PINK_DARK : STRIP_WHITE_DARK
  add(body, shadow(0, 3, 20, 4.5))
  // 纸条(画在立柱后面, 挂点被球/帽遮住)
  for (let i = 0; i < STRIP_COUNT; i += 1) {
    const droop = 90 + (hash01(entity.id, i * 7 + 1) - 0.5) * 24      // 下垂 ±12°
    const star = (360 / STRIP_COUNT) * i + (hash01(entity.id, i * 7 + 2) - 0.5) * 20
    const ang = lerp(droop, star, t) * Math.PI / 180
    const len = 40 + hash01(entity.id, i * 7 + 3) * 12
    const bow = (hash01(entity.id, i * 7 + 4) - 0.5) * 12 * (1 - t * 0.5)
    const dirX = Math.cos(ang)
    const dirY = Math.sin(ang)
    const perpX = -dirY
    const perpY = dirX
    const cX = dirX * len * 0.45 + perpX * bow
    const cY = attachY + dirY * len * 0.45 + perpY * bow
    const eX = dirX * len
    const eY = attachY + dirY * len
    body.append(svg('path', {
      d: `M0 ${attachY}Q${cX.toFixed(1)} ${cY.toFixed(1)} ${eX.toFixed(1)} ${eY.toFixed(1)}`,
      fill: 'none', stroke: i % 3 === 0 ? darkColor : mainColor,
      'stroke-width': 2.6, 'stroke-linecap': 'round',
    }))
  }
  if (variant === 'rod') {
    // rod 变体: 三脚架 + 金属杆 + 黄铜帽顶(frame-030/032 右支)
    add(body,
      svg('line', {x1: 0, y1: -16, x2: -17, y2: 0, stroke: '#5b6a6d', 'stroke-width': 3, 'stroke-linecap': 'round'}),
      svg('line', {x1: 0, y1: -16, x2: 17, y2: 0, stroke: '#5b6a6d', 'stroke-width': 3, 'stroke-linecap': 'round'}),
      svg('line', {x1: 0, y1: 0, x2: 0, y2: -88, stroke: '#8a929a', 'stroke-width': 4, 'stroke-linecap': 'round'}),
      svg('circle', {cx: 0, cy: -92, r: 5, fill: '#c9ae74', stroke: '#7d6a42', 'stroke-width': 1.4}),
      svg('circle', {cx: -1.4, cy: -93.4, r: 1.3, fill: '#ffffff', opacity: .85}),
    )
  } else {
    // ball 变体: 深色圆盘底座 + 金属立柱 + 镀铬球顶(frame-030/032 左支)
    add(body,
      svg('ellipse', {cx: 0, cy: -2, rx: 11, ry: 4, fill: '#2e383b', stroke: '#172023', 'stroke-width': 1.4}),
      svg('line', {x1: 0, y1: -6, x2: 0, y2: -92, class: 'stand'}),
      svg('circle', {cx: 0, cy: -92, r: 3, fill: '#8f959c', stroke: '#5b6a6d', 'stroke-width': 1}),
      svg('circle', {cx: 0, cy: -100, r: 9, fill: '#c9cfd5', stroke: '#5a626a', 'stroke-width': 1.6}),
      svg('circle', {cx: -2.6, cy: -102.6, r: 2.2, class: 'ball-highlight'}),
      svg('circle', {cx: -3.2, cy: -103.2, r: 0.9, fill: '#ffffff', opacity: .9}),
    )
  }
  if (connected) {
    // 引出短引线(立柱中部, 接线简化示意)
    add(body,
      svg('line', {x1: 3, y1: -48, x2: 14, y2: -54, stroke: WIRE_RED, 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
      svg('circle', {cx: 16.4, cy: -55.2, r: 2.4, fill: 'none', stroke: WIRE_RED, 'stroke-width': 1.3}),
    )
  }
  group.append(body)
  return group
}
