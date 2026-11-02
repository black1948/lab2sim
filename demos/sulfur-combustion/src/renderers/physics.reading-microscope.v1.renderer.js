import {add, label, shadow, svg} from './svg.js'

//  -  读数显微镜(盒式底座 + 载物台 + 悬臂镜筒 + 夹持细针, 薄膜干涉观察) - 
// 视觉依据: frame-002/005/007/010/012/016/018/019/023/028/039.盒式底座(正面暗色镜窗凹龛内
// 嵌圆镜 + 铭牌读数显微镜+ 右侧黑色调焦手轮, frame-002/039/005), 底座顶面为深色玻璃
// 载物台(frame-012/016 台面深色玻璃板), 后立柱 + 悬臂夹持镜筒(frame-005/007/028: 顶部
// 黑色目镜筒, 银灰上筒身, 黑色测量箱体, 下部银灰物镜筒, 弹簧夹头持细针下降至载物台面上方, 
// frame-012/016/017 夹头双滚花螺钉清晰可辨).
// 与既有 physics.measuring-microscope.v1(renderMeasuringMicroscope: 椭圆底座布氏硬度附件式
// 立柱镜 + 顶置目镜 + d1/d2 测量臂读数)结构不同, 不能互相顶替 - 按先例 physics.laser-source.v1
// 之于 physics.light-source.v1 另立变体, 同 kind 不同 asset_ref.
// 风格依据: physics.js 既有 code-native 类(metal-bracket 浅灰金属底座, scope-column 立柱, 
// scope-arm 悬臂, scope-barrel 黑色箱体, scope-objective 银灰物镜筒, scope-eyepiece 目镜筒, 
// apparatus-shadow 接地阴影), 铭牌/窗内文字 inline 配色(先例 renderPolarizer 0/90 内联字样); 
// 条纹观察窗条纹色取 frame-020 色彩采样(亮条 #8d824a→#8b8048, 暗底 #565129→#544f25, 钠黄系).
// 锚点: 局部 (0,0)=底座底部中心(与其余 physics 器材一致); 底座 x -88..+88(含右侧手轮至 +101), 
// 目镜筒顶 y≈-258, 载物台面 y≈-68, 细针尖 y≈-70(恰在台面上方悬停, frame-012/016; 
// 白瓷环由独立实体以更高 z 前置绘制, 落位由场景处理).
// 状态绑定(IR visual.state_bindings): state.focused=true → 镜筒测量箱正面呈现条纹观察窗内衬: 
// 等距横向明暗条带(条带沿窗口高度方向排布, 每条横贯窗口宽度; 条数=state.fringe_count 缺省 9, 
// 间距∝state.fringe_px 缺省 26 → ×0.14 局部 px, 条厚≈间距×0.55, 不透明度∝state.fringe_contrast
// 缺省 0); state.fringe_drift=true → 条纹组沿 y 缓慢往复平移(SMIL animateTransform; 
// prefers-reduced-motion: reduce 下不注入动画, 保持静止); focused=false/缺省 → 观察窗呈暗色
// 无条纹(未对焦).条纹方向依据: frame-020/021/025/027 条纹周期由帧行亮度 FFT 沿 y 方向测得
// (周期≈87px/960×786 帧) - 亮度随行号变化, 即条纹为水平横向条带(百叶窗式); 初版误按竖条
// 实现, 经构建方复核证据纠偏改为横向(2026-09-18 修订).
const OCULAR = {x: -18, y: -186, w: 36, h: 34}   // 条纹观察窗(测量箱正面, 目镜端; 高 34 容纳 9 条横向条带全数可见)
const STRIPE_SCALE = 0.14                        // fringe_px → 局部条纹间距换算

