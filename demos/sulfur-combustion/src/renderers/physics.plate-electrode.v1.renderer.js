import {add, shadow, svg} from './svg.js'

//  -  平行圆盘电极(kind=plate_electrode, station E; 一个渲染器读
//   entity.properties.side 出两实例: side="left" 朝右面贴白纸条 / side="right"
//   朝左面贴红纸条) - 
// 证据帧: frame-040/041(两只竖直金属圆盘电极左右相对, 各装绝缘底座, 盘面朝对盘一侧
//          贴纸条: 左盘白, 右盘红); frame-042(未充电: 纸条贴盘下垂); frame-043/044
//          (充电后: 纸条水平抬起指向对盘 - 静电吸引示意).
// 复用否决理由: 四域注册表无平行板电极类条目; physics.sodium-lamp(钠灯), 
//          physics.galvanometer(表盘)形状语义不符; 可信源发现运行无评分通过文件
//          (discover_apparatus.py "no scored vector file matched", trace
//          assets/discover-plate_electrode), 故代码原生生成(左右两实例共用一个
//          渲染器, default_for_kind, 实例由 properties.side 区分 - 先例
//          physics.magnetic-cart-left/right).
// 风格基础: 金属圆盘 class metal(#b4c0c2/#5b6a6d, physics.js 金属件族)+ 底座
//          class stand-base + 白纸条 #f0ece8 / 红纸条 #c23a2a(与 tassel/引线同族); 
//          纸条为贝塞尔描边(圆帽).配色内联, 不新增 class.
// 状态语义: state.alignment ∈ 0..1(缺省 0)→ 每条纸条自"贴盘下垂"(末端在挂点下方
//          30~38px)插值到"水平抬起指向对盘"(末端抬至挂点同高, 向对盘伸出 30~38px, 
//          frame-043/044); state.connected(bool, 缺省 false)→ 盘背面引出红色短引线
//          (IR assumptions"连接导线简化为引出短引线").properties.side: 'left'
//          (缺省)| 'right'.
// 关键尺寸(局部原点=底座底面中心=台面接触点, y 向下为正): 
//   底座 x∈[-20,20], y∈[-6,0](class stand-base); 绝缘立柱 x=0/y∈[-44,-6](宽 5); 
//   竖直圆盘椭圆 rx=13/ry=30 圆心 (0,-72)(盘面略侧转 2.5D); 纸条 12 条, 挂点沿盘面
//   竖向均布 y=-72±24, 贴面 x=±(9~13), 条长 30~38, 宽 2.6.总高约 102px.
// 证据不清处: frame-040/041 两盘支架样式不同(左盘深色矩形柱座, 右盘银色喇叭底座)
//    - 低照度帧无法确读差异细节, 两实例统一用同款底座(单渲染器约定), 如需还原
//   差异请构建方为右盘补 properties.stand 覆盖; 盘距/盘径按帧比例估读.
// 双实例错位(case 110 验证 major #2 修复): 吸附系统每个目标实体只有一个 snap_anchor, 
//   disc-left/right 都吸附到起电机同一接线锚点(实体原点重合).frame-040~044 的核心
//   可观察量是"两盘左右相对, 盘间留隙, 纸条跨隙互指" - 渲染端按 properties.side 把
//   器材本体自原点横向错开 ±38px(left −38 / right +38, 盘心距 76px, 内缘净距约 50px, 
//   对齐态纸条 30~38px 恰跨隙相互衔接), 吸附/拖拽交互点仍在共享原点不变.
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/plate-electrode'
//   (import {renderPlateElectrode} from './physics.plate-electrode.v1.renderer.js').

const WIRE_RED = '#c23a2a'
const STRIP_WHITE = '#f0ece8'
const STRIP_WHITE_DARK = '#ddd8d2'
const STRIP_RED = '#c23a2a'
const STRIP_RED_DARK = '#a03225'
const STRIP_COUNT = 12

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

