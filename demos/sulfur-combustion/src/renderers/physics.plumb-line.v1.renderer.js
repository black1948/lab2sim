import {add, label, svg} from './svg.js'

//  -  重垂线(kind=plumb_line 的 default physics.plumb-line.v1, 118-用悬挂法确定薄板的
// 重心; scene renderer=physics/plumb-line, 实体 plumb-line-1) - 
// 视觉依据: frame-014 近景实拍(细线自销钉垂下, 线端小金属锤: 顶部蘑菇形提头+两段钢色
//           圆柱锤体 - 非球形; 线竖直垂在薄板板面前); frame-013 宽景实拍(重垂线自支架
//           销钉垂下); frame-011 演示图(竖直线过板面即沿重垂线描迹的示意).frame-014
//           局部虚焦, 锤体采样仅可辨"亮帽/暗筒"两段钢色 - 归一化借用 physics.pendulum-bob
//           的钢色族(亮 #c9ced2, 筒 #9aa2a8, 缘 #5a626a).
// 复用审查否决记录: physics.pendulum-bob.v1(系线钢球摆锤: 球形锤+摆动状态语义) - 重垂线
//           锤为圆柱+提头, 无任何状态, 语义不符, 按预声明否决, 不改其默认; 可信源发现命中
//           chemistry.plumb-line.arrows-collapse-vertical.v1(图标 glyph, 词元误配)已回滚出
//           注册表并删除其 svg.
// 风格依据: physics.pendulum-bob.v1 的摆线细线画法(class string-line, 圆帽 1.3px 中灰)
//           与钢色配色; 锤体用 chemistry.js 的描边体块画法(fill+深缘+白高光, 内联).
//           配色内联, 不新增 styles.css class.
// 局部几何(y 向下, 比例 1:1px; 与契约 C 逐条一致): 
//   (0,0)=线顶(挂在销钉尖端=scene anchors.line=(0,0)).细竖直线 (0,0)→(0,L), 
//   L=properties.string_len_px(缺省 250, 契约).锤体挂线端: 提头帽 rect x∈[-8,8], 
//   y∈[L,L+6](~16px 宽, 契约"narrow bbox"); 颈 rect x∈[-3,3], y∈[L+6,L+9]; 锤身圆柱
//   rect x∈[-6.5,6.5], y∈[L+9,L+22](左白高光右暗影两段钢色)+底缘.总高 L+22, 
//   bbox x∈[-8.6,8.6].
// 状态契约: 静态器材, 无状态(始终竖直, 契约"always vertical, no state").properties
//   只读 string_len_px, 无外部状态硬编码.
// 证据不清处: ① 锤体各段高度比例在 352×288 下不可精读(锤全高 ~20px 虚影), 按提头:颈:
//   锤身 ≈ 6:3:13 的常见重垂锤比例示意; ② 片源线自销钉上的细线挂下, 契约即以线顶=销钉
//   尖端, 一致; ③ 实拍线略贴板面(在板前), 层级由 scene z 序(plumb-line-1 z40 > 板 z30)
//   保证, 渲染器不处理.
// 集成: renderer 键 physics/plumb-line(index.js 的 import/注册由构建方完成: 复制本文件
//   到 src/renderers/ 并注册 'physics/plumb-line').上下文 visual 可忽略.

const THREAD = '#6f767e'     // 细线(string-line 族)
const STEEL_LIT = '#c9ced2'  // 提头亮钢
const STEEL_MID = '#9aa2a8'  // 锤身钢
const STEEL_DARK = '#5a626a' // 缘
const DEFAULT_LEN = 250      // 契约缺省线长

export function renderPlumbLine(entity, state = {}, context = {}) {
  const group = svg('g')
  const props = entity.properties || {}
  const len = Number.isFinite(Number(props.string_len_px)) && Number(props.string_len_px) > 0
    ? Number(props.string_len_px) : DEFAULT_LEN
  add(group,
    // 细竖直线(pendulum-bob 摆线画法)
    svg('line', {x1: 0, y1: 0, x2: 0, y2: len, stroke: THREAD, 'stroke-width': 1.3, 'stroke-linecap': 'round', class: 'string-line'}),
    // 提头帽(蘑菇形, ~16px 宽)
    svg('rect', {x: -8, y: len, width: 16, height: 6, rx: 3, fill: STEEL_LIT, stroke: STEEL_DARK, 'stroke-width': 1.1}),
    svg('line', {x1: -5, y1: len + 1.4, x2: 3, y2: len + 1.4, stroke: 'rgb(255 255 255 / 60%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
    // 颈
    svg('rect', {x: -3, y: len + 6, width: 6, height: 3, fill: '#8a929a', stroke: STEEL_DARK, 'stroke-width': 0.8}),
    // 锤身圆柱(两段钢色: 左高光右暗影)
    svg('rect', {x: -6.5, y: len + 9, width: 13, height: 13, rx: 1.5, fill: STEEL_MID, stroke: STEEL_DARK, 'stroke-width': 1.1}),
    svg('line', {x1: -3.8, y1: len + 10.5, x2: -3.8, y2: len + 20.5, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
    svg('line', {x1: 4.4, y1: len + 10.5, x2: 4.4, y2: len + 20.5, stroke: '#6f767e', 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: 0.8}),
    svg('ellipse', {cx: 0, cy: len + 22, rx: 6.5, ry: 1.6, fill: '#7d858c', stroke: STEEL_DARK, 'stroke-width': 0.9}),
  )
  group.append(label(entity.label, 0, len + 38))
  return group
}
