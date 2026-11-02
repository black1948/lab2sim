import {add, label, shadow, svg} from './svg.js'

//  -  学生电源(120-用打点计时器演示匀速直线运动: 学生电源, 低压交流输出) - 
// 视觉依据: frame-007 特写(19.5s: 浅灰面板机箱, 左上圆形电压表刻度数字 8/10/12/14 沿弧
//           排布, 右上圆角子面板"Power indicator"下方黄绿色指示圆灯(通电亮), "ON"字+小按钮, 
//           竖排"电源开关", 红色圆形按钮+"OFF"字, 左下黑色调节旋钮与"2A max"字样, 机箱
//           右沿蓝色侧板); frame-001/006 全景(银灰面板机箱立在桌面后方, 底面两只小脚, 
//           底沿可见输出接线端钮).暗光采样归一化: 面板 #b9bcb4 族, 顶盖 #d3d5cd, 
//           蓝侧板 #274a73, 红按钮 #c23a2c, 指示灯亮 #e9ee4f(黄绿).
// 复用审查否决记录: 注册表无 power_supply 条目.可信源发现命中 twbs/icons battery-low
//           (16x16 单色电池 glyph) - 电池外壳+电量条, 与本机(电压表盘+指示灯+开/关
//           按钮+2A max 旋钮)形状语义完全不同, 且单色线稿与域内 2.5D 体块风格断裂, 
//           已回滚不注册, 转代码原生生成.
// 风格依据: physics.ticker-timer.v1.renderer.js 的机身体块+顶面斜折画法, 
//           physics.js renderGalvanometer 的表壳/刻度语言(电压表弧形刻度), 
//           physics.ticker-board.v1.renderer.js 的接地阴影与 inline 配色约定(不新增
//           styles.css class).
// 锚点: 局部 (0,0)=机箱底边中点(落地线).机身面 96×78(x∈[-48,48], y∈[-78,0]), 
//           顶盖斜折至 y=-85, 总高约 85px.
// 状态契约(scene visual.state_bindings 已声明 powered→indicator.lit, 渲染器读
//           state.powered): state.powered=true → "Power indicator"圆灯变亮(黄绿色 #e9ee4f
//           +外圈光晕 + 高光点); 断电时灯为暗橄榄色.开/关为面板印刷标识, 红色圆钮
//           Yes"OFF"位常驻按钮, 不随状态位移(frame-007).
// 契约参数: 无外部参数.
// 证据不清处: ① frame-007 电压表指针被手遮挡, 按指在 10-12V 间示意(补形); ② 面板
//           底沿的输出端钮在特写帧被裁, frame-001 全景仅见黑色圆钮, 按两只端钮补形于
//           左下; ③ 电源线出线位置帧内不可辨(机身背后), 不绘制.
// 导出签名与模板一致: renderPowerSupply(entity, state, context).
// 集成: renderer 键 physics/power-supply(index.js 的 import/注册由构建方完成: 复制本文件到
//           src/renderers/ 并在 index.js 注册 'physics/power-supply').

const PANEL = '#b9bcb4'       // 面板(frame-007 暗光采样归一化)
const PANEL_TOP = '#d3d5cd'   // 顶盖受光
const SUBPANEL = '#c9cbc3'    // 右侧子面板
const EDGE = '#55584f'        // 描边
const BLUE = '#274a73'        // 机箱蓝色侧沿(frame-007 右缘蓝条)
const FACE = '#eae8dc'        // 表盘米白
const DARKTEXT = '#3f423c'    // 面板印刷字
const RED = '#c23a2c'         // 红色按钮(frame-007)
const RED_EDGE = '#7e241b'
const LAMP_LIT = '#e9ee4f'    // 指示灯亮(黄绿, frame-007)
const LAMP_OFF = '#77795f'    // 指示灯灭(暗橄榄)
const KNOB = '#2c2c2a'        // 黑色调节旋钮

