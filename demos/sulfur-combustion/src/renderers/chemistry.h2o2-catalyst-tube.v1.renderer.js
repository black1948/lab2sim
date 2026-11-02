import {add, label, liquidColor, shadow, svg} from './svg.js'

//  -  过氧化氢催化反应试管变体(16 催化剂对化学反应速率的影响) - 
// 局部几何与 chemistry.js renderTestTube 完全一致(管体 M-10-52H10L9 54Q9 62 0 62Q-9 62-9 54Z, 
// 口沿 M-12-52H12M-9-48Q0-45 9-48, 内壁 ±8, 高光 M-4-46V46, 接地阴影 shadow(0,62,16,5), 标签 y=78), 
// 玻璃配色/线宽/2.5D 全部沿用 styles.css 既有 glass-body/glass-rim/glass-highlight/liquid/meniscus 族, 
// 保证试管按既有案例 04-不同组成的硫酸铜溶液/visual/scene.json 的摆位(scale 1.3, y 0.55)
// 落进 chemistry.test-tube-rack-3h.v1 三孔架(同 test-tube-solid/layered 先例).
// 在单层 renderTestTube 之上新增三个状态绑定字段(渲染器直读 state, 先例同
// chemistry.digital-thermometer.v1.renderer.js / chemistry.test-tube-solid.v1.renderer.js): 
//   rate (数值 0..1) → 持续气泡剧烈程度(区别于 __reaction 的一次性反应窗, 本字段常驻): 
//     <=0.02 不画(1 号空白对照, frame-012/020 仅极少量缓慢小气泡走 (0,0.2] 档); 
//     (0,0.2] 极少量缓慢小气泡 2 枚, 小半径, --d 拉长 1.3~1.7s(frame-012 左管); 
//     (0.2,0.6] 中等 4 枚; >0.6 剧烈 8 枚大气泡(frame-014/017/018 FeCl3 管 / frame-009 MnO2 管).
//     复用既有 .reaction-bubble class 与 --d/--x CSS 变量(styles.css 已有 animation: bubble-rise, 
//     上升位移 -40px 为模板既定视觉语言), 坐标全部按下标算术推导(禁止 Math.random), 
//     气泡自液面下升起(cy 分布在 liquidTop+6 .. 50, 无液体时不画 - 防御分支); 
//   suspension (数值 0..1) → MnO2 黑色悬浮: 液体内半透明深灰黑云团 + 细小暗颗粒
//     (frame-009 中管黑色粉末云 + 底部颗粒感), 0 不画; 无液体时不画(防御分支); 
//   foam (数值 0..1) → 液面白色泡沫: 骑在液面线上的确定性白珠(照抄 layered 模块 FOAM_BEADS
//     手法, 珠表按中心向外排序, 珠数/横向覆盖度随 foam 缩放), 0 不画; 无液体时不画(防御分支).
// 液体: ratio 同 svg.js liquidRatio 但 capacity 回退取 entity.properties?.capacity_ml || 10
// (照抄 layered 的 testTubeRatio), liquidTop = 42 - ratio*82, 液色由 state.color 驱动
// (liquidColor, 回退 #dfeef2 - 5% H2O2 本体近无色, 归一化为模板亮色族淡冷白, 同
// test-tube-solid 稀硫酸铜色; FeCl3 深红棕/MnO2 液色由 IR 规则下发 color).
// 视觉依据(CASE_DIR/frames/, 源视频 450x360, sheet-002..005 为 2x2 审阅表): 
//   frame-009  2 号加 MnO2 后: 黑粉悬浮团 + 液面下大量白色泡沫, 剧烈冒泡(中管液内黑云+液面白沫带); 
//   frame-012  1 号空白对照仅极少量缓慢小气泡; 2 号黑云+白沫; 3 号滴加 FeCl3 前后过渡; 
//   frame-014  3 号 FeCl3 深红棕色溶液 + 密集气泡泡沫; 
//   frame-017/018 特写: 右管(FeCl3)棕液满液面厚泡沫+密集气泡, 中管(MnO2)均匀深灰悬浮+缓沫, 
//              左管(对照)澄清仅个别小泡; 
//   frame-020  收尾全景: 三管差异仍在(左极少量, 中深灰, 右棕沫团).
// 证据不清处: 泡沫颗数/粒径与悬浮云团轮廓在原帧(450x360, 任务书按 352x288 记)不可数, 
// 不可描, 按确定性布置示意(泡沫 9 珠表缩放, 云团双瓣+颗粒算术散布), 非逐泡/逐粒还原.
// 与 renderTestTube 的另外两点差异: ① vesselGasLayer 不画(discovered 模块保持仅依赖 ./svg.js
// 的先例, 同 layered); ② rate 气泡组与 __reaction overlay 并存时各自独立(IR 不会同时下发).
// reactingGroup/reactionOverlay 在 chemistry.js 内为模块私有(未导出, 无法导入), 此处按原实现
// 重写(REACTION_PHASES 相位表, 气泡布局与 --d/--x 变量完全一致), 保证 .reacting 抖动与
// reaction-bubble 动画行为同单层试管(照抄 layered 模块重写稿).
// 不新增 styles.css class: 本模块用到的 suspension-cloud/suspension-grain/foam-bead/rate-bubble
// 均为语义标注 class(无对应 CSS 规则, 仅作测试钩子), 动画全部走既有 .reaction-bubble.
// 导出签名: renderH2O2CatalystTube(entity, state).
// 集成(构建方): 文件置于 assets/simulator-template/src/renderers/, index.js 注册
// ['chemistry/h2o2-catalyst-tube', renderH2O2CatalystTube]; 注册表键
// chemistry.h2o2-catalyst-tube.v1 由 IR visual.asset_ref 选择(不设 default_for_kind, 
// test_tube 默认仍指 chemistry.test-tube.v1).

