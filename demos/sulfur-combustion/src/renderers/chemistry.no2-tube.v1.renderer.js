import {add, label, shadow, svg} from './svg.js'

//  -  NO₂/N₂O₄ 双球密封管(H 形密封连通玻璃管, 2NO₂ ⇌ N₂O₄ 平衡演示) - 
// 视觉依据: frame-002(横管+中央向上尖嘴+两端下弯侧管, 各接一只含棕红气球泡, 双球同色中等棕), 
// frame-006/007(手持特写: 中央加料支管尖嘴清晰, 尖细顶部, 横管两端圆角下弯), frame-011/013
// (两球泡浸入两烧杯水中: 热侧深棕浓实, 冷侧淡黄半透明; 球径≈烧杯内宽, 两球心距≈两烧杯中心距).
// 玻璃画法与 chemistry.js 玻璃器皿同族: glass-body(fill rgb(221 245 249/35%) + 描边 #41626b), 
// glass-rim 描线, glass-highlight 白高光, tube-glass/tube-highlight 管路(同 renderDeliveryTube/
// renderGasHolder 的管路 class), apparatus-shadow 接地阴影(球泡下方两枚小椭圆 - 整管架在两杯
// 口之间, 不做全宽阴影条以免压在杯内水面上).
// 关键比例(构建方场景规格, 不得更改): 横管局部 y=-26; 侧管在 x=±180 下弯; 球心 (±180, +8), 
// 半径 16(屏幕 scale=1.44 → 直径 46px≈烧杯宽 86px 的 0.54, frame-011 目测一致); 两球心距局部
// 360 → 屏幕 518px=两烧杯中心距; 中央尖嘴高约 20, 顶部尖细.局部包围盒约 x∈[-200,200], y∈[-50,+28].
// 状态绑定: state.left_color/right_color(hex, 球内气体色, 缺省 #8a4a1a 中等棕); 
// state.left_no2_frac/right_no2_frac(0..1, NO₂ 相对占比, 缺省 0.5)→ 渐变不透明度随 frac 提高
// (frac 低→淡而透, frac 高→浓而实, 参考 frame-013 冷/热侧对比); state.immersed → 球外加淡蓝
// 水膜(浸入水浴的折射观感); state['no2-tube'].__reaction(兼容顶层 state.__reaction)存在且
// running → 球内轻微 reaction-bubble 扰动 overlay(沿用模板 class 惯例, 简化版).

const BULB_R = 18
const GAS_R = 15.2
const BULBS = [
  {side: 'left', cx: -180},
  {side: 'right', cx: 180},
]

// 渐变 id 带 entity.id 后缀: 同台面多实例/多状态不串色(SVG url(#id) 全文档取首个命中)
function gradientId(entity, side) {
  const uid = String((entity && entity.id) || 'no2-tube').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'no2-tube'
  return `${uid}-${side}-gas`
}

function clamp01(value) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0
}

// NO₂ 占比缺省 0.5(初始两球同为 #8a4a1a 中等棕, frame-002)
function no2Frac(state, side) {
  const value = Number(state[`${side}_no2_frac`])
  return Number.isFinite(value) ? clamp01(value) : 0.5
}

function gasColor(state, side) {
  const value = state[`${side}_color`]
  return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value) ? value : '#8a4a1a'
}

// 不透明度随 NO₂ 占比提高: frac=0.5(初始) → 0.61; frac→1 → 0.96; frac→0 → 0.26(淡而透)
function gasAlpha(frac) {
  return 0.26 + 0.7 * clamp01(frac)
}

// 球内气体 radial 渐变: 中心略淡, 边缘略浓(球体积感), 整体不透明度由 frac 驱动
function gasGradient(id, color, alpha) {
  const def = svg('radialGradient', {id})
  ;[[0, alpha * 0.5], [0.55, alpha * 0.85], [1, alpha]].forEach(([offset, opacity]) => {
    def.append(svg('stop', {offset, 'stop-color': color, 'stop-opacity': opacity.toFixed(3)}))
  })
  return def
}

