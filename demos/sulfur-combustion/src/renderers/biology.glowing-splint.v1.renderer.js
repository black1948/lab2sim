import {add, label, shadow, svg} from './svg.js'

//  -  带火星的木条(细长木条, 一端点燃后吹熄保留橙色余烬; 复燃出明亮火焰; 燃过端炭化) - 
// 视觉依据: frame-022(未点燃: 细长浅木色木条, 手持近竖置); frame-025(余烬态: 尖端一小粒
// 亮橙红余烬光斑, 杆身仍浅色); frame-024(伸入倒扣试管口检验, 余烬复燃出明亮暖光斑); 
// frame-026/027(燃过端炭化发黑, 灰白灰烬点).木条为细长杆(直径 ≈ 杆长 1/40), 无火柴头.
// 复用审查否决记录: chemistry.match.v1 是火柴(短方梗 + 深色椭圆火柴头 + lit 三层火焰锚在
// 头端, kind=match), 与细长木条形状与状态集(ember/relit/charred)均不符, 不顶替(trace
// assets/reuse-review:splint).发现记录: discover_apparatus.py --kind splint --query
// 'wooden splint ignition' 无候选(no scored vector file matched), 转 code-native.
// 风格依据: chemistry.js renderMatch 的木杆 inline 配色(#e3c193/#b09468 系, 按 frame-022
// 略去饱和)与火焰画法(flame-outer/flame-inner/flame-core 三层 + 泛光晕, 同 physics.flame.v1
// 的光晕画法; 复用既有 class 携带 flame-flicker 闪烁动画且 reduced-motion 下静止, 不新增
// class); 接地阴影 apparatus-shadow, 标签 apparatus-label 既有 class.
// 局部几何(与 IR 对齐): (0,0)=木条中心; 尖端位于 (-x,-y) 象限: IR anchors tip={x:-0.05,
// y:-0.16} → -0.05×1000=-50, -0.16×500=-80 → 尖端世界坐标 (-50,-80).木条自尖端 (-50,-80)
// 向右下延伸至尾端 (+50,+80): 长 √(100²+160²)≈189px, 宽 5.2px, 绘制为 rotate(58°) 框内的
// 水平杆(cos58×-94.5=-50.1, sin58×-94.5=-80.1, 尖端落点与锚点一致).
// 状态绑定(IR visual.state_bindings, 与构建方要求逐一对应): 
//   state.ember   → tip.ember: 尖端橙色余烬光斑(三层光斑: 泛晕/橙核/黄心, frame-025)
//   state.relit   → tip.flame: 复燃明亮火焰(三层火焰 + 泛光晕, 自尖端向上升起, frame-024; 
//                    relit 时替代余烬光斑)
//   state.charred → tip.charred: 尖端段炭黑(带灰白灰烬点, frame-026/027; 可与 ember 同现)
//   state.inserted→ stick.inserted: 插入态 - 仅作检查器标记, 不落器身视觉(插入深度由构建方
//                    的吸附摆位表达; 渲染器读取该键但无对应视觉分支)
const TIP_X = -94.5            // rotate(58) 框内杆轴坐标: 尖端
const STICK_LEN = 189
const STICK_W = 5.2
const ANGLE = 58               // 杆轴自尖端向右下 58°
const TIP_WORLD = {x: -50, y: -80}

// 复燃火焰(自尖端向上升起; 三层 + 泛光晕, 量级大于火柴焰 - 复燃明亮)
function relitFlame() {
  const flame = svg('g', {transform: `translate(${TIP_WORLD.x} ${TIP_WORLD.y})`})
  add(flame,
    svg('ellipse', {cx: 0, cy: -16, rx: 13, ry: 23, fill: '#ff9440', opacity: 0.13}),
    svg('path', {
      d: 'M0 5Q-7.4 -6 -5.8 -17Q-4.2 -27 0 -31Q4.2 -27 5.8 -17Q7.4 -6 0 5Z',
      fill: '#ff9f43', class: 'flame-outer',
    }),
    svg('path', {
      d: 'M0 3Q-4 -6 -3.1 -14.5Q-2.3 -21 0 -24Q2.3 -21 3.1 -14.5Q4 -6 0 3Z',
      fill: '#ffd54d', class: 'flame-inner',
    }),
    svg('path', {
      d: 'M0 1Q-1.9 -5 -1.5 -10.5Q-1.1 -14 0 -15.5Q1.1 -14 1.5 -10.5Q1.9 -5 0 1Z',
      fill: '#fff8d6', class: 'flame-core',
    }),
  )
  return flame
}