// 液面泡沫珠表(照抄 layered FOAM_BEADS 手法; 按中心向外排序, 取前 count 颗即中心权重聚集)
const FOAM_BEADS = [
  {dx: 0, r: 2.9, lift: 1.5},
  {dx: -3.2, r: 2.4, lift: 0.9},
  {dx: 3.4, r: 2.5, lift: 1.1},
  {dx: -6.0, r: 2.0, lift: 0.7},
  {dx: 5.8, r: 2.2, lift: 0.8},
  {dx: -1.7, r: 2.1, lift: 1.8},
  {dx: 1.9, r: 2.0, lift: 1.6},
  {dx: 7.4, r: 1.6, lift: 0.4},
  {dx: -7.4, r: 1.5, lift: 0.3},
]
const CLOUD_FILL = '#3b3733'   // MnO2 悬浮云团(frame-009/012 中管深灰黑, 归一化暗灰)
const CLOUD_CORE = '#2a2724'   // 云团内瓣
const GRAIN_FILL = '#211f1d'   // 细小暗颗粒
const LIQUID_FALLBACK = '#dfeef2' // 5% H2O2 本体近无色(模板亮色族淡冷白)

// rate 档位: {count 气泡数, width 展布半宽, base 基础周期, rmin/rstep 半径}
function rateTier(rate) {
  if (!Number.isFinite(rate) || rate <= 0.02) return null
  if (rate <= 0.2) return {count: 2, width: 7, base: 1.3, rmin: 1.1, rstep: 0.25, rmod: 3}
  if (rate <= 0.6) return {count: 4, width: 10, base: 0.85, rmin: 1.6, rstep: 0.3, rmod: 3}
  return {count: 8, width: 13, base: 0.5, rmin: 2.3, rstep: 0.35, rmod: 4}
}

// rate 持续气泡组: 确定性坐标(下标算术), 自液面下升起, 复用 .reaction-bubble/--d/--x
function rateBubbles(rate, liquidTop) {
  const tier = rateTier(rate)
  const group = svg('g', {class: 'rate-bubbles'})
  if (!tier || !Number.isFinite(liquidTop)) return group
  const surface = liquidTop + 6
  const span = Math.max(4, 50 - surface)
  for (let index = 0; index < tier.count; index += 1) {
    const x = -tier.width / 2 + (index / Math.max(1, tier.count - 1)) * tier.width
    const cy = surface + ((index * 13) % span)
    const r = tier.rmin + ((index * 7) % tier.rmod) * tier.rstep
    const d = tier.base + ((index * 37) % 40) / 100
    const drift = (index % 3 - 1) * 1.8
    group.append(svg('circle', {class: 'reaction-bubble rate-bubble', cx: x, cy, r, style: `--d:${d}s;--x:${drift}px`}))
  }
  return group
}

// MnO2 黑色悬浮: 半透明深灰黑云团(双瓣)+ 细小暗颗粒, 强度随 suspension 缩放
function suspensionLayer(suspension, liquidTop) {
  const group = svg('g', {class: 'suspension'})
  const value = Number.isFinite(Number(suspension)) ? Math.max(0, Math.min(1, Number(suspension))) : 0
  if (value <= 0 || !Number.isFinite(liquidTop)) return group
  const top = liquidTop + 2
  const bottom = 48
  const mid = (top + bottom) / 2
  group.append(svg('path', {
    d: `M-7.5 ${top + 1.5}Q-4 ${top - 0.5} 0 ${top + 0.5}Q4.5 ${top + 1.5} 7.5 ${top + 1}`
      + `L7.5 ${bottom - 3}Q3 ${bottom} -3 ${bottom - 1}Q-6 ${bottom - 2} -7.5 ${bottom - 4}Z`,
    fill: CLOUD_FILL,
    opacity: 0.18 + 0.55 * value,
    class: 'suspension-cloud',
  }))
  group.append(svg('ellipse', {
    cx: -2, cy: mid, rx: 4.5, ry: Math.max(2, (bottom - top) / 2.6),
    fill: CLOUD_CORE, opacity: 0.25 * value, class: 'suspension-cloud',
  }))
  const grains = Math.round(value * 9)
  for (let index = 0; index < grains; index += 1) {
    const gy = Math.min(48, top + 3 + ((index * 17) % Math.max(2, 45 - top)))
    group.append(svg('circle', {
      cx: -6.4 + ((index * 29) % 128) / 10,
      cy: gy,
      r: 0.6 + ((index * 5) % 3) * 0.2,
      fill: GRAIN_FILL,
      class: 'suspension-grain',
    }))
  }
  return group
}

