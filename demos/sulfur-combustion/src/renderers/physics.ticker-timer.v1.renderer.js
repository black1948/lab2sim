import {add, label, shadow, svg} from './svg.js'

//  -  电磁打点计时器(119-用打点计时器测匀加速直线运动: 4Hz 电磁打点计时器) - 
// 视觉依据: frame-004 特写(32.5s: 灰色机身, 左侧线圈壳凸包带红褐标签与顶面纸带槽, 
//           正面偏右打点圆盘圆孔, 圆孔右下绿色标签条, 暗光采样机身 #8a8f94 族, 标签绿
//           #3f7d4a 族, 电源线自机身右下引出); frame-002/003 全景(计时器坐板顶端板面, 
//           顶部两根接线柱, 电源线走向画面左下).
// 复用审查否决记录: 注册表无任何打点计时器/计时器条目; galvanometer=电流计(表盘指针), 
//           dry-cell=电池, knife-switch=闸刀开关, wimshurst-generator=静电起电机, 
//           ac-generator=手摇发电机, 均不同物.可信源发现无任何得分矢量文件命中.
// 风格依据: physics.air-glider.v1.renderer.js 的灰色金属体块+顶面斜折+右侧暗部画法, 
//           physics.galvanometer(physics.js renderGalvanometer)的表壳/圆孔语言, 
//           physics.wood-block.v1.renderer.js 的接地阴影与 inline 配色约定.
// 锚点: 局部 (0,0)=底座中心(贴板面); 机身 86 宽×54 高(约 86×64px 契约含凸包总高).
// 状态契约(scene visual.state_bindings 已声明 powered→power.on, stamping→reed.active, 
//           渲染器直接读 state.powered / state.stamping): 
//   state.powered=true → 电源开关滑到通位(nub 右移)+ 圆孔旁指示点变红; 
//   state.stamping=true → 振动片画两位置残影(绕枢轴 ±4° 两片, opacity 交替 0.5/0.3, 
//           静态双残影示意 50Hz 打点, 不要求真振动; 参照 metronome 摆针但不用 CSS 动画, 
//           本资产不新增 styles.css class).
// 契约参数: 无外部参数; 纸带限位孔锚点固定为局部 (±14,−34) - physics/paper-tape.v1 的
//           slot_dx=14/slot_dy=-34 契约偏移即指向右侧耳板槽孔(左侧镜像).
// 证据不清处: ① frame-004 机身正面的圆孔内盘面纹理不可辨, 按深色圆+内环示意; ② 接线柱
//           在帧内被手遮挡, 依全景象与常见器材补形为顶部两根黄铜柱; ③ 电源线出线位置帧间
//           不定(frame-004 右下, frame-002 左下), 按构建方契约"向左下方"绘制.
// 导出签名与模板一致: renderTickerTimer(entity, state, context).
// 集成: renderer 键 physics/ticker-timer(index.js 的 import/注册由构建方完成: 复制本文件到
//           src/renderers/ 并在 index.js 注册 'physics/ticker-timer').

const BODY = '#8a8f94'      // 机身(frame-004 暗光采样归一化)
const BODY_TOP = '#a3a8ad'  // 顶面受光
const BODY_HOUSING = '#90959b' // 线圈壳凸包
const DARK = '#6f747a'      // 侧部/开关座
const EDGE = '#4d5257'      // 描边
const HOLE = '#2b2e31'      // 打点圆盘孔
const RING = '#4a4e54'      // 孔内环
const GREEN = '#3f7d4a'     // 绿色标签(frame-004)
const GREEN_EDGE = '#2c5a35'
const BRASS = '#b8964f'     // 接线柱
const BRASS_EDGE = '#6b5426'
const CORD = '#2e3033'      // 电源线
const RED = '#c93030'       // 通电指示
const REED = '#5a5f66'      // 振动片
const LABEL_RED = '#8a4a38' // 线圈壳红褐标签(frame-004 左上)

