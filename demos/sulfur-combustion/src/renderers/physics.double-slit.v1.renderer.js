import {add, label, shadow, svg} from './svg.js'

//  -  双缝转盘(宽/窄两对缝) - 
// 视觉依据: frame-004(白盘上多组竖直双缝, 视频标注宽/窄以箭头指向左起两组; 盘面另有
// 印刷编号与一排短划对位标记); frame-008/009(白盘洁净, 红色激光斑打在被照缝对上); 
// frame-014 上下两图样条纹间距目测约 1:2 → 缝对缝间距比按 宽:窄≈2:1(宽对 14px, 窄对 7px).
// 简化说明: 实盘有多组缝对(frame-004 可见约 5 组, 见 experiment.json assumptions), 本渲染器
// 只呈现 IR 声明的宽, 窄两对.
// 风格依据: physics.js renderPolarizer 的圆盘+立柱+滑块底座画法(深色拨盘改为白盘, 配色沿用
// renderOpticalBench 标尺条的米白系), renderConvexLens 的金属描边; 红色光斑/出射光配色与
// physics.laser-source.v1 同一 #ff4b3e 系; inline 配色, 不新增 styles.css class.
// 锚点: 盘心=局部原点落在光轴上, 盘半径 52; 载体组(盘面+缝对+被照光斑)随 state.angle_deg
// SVG rotate(顺时针为正; 0° 时宽缝对位于盘心左侧 -26px 即光束入射侧, +26px 为窄缝对; 
// 180° 时两对对调).宽/窄标注为静态小字+指示短线, 画在盘轮廓之外, 不随载体旋转.
// 状态约定: state.aligned_pair="wide"|"narrow" → 在当前被照缝对位置(载体坐标)画红色光斑, 
// 并在盘右缘沿 +x 画短红出射光(静态, 保持在光轴上); "none" → 红斑画在盘左缘中点 (-52,0)
// (光束被盘面挡住), 无出射光.
const RADIUS = 52
const PAIR_X = {wide: -26, narrow: 26}
const GAP_PX = {wide: 14, narrow: 7}
const SLIT_HALF = 13        // 缝线半长(竖直细缝 y -13..13)
const SPOT = (x, y) => [
  svg('circle', {cx: x, cy: y, r: 7.5, fill: '#ff4b3e', opacity: .3}),
  svg('circle', {cx: x, cy: y, r: 4, fill: '#ff5a4a', opacity: .95}),
  svg('circle', {cx: x, cy: y, r: 1.8, fill: '#ffd2bd'}),
]

function slitPair(pairX, gap) {
  const half = gap / 2
  return svg('path', {
    d: `M${pairX - half} ${-SLIT_HALF}V${SLIT_HALF}M${pairX + half} ${-SLIT_HALF}V${SLIT_HALF}`,
    fill: 'none', stroke: '#4a575b', 'stroke-width': 2.6, 'stroke-linecap': 'round',
  })
}

export function renderDoubleSlit(entity, state = {}) {
  const group = svg('g')
  const angle = Number(state.angle_deg || 0)
  const aligned = state.aligned_pair === 'wide' || state.aligned_pair === 'narrow'
    ? state.aligned_pair : 'none'

  add(group,
    shadow(0, 66, 34, 6),
    // 立柱+滑块底座(落导轨 y=52..64, renderPolarizer 支架画法)
    svg('rect', {x: -3, y: 38, width: 6, height: 16, rx: 2, fill: '#9aa6aa', stroke: '#5b6a6d', 'stroke-width': 1.4}),
    svg('path', {d: 'M-16 52h32l-7 12h-18Z', class: 'metal-bracket'}),
    // 盘右缘沿 +x 的出射红光(对准缝对时; 静态, 保持在光轴上, 长约 263px 接观察屏左缘)
    aligned !== 'none' ? svg('path', {d: 'M52 -3.4L315 -4.8L315 4.8L52 3.4Z', fill: '#ff4b3e', opacity: .12}) : null,
    aligned !== 'none' ? svg('path', {d: 'M52 -1.5L315 -2.2L315 2.2L52 1.5Z', fill: '#ff6a55', opacity: .32}) : null,
  )

  // 载体组: 盘面+缝对+被照光斑随转角旋转
  const carrier = svg('g', {transform: `rotate(${angle.toFixed(1)})`})
  add(carrier,
    svg('circle', {cx: 0, cy: 0, r: RADIUS, fill: '#f4f1e6', stroke: '#5b6a6d', 'stroke-width': 2}),
    svg('circle', {cx: 0, cy: 0, r: RADIUS - 4.5, fill: 'none', stroke: '#e4dec9', 'stroke-width': 1.2}),
    // 盘心转轴点
    svg('circle', {cx: 0, cy: 0, r: 3, fill: '#9aa6aa', stroke: '#5b6a6d', 'stroke-width': 1}),
    // 两对竖直细缝(宽对缝间距 14, 窄对 7, 比例依 frame-014 约 2:1)
    slitPair(PAIR_X.wide, GAP_PX.wide),
    slitPair(PAIR_X.narrow, GAP_PX.narrow),
    // 缝对下方一排短划对位标记(frame-004/008 盘面下缘印刷短划)
    svg('path', {d: 'M-34 30h6M-16 30h6M2 30h6M20 30h6', stroke: '#b4ac93', 'stroke-width': 1.6, fill: 'none'}),
    // 盘面印刷编号(frame-004/008 盘左上Z03印刷; 实拍呈倒置, 正立字形不可辨, 按正立补白)
  )
  const printId = svg('text', {
    x: -34, y: -26, 'text-anchor': 'middle', fill: '#8b8468', opacity: .75,
    'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace', 'font-size': 9, 'font-weight': 600,
    'pointer-events': 'none',
  })
  printId.textContent = 'Z03'
  carrier.append(printId)
  if (aligned !== 'none') SPOT(PAIR_X[aligned], 0).forEach(node => carrier.append(node))
  group.append(carrier)

  // 光束被盘面挡住: 红斑画在盘左缘中点 (-52,0)(静态)
  if (aligned === 'none') SPOT(-RADIUS, 0).forEach(node => group.append(node))

  // 宽/窄静态标注: 盘轮廓之外的小字+指示短线(frame-004 视频标注的版式)
  const notes = svg('g')
  ;[['wide', PAIR_X.wide], ['narrow', PAIR_X.narrow]].forEach(([text, x]) => {
    const tag = svg('text', {
      x, y: -68, 'text-anchor': 'middle', fill: '#4c6b74',
      'font-family': 'ui-sans-serif, system-ui, sans-serif', 'font-size': 11, 'font-weight': 600,
      'pointer-events': 'none',
    })
    tag.textContent = text
    notes.append(tag,
      svg('path', {d: `M${x} -62V-52`, stroke: '#8fa2ab', 'stroke-width': 1.2, 'stroke-linecap': 'round', fill: 'none'}),
      svg('circle', {cx: x, cy: -50, r: 1.3, fill: '#8fa2ab'}),
    )
  })
  group.append(notes)
  group.append(label(entity.label, 0, 84))
  return group
}
