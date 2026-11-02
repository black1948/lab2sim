import {add, label, shadow, svg} from './svg.js'

//  -  微小压强计(U形管压强计+标度板, kind=u_tube_manometer; 117-用微小压强计演示超重于失重) - 
// 视觉依据: frame-002(静息特写: 左右液面同高 ≈3.9 格), frame-007(加载特写: 左 5.2 /
//           右 ≈3.1, 构建方台账 seq7 另测 frame-031 5.85/3.7 - 左升右降, 右臂为连接臂).
//           白色标度板夹在两根平行玻璃臂之间: 数字 10 在顶, 往下 9..1, 0 在板高中部偏下, 
//           0 以下再标 1..10(frame-007 全板可见); 整数刻度间有密集细分刻度, 数字右侧带短横; 
//           玻璃臂底部 U 形连通.深红液体(frame-002 暗光采样 #3e0100/#400100, 归一化取
//           #8b1a12, 弯月面高光提亮 #d0503c).整体夹持在铁架台上(iron-stand 渲染器由
//           构建方承担, 本渲染器不画夹持件).
// 局部原点 = 标度板底边中点(y 向下为正, 节点内 SVG 屏幕).
// 几何(scale=1): 板 52×300(x±26, y -300..0); 两臂中心 x=±32(visual.arm_dx), 臂宽 18, 
//           玻璃 y -308..+8, 底部 U 形连通(y +6..+15); 格距 unit_px=14(visual.unit_px), 
//           0 刻度线在 y=-152(板高中部偏下, visual.zero_offset_px); 整数刻度线在数字左右
//           断开, 半格细线全宽(frame-002 密集细刻度的可读化); 右臂外侧 y≈-22 处短玻璃嘴
//           接乳胶管(接口局部坐标见 design_notes).接地阴影沿用 renderWeight 恒画先例.
// 状态契约: state.level_diff = 左右液面差 d(格, 缺省 0); 左柱液面 = rest + d/2, 
//           右柱液面 = rest − d/2(rest=visual.rest_level 缺省 3.9; 增压时右柱[连接臂]下降, 
//           与 frame-007/031 一致).液面各自夹到 0.2..10.2 格防溢出标度.
// 参数契约(context.visual, 全部带缺省回退 - resolve_assets 只拷白名单键, 缺省值是双保险): 
//           rest_level=3.9, unit_px=14, arm_dx=32, zero_offset_px=152, liquid_color='#8b1a12'.
// 风格依据: physics.js 体块+受光面+接地阴影画法与 svg.js 的 add/label/shadow 工具; 玻璃用
//           既有 glass-body/glass-rim/glass-highlight, 液体用既有 .liquid(78% 不透明度), 
//           标度配色/字体 inline, 不新增 styles.css class.
// 证据不清处: frame-003/007/019/031 里乳胶管沿朝向探头那侧的臂外侧行走, 管-臂遮挡关系
//           无法定哪臂接管(构建方按液面响应裁定右臂=连接臂, 本渲染器据此把喷嘴画在右臂
//           外侧); 喷嘴精确高度帧内不可辨, 取右臂下部 y=-22.
// 导出签名与模板一致: renderUTubeManometer(entity, state, context).
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/u-tube-manometer'
//   (import {renderUTubeManometer} from './physics.u-tube-manometer.v1.renderer.js').

const NUM_ATTRS = {'font-size': 9, 'font-family': 'Georgia, serif', 'font-weight': 600}
const BOARD_FILL = '#f0e9d6'
const BOARD_EDGE = '#a5987a'
const TICK_DARK = '#6b6152'
const TICK_LIGHT = '#9a8f76'
const NUM_INK = '#3a3226'