export function renderTickerTimer(entity, state = {}, context = {}) {
  const group = svg('g')
  const powered = Boolean(state.powered)
  const stamping = Boolean(state.stamping)
  // 接地阴影 + 电源线(机身左下引出, frame-002 全景走向)
  add(group,
    shadow(0, 4, 54, 6),
    svg('path', {d: 'M-40 -8C-58 -2 -70 8 -78 20', fill: 'none', stroke: CORD, 'stroke-width': 2.5, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-40 -8C-58 -2 -70 8 -78 20', fill: 'none', stroke: '#4a4e54', 'stroke-width': 0.9, 'stroke-linecap': 'round', opacity: 0.7, transform: 'translate(0 -1)'}),
  )
  // 主体(86×54)
  add(group,
    svg('rect', {x: -43, y: -54, width: 86, height: 54, rx: 3, fill: BODY, stroke: EDGE, 'stroke-width': 1.6}),
    // 顶面 2.5D 斜折
    svg('path', {d: 'M-43 -54L-36 -61L36 -61L43 -54Z', fill: BODY_TOP, stroke: EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    // 右侧背光暗部
    svg('rect', {x: 31, y: -54, width: 12, height: 54, rx: 2, fill: '#2e2e2d', opacity: 0.16}),
  )
  // 线圈壳凸包(左侧抬高的块, 顶面带纸带槽 + 红褐标签, frame-004)
  add(group,
    svg('rect', {x: -43, y: -66, width: 37, height: 12, rx: 2, fill: BODY_HOUSING, stroke: EDGE, 'stroke-width': 1.4}),
    svg('path', {d: 'M-43 -66L-38 -71L-13 -71L-8 -66Z', fill: BODY_TOP, stroke: EDGE, 'stroke-width': 1.2, 'stroke-linejoin': 'round'}),
    svg('rect', {x: -30, y: -70, width: 15, height: 4.2, rx: 1.6, fill: '#3a3d42', stroke: EDGE, 'stroke-width': 0.9}),
    svg('rect', {x: -40, y: -63, width: 11, height: 6.5, rx: 1, fill: LABEL_RED, stroke: '#5e3125', 'stroke-width': 0.9}),
  )
  // 顶部两根接线柱(黄铜, frame-002/004)
  for (const px of [14, 28]) {
    add(group,
      svg('rect', {x: px - 2.6, y: -72, width: 5.2, height: 12, rx: 1, fill: '#9aa0a8', stroke: EDGE, 'stroke-width': 1.1}),
      svg('circle', {cx: px, cy: -73.5, r: 3.6, fill: BRASS, stroke: BRASS_EDGE, 'stroke-width': 1.1}),
    )
  }
  // 纸带限位孔耳板(前/后各一, 面板通道耳板, 槽孔锚点局部 (±14,-34))
  for (const side of [-1, 1]) {
    const cx = side * 14
    add(group,
      svg('rect', {x: cx - 7, y: -44, width: 14, height: 14, rx: 2, fill: '#7d8288', stroke: EDGE, 'stroke-width': 1.2}),
      svg('rect', {x: cx - 1.8, y: -42, width: 3.6, height: 10, rx: 1, fill: HOLE}),
    )
  }
  // 打点圆盘圆孔(正面偏右, 深色圆 + 内环, frame-004)
  add(group,
    svg('circle', {cx: 31, cy: -24, r: 10.5, fill: HOLE, stroke: EDGE, 'stroke-width': 1.4}),
    svg('circle', {cx: 31, cy: -24, r: 6.5, fill: 'none', stroke: RING, 'stroke-width': 2}),
    svg('circle', {cx: 31, cy: -24, r: 1.4, fill: RING}),
  )
  // 电源开关(右上, powered 时 nub 右移到通位)
  add(group,
    svg('rect', {x: 29, y: -49, width: 13, height: 9, rx: 1.5, fill: DARK, stroke: EDGE, 'stroke-width': 1.1}),
    svg('rect', {x: powered ? 37 : 30.5, y: -47.5, width: 4.5, height: 6, rx: 1, fill: '#d7dce1', stroke: EDGE, 'stroke-width': 0.8}),
  )
  // 通电指示点(圆孔旁, powered 变红)
  group.append(svg('circle', {cx: 17.5, cy: -47, r: 2.5, fill: powered ? RED : '#3d4146', stroke: EDGE, 'stroke-width': 0.9}))
  // 绿色标签条(圆孔左下, frame-004 右下绿标)
  const greenText = svg('text', {x: -20, y: -11.4, 'text-anchor': 'middle', fill: '#eaf2ec', 'font-size': 4.9, opacity: 0.95})
  greenText.textContent = 'Electromagnetic ticker timer'
  add(group,
    svg('rect', {x: -38, y: -18, width: 36, height: 9.5, rx: 1.2, fill: GREEN, stroke: GREEN_EDGE, 'stroke-width': 1}),
    greenText,
  )
  // 振动片: 枢轴在线圈壳右缘(-8,-58), 静止单片微垂; stamping 时画 ±4° 两位置残影
  //(opacity 0.5/0.3 交替叠印示意 50Hz 打点, 不要求真振动)
  const reedLine = (angle, opacity) => {
    const holder = svg('g', {transform: `translate(-8 -58) rotate(${angle})`})
    holder.append(svg('line', {x1: 0, y1: 0, x2: 39, y2: 20, stroke: REED, 'stroke-width': 3.4, 'stroke-linecap': 'round', opacity}))
    return holder
  }
  if (stamping) {
    group.append(reedLine(-4, 0.5), reedLine(4, 0.3))
  } else {
    group.append(reedLine(1.5, 0.92))
  }
  group.append(label(entity.label, 0, 22))
  return group
}