// 球泡左上弧形高光(190°→280°, 屏幕坐标逆时针, 弧过左上象限)
function bulbHighlight(cx, cy) {
  const r = 10.5
  const a0 = (190 * Math.PI) / 180
  const a1 = (280 * Math.PI) / 180
  const x0 = (cx + r * Math.cos(a0)).toFixed(2)
  const y0 = (cy + r * Math.sin(a0)).toFixed(2)
  const x1 = (cx + r * Math.cos(a1)).toFixed(2)
  const y1 = (cy + r * Math.sin(a1)).toFixed(2)
  return svg('path', {d: `M${x0} ${y0}A${r} ${r} 0 0 0 ${x1} ${y1}`, class: 'glass-highlight', 'stroke-width': 2.4})
}

function reactionInfo(state) {
  const nested = state['no2-tube']
  if (nested && typeof nested === 'object' && nested.__reaction) return nested.__reaction
  return state.__reaction
}

// 反应扰动 overlay: 每球 3 枚小气泡(确定性坐标/延时), 沿用模板 reaction-layer/reaction-bubble class
function reactionOverlay(state) {
  const overlay = svg('g', {class: 'reaction-layer'})
  const info = reactionInfo(state)
  if (!info || !info.running) return overlay
  overlay.setAttribute('data-phase', info.phase || 'mixing')
  BULBS.forEach(({cx}, bulbIndex) => {
    for (let index = 0; index < 3; index += 1) {
      const seed = bulbIndex * 3 + index
      overlay.append(svg('circle', {
        class: 'reaction-bubble',
        cx: cx - 6 + ((seed * 5) % 12),
        cy: 17,
        r: 1.5 + (seed % 3) * 0.4,
        style: `--d:${(0.35 + ((seed * 37) % 40) / 100).toFixed(2)}s;--x:${((seed % 3) - 1) * 6}`,
      }))
    }
  })
  return overlay
}

export function renderNo2Tube(entity, state) {
  // .reacting 的 CSS shake 动画会覆盖 SVG transform 属性, 抖动放在内层组, 外层组保留 renderStage 定位
  const group = svg('g')
  const running = Boolean(reactionInfo(state) && reactionInfo(state).running)
  const reacting = svg('g', {class: running ? 'reacting' : undefined})
  const immersed = Boolean(state.immersed)
  const defs = svg('defs')
  BULBS.forEach(({side}) => defs.append(gasGradient(gradientId(entity, side), gasColor(state, side), gasAlpha(no2Frac(state, side)))))
  // H 形管路: 横管 y=-26, 两端 x=±180 圆角下弯, 侧管下探至球顶(y=-8); 中央加料支管尖嘴(高约 20, 顶部尖细)
  const tubePath = 'M-180-8L-180-22Q-180-26-176-26L176-26Q180-26 180-22L180-8'
  add(reacting,
    defs,
    shadow(-180, 26.5, 16.5, 3.4),
    shadow(180, 26.5, 16.5, 3.4),
    svg('path', {d: tubePath, class: 'tube-glass'}),
    svg('path', {d: tubePath, class: 'tube-highlight', transform: 'translate(0 -1.6)'}),
    // 加料支管尖嘴: 玻璃实体(glass-body 同族配色), 凹弧两边收成尖顶
    svg('path', {d: 'M-4.2-24.5Q-2-37-0.8-46Q0-47.8 0.8-46Q2-37 4.2-24.5Z', class: 'glass-body', 'stroke-width': 1.4}),
    svg('path', {d: 'M-1.9-28Q-0.9-36-0.5-43', class: 'tube-highlight'}),
  )
  // 球泡: glass-body(轮廓+淡填充)→ 球内气体渐变(r13.5, 轮廓内) → 浸入水膜 → 左上高光
  BULBS.forEach(({cx, side}) => {
    add(reacting,
      svg('circle', {cx, cy: 8, r: BULB_R, class: 'glass-body'}),
      svg('circle', {cx, cy: 8, r: GAS_R, fill: `url(#${gradientId(entity, side)})`, class: `no2-gas no2-gas-${side}`}),
      immersed ? svg('circle', {cx, cy: 8, r: BULB_R, fill: 'rgb(197 227 236 / 30%)', class: 'immersed-tint'}) : null,
      bulbHighlight(cx, 8),
    )
  })
  add(reacting, reactionOverlay(state))
  group.append(reacting)
  group.append(label(entity.label, 0, -56))
  return group
}
