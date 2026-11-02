import {add, label, shadow, svg} from './svg.js'

//  -  气垫滑块 - U 形挡光片(121-用数字计时仪测气垫导轨上滑块的即时速度) - 
// 视觉依据: frame-005/006/007 特写(黑色低矮滑块压在白色滑行面上: 侧面横向棱纹(波纹
//           面), 宽底座→中层台阶→中央台面的阶梯轮廓, 台面中央一枚黄铜/不锈钢紧定
//           螺钉(frame-007 圆头+一字槽); 台面上竖立 U 形开槽挡光片: 两条竖直挡光沿
//           之间一道朝上开槽); frame-008/009(蓝色视频标注"1cm"跨在两挡光沿之间, 
//           标注 B/A - 开槽宽度即挡光宽度 Δs=1cm); 
//           frame-004/016/017/018 全景(滑块右端待发/滑行中的矮黑块剪影).
// 复用审查否决记录(构建方明示): physics.air-glider.v1=case-07 电磁炮式复合演示装置
//           (黄色箱体+透明立杆+电磁线圈+接球漏斗), 与本片黑色棱纹矮滑块+U 形挡光片
//           完全不同物, 不得顶替; physics.ticker-cart.v1 / physics.ticker-cart-uniform.v1
//           =带轮打点小车(本片滑块无轮, 气垫悬浮贴面), physics.cart.v1=24 案例红壳
//           双轮小车, physics.magnetic-cart-left/right.v1=106 案例银色磁铁车, 均不同物.
//           可信源发现(scripts/discover_apparatus.py --kind air_glider --label
//           滑块U形挡光片)返回 "no scored vector file matched"(tabler/twbs 单色线稿
//           图标, 风格断裂), 按规程代码原生生成.
// 风格依据: 暗光帧滑块采样近黑(#141416~#1e1e20), 归一化为深炭色 #2b2e32 族(同
//           physics.ticker-cart.v1 车身族, 可读性归一化); 棱纹用横向明暗条纹示意; 
//           黄铜紧定螺钉沿用 physics.ticker-timer.v1 的 BRASS 族(#b8964f/#6b5426); 
//           2.5D 顶面斜折/白高光/右侧暗部画法沿用 physics.ticker-cart.v1.renderer.js; 
//           接地阴影同域约定.配色全部内联, 不新增 styles.css class.
// 锚点: 局部 (0,0)=滑块底面中心(贴白色滑行面顶线, 气垫导轨 y=0 基准, IR snap
//           anchored_gap=0.08 的离面间隙由引擎承担).底座 104×16(x∈[-52,52], 
//           y∈[-16,0]); 中层台阶 68×8(y∈[-24,-16]); 中央台面 44×6(y∈[-30,-24]); 
//           紧定螺钉圆头 r3.2 于 (0,-27.2); U 形挡光片两挡光沿 x∈[-10,-5]/[5,10], 
//           y∈[-74,-23], 开槽净宽 10px=1cm(导轨 1cm=10px 标尺约定, frame-008"1cm").
//           总高约 74px.
// 滑行状态(契约重点, 匀速线性律 - 与 physics/photogate.v1 的挡光判定映射逐字一致, 
//           两处必须同步修改; 禁止 p² 平方律, 那是 119 匀加速先例 ticker-cart.v1 的律, 
//           与本片匀速矛盾): 
//   state.above === 'air-track-1' 或 state.sliding 为真时按映射定位: 
//     p = clamp01(Number(state.run_progress ?? 0)), context.preview 时强制 0(库房缩略
//       图冻结在静止位, ticker-cart-uniform 先例)
//     轨局部 x = glider_start_x_px + glider_run_span_px  -  p(缺省 240 + (-478) - p: 
//       右端 +240 px 向左匀速滑到 -238 px)
//     屏幕位 = world['air-track-1'] 原点(x*1000, 560-y*500)+ 轨局部 (x, 0) - 原点即
//       白色滑行面中心/滑行面顶线, 派生几何照 physics.ticker-cart-uniform.v1 的
//       boardBasis 世界读取写法.
//   其余(在家/被拖动/导轨不在场)→ 画在自身 world/transform 位置(offset=0).
//   跑完后 run_progress 保持, sliding 翻 false: 只要 above 仍吸附导轨即按 p 保持终点
//   位(ticker-cart.v1"跑完不回跳"同款处理); 引擎主动 return home 时 above 清空即回
//   自身位.
// 契约参数(context.visual, 全带缺省): glider_start_x_px=240, glider_run_span_px=-478.
// 证据不清处: ① 挡光沿顶切口细节(平切/圆角)按平切补形; ② 视频标注 A/B/1cm 为节目
//           叠加图形, 不属器材本体, 未绘制; ③ 滑块两端面气垫孔不可辨, 未绘制; 
//           ④ 紧定螺钉材质(黄铜/不锈钢)frame-007 特写偏暗, 按黄铜族补形.
// 导出签名与模板一致: renderAirGliderVane(entity, state, context).
// 集成: renderer 键 physics/air-glider-vane(index.js 的 import/注册由构建方完成: 复制
//           本文件到 src/renderers/ 并在 index.js 注册 'physics/air-glider-vane').

const BODY = '#2b2e32'      // 滑块主体(暗光近黑归一化深炭色, 同 119 车族可读性)
const BODY_TOP = '#45494f'  // 台面/台阶受光
const BODY_EDGE = '#14161a' // 描边
const RIB = '#1d1f23'       // 棱纹凹槽
const RIB_LIT = '#3a3e44'   // 棱纹受光棱
const VANE = '#33373d'      // 挡光沿(同族深色钢片)
const BRASS = '#b8964f'     // 紧定螺钉(黄铜, frame-007)
const BRASS_EDGE = '#6b5426'

