import {svg} from './svg.js'

//  -  面板旋钮(kind=panel_knob, case 138: 加速电压 0–350V / 励磁电流 0–3A, 两只同款) - 
// 视觉依据: frame-005(面板特写: 黑色滚花旋钮+深色裙边, 顶面有浅色指示刻线, 旋钮外围面板
//           印弧形刻度; frame-014 暗室中旋钮裙边/本体剪影一致); frame-007(手指捏旋钮调整
//           励磁电流, 旋钮形态不变).
// 复用审查否决(注册表无 panel_knob 条目): physics.weight-knob.v1=铬钢砝码顶球形提钮(非面板
//           旋钮); circuits.rotary-switch.v1=电路域频率选择旋钮(r25 大盘体+内嵌 20Hz/200Hz/
//           2kHz 丝印档位, 几何与本例 r13 本体+r16 裙边契约不符且丝印字义错误) - 禁止顶替.
//           可信源发现命中 feathericons activity.svg(心电折线 glyph, 词元误配)已回滚(trace
//           assets/rollback-panel_knob), 故代码原生生成.
// 风格基础: 黑色滚花旋钮沿 power-supply.v1.renderer.js KNOB(#2c2c2a 族+滚花短线+浅色指示线)
//           与 crt-demo-console.v1.renderer.js knob(裙边圈+本体+指示刻线+高光点)画法; 本体
//           #26262a 按契约给定.配色全部内联, 不新增 styles.css class.
// 关键尺寸(局部原点=旋钮中心, y 向下为正): 裙边 r16(深黑底盘); 本体 r13+滚花齿 16 根
//           (r11→r13)+内圈线 r10.5+中心毂 r3.4+白色指示线 (0,-3.5)→(0,-12.2).总直径 32px.
// 状态契约(读实体自身 state): state.angle_deg=指示线方位角, 0°=竖直向上, 顺时针为正 - 渲染
//           器对旋钮本体组应用 rotate(angle_deg)(SVG rotate 正角即屏幕顺时针, 指示线 0° 位
//           竖直向上); 缺省/非数值按 0.无其他状态.
// 证据不清处: ① 旋钮全程被手遮挡时的角度变化(frame-007/014)不可辨→角度完全由引擎
//           state.angle_deg 驱动, 渲染器不做证据角度绑定; ② 旋钮顶面字符/数字不可辨→不刻字.
// 集成: 复制本文件到模板 src/renderers/ 并在 index.js 注册 'physics/panel-knob'
//           (import {renderPanelKnob} from './physics.panel-knob.v1.renderer.js').
//           场景落位(构建方契约): 加速电压旋钮 (0.40,0.18)→屏幕 px (400,470), 励磁旋钮
//           (0.533,0.18)→(533,470), scale 1.15 - 即主机面板凸座排 x=-87/x=+29(局部)的屏幕
//           投影位, 旋钮本体叠于凸座之上.kind 唯一资产 default_for_kind=true.不画 label
//           (旋钮总径 32px, 13px 标签大于本体且必叠压主机面板图形, panel-lever 不画 label
//           先例; 器材识别由动作 label 与主机面板承担); 不画接地阴影(面板安装件); 
//           外围弧形刻度由主机渲染器绘制(本渲染器只画旋钮本体).hit 区域由 IR
//           visual.hit_shape 声明.

const KNOB = '#26262a'        // 旋钮本体(契约给定)
const KNOB_EDGE = '#0e0e10'
const SKIRT = '#1b1b1f'       // 裙边底盘
const KNURL = '#4a4a46'       // 滚花齿(power-supply KNOB 同族)
const INNER = '#313136'       // 本体内圈线
const POINTER = '#f2f0e6'     // 白色指示线

export function renderPanelKnob(entity, state = {}, context = {}) {
  const group = svg('g')
  const raw = Number(state.angle_deg)
  const angle = Number.isFinite(raw) ? raw : 0
  // 裙边(静止底盘, 不随角度旋转)
  group.append(svg('circle', {cx: 0, cy: 0, r: 16, fill: SKIRT, stroke: '#0a0a0c', 'stroke-width': 1.2}))
  // 旋钮本体组(随 angle_deg 旋转: 0°=竖直向上, 顺时针为正)
  const body = svg('g', {transform: `rotate(${angle.toFixed(2)})`})
  body.append(svg('circle', {cx: 0, cy: 0, r: 13, fill: KNOB, stroke: KNOB_EDGE, 'stroke-width': 1.4}))
  body.append(svg('circle', {cx: 0, cy: 0, r: 10.5, fill: 'none', stroke: INNER, 'stroke-width': 1}))
  for (let index = 0; index < 16; index += 1) {
    const rad = index * Math.PI / 8
    body.append(svg('line', {
      x1: (11 * Math.cos(rad)).toFixed(1), y1: (11 * Math.sin(rad)).toFixed(1),
      x2: (13 * Math.cos(rad)).toFixed(1), y2: (13 * Math.sin(rad)).toFixed(1),
      stroke: KNURL, 'stroke-width': 1,
    }))
  }
  body.append(svg('line', {x1: 0, y1: -3.5, x2: 0, y2: -12.2, stroke: POINTER, 'stroke-width': 1.8, 'stroke-linecap': 'round'}))
  body.append(svg('circle', {cx: 0, cy: 0, r: 3.4, fill: '#101013', stroke: '#3a3a3e', 'stroke-width': 1}))
  body.append(svg('circle', {cx: -2.6, cy: -3.2, r: 1.5, fill: 'rgb(255 255 255 / 22%)'}))
  group.append(body)
  return group
}
