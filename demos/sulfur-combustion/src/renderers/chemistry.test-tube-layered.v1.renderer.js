import {add, label, liquidColor, shadow, svg} from './svg.js'

//  -  收集管-双层液体变体(07 乙酸乙酯的制备及反应条件探究) - 
// 局部几何与 chemistry.js renderTestTube 完全一致(管体 M-10-52H10L9 54Q9 62 0 62Q-9 62-9 54Z, 
// 口沿 y=-52..-48, 内壁 ±8, 高光 M-4-46V46, 接地阴影 shadow(0,62,16,5), 标签 y=78), 
// 玻璃配色/线宽/2.5D 全部沿用 styles.css 既有 glass-body/glass-rim/glass-highlight/liquid/meniscus 族.
// 在单层 renderTestTube 之上新增三个数据驱动状态(渲染器直读 state 字段, 先例同
// chemistry.digital-thermometer.v1.renderer.js): 
//   volume_ml + color → 下层液体(液位算法同 renderTestTube: ratio=volume_ml/capacity_ml, 
//     liquidTop = 42 - ratio*82; capacity 取 entity.properties?.capacity_ml || 10 - svg.js
//     liquidRatio 的缺省回退是 50, 本变体按试管口径改为 10, 其余 clamp(0.04..0.9) 一致); 
//   layer_cm → 浮在液面上方的无色油层厚度(1cm ≈ 14px; 0 时不画任何节点), 带顶面/界面两条
//     meniscus 描线, 顶面另有一条淡品红环带(证据帧油层一出现顶面粉环就可见, 见下); 
//   foam (bool) → 界面白色泡沫团(6 颗确定性坐标白圆骑在界面线上)+ 界面两端淡品红椭圆环.
// 视觉依据(CASE_DIR/frames/): 
//   frame-005/009   收集管配液与品红液柱(下层单液, 尚未有浮层); 
//   frame-015/016   馏出物到达, 液柱顶部出现无色带与粉环; 
//   frame-019       直尺实测油层约 2cm(IR distill-layer-rule 据此定 layer_cm=2.0); 
//   frame-038/046/47 界面白色泡沫团 + 两端品红环 + 顶部粉环同时可见(管内自上而下: 
//                   顶面粉环 → 无色油带 → 白色泡沫团/品红环 → 品红下层); 
//   frame-042/043   顶部粉环特写(厚品红环带, 暗光采样 #884165~#b2208a).
// 配色归一化: 下层液色由 IR color 驱动(规则下发 #c2255c, 酚酞品红), 渲染器回退取同族
// '#c2255c'(svg.js liquidColor 缺省 #55b9cf 是蓝绿水色, 不合本案); 暗光实拍色
// (#1d0b27~#2e1434 液柱, #f28bd5 透光边)按模板亮色调约定归一化后交由 .liquid 78% 不透明度呈现.
// 泡沫白取 #ffffff/#d8cfc2, 品红环/顶环以 IR 品红 #c2255c 的半透明描线表达, 不新增 styles.css class.
// 证据不清处: 泡沫团颗数/粒径在原帧不可数(352x288 实际分辨率), 按 6 颗确定性布置; 
// 油层内馏出物流注细流(frame-046 可见)属运液过程特效, 归 #fx 液流承担, 本渲染器不画.
// 与 renderTestTube 的另外两点差异: ① 顶部粉环(class surface-ring, 内联描线)绑定 layer_cm>0
// 而非 foam - frame-016/019/037 顶层粉环随油层出现, 早于泡沫团可见(IR distill-foam-rule 阶段
// layer 已置 0.5, 两态都能看到环); ② 无下层液体而仅有油层时(IR 流程不会出现, 防御分支)油层
// 沉底.gas 雾层不画: vesselGasLayer 虽由 chemistry.js 导出, 但本案收集管无 gas_level 状态, 
// 且 discovered 模块保持仅依赖 ./svg.js 的先例.
// reactingGroup/reactionOverlay 在 chemistry.js 内为模块私有(未导出, 无法导入), 此处按原实现
// 重写(REACTION_PHASES 相位表, 气泡布局与 --d/--x 变量完全一致), 保证 .reacting 抖动与
// reaction-bubble 动画行为同单层试管.
// 导出签名: renderTestTubeLayered(entity, state).
// 集成(构建方): 文件置于 assets/simulator-template/src/renderers/, index.js 注册
// ['chemistry/test-tube-layered', renderTestTubeLayered]; 注册表键 chemistry.test-tube-layered.v1
// 由 IR visual.asset_ref 选择(不设 default_for_kind, test_tube 默认仍指 chemistry.test-tube.v1).

