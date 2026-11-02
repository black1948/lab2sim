import {add, label, shadow, svg} from './svg.js'

//  -  玻璃漏斗(倒扣集气变体: 穹顶朝下扣住植株, 漏斗颈朝上伸出水面; 无滤纸) - 
// 视觉依据: frame-003(漏斗侧放: 薄壁玻璃, 宽口沿 + 锥体收窄 + 细颈, 无滤纸); frame-012/
// 014/015(倒置使用: 宽口沿(最宽圆)沉在水下近杯底, 锥面自口沿向上收窄成穹顶, 细颈自穹顶
// 顶端向上伸出水面; frame-015 特写见穹顶内壁挂气泡).全片漏斗均无滤纸 - chemistry.funnel.v1
// 的常驻 filter-paper/residue/wet 画法属虚假细节, 且其锥口朝上, 颈向下的正立姿态与证据相反, 
// 故否决复用(复用审查记录 trace assets/reuse-review:funnel).
// 发现记录: discover_apparatus.py --kind funnel 唯一候选 chemistry.funnel.funnel-fill.v1
// (twbs/icons 16x16 单色 UI 字形)风格断裂, 已否决并撤销自动注册.
// 风格依据: chemistry.js renderFunnel / renderBeaker 的玻璃画法 - glass-body 半透明填充, 
// glass-rim 口沿线, glass-highlight 竖向高光, apparatus-shadow 接地阴影; 气泡画法沿用
// chemistry.beaker-inverted.v1 的 glistening 水珠双圆画法(inline 配色, 不新增 class).
// 局部几何(与 IR/构建方约定对齐): (0,0)=穹顶最宽圆(口沿)圆心; 口沿椭圆 rx27/ry6.5 在
// y=0; 锥面自口沿向 -y(above)收窄至 y=-50 的颈接 aperture(±3.8); 颈管向 -y 伸出至
// y=-110(顶端微敞口沿).总高 ≈110px, 最宽 54px.
// 几何读法说明(如实记录, 供构建方核验): 任务约定写穹顶在 +y(下方), 但按该字面读法
// (穹顶自 (0,0) 向下延伸)+ 构建方声明的 gap_overrides beaker=-0.08(漏斗原点置于烧杯中心
// 下方 0.08 场景单位 ≈40 局部 px), 穹顶将穿过烧杯内底(renderBeaker 杯底 ≈ 杯心 +47 局部
// px @scale1.35), 且与颈向 -y 伸出水面在实体解剖上不能同时成立; 证据帧(frame-012/014/
// 015)均为口沿在下, 穹顶向上收窄.故本渲染取 (0,0)=最宽圆心, 穹顶向 -y 收窄, 颈向 -y 伸出: 
// gap=-0.08 时口沿与穹顶恰沉入烧杯内(杯心下方 40px ≈ 杯内下部, frame-014 位置), 颈伸出
// 水面, 与全部引用帧一致.
// 状态绑定(IR visual.state_bindings): state.bubbles=true → 穹顶内壁上升/挂壁气泡 + 颈内
// 两颗(frame-015 穹顶挂泡; 确定性坐标).无液层/无滤纸/无残渣(volume 类状态有意忽略 - 
// 本实验漏斗内不盛液).
const RIM_RX = 27
const RIM_RY = 6.5
const APEX_Y = -50
const APEX_RX = 3.8
const NECK_TOP = -110

// 穹顶内壁/颈内气泡(state.bubbles; 确定性坐标, 渲染可复现)
function domeBubbles() {
  const drops = [
    {cx: -7, cy: -16, r: 2.1}, {cx: 8, cy: -24, r: 1.7}, {cx: -2, cy: -33, r: 2.4},
    {cx: 12, cy: -12, r: 1.5}, {cx: 3, cy: -42, r: 1.8}, {cx: -11, cy: -8, r: 1.4},
    {cx: 0, cy: -66, r: 1.5}, {cx: 0.6, cy: -86, r: 1.3},
  ]
  return drops.map(({cx, cy, r}) => {
    const drop = svg('g')
    drop.append(
      svg('circle', {cx, cy, r, fill: 'rgb(240 250 253 / 88%)', stroke: 'rgb(125 165 178 / 55%)', 'stroke-width': 0.6}),
      svg('circle', {cx: cx - r * 0.3, cy: cy - r * 0.35, r: r * 0.28, fill: '#ffffff', opacity: 0.95}),
    )
    return drop
  })
}

export function renderFunnelInverted(entity, state = {}) {
  const group = svg('g')
  add(group,
    shadow(0, 5, 25, 5),
    // 锥形穹顶壳体(口沿在 y=0, 向上收窄至颈接 aperture; glass-body 半透明)
    svg('path', {
      d: `M${-RIM_RX} 0Q-19 -22 ${-APEX_RX} ${APEX_Y}L${APEX_RX} ${APEX_Y}Q19 -22 ${RIM_RX} 0A${RIM_RX} ${RIM_RY} 0 0 1 ${-RIM_RX} 0Z`,
      class: 'glass-body',
    }),
  )
  // 颈管(自 aperture 向 -y 伸出, 顶端微敞)
  add(group, svg('path', {
    d: `M${-APEX_RX} ${APEX_Y}V${NECK_TOP + 2}Q${-APEX_RX} ${NECK_TOP} 0 ${NECK_TOP}Q${APEX_RX} ${NECK_TOP} ${APEX_RX} ${NECK_TOP + 2}V${APEX_Y}Z`,
    class: 'glass-body',
  }))
  add(group,
    // 口沿(最宽圆: 外椭圆 + 内口椭圆弱线, frame-003 薄壁口沿)
    svg('ellipse', {cx: 0, cy: 0, rx: RIM_RX, ry: RIM_RY, class: 'glass-rim'}),
    svg('ellipse', {cx: 0, cy: 0.6, rx: RIM_RX - 3.4, ry: RIM_RY - 1.2, class: 'glass-rim', opacity: 0.45}),
    // 颈顶端敞口微张沿
    svg('path', {d: `M-5.2 ${NECK_TOP + 3.4}Q0 ${NECK_TOP + 0.6} 5.2 ${NECK_TOP + 3.4}`, class: 'glass-rim'}),
    // 高光: 左锥面 + 颈左侧(frame-003/015 玻璃高光)
    svg('path', {d: 'M-19 -6Q-15 -24 -3.4 -43', class: 'glass-highlight', opacity: 0.8}),
    svg('path', {d: `M-1.9 ${APEX_Y - 4}V${NECK_TOP + 8}`, class: 'glass-highlight', opacity: 0.8}),
    // Bubbles(穹顶集气阶段)
    state.bubbles ? domeBubbles() : null,
  )
  // 器械标签置于颈上方外侧(水下口沿区留白, 避开烧杯刻度)
  group.append(label(entity.label, 0, NECK_TOP - 16))
  return group
}
