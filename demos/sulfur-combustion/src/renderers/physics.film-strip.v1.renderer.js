import {add, label, shadow, svg} from './svg.js'

//  -  半透明薄条(平放到白瓷环环口上压实的玻璃质感薄条) - 
// 视觉依据: frame-028/030/031(手持细长半透明矩形薄条悬于环上方→平放环口压实; frame-028
// 手持段长宽比目测≈4:1 → 条面 200x48, 与 IR hit_shape 0.20x0.08(200x40px)相当; 
// frame-016/017/039 台面上平放的同一薄条呈半透明, 仅淡高光与边线可辨, 膜下物体透见).
// 无状态视觉(IR 无 state_bindings): 落位(悬于环上方/平放环口)由场景与动作处理, 
// 渲染器只画薄条本体.
// 与形近资产的复用审查否决记录: physics.thin-film.v1 为手持薄膜片(锚点=膜片中心, 
// state.reflecting 反射光带, 板面 208x70 约 3:1), 与细长 4:1 薄条 kind/锚点/状态语义不同; 
// chemistry.glass-plate 为 80x6 刚性盖片.均不能顶替.
// 风格依据: chemistry.js renderGlassPlate / physics.js renderConvexLens 的玻璃画法
// (glass-body 透明填充+细边线)+ 内圈淡高光线与 glass-highlight 斜向高光滑条
// (先例 physics.thin-film.v1 未承接反射时的膜面反光画法)+ apparatus-shadow 接地阴影.
// 锚点: 局部 (0,0)=条底边中心; 条面 x ±100, y -48..0.
export function renderFilmStrip(entity, state = {}) {
  const group = svg('g')
  add(group,
    shadow(0, 2, 92, 5),
    // 条面: 玻璃质感透明填充 + 细边线(renderGlassPlate 画法)
    svg('rect', {x: -100, y: -48, width: 200, height: 48, rx: 4, class: 'glass-body'}),
    // 内圈淡高光线(薄条前表面反光, renderConvexLens 内圈画法)
    svg('rect', {x: -96, y: -44, width: 192, height: 40, rx: 3, fill: 'none', stroke: '#e8f2f4', 'stroke-width': 1, opacity: .5}),
    // 斜向高光滑条(frame-028 膜面两道淡反光)
    svg('path', {d: 'M-72 -6L-36 -42', class: 'glass-highlight', 'stroke-width': 2.4, opacity: .5}),
    svg('path', {d: 'M28 -42L60 -10', class: 'glass-highlight', 'stroke-width': 1.6, opacity: .4}),
  )
  group.append(label(entity.label, 0, -58))
  return group
}