//  -  轨面基准与滑行映射(匀速线性律; 与 physics/photogate.v1.renderer.js 逐字一致的
//    常量, 改一处必须同步另一处) - 
function trackBasis(world) {
  const track = (world && world['air-track-1']) || {}
  return {
    x: Number(track.x ?? 0.5) * 1000,
    y: 560 - Number(track.y ?? 0.42) * 500,
  }
}

function gliderRunScreen(world, visual, runState, preview) {
  const onTrack = (runState && runState.above) === 'air-track-1' || Boolean(runState && runState.sliding)
  if (!onTrack || !world['air-track-1']) return null
  const p = preview ? 0 : Math.max(0, Math.min(1, Number(runState.run_progress ?? 0)))
  const localX = Number(visual.glider_start_x_px ?? 240) + Number(visual.glider_run_span_px ?? -478) * p
  const basis = trackBasis(world)
  return {x: basis.x + localX, y: basis.y}
}

// U 形开槽挡光片: 两条竖直挡光沿立在台面上, 之间开槽朝上(开槽净宽 10px=1cm, 
// frame-008"1cm"标注跨在两沿之间)
function vane() {
  return add(svg('g'),
    // 左/右挡光沿(顶端平切, frame-008 两沿等高, 下端插入台面)
    svg('rect', {x: -10, y: -74, width: 5, height: 51, rx: 1, fill: VANE, stroke: BODY_EDGE, 'stroke-width': 1.1}),
    svg('rect', {x: 5, y: -74, width: 5, height: 51, rx: 1, fill: VANE, stroke: BODY_EDGE, 'stroke-width': 1.1}),
    // 挡光沿受光棱(右侧受光)
    svg('line', {x1: -6, y1: -71, x2: -6, y2: -27, stroke: 'rgb(255 255 255 / 16%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
    svg('line', {x1: 9, y1: -71, x2: 9, y2: -27, stroke: 'rgb(255 255 255 / 16%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
  )
}

export function renderAirGliderVane(entity, state = {}, context = {}) {
  const group = svg('g')
  const visual = context.visual || {}
  const world = context.world || {}
  // 自身屏幕位(world 缺失时回退 visual.transform / 缺省位)
  let self = null
  const item = world[entity?.id]
  if (item) self = {x: Number(item.x ?? 0.5) * 1000, y: 560 - Number(item.y ?? 0.42) * 500}
  if (!self) {
    const t = entity?.visual?.transform || visual.transform || {}
    self = {x: Number(t.x ?? 0.5) * 1000, y: 560 - Number(t.y ?? 0.42) * 500}
  }
  // 滑行映射: 吸附导轨/滑行中按匀速线性律沿轨面定位, 否则画在自身位(offset=0)
  let offsetX = 0
  let offsetY = 0
  const anchor = gliderRunScreen(world, visual, state, Boolean(context.preview))
  if (anchor) {
    offsetX = anchor.x - self.x
    offsetY = anchor.y - self.y
  }
  const body = svg('g', (offsetX || offsetY) ? {transform: `translate(${offsetX.toFixed(1)} ${offsetY.toFixed(1)})`} : {})
  add(body,
    shadow(0, 2, 46, 4.5),
    // 底座(104×16, 侧面横向棱纹=波纹面, frame-005/006)
    svg('rect', {x: -52, y: -16, width: 104, height: 16, rx: 2, fill: BODY, stroke: BODY_EDGE, 'stroke-width': 1.6}),
    ...[-12.5, -9, -5.5, -2.5].map(y => svg('line', {x1: -50, y1: y, x2: 50, y2: y, stroke: RIB, 'stroke-width': 1.6})),
    ...[-11.5, -8, -4.5, -1.7].map(y => svg('line', {x1: -50, y1: y, x2: 50, y2: y, stroke: RIB_LIT, 'stroke-width': 0.7, opacity: 0.8})),
    // 右端背光暗部
    svg('rect', {x: 38, y: -16, width: 14, height: 16, rx: 2, fill: '#14161a', opacity: 0.5}),
    // 中层台阶(68×8)
    svg('rect', {x: -34, y: -24, width: 68, height: 8, rx: 1.5, fill: BODY, stroke: BODY_EDGE, 'stroke-width': 1.4}),
    svg('line', {x1: -32, y1: -22.6, x2: 32, y2: -22.6, stroke: RIB_LIT, 'stroke-width': 1}),
    // 中央台面(44×6, 带 2.5D 顶面斜折)
    svg('path', {d: 'M-22 -18L-19 -24H19L22 -18Z', fill: BODY_TOP, stroke: BODY_EDGE, 'stroke-width': 1.2, 'stroke-linejoin': 'round'}),
    svg('line', {x1: -14, y1: -22.4, x2: 14, y2: -22.4, stroke: 'rgb(255 255 255 / 28%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
    // 紧定螺钉(台面中央, 两挡光沿之间, 圆头+一字槽, frame-007)
    svg('circle', {cx: 0, cy: -27.2, r: 3.2, fill: BRASS, stroke: BRASS_EDGE, 'stroke-width': 1.1}),
    svg('line', {x1: -1.9, y1: -28, x2: 1.9, y2: -26.4, stroke: BRASS_EDGE, 'stroke-width': 0.9, 'stroke-linecap': 'round'}),
    // U 形开槽挡光片(竖立, 开槽净宽 1cm 朝上)
    vane(),
  )
  body.append(label(entity.label, 0, 14))
  group.append(body)
  return group
}