export function renderPlateElectrode(entity, state = {}, context = {}) {
  const group = svg('g')
  const props = entity.properties || {}
  const facing = (props.side === 'right') ? -1 : 1 // 面朝对盘的方向: left 盘朝 +x, right 盘朝 -x
  // 双实例错位: left 盘本体居原点左 38px, right 盘居右 38px(见头部"双实例错位"), 
  // 共享吸附原点上两盘左右相对, 纸条跨隙互指
  const bodyX = (facing === 1) ? -38 : 38
  const body = svg('g', {transform: `translate(${bodyX} 0)`})
  const connected = Boolean(state.connected)
  const t = Math.max(0, Math.min(1, Number(state.alignment || 0)))
  const mainColor = facing === 1 ? STRIP_WHITE : STRIP_RED
  const darkColor = facing === 1 ? STRIP_WHITE_DARK : STRIP_RED_DARK
  add(body, shadow(0, 3, 24, 5))
  // 绝缘底座 + 立柱(frame-040 左盘样式; 支架差异见头部"证据不清处")
  add(body,
    svg('rect', {x: -20, y: -6, width: 40, height: 6, rx: 2, class: 'stand-base'}),
    svg('line', {x1: 0, y1: -6, x2: 0, y2: -44, stroke: '#454e53', 'stroke-width': 5, 'stroke-linecap': 'round'}),
    svg('line', {x1: -1.2, y1: -8, x2: -1.2, y2: -42, stroke: 'rgb(255 255 255 / 22%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )
  // 竖直金属圆盘(2.5D 侧转椭圆)+ 盘面高光(先画盘, 纸条贴在盘面前侧)
  add(body,
    svg('ellipse', {cx: 0, cy: -72, rx: 13, ry: 30, class: 'metal'}),
    svg('ellipse', {cx: 0, cy: -72, rx: 9.5, ry: 26.5, fill: 'none', stroke: 'rgb(255 255 255 / 35%)', 'stroke-width': 1.2}),
    svg('line', {x1: -facing * 5, y1: -94, x2: -facing * 5, y2: -50, stroke: 'rgb(255 255 255 / 45%)', 'stroke-width': 2, 'stroke-linecap': 'round'}),
    svg('circle', {cx: 0, cy: -72, r: 2, class: 'screw'}),
  )
  // 纸条(贴在对盘面一侧, 画在盘之后: frame-042 下垂纸条贴着盘面可见)
  for (let i = 0; i < STRIP_COUNT; i += 1) {
    const ay = -72 + (i - (STRIP_COUNT - 1) / 2) * 4.4
    const ax = facing * (9 + hash01(entity.id, i * 7 + 1) * 4)
    const droopLen = 30 + hash01(entity.id, i * 7 + 2) * 8
    const reach = 30 + hash01(entity.id, i * 7 + 3) * 8
    const eX = ax + facing * reach * t
    const eY = ay + droopLen * (1 - t) + 2 * t
    const c1X = ax + facing * 8 * t
    const c1Y = ay + droopLen * 0.4 * (1 - t)
    const c2X = eX - facing * 9 * t
    const c2Y = eY - (droopLen * 0.25 * (1 - t) + 3 * t)
    body.append(svg('path', {
      d: `M${ax.toFixed(1)} ${ay.toFixed(1)}C${c1X.toFixed(1)} ${c1Y.toFixed(1)} ${c2X.toFixed(1)} ${c2Y.toFixed(1)} ${eX.toFixed(1)} ${eY.toFixed(1)}`,
      fill: 'none', stroke: i % 3 === 0 ? darkColor : mainColor,
      'stroke-width': 2.6, 'stroke-linecap': 'round',
    }))
  }
  if (connected) {
    // 引出短引线: 盘背面(背向对盘一侧, frame-040 接线在盘后)
    add(body,
      svg('line', {x1: -facing * 12, y1: -72, x2: -facing * 22, y2: -77, stroke: WIRE_RED, 'stroke-width': 2.2, 'stroke-linecap': 'round'}),
      svg('circle', {cx: -facing * 24.4, cy: -78.2, r: 2.4, fill: 'none', stroke: WIRE_RED, 'stroke-width': 1.3}),
    )
  }
  group.append(body)
  return group
}
