import {add, label, liquidColor, svg} from './svg.js'

//  -  铜丝螺旋(09 乙醇的氧化反应: 细长铜柄末端密绕螺旋线圈, 乙醇氧化的铜催化剂) - 
// 视觉依据(CASE_DIR/frames/): 
//   frame-006/007  细铜柄自右上(约 40° 手持)伸向酒精灯焰, 末端密绕螺旋; 柄顶有一个小弯钩
//                  (绕制时留下的手持端).柄明显细于螺旋线径.
//   frame-008      螺旋停在焰尖上方灼烧(加热位姿由构建方吸附表达, 渲染器只画器身).
//   frame-009      灼烧取出后螺旋整体变黑(CuO), 柄仍保持铜色 → 氧化只发生在螺旋段, 
//                  本渲染器把 state.color 只涂在整件器身上(IR 只下发一个 color 键), 
//                  变黑态以 IR 规则色 #26262a 呈现.
//   frame-013      螺旋竖直落入试管, 几乎填满管腔(外径≈管内宽; 管内腔半宽约 10.4px, 
//                  口径约 ±13px → 螺旋外径取 16.6px, 落入管内且不撑破口径).
//   frame-016      微距特写: 约 7 匝密绕, 匝间几乎无缝, 线径约为外径的 1/4~1/5.
// 颜色采样(PIL 直方图, 暗光实拍): 
//   铜态  frame-016 mid=#975243 bright=#ffe3ce; frame-006/007 mid=#644f3e/#884e29
//         bright=#cbb79e/#d1a78f  -  均为 #b87333 铜色族在暗光/镜面下的偏移, 
//         归一化到 IR 规则色 #b87333(state.color 缺省回退同值), 高光/描边由基色 shade 推导.
//   红热  frame-008 mid=#c62a2d(饱和橙红发射光)→ 辉光取 #ff5f2e/#ff6a2a/#ff8a3d 族, 
//         叠加不透明度随 state.heat 缩放; heat=0 时一个辉光节点都不画.
//   氧化黑 frame-009 mid=#63625e bright=#cdd0c5(暗炭灰+浅镜面反光; 采样偏亮系镜面所致, 
//         IR 规则色 #26262a 更深, 以 IR 色为准)→ 基色走 liquidColor(state, '#b87333'), 
//         被氧化时 IR 写 #26262a, shade 推导出的描边 #151517/高光 #36363d 恰好呈现炭灰镜面感.
// 风格依据: chemistry.js renderGlassRod / renderIronNail(discovered 先例)的金属杆画法 - 
//   细长杆 + 竖向高光 + 由基色 shade 推导描边/高光, 配色全部内联(不新增 styles.css class, 
//   CSS 类会覆盖属性 fill/stroke 吞掉 IR 下发色); 辉光画法同 biology.glowing-splint.v1
//   的分层不透明度光斑(无 filter/radialGradient, 确定性渲染).局部原点 = 螺旋线圈中心
//   (构建方吸附落位公式依赖此约定); 线圈绕竖直轴在原点两侧对称展开, 细柄自线圈上端
//   向上偏右伸出, 柄顶小弯钩示意手持端(frame-006/016).
// 状态绑定(构建方契约): state.color → 螺旋基色(默认 #b87333 族, 氧化黑 #26262a); 
//   state.heat(0..1)→ 红热辉光(背光晕 + 匝身热色叠描 + 柄根热段, 强度随 heat 线性缩放).
//   IR 另有 state.oxidized 键, 不单独落视觉(变黑已由 color 承载, 与 IR 规则一致).
// 不画接地阴影: 本器械是手持探件, IR 摆位为悬于焰上/管内蒸气中(frame-008/013), 固定
//   接地阴影会落在火焰或液面上产生悬空暗斑; 与 iron-nail(静置管底)情形不同.
// 几何(局部单位): 匝椭圆 rx 7.0/ry 2.2, 线径 2.6 → 螺旋外径 16.6px(scale 1.0, ≤18); 
//   7 匝, 匝距 2.42 → 线圈高 17.1px(原点 ±8.55); 柄自 (5.2,-6.6) 升至弯钩顶 y≈-52.6, 
//   柄线径 2.2; 自由端小线头 y≈10.6; 总高约 63px(契约 55~70).标签 withLabel 置于
//   y=-62(柄顶上方外侧).
// 集成(构建方): 文件置于 assets/simulator-template/src/renderers/, index.js 注册
//   ['chemistry/copper-spiral', renderCopperSpiral]; 注册表键 chemistry.copper-spiral.v1
//   由 IR visual.asset_ref 选择(不设 default_for_kind, metal_wire 为通用 kind, 先例同
//   chemistry.test-tube-layered.v1).
// 导出签名: renderCopperSpiral(entity, state).

const TURNS = 7            // frame-016 微距约 7 匝
const PITCH = 2.42         // 匝距(密绕: 略小于线径 2.6, 匝间无缝)
const RING_RX = 7.0        // 匝椭圆横半径 → 外径 2*(7.0+1.3)=16.6px
const RING_RY = 2.2        // 匝椭圆纵半径(2.5D 俯视角)
const WIRE_W = 2.6         // 螺旋线径(契约 2.2~3px)
const HANDLE_W = 2.2       // 柄线径(frame-006: 柄明显细于螺旋线)
const HANDLE_D = 'M5.2 -6.6C6.8 -11.5 5.9 -21.5 7.4 -33C8.2 -39 8.9 -43.5 9.1 -47.2Q9.7 -52.6 4.9 -52.4'
const TIP_D = 'M-6.3 8.0Q-7.6 9.4 -6.9 10.6'  // 自由端小线头(frame-016 左端末匝外的小弯头)

