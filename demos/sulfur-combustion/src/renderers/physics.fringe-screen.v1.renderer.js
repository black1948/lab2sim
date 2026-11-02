import {add, label, shadow, svg} from './svg.js'

//  -  观察屏(双缝干涉条纹屏) - 
// 视觉依据: frame-007/012/013/014/015(无刻度白屏, 光轴高度一排红色干涉条纹: 中央最亮, 
// 向两侧对称递减; frame-012 特写确认屏面无任何刻度/标注; frame-014 对比 宽缝对≈9 条密纹, 
// 窄缝对≈5 条疏纹).与既有 physics.screen.v1(圆形透射光斑屏 renderScreen: intensity 单光斑)
// 不能互相顶替 - 图样为离散条纹行而非单光斑 - 故按 IR visual.asset_ref 另立变体渲染器, 
// 不设 default_for_kind(kind 默认仍指 physics.screen.v1).
// 风格依据: physics.js renderScreen 的白屏面板+底部金属裙边+接地阴影画法; 条纹用三层椭圆
// 叠加(halo/core/hot)表达亮度向外衰减, 红取证据帧红光(#ff4b3e 系, 与 physics.laser-source.v1
// 同一色系); inline 配色, 不新增 styles.css class.
// 锚点: 屏板中心=局部原点(光轴过屏心), 板宽 150(x ±75), 板顶 y=-126(不超 -130), 
// 板底 +52, 裙边+落脚 +52..+64 立于导轨(板总高 184px, 与 IR hit_shape 高 0.38≈190px 一致; 
// 说明: ±(110..130) 半板高与落脚 +52..+64在板中心=原点约定下不能同时成立, 取落脚约束
// 与板顶上限, 见注册表 design_notes).
// 状态约定: state.fringe_mode="wide"|"narrow" → 沿局部 y=0 画 state.fringe_count 条红条纹, 
// 相邻亮纹间距 state.fringe_px(局部 px), 条纹行以局部原点为中心对称展开, 中央最亮向外
// 高斯衰减; "none"(或 count/px 缺失)→ 素白屏无图样.
const PLATE_HALF_W = 75
const PLATE_TOP = -126
const PLATE_BOTTOM = 52

export function renderFringeScreen(entity, state = {}) {
  const group = svg('g')
  const mode = state.fringe_mode
  const count = Math.max(0, Math.min(21, Math.round(Number(state.fringe_count || 0))))
  const px = Number(state.fringe_px || 0)
  add(group,
    shadow(0, 66, 52, 7),
    // 底部裙边+落脚(renderScreen 裙边画法, 落导轨 y=52..63)
    svg('path', {d: 'M-34 52h22l-5 11h-13Z', class: 'metal-bracket'}),
    svg('path', {d: 'M34 52h-22l5 11h13Z', class: 'metal-bracket'}),
    // 白屏面板(无刻度, frame-012 特写)
    svg('rect', {x: -PLATE_HALF_W, y: PLATE_TOP, width: PLATE_HALF_W * 2, height: PLATE_BOTTOM - PLATE_TOP, rx: 4, fill: '#f6f4ec', stroke: '#5b6a6d', 'stroke-width': 2}),
  )
  if ((mode === 'wide' || mode === 'narrow') && count > 0 && px > 0) {
    const fringes = svg('g')
    const span = ((count - 1) / 2) * px
    const sigma = span > 0 ? span / 1.18 : px // 最外侧条纹强度衰减到约 1/4
    // 条纹行下连续微光带(frame-007 条纹行两侧的暗红余光)
    const tail = Math.min(70, span + 14)
    fringes.append(svg('path', {d: `M${-tail} 0H${tail}`, stroke: '#ff4b3e', 'stroke-width': 1.6, opacity: .13, fill: 'none'}))
    for (let i = 0; i < count; i += 1) {
      const x = (i - (count - 1) / 2) * px
      const k = Math.exp(-((x / sigma) ** 2)) // 中央 1 → 外侧 ~0.25
      fringes.append(
        svg('ellipse', {cx: x.toFixed(1), cy: 0, rx: 7, ry: 4.2, fill: '#ff4b3e', opacity: (0.07 + 0.16 * k).toFixed(3)}),
        svg('ellipse', {cx: x.toFixed(1), cy: 0, rx: (5.2 + 2.2 * k).toFixed(1), ry: (2.5 + 1.3 * k).toFixed(1), fill: '#f04a30', opacity: (0.35 + 0.55 * k).toFixed(3)}),
      )
      if (k > 0.35) {
        fringes.append(svg('ellipse', {cx: x.toFixed(1), cy: 0, rx: (1 + 2.6 * k).toFixed(1), ry: (1.1 + 0.9 * k).toFixed(1), fill: '#ffb08c', opacity: (0.85 * k).toFixed(3)}))
      }
    }
    group.append(fringes)
  }
  group.append(label(entity.label, 0, 88))
  return group
}
