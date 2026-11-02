import {add, label, shadow, svg} from './svg.js'

//  -  斜面木板(119-用打点计时器测匀加速直线运动: 左端垫木块的斜置长木板, 板面带刻度) - 
// 视觉依据: frame-002/003 全景(浅色长木板, 左端垫深红棕木块, 板自左上向右下缓倾约 4°, 
//           板面前沿一整排黑色刻度短线, 顶面浅木色受光); frame-008 板面特写(刻度更密, 
//           板面有手写"310"式浅色标记); frame-005/006(小车与纸带压在板面上滑行, 板面
//           无导轨/无支脚, 直接坐垫块与桌面).
// 复用审查否决记录: physics.slope.v1=20° 实心木质楔形体(三角截面+立柱); physics.incline.prop.v1=
//           24 案例带支架轨道板(两根立柱落地+倾角标注弧); physics.board.v1=水平实验板; 
//           physics.demo-track.v1=106 案例蓝色扁平轨道(深蓝配色, 两端挡边); physics.optical-bench.v1=
//           铝型材导轨(金属色+白色标尺+支脚).均与"垫块上的斜置刻度木板"形/色/语义不符, 
//           不得顶替.可信源发现命中 twbs/icons airplane-engines-fill(飞机发动机图标), 形状
//           语义无关已回滚.
// 风格依据: physics.demo-track.v1.renderer.js 的板件三段画法(顶面受光条+前立面+下段压深)
//           与接地阴影约定; physics.js renderIncline 的斜面角参数化; 刻度线用 svg.js markings
//           的长短刻度语言(改为沿板面分布, 内联配色).
// 锚点: 局部 (0,0)=板顶端板面点(scene 已按此摆放); 板自原点沿 +x(屏幕右下方, 屏幕系
//           dx=cosθ, dy=+sinθ, θ=angle_deg)延伸 length_px.
// 契约参数(entity.properties, 全带缺省回退 - resolve_assets 只拷白名单键, 缺省值是双保险): 
//           length_px=620, angle_deg=4.4, thickness_px=12.
// 状态语义: 纯静态件, 无状态绑定.
// 证据不清处: ① frame-002/003 板右端有一个白色小栓/滑轮(画幅边缘虚焦), 不属本资产契约, 
//           未绘制; ② 板面刻度为黑白相间前沿刻度尺(数量多于每 50px 一刻), 按契约"每 50px
//           一长刻度, 中间短刻度"示意; ③ 手写标记内容不可全辨, 按 frame-008 画"I, 310"式
//           浅色手写风小字, 不必可读.
// 导出签名与模板一致: renderTickerBoard(entity, state, context).
// 集成: renderer 键 physics/ticker-board(index.js 的 import/注册由构建方完成: 复制本文件到
//           src/renderers/ 并在 index.js 注册 'physics/ticker-board').

const TOP_LIT = '#e3d6b4'   // 顶面受光条(frame-002 浅木板顶面, 低照度归一化提亮)
const FACE = '#cfc09a'      // 前立面主色
const FACE_DEEP = '#b9a97f' // 前立面下段压深
const EDGE = '#6b5a38'      // 描边/底缘
const INK = '#3a3428'       // 刻度墨色
const NOTE = '#8a7a58'      // 手写标记浅色

export function renderTickerBoard(entity, state = {}, context = {}) {
  const group = svg('g')
  const props = entity?.properties || {}
  const lengthPx = Math.max(120, Number(props.length_px ?? 620))
  const thick = Math.max(6, Number(props.thickness_px ?? 12))
  const rad = (Number(props.angle_deg ?? 4.4) * Math.PI) / 180
  const ex = lengthPx * Math.cos(rad)   // 板末端屏幕 x
  const ey = lengthPx * Math.sin(rad)   // 板末端屏幕 y(下倾)
  const along = s => `${(s * Math.cos(rad)).toFixed(1)} ${(s * Math.sin(rad)).toFixed(1)}`
  // 接地阴影: 沿板底缘的旋转椭圆
  const shX = ex / 2
  const shY = ey + thick + 4
  const groundShadow = svg('ellipse', {
    cx: shX.toFixed(1), cy: shY.toFixed(1), rx: (ex / 2 + 24).toFixed(1), ry: 6,
    class: 'apparatus-shadow', transform: `rotate(${(rad * 180 / Math.PI).toFixed(2)} ${shX.toFixed(1)} ${shY.toFixed(1)})`,
  })
  group.append(groundShadow)
  // 顶面受光条(表面上方 6px 的窄带)
  group.append(svg('path', {
    d: `M0 0L${along(lengthPx)}L${(ex).toFixed(1)} ${(ey - 6).toFixed(1)}L0 -6Z`,
    fill: TOP_LIT, stroke: EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round',
  }))
  // 前立面(板厚)+ 下段压深
  group.append(svg('path', {
    d: `M0 0L${along(lengthPx)}L${ex.toFixed(1)} ${(ey + thick).toFixed(1)}L0 ${thick}Z`,
    fill: FACE, stroke: EDGE, 'stroke-width': 1.6, 'stroke-linejoin': 'round',
  }))
  group.append(svg('path', {
    d: `M0 ${thick - 4}L${along(lengthPx)}L${ex.toFixed(1)} ${(ey + thick).toFixed(1)}L0 ${thick}Z`,
    fill: FACE_DEEP,
  }))
  // 前缘亮线 + 底缘线
  add(group,
    svg('line', {x1: 2, y1: 1.2, x2: (ex - 2).toFixed(1), y2: (ey + 1.2).toFixed(1), stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    svg('line', {x1: 1, y1: thick - 0.6, x2: (ex - 1).toFixed(1), y2: (ey + thick - 0.6).toFixed(1), stroke: EDGE, 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
  )
  // 板面刻度: 每 50px 一长刻度(9px), 中间 25px 处短刻度(4.5px), 自表面向下画入前立面
  const ticks = svg('g', {stroke: INK, 'stroke-width': 1, 'stroke-linecap': 'round'})
  for (let s = 0; s <= lengthPx; s += 25) {
    const tx = s * Math.cos(rad)
    const ty = s * Math.sin(rad) + 1.5
    const len = s % 50 === 0 ? 9 : 4.5
    ticks.append(svg('line', {x1: tx.toFixed(1), y1: ty.toFixed(1), x2: tx.toFixed(1), y2: (ty + len).toFixed(1), 'stroke-width': s % 50 === 0 ? 1.3 : 1}))
  }
  group.append(ticks)
  // 近顶端板面手写风小字(frame-008 "I, 310"式标记, 浅色, 不必可读)
  const noteX = 120 * Math.cos(rad)
  const noteY = 120 * Math.sin(rad) + 11
  const note = svg('text', {
    x: noteX.toFixed(1), y: noteY.toFixed(1), 'text-anchor': 'middle',
    fill: NOTE, opacity: 0.62, 'font-size': 10, 'font-family': 'cursive',
    transform: `rotate(${(rad * 180 / Math.PI).toFixed(2)} ${noteX.toFixed(1)} ${noteY.toFixed(1)})`,
  })
  note.textContent = 'I, 310'
  group.append(note)
  group.append(label(entity.label, (ex / 2).toFixed(1), (ey + thick + 24).toFixed(1)))
  return group
}
