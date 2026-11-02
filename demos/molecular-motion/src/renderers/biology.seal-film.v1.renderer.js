//  -  封口膜(半透明白色 Parafilm 类膜卷, 静态道具) - 
// 视觉依据: frame-013/014/015(封口膜压封在试管口的形态: 半透明, 乳白微黄, 膜缘超出管口, 
// 沿茎周收拢有皱褶与高光); frame-012/016(膜卷未入镜, 独立道具外观证据不可辨, 见
// design_notes 证据偏差).台面道具按膜卷+撕开膜带呈现, 颜色/质感与贴覆态一致.
// 风格依据: physics.film-strip.v1 的玻璃质感膜面画法(glass-body 半透明填充 + 细边线 +
// glass-highlight 斜向高光滑条)+ apparatus-shadow 接地阴影; 卷芯用 inline 米白配色
// (frame-013 膜色偏乳白微黄), 不新增 styles.css class.
// 几何锚点: 局部 (0,0)=膜卷与台面接触点; 卷体 x -43..-9, 膜带延伸至 x +62.
// 无状态绑定(IR 无 state_bindings; 密封后的管口覆膜由 test-tube-sealable 的
// state.sealed 表达, 本道具不随密封状态消失 - IR 无对应规则字段).
// 证据偏差(design_notes): 封口膜独立摆放形态在全部引用帧中不可见, 膜卷直径/膜带宽为
// 与贴覆态质感一致的示意几何; 如构建方有更近证据可替换.
// 导出签名沿用既有模块先例: export function renderSealFilm(entity, state) 返回 SVG group; 
// svg()/add()/label()/shadow() 在模块内自含最小实现(不 import biology.js).

const NS = 'http://www.w3.org/2000/svg'

function svg(tag, attributes = {}) {
  const node = document.createElementNS(NS, tag)
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value))
  })
  return node
}

function add(parent, ...children) {
  children.flat().filter(Boolean).forEach(child => parent.append(child))
  return parent
}

function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

function shadow(cx = 0, cy = 0, rx = 28, ry = 7) {
  return svg('ellipse', {cx, cy, rx, ry, class: 'apparatus-shadow'})
}

export function renderSealFilm(entity, state = {}) {
  const group = svg('g')
  add(group,
    shadow(0, 2, 52, 5),
    // 膜卷(侧视椭圆卷筒: 乳白微黄膜色, frame-013 贴覆态膜色一致)
    svg('ellipse', {cx: -26, cy: -11, rx: 17, ry: 11, fill: '#f3f4ea', stroke: '#cfd6c2', 'stroke-width': 1.4}),
    svg('ellipse', {cx: -26, cy: -11, rx: 9.5, ry: 5.8, fill: 'none', stroke: '#dfe3d2', 'stroke-width': 1}),
    svg('ellipse', {cx: -26, cy: -11, rx: 2.6, ry: 1.5, fill: '#d9dfc9'}),
    svg('path', {d: 'M-37 -18Q-30 -21 -22 -19.5', stroke: 'rgb(255 255 255 / 80%)', 'stroke-width': 1.4, 'stroke-linecap': 'round', fill: 'none'}),
    // 撕开的膜带: 半透明膜面自卷底延展到台面(glass-body 膜面 + 细边线)
    svg('path', {d: 'M-16 -5.5Q24 -9.5 60 -4.5Q24 -3.5 -16 2.5Z', class: 'glass-body', 'stroke-width': 0.8, stroke: '#c8d2cc'}),
    svg('path', {d: 'M-12 -4.6Q24 -8.2 56 -4', fill: 'none', stroke: 'rgb(255 255 255 / 70%)', 'stroke-width': 0.9}),
    // 膜带末端微翘(撕断端)
    svg('path', {d: 'M58 -4.8Q63 -8 66 -11', fill: 'none', stroke: '#d5ddd2', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    // 膜面皱褶淡线(frame-013 贴覆态皱褶质感的延展)
    svg('path', {d: 'M4 -6.2L10 -3.2M26 -6.8L32 -3.6', stroke: '#dfe5da', 'stroke-width': 0.7, fill: 'none'}),
  )
  group.append(label(entity.label, 0, 20))
  return group
}