// 橙色余烬光斑(frame-025: 小粒亮橙红光斑 + 微泛晕)
function emberTip() {
  const tip = svg('g', {transform: `translate(${TIP_WORLD.x} ${TIP_WORLD.y})`})
  add(tip,
    svg('circle', {cx: 0.5, cy: 0.5, r: 6.2, fill: '#ff5f2e', opacity: 0.24}),
    svg('circle', {cx: 0.5, cy: 0.5, r: 3.4, fill: '#ff7a30', opacity: 0.8}),
    svg('circle', {cx: 0.5, cy: 0.5, r: 1.9, fill: '#ffc27a'}),
    svg('circle', {cx: 0.5, cy: 0.5, r: 0.9, fill: '#fff3d6'}),
  )
  return tip
}

// 尖端炭黑段(frame-026/027: 燃过端发黑 + 灰白灰烬点; rotate(58) 框内杆轴坐标)
function charredSegment() {
  const g = svg('g', {transform: `rotate(${ANGLE})`})
  add(g,
    svg('path', {
      d: `M${TIP_X} ${-STICK_W / 2}L-68 ${-STICK_W / 2 + 0.5}Q-65.5 0 -68 ${STICK_W / 2 - 0.5}L${TIP_X} ${STICK_W / 2}Q${TIP_X - 2.4} 0 ${TIP_X} ${-STICK_W / 2}Z`,
      fill: '#332e29',
    }),
    svg('circle', {cx: -84, cy: -0.8, r: 0.7, fill: '#9d9891', opacity: 0.85}),
    svg('circle', {cx: -76, cy: 1, r: 0.6, fill: '#b3aea6', opacity: 0.8}),
    svg('circle', {cx: -71, cy: -1.1, r: 0.5, fill: '#9d9891', opacity: 0.7}),
  )
  return g
}

export function renderGlowingSplint(entity, state = {}) {
  const group = svg('g')
  const ember = Boolean(state.ember)
  const relit = Boolean(state.relit)
  const charred = Boolean(state.charred)
  const inserted = Boolean(state.inserted)  // 检查器标记: 不落视觉(见文件头状态绑定)

  // 木条本体(rotate(58) 框内水平杆: 浅木色 + 木纹线 + 尾端切面)
  const stick = svg('g', {transform: `rotate(${ANGLE})`})
  add(stick,
    svg('rect', {
      x: TIP_X, y: -STICK_W / 2, width: STICK_LEN, height: STICK_W, rx: STICK_W / 2,
      fill: '#dcc39a', stroke: '#a98e66', 'stroke-width': 1, class: 'splint-stick',
    }),
    svg('path', {
      d: `M${TIP_X + 7} 0.5H${-TIP_X - 7}`,
      stroke: '#c4a87e', 'stroke-width': 0.8, opacity: 0.9, fill: 'none',
    }),
    svg('path', {
      d: `M${-TIP_X - 3.4} ${-STICK_W / 2 + 0.7}Q${-TIP_X} 0 ${-TIP_X - 3.4} ${STICK_W / 2 - 0.7}`,
      stroke: '#b09468', 'stroke-width': 0.9, fill: 'none', opacity: 0.85,
    }),
  )
  group.append(stick)
  if (charred) group.append(charredSegment())
  // 复燃时火焰替代余烬光斑; 仅余烬态画光斑
  if (relit) group.append(relitFlame())
  else if (ember) group.append(emberTip())

  add(group, shadow(28, 86, 20, 4.5))
  // 标签置于尾端右下外侧(避开尖端/试管口检验区)
  group.append(label(entity.label, 34, 98))
  return group
}
