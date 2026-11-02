import {add, label, shadow, svg} from './svg.js'

//  -  木板端定滑轮(120-用打点计时器演示匀速直线运动: 板右端小型导绳件) - 
// 视觉依据: frame-001/006(17.5s 全景: 板右端伸出一小型灰色导绳件, 虚焦小轮/栓, 绳沿
//           板面绕过其顶后垂直向下吊桶), frame-012/014(滑行中同一位置, 绳绷直).
//           虚焦件按形制补形: 金属夹脚固在板端面, 短悬臂外伸, 端头小滑轮(轮顶与板面
//           齐平, 绳走轮顶).暗光采样归一化: 金属件 #9aa0a8/#b9bcbf, 轮体 #b9bcbf, 
//           描边 #55584f.
// 复用审查否决记录: physics.pulley.v1(builtin)为 r=16 竖架吊装滑轮 - bracket 朝上
//           (M0-16V-24L-6-30H6Z 挂钩架), 供吊挂于支架钩使用; 本片为板端夹持脚+悬臂
//           小轮伸出板端, 轮轴水平, 轮顶与板面齐平的装向, 结构(无夹脚/悬臂方向相反)
//           与朝向均不符; visual.scale 缩放解决不了 bracket 朝向(旋转 180° 会让 bracket
//           压在板内且无夹脚形状), 不诚实 - 否决复用, 按构建方契约生成
//           physics.ticker-end-pulley.v1.可信源发现因 GitHub API 403 rate limit 不可用.
// 风格依据: physics.pulley.v1 的轮体/轮槽/轴心画法(r 缩小, 换装向), physics.js
//           renderWallBracket 的金属 bracket 配色(metal-bracket 族灰), 
//           physics.ticker-cart.v1 的 inline 配色约定.配色 inline, 不新增 styles.css
//           class.
// 锚点: 局部 (0,0)=轮心.夹脚在轮心左侧(-x 侧, 即板内方向), 悬臂长 22px; 板端面
//           应位于轮心左侧约 12px 处(scene 摆位契约: world['pulley-1'] 屏幕位即轮心, 
//           string/cup 渲染器以此为绳几何基准, 绳绕点=轮心上方 pulley_top_px=8=轮半径).
// 状态契约: 纯静态无状态绑定(定滑轮不随状态形变).
// 契约参数: 无外部参数(轮半径 8 与 ticker-drive-string 的 pulley_top_px=8 契约对应, 
//           改轮径必须同步该参数).
// 证据不清处: ① 虚焦严重, 轮径/夹脚形制按"轮顶与板面齐平, 绳过轮顶即垂直下落"反推
//           补形; ② 夹脚是夹板端面还是销入板端孔不可辨, 按端面夹脚(两爪+紧固钮)补形.
// 导出签名与模板一致: renderTickerEndPulley(entity, state, context).
// 集成: renderer 键 physics/ticker-end-pulley(index.js 的 import/注册由构建方完成: 
//           复制本文件到 src/renderers/ 并在 index.js 注册 'physics/ticker-end-pulley').

const METAL = '#9aa0a8'      // 夹脚/悬臂(frame-006 虚焦灰)
const METAL_LIT = '#b9bcbf'  // 轮体受光
const METAL_DARK = '#7d8288' // 金属暗部
const EDGE = '#55584f'       // 描边

export function renderTickerEndPulley(entity, state = {}, context = {}) {
  const group = svg('g')
  add(group,
    // 接地阴影(板端面处窄条)
    shadow(-8, 10, 18, 3.5),
    // 板端夹脚(两爪夹板端面, 紧固钮在下) - 板内方向为 -x
    svg('rect', {x: -34, y: -6, width: 22, height: 12, rx: 1.5, fill: METAL, stroke: EDGE, 'stroke-width': 1.3}),
    svg('rect', {x: -30, y: 6, width: 5, height: 6, rx: 1, fill: METAL_DARK, stroke: EDGE, 'stroke-width': 1}),
    svg('rect', {x: -19, y: 6, width: 5, height: 6, rx: 1, fill: METAL_DARK, stroke: EDGE, 'stroke-width': 1}),
    svg('circle', {cx: -28.5, cy: 0, r: 1.6, fill: METAL_DARK, stroke: EDGE, 'stroke-width': 0.8}),
    // 悬臂外伸(+x = 板端外)
    svg('rect', {x: -12, y: -2.4, width: 12, height: 4.8, rx: 1.4, fill: METAL, stroke: EDGE, 'stroke-width': 1.2}),
  )
  // 小滑轮(r=8, 轮顶即绳绕点, 与 ticker-drive-string pulley_top_px=8 契约对应)
  add(group,
    svg('circle', {cx: 0, cy: 0, r: 8, fill: METAL_LIT, stroke: EDGE, 'stroke-width': 1.4}),
    svg('circle', {cx: 0, cy: 0, r: 5.2, fill: 'none', stroke: METAL_DARK, 'stroke-width': 1.4}),
    svg('circle', {cx: 0, cy: 0, r: 1.8, fill: METAL_DARK, stroke: EDGE, 'stroke-width': 0.8}),
    // 轮顶高光(绳绕过处)
    svg('path', {d: 'M-4.6 -6.4A8 8 0 0 1 4.6 -6.4', fill: 'none', stroke: '#d7d9db', 'stroke-width': 1.2, opacity: 0.9}),
    // 轴座连接
    svg('rect', {x: -5, y: -2, width: 5, height: 4, rx: 1, fill: METAL_DARK, stroke: EDGE, 'stroke-width': 0.9}),
  )
  group.append(label(entity.label, -6, 22))
  return group
}