function ocularFringes(entity, state) {
  const count = Math.max(1, Math.min(24, Number(state.fringe_count ?? 9) || 9))
  const spacing = Math.max(2, STRIPE_SCALE * (Number(state.fringe_px) || 26))
  const contrast = Math.max(0, Math.min(1, Number(state.fringe_contrast ?? 0)))
  const clipId = `reading-microscope-ocular-${entity.id || 'scope'}`
  const defs = svg('defs')
  const clip = svg('clipPath', {id: clipId})
  clip.append(svg('rect', {x: OCULAR.x, y: OCULAR.y, width: OCULAR.w, height: OCULAR.h, rx: 3}))
  defs.append(clip)
  const inner = svg('g', {'clip-path': `url(#${clipId})`})
  // 暗底衬(frame-020 条纹暗带 #565129 → #544f25)
  inner.append(svg('rect', {x: OCULAR.x, y: OCULAR.y, width: OCULAR.w, height: OCULAR.h, fill: '#544f25'}))
  const bars = svg('g')
  const thick = Math.max(1.4, spacing * 0.55)
  const midY = OCULAR.y + OCULAR.h / 2
  for (let i = 0; i < count; i += 1) {
    const cy = midY + (i - (count - 1) / 2) * spacing
    bars.append(svg('rect', {
      x: OCULAR.x, y: (cy - thick / 2).toFixed(2), width: OCULAR.w, height: thick.toFixed(2),
      fill: '#8b8048', opacity: (0.25 + 0.75 * contrast).toFixed(3),
    }))
  }
  inner.append(bars)
  // 漂移: 沿 y 缓慢往复平移一个条纹周期(reduced-motion 下不注入动画)
  const reduced = typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (state.fringe_drift && !reduced) {
    const period = Math.max(2, spacing).toFixed(2)
    bars.append(svg('animateTransform', {
      attributeName: 'transform', type: 'translate',
      values: `0 -${period}; 0 ${period}; 0 -${period}`, dur: '7s', repeatCount: 'indefinite',
    }))
  }
  const wrap = svg('g')
  wrap.append(defs, inner)
  return wrap
}