// 界面泡沫团: 6 颗确定性白圆(dx 相对管轴, r 半径, lift 圆心相对界面线抬高量 - lift<r 故圆骑在线上)
const FOAM_BEADS = [
  {dx: -6.1, r: 2.1, lift: 0.8},
  {dx: -3.6, r: 2.7, lift: 1.4},
  {dx: -0.9, r: 2.3, lift: 0.6},
  {dx: 1.7, r: 2.9, lift: 1.6},
  {dx: 4.4, r: 2.0, lift: 0.7},
  {dx: 6.6, r: 1.5, lift: 0.3},
]
const CM_TO_PX = 14        // 1cm 油层厚度(frame-019 直尺 2cm ≈ 28px)
const OIL_TOP_LIMIT = -44  // 油面最高可达 y(口沿内 -48 之下留 4px, 防顶穿玻璃)
const OIL_FILL = '#f7fbfc' // 无色油层(微冷白, 较玻璃 35% 底色更实)
const OIL_OPACITY = 0.85
const MAGENTA = '#c2255c'  // IR 品红族(酚酞), 环带描线取其半透明

// 与 svg.js liquidRatio 同式, capacity 回退改试管口径 10(见头部说明)
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

//  -  以下两个 helper 按 chemistry.js 原实现重写(该文件未导出, 无法复用) - 
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

export function renderTestTubeLayered(entity, state = {}) {
  // 双层组: 外层定位, 内层承接 .reacting 抖动(CSS transform 动画会覆盖属性 transform, 同 renderTestTube)
  const group = svg('g')
  const reacting = reactingGroup(state)
  const ratio = testTubeRatio(entity, state)
  const liquidTop = 42 - ratio * 82
  // 油层: 厚度 px 夹到可用内腔, >=1px 才画(0 完全不可见)
  const interfaceY = ratio > 0 ? liquidTop : 50
  const layerPx = Math.min(Number(state.layer_cm || 0) * CM_TO_PX, interfaceY - OIL_TOP_LIMIT)
  const hasLayer = Number.isFinite(layerPx) && layerPx >= 1
  const oilTop = interfaceY - layerPx
  add(reacting,
    shadow(0, 62, 16, 5),
    svg('path', {d: 'M-10-52H10L9 54Q9 62 0 62Q-9 62-9 54Z', class: 'glass-body'}),
    ...(ratio > 0 ? [
      svg('path', {d: `M-8 ${liquidTop}Q0 ${liquidTop - 2} 8 ${liquidTop}V54Q8 58 3 59H-3Q-8 58-8 54Z`, fill: liquidColor(state, MAGENTA), class: 'liquid'}),
    ] : []),
    ...(hasLayer ? [
      // 无色油带: 底边=界面曲线(或沉底曲线), 顶边=油面曲线
      svg('path', {
        d: ratio > 0
          ? `M-8 ${oilTop}Q0 ${oilTop - 2} 8 ${oilTop}L8 ${liquidTop}Q0 ${liquidTop - 2} -8 ${liquidTop}Z`
          : `M-8 ${oilTop}Q0 ${oilTop - 2} 8 ${oilTop}L8 50Q8 55 3 56H-3Q-8 55-8 50Z`,
        fill: OIL_FILL,
        opacity: OIL_OPACITY,
        class: 'oil-layer',
      }),
      // 顶部粉环(frame-016/019/037/042/046: 油层一出现顶面即有品红环, 早于泡沫可见)
      svg('path', {d: `M-7.2 ${oilTop + 2}Q0 ${oilTop - 1} 7.2 ${oilTop + 2}`, fill: 'none', stroke: MAGENTA, 'stroke-width': 2.4, opacity: 0.45, class: 'surface-ring'}),
      // 油面 meniscus 描线
      svg('path', {d: `M-8 ${oilTop}Q0 ${oilTop - 3} 8 ${oilTop}`, class: 'meniscus'}),
    ] : []),
    // 界面 meniscus 描线(画在油带之后, 保证透过 85% 油层仍可见; 无油层时即 renderTestTube 原液面线)
    ratio > 0 ? svg('path', {d: `M-8 ${liquidTop}Q0 ${liquidTop - 3} 8 ${liquidTop}`, class: 'meniscus'}) : null,
    ...(state.foam && ratio > 0 ? [
      // 界面两端淡品红椭圆环(frame-046/047 界面品红环, 呼应 frame-042/043 顶部粉环)
      svg('ellipse', {cx: -6.3, cy: liquidTop, rx: 2.4, ry: 1.05, fill: 'none', stroke: MAGENTA, 'stroke-width': 1.2, opacity: 0.4, class: 'interface-ring'}),
      svg('ellipse', {cx: 6.3, cy: liquidTop, rx: 2.4, ry: 1.05, fill: 'none', stroke: MAGENTA, 'stroke-width': 1.2, opacity: 0.4, class: 'interface-ring'}),
      // 界面白色泡沫团(frame-038/046: 白团骑在界面线上)
      ...FOAM_BEADS.map(bead => svg('circle', {
        cx: bead.dx,
        cy: liquidTop - bead.lift,
        r: bead.r,
        fill: '#ffffff',
        stroke: '#d8cfc2',
        'stroke-width': 0.6,
        class: 'foam-bead',
      })),
    ] : []),
    svg('path', {d: 'M-12-52H12M-9-48Q0-45 9-48', class: 'glass-rim'}),
    svg('path', {d: 'M-4-46V46', class: 'glass-highlight'}),
    reactionOverlay(state, 14, liquidTop, 52)
  )
  group.append(reacting)
  group.append(label(entity.label, 0, 78))
  return group
}