export function renderPowerSupply(entity, state = {}, context = {}) {
  const group = svg('g')
  const powered = Boolean(state.powered)
  const cx = 25            // 右侧子面板中轴
  const textAt = (content, x, y, size) => {
    const t = svg('text', {x, y, 'text-anchor': 'middle', fill: DARKTEXT, 'font-size': size})
    t.textContent = content
    return t
  }
  // 接地阴影 + 机箱主体(96×78)+ 顶盖斜折 + 蓝色右侧板(frame-007 右缘蓝条)
  add(group,
    shadow(0, 2.5, 52, 6),
    svg('rect', {x: -48, y: -78, width: 96, height: 78, rx: 3, fill: PANEL, stroke: EDGE, 'stroke-width': 1.6}),
    svg('path', {d: 'M-48 -78L-42 -85L42 -85L48 -78Z', fill: PANEL_TOP, stroke: EDGE, 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    svg('rect', {x: 41, y: -78, width: 7, height: 78, rx: 2, fill: BLUE, opacity: 0.92}),
  )
  // 底面小脚(frame-001 全景)
  add(group,
    svg('rect', {x: -42, y: 0, width: 10, height: 2.6, rx: 1, fill: '#6f7276'}),
    svg('rect', {x: 32, y: 0, width: 10, height: 2.6, rx: 1, fill: '#6f7276'}),
  )
  //  -  左上圆形电压表(弧形刻度 8/10/12/14, frame-007) - 
  const mx = -25
  const my = -47
  add(group,
    svg('circle', {cx: mx, cy: my, r: 21, fill: FACE, stroke: EDGE, 'stroke-width': 1.5}),
    svg('circle', {cx: mx, cy: my, r: 17.5, fill: 'none', stroke: '#c5c2b2', 'stroke-width': 1}),
  )
  const polar = (deg, r) => {
    const rad = (deg - 90) * Math.PI / 180
    return {x: mx + r * Math.cos(rad), y: my + r * Math.sin(rad)}
  }
  const arcPath = r => {
    const a = polar(-55, r)
    const b = polar(55, r)
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}A${r} ${r} 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
  }
  add(group,
    svg('path', {d: arcPath(15.5), fill: 'none', stroke: DARKTEXT, 'stroke-width': 1}),
    svg('path', {d: arcPath(13), fill: 'none', stroke: DARKTEXT, 'stroke-width': 0.6, opacity: 0.7}),
  )
  // 刻度数字+刻度线(8/10/12/14V, frame-007 沿弧排布)
  const SCALE = [
    {deg: -55, text: '8'},
    {deg: -18, text: '10'},
    {deg: 18, text: '12'},
    {deg: 55, text: '14'},
  ]
  for (const item of SCALE) {
    const t1 = polar(item.deg, 15.5)
    const t2 = polar(item.deg, 12.5)
    const n = polar(item.deg, 20)
    add(group,
      svg('line', {x1: t1.x.toFixed(1), y1: t1.y.toFixed(1), x2: t2.x.toFixed(1), y2: t2.y.toFixed(1), stroke: DARKTEXT, 'stroke-width': 1}),
      textAt(item.text, n.x.toFixed(1), (n.y + 1.8).toFixed(1), 5),
    )
  }
  // 表针(frame-007 被手遮挡, 按指在 10-12V 间补形)+ 表心轴
  const needle = polar(-36, 12)
  add(group,
    svg('line', {x1: mx, y1: my, x2: needle.x.toFixed(1), y2: needle.y.toFixed(1), stroke: '#8a4a38', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    svg('circle', {cx: mx, cy: my, r: 2, fill: '#55584f'}),
  )
  //  -  右侧子面板(电源指示 / 开关区, frame-007) - 
  group.append(svg('rect', {x: 4, y: -75, width: 42, height: 71, rx: 4, fill: SUBPANEL, stroke: '#7a7d74', 'stroke-width': 1.2}))
  group.append(textAt('Power indicator', cx, -66.5, 5.4))
  // 指示灯(powered 亮: 黄绿 + 光晕 + 高光; 灭: 暗橄榄)
  if (powered) {
    group.append(svg('circle', {cx, cy: -56.5, r: 7.4, fill: LAMP_LIT, opacity: 0.32}))
  }
  group.append(svg('circle', {cx, cy: -56.5, r: 4.6, fill: powered ? LAMP_LIT : LAMP_OFF, stroke: EDGE, 'stroke-width': 1.1}))
  if (powered) {
    group.append(svg('circle', {cx: cx - 1.4, cy: -58, r: 1.3, fill: '#fbfbe8', opacity: 0.95}))
  }
  group.append(textAt('ON', cx, -43.5, 6))
  // 开关小按钮(frame-007 中被手指部分遮挡的灰白小方钮)
  group.append(svg('rect', {x: cx - 4.5, y: -37, width: 9, height: 6.5, rx: 2, fill: '#8f938a', stroke: EDGE, 'stroke-width': 1}))
  // 竖排"电源开关"
  ;['power', 'source', 'ON', 'OFF'].forEach((ch, index) => group.append(textAt(ch, cx, -30.5 + index * 4.4, 4.6)))
  // 红色圆形按钮 + "OFF"(frame-007)
  group.append(svg('circle', {cx, cy: -12.5, r: 5.2, fill: RED, stroke: RED_EDGE, 'stroke-width': 1.2}))
  group.append(svg('circle', {cx: cx - 1.5, cy: -14.2, r: 1.5, fill: '#e8836f', opacity: 0.85}))
  group.append(textAt('OFF', cx, -4.8, 5))
  //  -  左下调节旋钮 + "2A max"(frame-007) - 
  const kx = -25
  const ky = -13
  group.append(svg('circle', {cx: kx, cy: ky, r: 6, fill: KNOB, stroke: '#111110', 'stroke-width': 1.1}))
  for (let index = 0; index < 8; index += 1) {
    const rad = index * Math.PI / 4
    group.append(svg('line', {
      x1: (kx + 4.4 * Math.cos(rad)).toFixed(1), y1: (ky + 4.4 * Math.sin(rad)).toFixed(1),
      x2: (kx + 6 * Math.cos(rad)).toFixed(1), y2: (ky + 6 * Math.sin(rad)).toFixed(1),
      stroke: '#4a4a46', 'stroke-width': 1,
    }))
  }
  group.append(svg('line', {x1: kx, y1: ky, x2: kx + 3.6, y2: ky - 3.6, stroke: '#8f938a', 'stroke-width': 1.2, 'stroke-linecap': 'round'}))
  group.append(textAt('2A max', -18, -3.2, 4.6))
  // 左下输出端钮(frame-001 全景底沿黑色圆钮, 补形)
  add(group,
    svg('circle', {cx: -44, cy: -5, r: 2.6, fill: '#26262a', stroke: '#0c0c0e', 'stroke-width': 0.9}),
    svg('circle', {cx: -37, cy: -5, r: 2.6, fill: '#26262a', stroke: '#0c0c0e', 'stroke-width': 0.9}),
  )
  group.append(label(entity.label, 0, 16))
  return group
}
