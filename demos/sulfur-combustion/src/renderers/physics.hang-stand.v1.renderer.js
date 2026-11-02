import {add, label, shadow, svg} from './svg.js'

//  -  悬挂法支架(kind=iron_stand 的变体 physics.hang-stand.v1, 118-用悬挂法确定薄板的
// 重心; scene renderer=physics/hang-stand, 实体 hang-stand-1; physics.iron-stand.v1 仍为
// kind=iron_stand 的 default) - 
// 视觉依据: frame-001 全景(深色铁架: 沉重亮面黑底座+立杆, 杆顶接一段向左下伸的横臂, 
//           臂端朝下小销钉, 薄板穿在销钉上); frame-004 近景(横臂臂端夹座+黄铜滚花旋钮
//           在上, 销钉尖端朝下穿板孔); frame-014 近景实拍(支架横臂与销钉, 重垂线同框).
//           底座近黑, 杆臂深灰有白高光 - 低照度采样归一化后沿用既有 stand 系配色.
// 复用审查否决记录: physics.iron-stand.v1(chemistry.js renderIronStand: 独杆+夹持爪+
//           铁环, 无顶部横臂与臂端销钉)形制不符 - 本实验横臂端悬销挂板, 铁环无处安放, 
//           按预声明否决, 不改其默认; 可信源发现命中 chemistry.iron-stand.pin.v1(图标
//           glyph, "pin" 词元误配)已回滚出注册表并删除其 svg.
// 风格依据: chemistry.js renderIronStand 的 stand / stand-base / clamp / clamp-knob 既有
//           class 与体块画法(深灰杆件+白高光线+黄铜旋钮+近黑底座, 契约 B 指定), 
//           apparatus-shadow 接地阴影; 配色全部走既有 class 或内联, 不新增 styles.css class.
// 局部几何(y 向下, 比例 1:1px; 与契约 B 逐条一致): 
//   (0,0)=横臂端销钉尖端(scene anchors.pin=(0,0) 即此点).销钉: 暗色小钉, 杆
//   (0,-12)→(0,-3), 尖端三角至 (0,0), 钉上夹座 rect x∈[-6,6], y∈[-20,-12], 夹座顶黄铜
//   滚花旋钮 (0,-24.5) r4.5.横臂自 (-2,-16) 至 (120,2)(右下斜 ~+120px, 契约), 双线
//   体块+白高光.杆夹座 rect x∈[113,131], y∈[-8,16](含黄铜侧旋钮 (127,4)).立杆
//   x=122: 自 y=-10 至 y=275(杆下段 ~275px, 契约).底座梯形 x∈[52,192](~140px 宽, 
//   契约), y∈[268,304], 亮面黑(stand-base)+白高光+三只圆脚.
// 状态契约: 静态器材, 无状态绑定.薄板挂孔后原点即销钉尖端(板渲染器在孔位再画销钉头
//   覆盖, 两层在 (0,0) 对齐).锚点: snap_anchor=pin=(0,0)(契约).
// 证据不清处: ① 底座正面高光纹理在 352×288 下只剩两道亮斑, 按亮面金属示意; ② 横臂与
//   立杆的连接件被虚焦截断, 按夹座+滚花旋钮示意(frame-004 可见旋钮轮廓); ③ 片源横臂
//   略带弧度, 按直臂化处理(与契约"顶部横臂"一致).
// 集成: renderer 键 physics/hang-stand(index.js 的 import/注册由构建方完成: 复制本文件
//   到 src/renderers/ 并注册 'physics/hang-stand').上下文 visual 可忽略.

const PIN = '#4a545c'        // 销钉(暗色小钉)
const PIN_DARK = '#2f3a3e'
const ARM_EDGE = '#5b6a6d'   // 臂缘暗线(clamp 描边族)
const HIGHLIGHT = 'rgb(255 255 255 / 45%)'
const FOOT = '#172023'       // 底座圆脚(stand-base 深色族)

export function renderHangStand(entity, state = {}, context = {}) {
  const group = svg('g')
  add(group,
    // 接地阴影 + 底座(亮面黑, ~140px 宽)
    shadow(122, 306, 80, 7),
    svg('path', {d: 'M78 268 L166 268 L188 294 Q192 304 180 304 L64 304 Q52 304 56 294 Z', class: 'stand-base'}),
    svg('line', {x1: 80, y1: 269.5, x2: 164, y2: 269.5, stroke: HIGHLIGHT, 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    svg('line', {x1: 92, y1: 281, x2: 150, y2: 281, stroke: 'rgb(255 255 255 / 14%)', 'stroke-width': 3, 'stroke-linecap': 'round'}),
    svg('ellipse', {cx: 66, cy: 304, rx: 7, ry: 3.5, fill: FOOT}),
    svg('ellipse', {cx: 122, cy: 305.5, rx: 8, ry: 3.8, fill: FOOT}),
    svg('ellipse', {cx: 180, cy: 304, rx: 7, ry: 3.5, fill: FOOT}),
    // 立杆(x=122, 杆顶略高出横臂上方 - frame-004 可见)
    svg('line', {x1: 122, y1: -10, x2: 122, y2: 275, class: 'stand'}),
    svg('line', {x1: 120.4, y1: -6, x2: 120.4, y2: 272, stroke: HIGHLIGHT, 'stroke-width': 1.2, 'stroke-linecap': 'round'}),
    svg('ellipse', {cx: 122, cy: -10, rx: 3, ry: 1.2, fill: '#8a949c'}),
    // 杆夹座(横臂与立杆的连接件)+ 黄铜侧旋钮
    svg('rect', {x: 113, y: -8, width: 18, height: 24, rx: 2, class: 'clamp'}),
    svg('circle', {cx: 127, cy: 4, r: 4.5, class: 'clamp-knob'}),
    // 横臂((-2,-16)→(120,2), 右下斜)双线体块 + 白高光
    svg('path', {d: 'M-2 -16 L120 2', class: 'clamp', 'stroke-width': 7, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-2 -18.5 L120 -0.5', stroke: HIGHLIGHT, 'stroke-width': 1.4, 'stroke-linecap': 'round', fill: 'none'}),
    svg('path', {d: 'M-2 -13 L120 4.5', stroke: ARM_EDGE, 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: 0.6, fill: 'none'}),
    // 臂端夹座 + 黄铜滚花旋钮(在上 - frame-004)
    svg('rect', {x: -6, y: -20, width: 12, height: 8, rx: 1.5, class: 'clamp'}),
    svg('circle', {cx: 0, cy: -24.5, r: 4.5, class: 'clamp-knob'}),
    svg('line', {x1: -3.2, y1: -27.2, x2: -1.4, y2: -28.4, stroke: '#5c5133', 'stroke-width': 0.9, 'stroke-linecap': 'round'}),
    svg('line', {x1: -0.4, y1: -28.8, x2: 1.4, y2: -28, stroke: '#5c5133', 'stroke-width': 0.9, 'stroke-linecap': 'round'}),
    // 销钉: 暗色小钉, 尖端朝下在 (0,0)
    svg('line', {x1: 0, y1: -12, x2: 0, y2: -3, stroke: PIN, 'stroke-width': 2.6, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-1.7 -3 L1.7 -3 L0 0 Z', fill: PIN, stroke: PIN_DARK, 'stroke-width': 0.6}),
  )
  group.append(label(entity.label, 122, 324))
  return group
}
