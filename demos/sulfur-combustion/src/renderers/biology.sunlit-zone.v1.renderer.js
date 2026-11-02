//  -  阳光充足处(户外阳光直射区, 拖放目标 zone 底景, 静态) - 
// 视觉依据: frame-019/021/024(户外窗台/石质台面的阳光直射区域: 暖亮光斑铺在台面, 
// 台缘与背景过曝发白, 植株投影清晰锐利; frame-019 为叠化过渡帧, 以 021/024 为准).
// 风格依据: 低透明暖色多层叠加画法(先例 biology.js renderIncubator warm-glow /
// renderPetriDish sterile-glow 的 glow 叠加口径)+ circuits.js renderSocketZone 的
// zone 标题排布(标题置于 zone 上缘外侧); zone 是底景, 整体透明度 ≤0.16, 不抢主体.
// inline 配色(无内置 zone 暖色 class), 不新增 styles.css class; 无接地阴影(zone 非
// 实体器械).几何: hit_shape 0.22x0.32 → 220x320 舞台像素, 局部 (0,0)=zone 中心.
// 状态绑定: 无(IR 无 state_bindings; renderXxx(entity, state) 签名保留 state 形参).
// 证据不清处: 光斑轮廓在证据中为过曝软边界, 按同心软椭圆近似; 斜射光带为示意(证据帧
// 无明显光柱, 仅台面亮斑与锐利投影), 透明度压至 0.08.
// 导出签名沿用既有模块先例: export function renderSunlitZone(entity, state) 返回 SVG group; 
// svg()/add()/label() 在模块内自含最小实现(不 import biology.js).

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

export function renderSunlitZone(entity, state = {}) {
  const group = svg('g')
  add(group,
    // 台面暖亮光斑: 三层同心软椭圆(frame-021 台面亮斑, 过曝软边界)
    svg('ellipse', {cx: 0, cy: 24, rx: 110, ry: 132, fill: 'rgb(255 214 130 / 0.09)', class: 'sunlit-zone-halo'}),
    svg('ellipse', {cx: 0, cy: 20, rx: 82, ry: 100, fill: 'rgb(255 222 150 / 0.11)', class: 'sunlit-zone-mid'}),
    svg('ellipse', {cx: 0, cy: 16, rx: 54, ry: 68, fill: 'rgb(255 233 176 / 0.15)', class: 'sunlit-zone-core'}),
    // 斜射光带(示意, 透明度 0.08; 证据帧以亮斑为主, 光带仅作方向暗示)
    svg('path', {d: 'M-58 -160L18 -160L86 150L34 150Z', fill: 'rgb(255 240 200 / 0.08)', class: 'sunlit-zone-ray'}),
    svg('path', {d: 'M-6 -160L36 -160L118 150L82 150Z', fill: 'rgb(255 240 200 / 0.07)', class: 'sunlit-zone-ray2'}),
    // 台面亮缘(frame-021 台缘过曝线)
    svg('path', {d: 'M-96 118Q0 134 96 118', fill: 'none', stroke: 'rgb(255 236 180 / 0.35)', 'stroke-width': 3, 'stroke-linecap': 'round', class: 'sunlit-zone-edge'}),
  )
  // 标签置于 zone 上缘外侧(与 circuits zone-title 排布口径一致, 器身不加底色)
  group.append(label(entity.label, 0, -172))
  return group
}
