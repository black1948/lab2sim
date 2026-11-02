import {add, label, svg} from './svg.js'

//  -  燃着的小木条(细长木条, 手持近竖置, 尖端朝下, 燃着端在下) - 
// 视觉依据: frame-023(两根木条悬于瓶口上方, 尖端燃着有小焰); frame-024/025(伸入集气瓶: 
// 氧气瓶内火焰更长更旺 - 焰柱沿木条向上拉长 ≈150px, 亮黄橙, 焰体包住木条下段; 二氧化碳
// 瓶内火焰立即熄灭, 少量白烟); frame-030(持续态: 二氧化碳瓶内为无焰炭化裸条+尖端灰白
// 灰烬, 氧气瓶内持续明亮燃烧).
// 复用审查否决记录(trace assets-1-reuse-review): chemistry.wood-splint.v1 仅 charred/heating/
// char_zones 水平姿, 无火焰分支, 不能表达燃着; chemistry.match.v1 短火柴梗+火柴头, 
// chemistry.candle.v1 蜡烛, chemistry.lighter.v1 打火机, 形状功能均不符; biology.glowing-splint.v1
// 近竖置+ember/relit/charred 最接近, 但①缺 flame_boost 大火焰分支(本案 IR
// r-splint-*-o2-brighter 核心: 氧气助燃燃烧更旺必须诚实表达)②其尖端朝上 58° 斜姿, 
// 焰自尖端向上与本案例尖端朝下竖直入瓶相反 ③该文件为已交付案例 18(光合作用产生氧气)
// 共享资产, 直接修改会使他案回归 - 故按任务约定新增独立条目+独立渲染器文件, 不改原文件.
// 发现否决记录(trace assets-2-discover): discover_apparatus.py 'wooden splint'/'burning match
// stick flame' 均无矢量候选.转 code-native.
// 风格依据: 木杆配色沿用 biology.glowing-splint.v1/renderMatch 木杆 inline 族(#dcc39a/
// #a98e66/木纹 #c4a87e); 火焰画法沿用三层 flame-outer #ff9f43 / flame-inner #ffd54d /
// flame-core #fff8d6 既有 class(携带 styles.css flame-flicker 闪烁动画, reduced-motion 下
// 静止, 不新增 class); flame_boost 大焰的羽化外缘+分层低不透明度泛光晕画法参照
// physics.flame.v1 与 biology.glowing-splint.v1 relitFlame 泛晕; 炭化段+灰白灰烬点画法沿用
// biology.glowing-splint.v1 charredSegment(炭色 #332e29, 本案 frame-030 同族深灰黑).
// 局部几何(y 向下, (0,0)=木条全长中心): 竖直木条 150x5.2(frame-024 木条宽 ≈4.5px, 
// 可见长 ≈250px 出画, 全长不可测, 150 为手持探件场景尺度约定值, 同 wood-splint 长宽比
// 量级), 尖端在下 (0,+75)(微收尖坡口), 尾端在上 (0,-75)(圆角).
// 状态绑定(与 IR initial_state/rules 逐一对应): 
//   state.relit=true  → 尖端三层火焰(frame-023 小焰; relit&&!charred 才画 - 全规则守卫防
//                        兄弟规则状态泄漏画出炭化仍燃矛盾态)
//   state.flame_boost=true(且 relit)→ 火焰更长更旺: 焰柱自尖端沿木条向上拉长 ≈146px, 
//                        加宽至 ±13, 增两层泛光晕(frame-024/025 氧气瓶长焰)
//   state.charred=true → 尖端段 ≈24px 炭化深灰黑+灰白灰烬点(frame-030; relit 时被守卫
//                        熄焰 - IR 结果态 relit=false+charred=true 同批写入)
//   IR assumptions: 熄灭瞬间的少量白烟(frame-024)为过渡特效, 渲染器无状态可承载瞬态, 
//   且 frame-030 持续炭化态无烟 - 按该条 assumptions 以炭化端表达, 不画常驻烟.
const HALF_W = 2.6
const TOP_Y = -75
const TIP_Y = 75

// 常燃小焰(frame-023: 尖端小焰, 量级同 biology.glowing-splint.v1 relitFlame)
function tipFlame() {
  const flame = svg('g', {transform: `translate(0 ${TIP_Y})`})
  add(flame,
    svg('ellipse', {cx: 0, cy: -15, rx: 10, ry: 20, fill: '#ff9440', opacity: 0.13}),
    svg('path', {
      d: 'M0 4Q-6.6 -6 -5.4 -16Q-4 -26 0 -31Q4 -26 5.4 -16Q6.6 -6 0 4Z',
      fill: '#ff9f43', class: 'flame-outer',
    }),
    svg('path', {
      d: 'M0 2Q-3.4 -5 -2.7 -13Q-2 -19 0 -22.5Q2 -19 2.7 -13Q3.4 -5 0 2Z',
      fill: '#ffd54d', class: 'flame-inner',
    }),
    svg('path', {
      d: 'M0 1Q-1.7 -4 -1.35 -9.5Q-1 -13 0 -14.5Q1 -13 1.35 -9.5Q1.7 -4 0 1Z',
      fill: '#fff8d6', class: 'flame-core',
    }),
  )
  return flame
}

