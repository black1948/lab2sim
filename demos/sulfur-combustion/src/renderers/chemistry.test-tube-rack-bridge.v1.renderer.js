import {add, shadow, svg} from './svg.js'

function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

//  -  桥式试管架(两孔; 白色塑料, 固体的溶解速率对比) - 
// 视觉依据: frame-013/014/016/018(frame-018 正面最清楚): 白色塑料桥式架 =
// 两个端部立柱(柱顶高出顶板)+ 一块抬高的薄顶板(顶板面一排多个插孔)+
// 厚底板(板面亦有孔列), 试管穿过顶板孔, 管底立在底板孔位面上(frame-026 特写: 
// 管底坐底板板面, 孔缘在管底两侧可见).注册前已否决 chemistry.test-tube-rack-3h.v1
// (三孔 140px 孔距为另一案例场景约束定制, 与本案例 90px 管距不符, 且其每板只画
// 3 大孔, 无"多孔桥架"读感; frame-018 底部放大复核为"试管立底板孔面"而非悬空坐台面, 
// 见 trace assets-1-reuse-review).
// 几何锚点: 局部原点 = 底板底面中心, y 向下为正.两插孔中心 x=±45  -  与本案例
// tube-a/tube-b 0.475/0.565(90 舞台像素)管距对齐, 架实体 x=0.52 恰为两管中点; 
// 孔径沿用 3h 案例口径(试管直径 26px: 孔外椭圆 rx13/ry4.6, 内孔 rx8/ry2.6).
// 立柱 x=±156..±170, 高 96(柱顶 y=-96, 高出顶板, frame-018 柱顶伸出顶板上方); 
// 顶板 y=-84..-72, 跨 ±163; 底板前立面 y=-14..0, 顶面斜折 -20..-14, 孔心 y=-17.
// 辅助小孔(x=0/±90/±135)为 frame-018 顶板/底板上"多于插管的均布孔列"的读感抽象
// (原帧孔数多于两管, 孔距与插孔不完全均匀, 分辨率不足以逐孔定位, 按等距 45 画示意).
// 风格依据: biology.test-tube-rack.v1.renderer.js 的白塑料色族与形状语言
// (PLASTIC #efeadd / PLASTIC_TOP #f7f4ea / PLASTIC_EDGE #c6c0ae / HOLE #b9b2a0 /
// HOLE_DEEP #7d7666 + apparatus-shadow + 2.5D 顶面斜折 + 白色高光线, 线宽 1.6/1.4).
// 场景 z 序建议: 架在试管之后(试管玻璃叠在顶板前, 同 frame-002/018); 
// 试管落位: 管底(试管局部 y=62)应落底板孔面(架局部 y≈-17).
// 无状态绑定(IR rack 实体无 state_bindings; renderXxx(entity, state) 签名保留 state 形参).

const PLASTIC = '#efeadd'
const PLASTIC_TOP = '#f7f4ea'
const PLASTIC_EDGE = '#c6c0ae'
const HOLE = '#b9b2a0'
const HOLE_DEEP = '#7d7666'
const AUX_X = [-135, -90, 0, 90, 135]

export function renderTestTubeRackBridge(entity, state = {}) {
  const group = svg('g')
  add(group,
    shadow(0, 4, 180, 9),
    // 左右端部立柱(frame-018: 平顶圆角柱, 顶高出顶板, 左缘受光)
    svg('rect', {x: -170, y: -96, width: 14, height: 82, rx: 4, fill: PLASTIC, stroke: PLASTIC_EDGE, 'stroke-width': 1.6}),
    svg('rect', {x: 156, y: -96, width: 14, height: 82, rx: 4, fill: PLASTIC, stroke: PLASTIC_EDGE, 'stroke-width': 1.6}),
    svg('path', {d: 'M-166 -90V-20M162 -90V-20', stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-160.5 -88V-22M167.5 -88V-22', stroke: 'rgb(198 192 174 / 55%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    // 抬高的顶板(薄板 + 白色高光/暗缘 + 双插孔与辅助孔列)
    svg('rect', {x: -163, y: -84, width: 326, height: 12, rx: 3, fill: PLASTIC_TOP, stroke: PLASTIC_EDGE, 'stroke-width': 1.6}),
    svg('path', {d: 'M-155 -81.5H155', stroke: 'rgb(255 255 255 / 80%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-155 -73.4H155', stroke: 'rgb(198 192 174 / 70%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
    ...[-45, 45].map(x => [
      svg('ellipse', {cx: x, cy: -78, rx: 10, ry: 3.6, fill: HOLE}),
      svg('ellipse', {cx: x, cy: -78.6, rx: 6, ry: 2, fill: HOLE_DEEP}),
    ]).flat(),
    ...AUX_X.map(x => [
      svg('ellipse', {cx: x, cy: -78, rx: 4.5, ry: 1.7, fill: HOLE}),
      svg('ellipse', {cx: x, cy: -78.4, rx: 2.4, ry: 0.9, fill: HOLE_DEEP}),
    ]).flat(),
    // 底板: 前立面 + 2.5D 顶面斜折 + 双插孔与辅助孔列(管底落此板面)
    svg('rect', {x: -170, y: -14, width: 340, height: 14, rx: 2, fill: PLASTIC, stroke: PLASTIC_EDGE, 'stroke-width': 1.6}),
    svg('path', {d: 'M-170 -14L-160 -20H160L170 -14Z', fill: PLASTIC_TOP, stroke: PLASTIC_EDGE, 'stroke-width': 1.6, 'stroke-linejoin': 'round'}),
    ...[-45, 45].map(x => [
      svg('ellipse', {cx: x, cy: -17, rx: 13, ry: 4.6, fill: HOLE}),
      svg('ellipse', {cx: x, cy: -17.6, rx: 8, ry: 2.6, fill: HOLE_DEEP}),
    ]).flat(),
    ...AUX_X.map(x => [
      svg('ellipse', {cx: x, cy: -17, rx: 5.5, ry: 2, fill: HOLE}),
      svg('ellipse', {cx: x, cy: -17.4, rx: 3, ry: 1.1, fill: HOLE_DEEP}),
    ]).flat(),
    svg('path', {d: 'M-166 -1.6H166', stroke: 'rgb(183 176 158 / 70%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
  )
  group.append(label(entity.label, 0, 30))
  return group
}
