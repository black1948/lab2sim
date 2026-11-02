import {add, liquidColor, shadow, svg} from './svg.js'

//  -  铁钉(铁钉锈蚀条件探究, 试管①~⑤ 各一枚) - 
// 视觉依据: frame-005/006(干净铁钉直立台面特写: 钢灰色, 钉头在下端, 钉尖朝上, 
// 杆身光滑无螺纹, 头宽约为杆宽 2 倍); frame-016(五管内钉身斜靠管壁, 大圆头沉在
// 管底, 钉长与试管内腔同尺度); frame-058/059/071(锈蚀后钉身呈深红褐, 锈色随条件
// 加深).证据引用修正: 任务给的 frame-004 实为植物油/NaCl 试剂瓶特写, 干净铁钉
// 特写以 frame-005/006 为准(已记入 trace 复用审查结论).
// 比例: 总长约 100(局部单位, 与试管内腔 -52..62 同尺度), 杆宽 4.4, 头宽 9.4, 
// 头厚 6.5(frame-005 实测头宽/杆宽≈2.1, 杆长/杆宽≈27).
// 状态约定: 金属色读 state.color(与 chemistry.js liquidColor 同口径, 默认 #b9c2c7), 
// 规则色 #b08d6a(①水+空气)/ #8a5a2e(③④食盐水)/ #5b2c1a(⑤醋酸)随状态替换; 
// 杆身高光与描边色由金属色明暗推导(shade 助手), 锈色加深时高光/描边同步变深, 
// 不引入与锈色断裂的固定灰描边.无螺纹(不得画成螺栓/螺丝).
// 风格依据: chemistry.js renderGlassRod 的细长杆 + 竖向高光 + apparatus-shadow 接地
// 阴影画法; 金属默认色 #b9c2c7 与 styles.css .metal 填充 #b4c0c2 同族.杆身用内联
// 属性填色(不用 .metal class - CSS 类会覆盖属性 fill, 锈色将被吞掉).
// 标签: 按任务约定省略(钉在试管内, 任何附加标签都会与试管①~⑤标签碰撞).
// 渲染层级: z_index 12(试管玻璃 z 22 之后, 被 35% 透明玻璃覆盖仍可见).

// 颜色明暗推导(确定性, 无外部依赖): f<1 变深(描边/暗缘), f>1 变亮(高光)
function shade(hex, f) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) return hex
  const value = parseInt(match[1], 16)
  const channel = shift => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * f)))
  return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, '0')}`
}

export function renderIronNail(entity, state = {}) {
  const group = svg('g')
  // 金属/锈色: state.color(IR 规则按管写入), 默认钢灰 #b9c2c7
  const metal = liquidColor(state, '#b9c2c7')
  const edge = shade(metal, 0.55)
  const highlight = shade(metal, 1.45)
  add(group,
    shadow(0, 52, 9, 2.8),
    // 钉杆: 顶端自 y=-50 收尖(锥段约 9), 杆身直壁到 y=43.5
    svg('path', {d: 'M0 -50L-2.2 -41V43.5H2.2V-41Z', fill: metal, stroke: edge, 'stroke-width': 1, 'stroke-linejoin': 'round'}),
    // 圆钉头(下端, frame-005/016: 头宽约为杆宽 2 倍, 下缘圆弧, 无螺纹)
    svg('path', {d: 'M-4.7 43.5H4.7V47.2Q4.7 50 2.2 50H-2.2Q-4.7 50 -4.7 47.2Z', fill: metal, stroke: edge, 'stroke-width': 1, 'stroke-linejoin': 'round'}),
    // 右缘暗线(2.5D 圆柱暗侧)
    svg('path', {d: 'M1.3 -40V42.5', stroke: edge, 'stroke-width': 0.7, opacity: 0.55, 'stroke-linecap': 'round'}),
    // 左缘高光(浅色高光线, frame-005 杆身左侧反光)
    svg('path', {d: 'M-1 -38V42', stroke: highlight, 'stroke-width': 0.9, opacity: 0.9, 'stroke-linecap': 'round'}),
    svg('path', {d: 'M-3.5 45.4V48.2', stroke: highlight, 'stroke-width': 0.8, opacity: 0.65, 'stroke-linecap': 'round'}),
    // 尖端一小段反光
    svg('path', {d: 'M-0.7 -46.5L-1.5 -42.5', stroke: highlight, 'stroke-width': 0.7, opacity: 0.7, 'stroke-linecap': 'round'}),
  )
  return group
}