// 助燃长焰(frame-024/025: 焰柱沿木条向上拉长, 更亮更宽, 泛光晕包住瓶口区)
function boostedFlame() {
  const flame = svg('g', {transform: `translate(0 ${TIP_Y})`})
  add(flame,
    svg('ellipse', {cx: 0, cy: -62, rx: 27, ry: 78, fill: '#ff9440', opacity: 0.11}),
    svg('ellipse', {cx: 0, cy: -42, rx: 18, ry: 54, fill: '#ffb066', opacity: 0.1}),
    // 羽化软缘(低不透明度最宽轮廓, physics.flame.v1 画法)
    svg('path', {
      d: 'M0 6Q-9 -18 -11.8 -52Q-14 -95 -8 -120Q-4 -136 0 -141Q4 -136 8 -120Q14 -95 11.8 -52Q9 -18 0 6Z',
      fill: '#ff8f3d', opacity: 0.4, class: 'flame-outer',
    }),
    svg('path', {
      d: 'M0 4Q-7.6 -16 -10 -48Q-11.8 -88 -6.8 -112Q-3.2 -128 0 -132Q3.2 -128 6.8 -112Q11.8 -88 10 -48Q7.6 -16 0 4Z',
      fill: '#ff8f3d', class: 'flame-outer',
    }),
    svg('path', {
      d: 'M0 2Q-5 -14 -6.6 -42Q-7.8 -76 -4.4 -96Q-2 -108 0 -111Q2 -108 4.4 -96Q7.8 -76 6.6 -42Q5 -14 0 2Z',
      fill: '#ffd54d', class: 'flame-inner',
    }),
    svg('path', {
      d: 'M0 1Q-2.6 -10 -3.4 -30Q-4 -54 -2.2 -68Q-1 -76 0 -78Q1 -76 2.2 -68Q4 -54 3.4 -30Q2.6 -10 0 1Z',
      fill: '#fff8d6', class: 'flame-core',
    }),
  )
  return flame
}

// 尖端炭化段(frame-030: 无焰炭化裸条+灰白灰烬点, 包住木条尖端 24px)
function charredTip() {
  const g = svg('g')
  add(g,
    svg('path', {
      d: `M0 ${TIP_Y}Q${-HALF_W} 71.8 ${-HALF_W} 68.5L${-HALF_W} 56Q${-HALF_W} 53 0 51.2Q${HALF_W} 53 ${HALF_W} 56L${HALF_W} 68.5Q${HALF_W} 71.8 0 ${TIP_Y}Z`,
      fill: '#332e29',
    }),
    svg('circle', {cx: -1, cy: 62, r: 0.7, fill: '#9d9891', opacity: 0.85}),
    svg('circle', {cx: 1.1, cy: 67, r: 0.6, fill: '#b3aea6', opacity: 0.8}),
    svg('circle', {cx: 0.2, cy: 72, r: 1.1, fill: '#b3aea6', opacity: 0.75}),
  )
  return g
}

export function renderBurningSplint(entity, state = {}) {
  const group = svg('g')
  const relit = Boolean(state.relit)
  const boost = Boolean(state.flame_boost)
  const charred = Boolean(state.charred)

  // 木条本体: 竖直杆, 尖端在下(微收尖), 尾端圆角; 浅木色+木纹线
  add(group,
    svg('path', {
      d: `M${-HALF_W} ${TOP_Y + 2.6}Q${-HALF_W} ${TOP_Y} 0 ${TOP_Y}Q${HALF_W} ${TOP_Y} ${HALF_W} ${TOP_Y + 2.6}L${HALF_W} 68.5Q${HALF_W} 71.8 0 ${TIP_Y}Q${-HALF_W} 71.8 ${-HALF_W} 68.5Z`,
      fill: '#dcc39a', stroke: '#a98e66', 'stroke-width': 0.8, class: 'splint-stick',
    }),
    svg('path', {d: 'M-0.8 -68V66', stroke: '#c4a87e', 'stroke-width': 0.8, opacity: 0.9, fill: 'none'}),
  )
  // 全规则守卫: charred 时熄焰(IR 结果态 relit=false+charred=true 同批写入, 
  // 防兄弟规则泄漏画出炭化仍燃矛盾态); boost 须以 relit 为前提
  if (charred) group.append(charredTip())
  else if (relit) group.append(boost ? boostedFlame() : tipFlame())

  // 无接地阴影: 手持探件悬于瓶口/瓶内(同 chemistry.copper-spiral.v1 / chemistry.wood-splint.v1
  // 手持探件处理, 固定接地阴影会落在瓶口/瓶内产生悬空暗斑)
  // 标签置于木条上段右侧外侧(避开尖端火焰区与瓶口检验区)
  group.append(label(entity.label, 34, -64))
  return group
}