export function renderReadingMicroscope(entity, state = {}) {
  const group = svg('g')
  const focused = Boolean(state.focused)
  add(group,
    shadow(0, 3, 94, 8),
    // 盒式底座(frame-002/039/005: 浅灰金属箱式底座)
    svg('rect', {x: -88, y: -58, width: 176, height: 58, rx: 6, class: 'metal-bracket'}),
    svg('rect', {x: -88, y: -58, width: 176, height: 8, rx: 4, fill: '#d3dcde', opacity: .55}),
    // 载物台: 底座顶面深色玻璃台面(frame-012/016 台面深色玻璃板+浅色包边)
    svg('rect', {x: -80, y: -68, width: 160, height: 13, rx: 4, class: 'scope-base'}),
    svg('rect', {x: -72, y: -65, width: 144, height: 7, rx: 3, fill: '#2b353c', opacity: .85}),
    // 正面暗色镜窗凹龛 + 圆镜(frame-002/039 底座正面暗窗, frame-005 窗内圆镜微反光)
    svg('rect', {x: -66, y: -46, width: 58, height: 30, rx: 4, fill: '#232a2e', stroke: '#1a2126', 'stroke-width': 1.5}),
    svg('ellipse', {cx: -37, cy: -31, rx: 17, ry: 10, fill: '#45535b', stroke: '#2c3840', 'stroke-width': 1.2}),
    svg('path', {d: 'M-48 -35q11 -6 22 0', fill: 'none', stroke: '#6d7d86', 'stroke-width': 1.4, opacity: .55}),
    // 铭牌读数显微镜(IR properties.base_nameplate; frame-005/007 底座正面浅色铭牌)
    svg('rect', {x: 4, y: -44, width: 74, height: 18, rx: 2, fill: '#e6e2d4', stroke: '#5b6a6d', 'stroke-width': 1.2}),
    // 右侧黑色调焦手轮(frame-002/018/019 底座右侧黑色大圆手轮)
    svg('rect', {x: 84, y: -35, width: 9, height: 10, rx: 2, fill: '#3c464b', stroke: '#26313a', 'stroke-width': 1.2}),
    svg('circle', {cx: 97, cy: -30, r: 9.5, fill: '#23282b', stroke: '#101416', 'stroke-width': 1.5}),
    svg('circle', {cx: 94.5, cy: -33, r: 2.2, fill: '#4a565c', opacity: .8}),
  )
  // 铭牌文字(内联字样, 先例 renderPolarizer 0/90 标注)
  const plate = svg('text', {
    x: 41, y: -31, 'text-anchor': 'middle', fill: '#3d4750', 'pointer-events': 'none',
    style: 'font: 650 8px/1 ui-sans-serif, system-ui, sans-serif',
  })
  plate.textContent = 'Reading microscope'
  group.append(plate)
  add(group,
    // 后立柱 + 柱顶套环(frame-005/007 立柱位于底座后部)
    svg('rect', {x: 58, y: -204, width: 15, height: 138, rx: 2, class: 'scope-column'}),
    svg('rect', {x: 54, y: -208, width: 23, height: 9, rx: 2, class: 'metal-bracket'}),
    // 悬臂(自立柱前伸夹持镜筒, frame-005/028 悬臂+夹持带)
    svg('rect', {x: -30, y: -210, width: 105, height: 20, rx: 4, class: 'scope-arm'}),
    svg('circle', {cx: 65, cy: -200, r: 2.6, class: 'screw'}),
    // 镜筒: 顶部黑色目镜筒(frame-023 示教者自目镜观察)
    svg('rect', {x: -8, y: -258, width: 16, height: 24, rx: 3, class: 'scope-eyepiece'}),
    svg('rect', {x: -9, y: -258, width: 18, height: 6, rx: 3, fill: '#141b1f'}),
    // 银灰上筒身(drawtube)
    svg('rect', {x: -13, y: -236, width: 26, height: 46, rx: 3, fill: '#c9d4d8', stroke: '#5b6a6d', 'stroke-width': 1.5}),
    // 筒身夹持带(悬臂端夹箍)
    svg('rect', {x: -17, y: -214, width: 34, height: 22, rx: 3, class: 'metal-bracket'}),
    // 黑色测量箱体(frame-028/039 镜筒两侧黑色箱体)
    svg('rect', {x: -28, y: -192, width: 56, height: 46, rx: 4, class: 'scope-barrel'}),
    // 下部银灰物镜筒
    svg('rect', {x: -11, y: -146, width: 22, height: 46, rx: 3, class: 'scope-objective'}),
    // 弹簧夹头(frame-012/016 夹头两侧滚花螺钉)+ 持针
    svg('path', {d: 'M-9 -100L9 -100L6 -84L-6 -84Z', fill: '#9fb0b8', stroke: '#46575f', 'stroke-width': 1.4}),
    svg('circle', {cx: -13, cy: -92, r: 4.4, fill: '#cfd8da', stroke: '#5b6a6d', 'stroke-width': 1.2}),
    svg('circle', {cx: 13, cy: -92, r: 4.4, fill: '#cfd8da', stroke: '#5b6a6d', 'stroke-width': 1.2}),
    svg('line', {x1: 0, y1: -84, x2: 0, y2: -70, stroke: '#8d979b', 'stroke-width': 2.4, 'stroke-linecap': 'round'}),
    svg('line', {x1: 0, y1: -76, x2: 0, y2: -70, stroke: '#5f6a6e', 'stroke-width': 2, 'stroke-linecap': 'round'}),
  )
  // 条纹观察窗(目镜端): focused=true 显钠黄条纹内衬, 否则暗窗
  add(group, svg('rect', {
    x: OCULAR.x, y: OCULAR.y, width: OCULAR.w, height: OCULAR.h, rx: 3,
    fill: focused ? '#2a2817' : '#1d2a30', stroke: '#10171b', 'stroke-width': 1.6,
  }))
  if (focused) group.append(ocularFringes(entity, state))
  // 观察窗内圈淡高光(玻璃面反光)
  add(group, svg('rect', {
    x: OCULAR.x + 2, y: OCULAR.y + 2, width: OCULAR.w - 4, height: OCULAR.h - 4, rx: 2,
    fill: 'none', stroke: '#e8f2f4', 'stroke-width': 1, opacity: .25,
  }))
  group.append(label(entity.label, 0, 24))
  return group
}
