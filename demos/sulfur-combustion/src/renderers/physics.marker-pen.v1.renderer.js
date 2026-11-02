import {add, label, shadow, svg} from './svg.js'

//  -  记号笔(kind=marker_pen 的 default physics.marker-pen.v1, 118-用悬挂法确定薄板的
// 重心; scene renderer=physics/marker-pen, 实体 marker-pen-1) - 
// 视觉依据(如实说明: 形制为推断): 全片 22 帧中记号笔从未入画 - frame-002/003 仅见
//           板面已画的深色迹线与蓝色高亮线(描迹动作在画外发生), frame-004/014 亦无笔.
//           故按中学实验室白板记号笔的通行形制(笔杆+笔帽+凿形笔尖, ~70mm 量级)推断, 
//           配色取实验室主题蓝(迹线蓝 #33518e 同族, 与片中蓝色高亮迹线呼应)+深炭笔杆.
// 复用审查否决记录: 注册表内无可复用的笔/棒类资产; 可信源发现命中
//           chemistry.marker-pen.highlighter.v1(图标 glyph, 位图示意风与本模板体块画法
//           不符, 且误注册入 chemistry-core)已回滚出注册表并删除其 svg.
// 风格依据: chemistry.js 的描边体块画法(fill+深缘+白高光, 内联)与 clamp-knob 黄铜件
//           的点缀习惯; apparatus-shadow 接地阴影(renderWeight 恒画先例 - 挂空时为低
//           透明度淡影, 构建方可裁量删除).配色内联, 不新增 styles.css class.
// 局部几何(y 向下, 比例 1:1px; 与契约 D 逐条一致): 
//   (0,0)=笔身中心; 整笔微倾躺放 rotate(-8°)(契约"slightly tilted lying").笔帽
//   rect x∈[-33,-16], y∈[-6.25,6.25](蓝帽+笔夹); 笔杆 rect x∈[-16,24], 
//   y∈[-5.5,5.5](深炭杆+米白标带); 锥颈 x∈[24,27.5]; 凿形笔尖 x∈[27.5,33]
//   (右端平凿边).总长 ~66px(含描边 ~67px, 契约 ~70px 量级); 桌上带阴影.
// 状态契约: 静态器材, 无状态绑定.properties 无.
// 证据不清处: ① 笔的形制/颜色全部为推断(无帧证据), 构建方如需对齐课程实拍可替换
//    - 此为已知并如实声明的推断项; ② 标带上不作文字印刷(352×288 片源分辨率下不可读, 
//   按留白标带示意).
// 集成: renderer 键 physics/marker-pen(index.js 的 import/注册由构建方完成: 复制本文件
//   到 src/renderers/ 并注册 'physics/marker-pen').上下文 visual 可忽略.

const CAP_BLUE = '#33518e'     // 笔帽(与片中蓝色高亮迹线同族的实验室蓝)
const CAP_DARK = '#26406f'
const BODY = '#3f474c'         // 笔杆深炭
const BODY_DARK = '#2b3236'
const BAND = '#e8e6df'         // 标带米白
const TIP = '#6b7278'          // 凿形笔尖
const TIP_DARK = '#4a545c'

export function renderMarkerPen(entity, state = {}, context = {}) {
  const group = svg('g')
  add(group,
    shadow(2, 12, 36, 5),
  )
  const pen = svg('g', {transform: 'rotate(-8)'})
  add(pen,
    // 笔杆(深炭)+ 米白标带
    svg('rect', {x: -16, y: -5.5, width: 40, height: 11, rx: 2.5, fill: BODY, stroke: BODY_DARK, 'stroke-width': 1.2}),
    svg('rect', {x: -4, y: -5.5, width: 14, height: 11, fill: BAND}),
    svg('line', {x1: -14, y1: -3.2, x2: 20, y2: -3.2, stroke: 'rgb(255 255 255 / 40%)', 'stroke-width': 1, 'stroke-linecap': 'round'}),
    // 笔帽(蓝)+ 笔夹
    svg('rect', {x: -33, y: -6.25, width: 17, height: 12.5, rx: 3, fill: CAP_BLUE, stroke: CAP_DARK, 'stroke-width': 1.2}),
    svg('rect', {x: -31, y: -9.5, width: 3, height: 8, rx: 1.2, fill: CAP_DARK}),
    svg('line', {x1: -30.5, y1: -3.6, x2: -19.5, y2: -3.6, stroke: 'rgb(255 255 255 / 35%)', 'stroke-width': 1.1, 'stroke-linecap': 'round'}),
    // 锥颈 + 凿形笔尖(右端平凿边)
    svg('rect', {x: 24, y: -4.5, width: 3.5, height: 9, fill: BODY_DARK}),
    svg('path', {d: 'M27.5 -3.5 L33 -1.6 L33 1.6 L27.5 3.5 Z', fill: TIP, stroke: TIP_DARK, 'stroke-width': 0.9, 'stroke-linejoin': 'round'}),
  )
  group.append(pen)
  group.append(label(entity.label, 0, 30))
  return group
}
