import {add, label, shadow, svg} from './svg.js'

//  -  金鱼藻(沉水植物, 束状细茎 + 轮生羽状细叶) - 
// 视觉依据: frame-004(束状 10+ 根细长 bare 茎, 顶端平切, 中绿色); frame-002/005/012/015
// (水下整株: 细茎密集丛生, 沿茎轮生羽状细叶呈羽毛状, 整体沉水, 束内叶色深绿); frame-015
// (穹顶内特写: 细叶柔软, 随水微弯, 气泡挂叶).
// 复用审查否决记录: biology.plant-stem.v1 是整段芹菜(单根肉质直茎 + 顶部羽状裂叶冠 +
// 白色根端, kind=plant_stem), 与沉水束状金鱼藻形态不符, 不顶替.
// 发现记录: discover_apparatus.py --kind aquatic_plant --query 'ceratophyllum demersum
// aquatic plant' 无候选(no scored vector file matched), 转 code-native.
// 风格依据: biology.js / biology.plant-stem.v1 的 code-native 有机件画法 - 曲线描边茎 +
// inline 配色(不新增 styles.css class), 接地阴影/器械标签沿用 apparatus-shadow /
// apparatus-label 既有 class; 玻璃器内水下观感以 0.92 不透明度 + 偏冷绿表达.
// 局部几何: (0,0)=束基中心(茎束收拢点), 茎自 (≈0,+58) 散开向上, 叶冠顶 ≈ -68, 
// 总体 ≈ 126px 高, 86px 宽(对应 IR hit_shape capsule 0.10x0.24 的抓取区, 视觉略窄于区).
// 状态绑定(IR visual.state_bindings): state.bubbling=true → 沿茎上升的确定性气泡串
// (frame-012/015 植株周缘气泡; 坐标确定性排布, 渲染可复现).无其余状态.
export function renderAquaticPlant(entity, state = {}) {
  const group = svg('g')
  const bubbling = Boolean(state.bubbling)

  // 束状细茎(frame-004: 多根细茎自基部散开; 二次曲线, 向叶尖渐细; 总体宽 ≈70px, 
  // 与 250 mL 烧杯内宽(@scale1.35 ≈78px)匹配, frame-012 植株占杯宽约六成)
  const STEMS = [
    {bx: 0, by: 56, cx: -7, cy: 4, tx: -32, ty: -36, w: 1.9},
    {bx: 0, by: 58, cx: -5, cy: 8, tx: -21, ty: -55, w: 2.0},
    {bx: 1, by: 58, cx: -2, cy: 11, tx: -9, ty: -66, w: 2.1},
    {bx: 2, by: 58, cx: 3, cy: 12, tx: 6, ty: -68, w: 2.1},
    {bx: 3, by: 57, cx: 7, cy: 9, tx: 21, ty: -59, w: 2.0},
    {bx: 4, by: 55, cx: 11, cy: 6, tx: 34, ty: -40, w: 1.9},
    {bx: -2, by: 57, cx: -11, cy: 12, tx: -28, ty: -20, w: 1.8},
    {bx: 2, by: 58, cx: 8, cy: 15, tx: 26, ty: -16, w: 1.8},
    {bx: 0, by: 58, cx: -1, cy: 16, tx: -3, ty: -26, w: 1.7},
  ]
  const qPoint = (s, t) => ({
    x: (1 - t) * (1 - t) * s.bx + 2 * (1 - t) * t * s.cx + t * t * s.tx,
    y: (1 - t) * (1 - t) * s.by + 2 * (1 - t) * t * s.cy + t * t * s.ty,
  })
  const qTangent = (s, t) => {
    const dx = 2 * (1 - t) * (s.cx - s.bx) + 2 * t * (s.tx - s.cx)
    const dy = 2 * (1 - t) * (s.cy - s.by) + 2 * t * (s.ty - s.cy)
    return Math.atan2(dy, dx) * 180 / Math.PI
  }

  add(group, shadow(0, 60, 26, 5))

  // 茎(先画, 叶覆盖其上)
  STEMS.forEach((s, index) => {
    add(group, svg('path', {
      d: `M${s.bx} ${s.by}Q${s.cx} ${s.cy} ${s.tx} ${s.ty}`,
      stroke: index % 2 ? '#5f8a3a' : '#679445',
      'stroke-width': s.w, fill: 'none', 'stroke-linecap': 'round', opacity: 0.95,
    }))
  })

  // 轮生羽状细叶(金鱼藻每节一轮 5~6 枚分叉细叶, frame-002/015 羽状柔软观感): 
  // 每茎 5 个节, 叶长向叶尖渐短, 叶向茎两侧下方略垂
  const NODES = [0.22, 0.38, 0.54, 0.7, 0.86]
  STEMS.forEach((s, stemIndex) => {
    NODES.forEach((t, nodeIndex) => {
      const point = qPoint(s, t)
      const tangent = qTangent(s, t)
      const leafLen = 12.5 * (1 - 0.42 * t) * (1 - 0.08 * (stemIndex % 3))
      const whorl = svg('g', {transform: `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`})
      for (let k = -2; k <= 2; k += 1) {
        if (k === 0 && nodeIndex % 2 === 1) continue  // 奇数节留缝, 避免过密
        const side = k < 0 ? -1 : 1
        const spread = Math.abs(k) * 34 + (k === 0 ? 0 : 6)
        const droop = 10
        const angle = tangent + 90 * side - 90 + spread * side + droop * side * 0.2
        const len = leafLen * (k === 0 ? 0.82 : 1 - Math.abs(k) * 0.13)
        add(whorl, svg('path', {
          d: `M0 0Q${(len * 0.55).toFixed(1)} ${(len * 0.1).toFixed(1)} ${len.toFixed(1)} ${(len * 0.26).toFixed(1)}`,
          stroke: (nodeIndex + stemIndex) % 2 ? '#38702e' : '#457f36',
          'stroke-width': 1.25, fill: 'none', 'stroke-linecap': 'round', opacity: 0.92,
          transform: `rotate(${angle.toFixed(1)})`,
        }))
      }
      group.append(whorl)
    })
    // 茎顶幼叶簇(frame-004 顶端平切后新生的细尖)
    const tip = {x: s.tx, y: s.ty}
    add(group, svg('path', {
      d: `M${tip.x} ${tip.y}l-3.2 5.4M${tip.x} ${tip.y}l3.4 4.8`,
      stroke: '#5d9a41', 'stroke-width': 1, fill: 'none', 'stroke-linecap': 'round', opacity: 0.9,
    }))
  })

  // 气泡串(state.bubbling, frame-012/015 植株周缘上升气泡; 确定性坐标)
  if (bubbling) {
    const BUBBLES = [
      {cx: -6, cy: -18, r: 1.6}, {cx: 4, cy: -36, r: 2.2}, {cx: -2, cy: -52, r: 1.4},
      {cx: 11, cy: -8, r: 1.3}, {cx: -13, cy: -4, r: 1.8}, {cx: 2, cy: -62, r: 1.2},
      {cx: 15, cy: -28, r: 1.5}, {cx: -21, cy: -30, r: 1.3},
    ]
    BUBBLES.forEach(({cx, cy, r}) => {
      const bubble = svg('g')
      add(bubble,
        svg('circle', {cx, cy, r, fill: 'rgb(240 250 253 / 85%)', stroke: 'rgb(125 165 178 / 55%)', 'stroke-width': 0.6}),
        svg('circle', {cx: cx - r * 0.3, cy: cy - r * 0.35, r: r * 0.28, fill: '#ffffff', opacity: 0.95}),
      )
      group.append(bubble)
    })
  }

  group.append(label(entity.label, 0, -86))
  return group
}
