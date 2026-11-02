import {add, label, shadow, svg} from './svg.js'

//  -  压强计探头(kind=membrane_probe; 117-用微小压强计演示超重于失重) - 
// 视觉依据: frame-007(特写最清晰: 橙红截锥座底大顶小, 顶面蒙深色橡皮膜, 铬砝码坐膜上, 
//           底部接乳胶管), frame-019/031(手持态: 锥座底部有一圈外翻底缘, 膜缘在锥顶
//           呈深色环), frame-001(探头侧躺在台面: 膜面与底缘同色橙红).橙红锥体暗光
//           采样 #702805/#832b03(p75)→按模板亮色调归一化取 #d95422(亮部 #f0713a, 
//           暗部 #a83812, 描边 #8f3210); 橡皮膜深棕红 #5a2a22(frame-007 膜缘采样
//           #70534d 去黄归一).
// 局部原点 = 底面中心(坐放/手持两用, 底面平).
// 几何(scale=1): 底宽 52(x±26)+ 底缘外翻 ±28, 顶宽 40(x±20), 锥体高 58, 
//           膜面顶 y≈-62, 总高 ≈62(契约建议 ≈64, 构建方 scale 1.3 放大); 底部右侧
//           短管嘴(接口局部坐标见 design_notes).
// 状态契约: state.loaded=true 时膜面中央微下凹 1.5px(砝码坐膜, frame-007; 可选增强, 
//           不影响其余绘制).
// 参数契约: context.visual 无必需参数; 可选 membrane_sag_px(缺省 1.5).
// 风格依据: physics.js renderWeight 的体块+受光面+接地阴影两色阶画法, 配色 inline, 
//           不新增 styles.css class.
// 导出签名与模板一致: renderMembraneProbe(entity, state, context).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/membrane-probe'.

const CONE = {body: '#d95422', light: '#f0713a', dark: '#a83812', stroke: '#8f3210'}
const MEMBRANE = '#5a2a22'
const MEMBRANE_EDGE = '#3f1b15'

export function renderMembraneProbe(entity, state = {}, context = {}) {
  const visual = context.visual || {}
  const sag = Number(visual.membrane_sag_px ?? 1.5)
  const loaded = Boolean(state.loaded)
  const group = svg('g')

  group.append(shadow(0, 3, 30, 5.5))

  // 橙红截锥座(底大顶小, 侧壁左受光右背光)+ 底部外翻底缘(frame-019/031)
  group.append(
    svg('path', {d: 'M-26 0Q-24 -29 -20 -58L20 -58Q24 -29 26 0Z', fill: CONE.body, stroke: CONE.stroke, 'stroke-width': 2, 'stroke-linejoin': 'round'}),
    svg('path', {d: 'M12 -1.5Q23.2 -28 19.6 -56.5L20 -58Q24 -29 26 0Z', fill: CONE.dark, opacity: 0.55}),
    svg('path', {d: 'M-22.8 -2Q-21.6 -29 -19 -56L-13 -56Q-15.4 -29 -16.6 -2Z', fill: CONE.light, opacity: 0.5}),
    svg('path', {d: 'M-28 -3Q0 3 28 -3L27.4 1.5Q0 7 -27.4 1.5Z', fill: CONE.body, stroke: CONE.stroke, 'stroke-width': 1.6, 'stroke-linejoin': 'round'}),
  )

  // 橡皮膜: 顶面深色圆盘(cy=-58), 中央微穹(loaded 时下凹)
  const dome = loaded ? -58.5 + sag : -61.5
  group.append(
    svg('ellipse', {cx: 0, cy: -58, rx: 20, ry: 4.6, fill: MEMBRANE, stroke: MEMBRANE_EDGE, 'stroke-width': 1.6}),
    svg('path', {d: `M-17 -59Q0 ${dome} 17 -59`, fill: 'none', stroke: MEMBRANE_EDGE, 'stroke-width': 1.4}),
    svg('ellipse', {cx: -6, cy: loaded ? -59.8 : -61, rx: 5.4, ry: 1.7, fill: '#7d463c', opacity: 0.75}),
  )

  // 底部右侧短管嘴(乳胶管接口, 局部坐标 (22,2) 见 design_notes)
  group.append(
    svg('path', {d: 'M14 -8L23 -4L20 4L12 0Z', fill: CONE.dark, stroke: CONE.stroke, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('ellipse', {cx: 21.6, cy: 0, rx: 2, ry: 3.4, fill: '#c9b8a4', stroke: CONE.stroke, 'stroke-width': 1.2}),
  )

  group.append(label(entity.label, 0, 22))
  return group
}