export function renderUTubeManometer(entity, state = {}, context = {}) {
  const visual = context.visual || {}
  const unit = Number(visual.unit_px || 14)
  const rest = Number(visual.rest_level ?? 3.9)
  const armDx = Number(visual.arm_dx || 32)
  const zeroY = -Number(visual.zero_offset_px ?? 152)
  const liquid = typeof visual.liquid_color === 'string' ? visual.liquid_color : '#8b1a12'
  const d = Number(state.level_diff || 0)
  const clampLevel = v => Math.max(0.2, Math.min(10.2, v))
  const leftLevel = clampLevel(rest + d / 2)   // 开口臂(左) - 加载后上升
  const rightLevel = clampLevel(rest - d / 2)  // 连接臂(右) - 增压下降
  const yL = zeroY - leftLevel * unit
  const yR = zeroY - rightLevel * unit
  const inner = armDx - 9   // 臂内壁(臂宽 18 → 内缘 ±23 当 armDx=32)
  const outer = armDx + 9   // 臂外缘 ±41
  const group = svg('g')

  group.append(shadow(0, 14, 40, 6))

  // 标度板(画在臂后面, 臂缘压住板边 - frame-002 板面被两臂夹持)
  group.append(svg('rect', {x: -26, y: -300, width: 52, height: 300, rx: 2, fill: BOARD_FILL, stroke: BOARD_EDGE, 'stroke-width': 1.5}))
  // 刻度: 整数线在中央数字区断开(frame-002 版式: 数字居中, 线让位), 半格细线全宽
  const ticks = svg('g')
  const lineAt = (y, x1, x2, stroke, w) => ticks.append(svg('path', {d: `M${x1} ${y}H${x2}`, stroke, 'stroke-width': w, fill: 'none'}))
  for (let n = -10; n <= 10; n += 1) {
    const y = zeroY - n * unit
    if (y < -297 || y > -4) continue
    lineAt(y, -24, -7, TICK_DARK, n === 0 ? 1.3 : 1.1)
    lineAt(y, 17, 24, TICK_DARK, n === 0 ? 1.3 : 1.1)
    const yh = y - unit / 2
    if (n !== 10 && n !== -10 && yh >= -297 && yh <= -4) lineAt(yh, -24, 24, TICK_LIGHT, 0.7)
  }
  group.append(ticks)
  // 数字: 0 以上 10..1, 0, 0 以下 1..10(frame-007 全板标定)
  for (let n = -10; n <= 10; n += 1) {
    const y = zeroY - n * unit
    if (y < -294 || y > -8) continue
    const text = svg('text', {x: 5, y: y + 3, 'text-anchor': 'middle', fill: NUM_INK, ...NUM_ATTRS})
    text.textContent = String(Math.abs(n))
    group.append(text)
  }

  // 玻璃臂(夹板而立)+ 底部 U 形连通(外壁 y≈18 / 内壁 y≈6, 弯位孔径 ≈10px)
  group.append(
    svg('path', {d: `M${-outer} 8Q${-outer} 18 ${-armDx + 9} 18H${armDx - 9}Q${outer} 18 ${outer} 8`, class: 'glass-body'}),
    svg('path', {d: `M${-inner} 0Q${-inner} 6 ${-armDx + 14} 6H${armDx - 14}Q${inner} 6 ${inner} 0`, fill: 'none', stroke: '#41626b', 'stroke-width': 1.5}),
    svg('rect', {x: -outer, y: -308, width: 18, height: 324, rx: 8, class: 'glass-body'}),
    svg('rect', {x: outer - 18, y: -308, width: 18, height: 324, rx: 8, class: 'glass-body'}),
    // 管口沿
    svg('path', {d: `M${-outer - 1.5} -306H${-outer + 19.5}M${outer - 19.5} -306H${outer + 1.5}`, class: 'glass-rim'}),
    // 左臂内侧受光高光
    svg('path', {d: `M${-outer + 4} -300V4M${-inner - 4} -300V4`, class: 'glass-highlight', opacity: 0.45, 'stroke-width': 2}),
    svg('path', {d: `M${inner + 4} -300V4M${outer - 4} -300V4`, class: 'glass-highlight', opacity: 0.3, 'stroke-width': 2}),
  )

  // 深红液体: 两柱 + U 形连通一体(.liquid 78% 不透明度), 弯月面高光
  group.append(svg('path', {
    d: `M${-outer + 2} ${yL}H${-inner - 2}V2Q${-inner - 2} 7 ${-armDx + 15} 7H${armDx - 15}Q${inner + 2} 7 ${inner + 2} 2V${yR}H${outer - 2}V9Q${outer - 2} 16 ${armDx - 9} 16H${-armDx + 9}Q${-outer + 2} 16 ${-outer + 2} 9Z`,
    fill: liquid, class: 'liquid',
  }))
  group.append(
    svg('path', {d: `M${-outer + 2} ${yL}H${-inner - 2}`, stroke: '#4a0b05', 'stroke-width': 1.6, fill: 'none'}),
    svg('path', {d: `M${inner + 2} ${yR}H${outer - 2}`, stroke: '#4a0b05', 'stroke-width': 1.6, fill: 'none'}),
    svg('ellipse', {cx: (-outer - inner) / 2, cy: yL + 1.2, rx: 6, ry: 1.5, fill: '#d0503c', opacity: 0.5}),
    svg('ellipse', {cx: (outer + inner) / 2, cy: yR + 1.2, rx: 6, ry: 1.5, fill: '#d0503c', opacity: 0.5}),
  )

  // 右臂下部外侧短玻璃嘴(接乳胶管; 接口局部坐标 (+49,-19) 见 design_notes)
  group.append(
    svg('path', {d: `M${outer - 2} -26L${outer + 8} -22L${outer + 8} -15L${outer - 2} -18Z`, class: 'glass-body'}),
    svg('ellipse', {cx: outer + 8, cy: -18.5, rx: 2.2, ry: 3.4, fill: '#dcedf1', stroke: '#41626b', 'stroke-width': 1.2}),
  )

  group.append(label(entity.label, 0, 36))
  return group
}
