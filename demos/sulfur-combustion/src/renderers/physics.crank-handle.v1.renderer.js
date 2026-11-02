import {add, shadow, svg} from './svg.js'

//  -  起电机摇柄(kind=crank_handle, 小件) - 
// 证据帧: frame-007(起电机底座前方带轮与摇柄轴近景: L 形金属曲柄自轴座伸出, 末端向下
//          的深色木柄); frame-032(讲师摇动时曲柄处于竖直位附近, 木柄在手下方).
// 复用否决理由: 四域注册表无 handle/crank 类条目; physics.pulley(滑轮组吊重语义), 
//          physics.wall-bracket(壁装支架)形状语义均不符; 可信源发现运行无评分通过文件
//          (discover_apparatus.py "no scored vector file matched", 
//          trace assets/discover-crank_handle), 故代码原生生成.
// 风格基础: physics.js renderPulley 的金属曲臂画法(class metal/metal-bracket + screw 轴点)
//          与木质件内联配色(先例 renderMeterStick 木色系); apparatus-shadow 接地阴影
//          不适用(悬空小件, 仅画轴座投影省略) - 本件不画 shadow, 避免漂浮投影错位.
// 状态语义: 无状态字段; IR 中 crank-handle 为独立实体(z 序 12, gap electrostatic_generator
//          0.02), 由场景/编舞控制位姿; 渲染器只画 L 形柄本体(金属曲臂 + 木柄), 不画
//          转轴轴座(轴座由 physics.wimshurst-generator.v1 在 (0,-30) 处绘制, 两件对接).
// 关键尺寸(局部原点=曲柄轴心=与起电机轴座对接点; 注意: 小件原点偏离"底座中心"约定, 
//   属任务已备案的小件特例, 对接基准是轴心而非台面): 
//   轴毂 r=5.5 于 (0,0); 金属曲臂 (0,0)→(24,-10)(宽 5.5, 圆帽); 臂端肘点 r=3; 
//   木柄竖直向下 (24,-10)→(24,16)(宽 7.5, 圆帽, 木色 #8a5a34/#5f3a20 + 受光线).
//   外接盒约 x∈[-7,28], y∈[-14,17], 总尺寸约 35×31px.
// 证据不清处: 木柄确色在低照度帧不可精确采样(目测深棕), 取 #8a5a34 中稳值; 曲柄转动
//   角度由编舞/场景驱动(渲染器不内置动画).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/crank-handle'
//   (import {renderCrankHandle} from './physics.crank-handle.v1.renderer.js').

const ARM_METAL = '#b4c0c2'
const ARM_EDGE = '#5b6a6d'
const WOOD = '#8a5a34'
const WOOD_EDGE = '#5f3a20'

export function renderCrankHandle(entity, state = {}, context = {}) {
  const group = svg('g')
  add(group,
    // 金属曲臂: 轴心 → 肘点
    svg('line', {x1: 0, y1: 0, x2: 24, y2: -10, stroke: ARM_EDGE, 'stroke-width': 7.5, 'stroke-linecap': 'round'}),
    svg('line', {x1: 0, y1: 0, x2: 24, y2: -10, stroke: ARM_METAL, 'stroke-width': 5.5, 'stroke-linecap': 'round'}),
    // 木柄: 肘点竖直向下(frame-007/032 静置时柄垂下)
    svg('line', {x1: 24, y1: -10, x2: 24, y2: 16, stroke: WOOD_EDGE, 'stroke-width': 7.5, 'stroke-linecap': 'round'}),
    svg('line', {x1: 24, y1: -10, x2: 24, y2: 16, stroke: WOOD, 'stroke-width': 5.5, 'stroke-linecap': 'round'}),
    svg('line', {x1: 22.6, y1: -7, x2: 22.6, y2: 12, stroke: 'rgb(255 255 255 / 30%)', 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
    // 轴毂盖住曲臂起点
    svg('circle', {cx: 0, cy: 0, r: 5.5, fill: '#8f959c', stroke: ARM_EDGE, 'stroke-width': 1.6}),
    svg('circle', {cx: 0, cy: 0, r: 1.8, class: 'screw'}),
    svg('circle', {cx: 24, cy: -10, r: 3, fill: '#8f959c', stroke: ARM_EDGE, 'stroke-width': 1.2}),
  )
  return group
}