// 液面白色泡沫: 珠数/覆盖度随 foam 缩放(0 不画), 珠骑在液面线上(lift<r)
function foamLayer(foam, liquidTop) {
  const group = svg('g', {class: 'surface-foam'})
  const value = Number.isFinite(Number(foam)) ? Math.max(0, Math.min(1, Number(foam))) : 0
  if (value <= 0 || !Number.isFinite(liquidTop)) return group
  const count = Math.max(2, Math.round(value * FOAM_BEADS.length))
  const cover = 0.45 + 0.55 * value
  for (let index = 0; index < count; index += 1) {
    const bead = FOAM_BEADS[index]
    group.append(svg('circle', {
      cx: bead.dx * cover,
      cy: liquidTop - bead.lift,
      r: bead.r,
      fill: '#ffffff',
      stroke: '#d8cfc2',
      'stroke-width': 0.6,
      class: 'foam-bead',
    }))
  }
  return group
}

// 与 svg.js liquidRatio 同式, capacity 回退改试管口径 10(同 layered 的 testTubeRatio)
function testTubeRatio(entity, state) {
  const capacity = Number(entity.properties?.capacity_ml || 10)
  const volume = Number(state.volume_ml || 0) + Number(state.delivered_ml || 0)
  if (!Number.isFinite(volume) || volume <= 0) return 0
  return Math.max(0.04, Math.min(0.9, volume / Math.max(capacity, 1)))
}

const REACTION_PHASES = {
  mixing: {class: 'reacting mixing', bubbles: 4},
  changing: {class: 'reacting changing', bubbles: 6},
  settling: {class: 'reacting settling', bubbles: 3},
}

//  -  以下两个 helper 按 chemistry.js 原实现重写(该文件未导出, 无法复用; 照抄 layered 重写稿) - 
function reactionOverlay(state, width, top, bottom) {
  const overlay = svg('g', {class: 'reaction-layer'})
  const info = state.__reaction
  if (!info || !info.running) return overlay
  const phase = REACTION_PHASES[info.phase] || REACTION_PHASES.mixing
  overlay.setAttribute('data-phase', info.phase || 'mixing')
  for (let index = 0; index < phase.bubbles; index += 1) {
    const x = -width / 2 + (index / Math.max(1, phase.bubbles - 1)) * width
    overlay.append(svg('circle', {class: 'reaction-bubble', cx: x, cy: bottom, style: `--d:${0.3 + ((index * 37) % 40) / 100}s;--x:${(index % 3 - 1) * width * 0.22}`}))
  }
  return overlay
}

function reactingGroup(state, className = '') {
  const reacting = Boolean(state.__reaction && state.__reaction.running)
  return svg('g', {class: reacting ? `${className} reacting`.trim() : (className || undefined)})
}

export function renderH2O2CatalystTube(entity, state = {}) {
  // 双层组: 外层定位, 内层承接 .reacting 抖动(CSS transform 动画会覆盖属性 transform, 同 renderTestTube)
  const group = svg('g')
  const reacting = reactingGroup(state)
  const ratio = testTubeRatio(entity, state)
  const liquidTop = 42 - ratio * 82
  add(reacting,
    shadow(0, 62, 16, 5),
    svg('path', {d: 'M-10-52H10L9 54Q9 62 0 62Q-9 62-9 54Z', class: 'glass-body'}),
    ...(ratio > 0 ? [
      svg('path', {d: `M-8 ${liquidTop}Q0 ${liquidTop - 2} 8 ${liquidTop}V54Q8 58 3 59H-3Q-8 58-8 54Z`, fill: liquidColor(state, LIQUID_FALLBACK), class: 'liquid'}),
    ] : []),
    suspensionLayer(state.suspension, ratio > 0 ? liquidTop : NaN),
    ratio > 0 ? svg('path', {d: `M-8 ${liquidTop}Q0 ${liquidTop - 3} 8 ${liquidTop}`, class: 'meniscus'}) : null,
    foamLayer(state.foam, ratio > 0 ? liquidTop : NaN),
    svg('path', {d: 'M-12-52H12M-9-48Q0-45 9-48', class: 'glass-rim'}),
    svg('path', {d: 'M-4-46V46', class: 'glass-highlight'}),
    rateBubbles(state.rate, ratio > 0 ? liquidTop : NaN),
    reactionOverlay(state, 14, liquidTop, 52)
  )
  group.append(reacting)
  group.append(label(entity.label, 0, 78))
  return group
}