// 匝中心 y: 7 匝绕原点对称展开(-7.26 .. +7.26)
function turnCy(index) {
  return (index - (TURNS - 1) / 2) * PITCH
}

// 颜色明暗推导(确定性, 无外部依赖; 同 chemistry.iron-nail.v1 先例): 
// f<1 变深(描边/暗缘), f>1 变亮(高光)
function shade(hex, f) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) return hex
  const value = parseInt(match[1], 16)
  const channel = shift => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * f)))
  return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, '0')}`
}

// 单匝: 基色整匝 + 下缘暗弧(匝间缝)+ 上缘高光弧(2.5D 金属反光)
function turn(metal, edge, highlight, index) {
  const cy = turnCy(index)
  return [
    svg('ellipse', {cx: 0, cy, rx: RING_RX, ry: RING_RY, fill: 'none', stroke: metal, 'stroke-width': WIRE_W}),
    svg('path', {
      d: `M${-RING_RX * 0.66} ${cy + RING_RY * 0.755}A${RING_RX} ${RING_RY} 0 0 0 ${RING_RX * 0.66} ${cy + RING_RY * 0.755}`,
      fill: 'none', stroke: edge, 'stroke-width': 0.75, opacity: 0.6, 'stroke-linecap': 'round',
    }),
    svg('path', {
      d: `M${-RING_RX * 0.63} ${cy - RING_RY * 0.78}A${RING_RX} ${RING_RY} 0 0 1 ${RING_RX * 0.63} ${cy - RING_RY * 0.78}`,
      fill: 'none', stroke: highlight, 'stroke-width': 0.85, opacity: 0.9, 'stroke-linecap': 'round',
    }),
  ]
}

export function renderCopperSpiral(entity, state = {}) {
  const group = svg('g')
  // 金属色: state.color(IR 规则下发 #b87333 / 氧化黑 #26262a), 缺省回退铜色
  const metal = liquidColor(state, '#b87333')
  const edge = shade(metal, 0.55)
  const highlight = shade(metal, 1.45)
  const heatRaw = Number(state.heat)
  const heat = Number.isFinite(heatRaw) ? Math.min(1, Math.max(0, heatRaw)) : 0

  // 红热辉光(heat>0 才画; 强度随 heat 线性缩放; frame-008 焰中红热采样 #c62a2d)
  if (heat > 0) {
    const glow = svg('g')
    add(glow,
      // 背景柔光晕(三层, 分层不透明度画法同 glowing-splint 余烬光斑)
      svg('ellipse', {cx: 0, cy: 0, rx: 14.5, ry: 10.5, fill: '#ff5f2e', opacity: 0.10 + 0.16 * heat}),
      svg('ellipse', {cx: 0, cy: 0, rx: 10, ry: 7, fill: '#ff6a2a', opacity: 0.16 + 0.28 * heat}),
      svg('ellipse', {cx: 0, cy: 0, rx: 7.6, ry: 5.2, fill: '#ff8a3d', opacity: 0.20 + 0.34 * heat}),
    )
    group.append(glow)
  }

  // 螺旋线圈: 自上而下逐匝叠画(后画的下匝盖住上匝下缘, 形成密绕匝间缝)
  const coil = svg('g')
  for (let index = 0; index < TURNS; index += 1) add(coil, turn(metal, edge, highlight, index))
  // 自由端小线头(frame-016 左端末匝外的小弯头)
  add(coil, svg('path', {d: TIP_D, fill: 'none', stroke: metal, 'stroke-width': HANDLE_W, 'stroke-linecap': 'round'}))
  group.append(coil)

  // 细柄: 暗缘 → 基色 → 高光(三叠画法同 iron-nail 杆身), 柄顶小弯钩示意手持端
  add(group,
    svg('path', {d: HANDLE_D, fill: 'none', stroke: edge, 'stroke-width': HANDLE_W + 0.7, 'stroke-linecap': 'round'}),
    svg('path', {d: HANDLE_D, fill: 'none', stroke: metal, 'stroke-width': HANDLE_W, 'stroke-linecap': 'round'}),
    svg('path', {d: HANDLE_D, fill: 'none', stroke: highlight, 'stroke-width': 0.7, opacity: 0.8, 'stroke-linecap': 'round', transform: 'translate(-0.5 -0.5)'}),
  )

  // 匝身热色叠描 + 柄根热段(heat>0; 叠在基色上呈现红热金属本身在发光)
  if (heat > 0) {
    const hot = svg('g')
    for (let index = 0; index < TURNS; index += 1) {
      const cy = turnCy(index)
      add(hot,
        svg('ellipse', {cx: 0, cy, rx: RING_RX, ry: RING_RY, fill: 'none', stroke: '#ff7a30', 'stroke-width': WIRE_W, opacity: 0.26 + 0.46 * heat}),
        svg('path', {
          d: `M${-RING_RX * 0.63} ${cy - RING_RY * 0.78}A${RING_RX} ${RING_RY} 0 0 1 ${RING_RX * 0.63} ${cy - RING_RY * 0.78}`,
          fill: 'none', stroke: '#ffc98d', 'stroke-width': 1.0, opacity: 0.16 + 0.34 * heat, 'stroke-linecap': 'round',
        }),
      )
    }
    add(hot, svg('path', {
      d: 'M5.2 -6.6C6.8 -11.5 5.9 -18 6.6 -23',
      fill: 'none', stroke: '#ff7a30', 'stroke-width': HANDLE_W, opacity: 0.18 + 0.30 * heat, 'stroke-linecap': 'round',
    }))
    group.append(hot)
  }

  // 器械标签: 柄顶上方外侧(既有 apparatus-label class, 无新增)
  group.append(label(entity.label, 0, -62))
  return group
}
