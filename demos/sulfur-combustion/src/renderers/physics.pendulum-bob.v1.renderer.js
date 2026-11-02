import {add, label, svg} from './svg.js'

//  -  系线摆锤(kind=ball 的状态驱动变体, 109-物体的动能; bob-small-1 / bob-large-1 两
// 实例共用本渲染器, IR scene renderer=physics/pendulum-bob 选择; physics.ball.v1 仍为
// kind=ball 的 default) - 
// 视觉依据: frame-023(两只钢球摆锤并挂于横杆左段两悬挂点: 大球居左 r 大, 小球居右, 
//           细线自横杆垂下); frame-027(摆线以小金属夹系于横杆); frame-039/042(摆锤
//           拉起到释放高度线(与 20cm 刻度同高)及回摆最低点撞击木块).
//           frame-023 采样: 亮部 (191,181,179) → 钢灰 #d9dcdc 族归一化.
// 复用审查否决记录: physics.ball.v1(球体类)与 physics.ball-flight.v1(飞行态变体)均无
//           摆线悬摆语义; kind=ball 变体先例(physics.ball-flight.v1)照做, 不改默认.
// 风格依据: physics.js renderBall 的球体画法结构(body 圆+高光, 大小两档半径)与
//           renderString 的细线画法(class string-line, 圆帽细线)+ physics.ball-flight.v1
//           的钢球配色; apparatus-shadow 接地阴影.所有几何差分读 properties, 不硬编码
//           半径/摆长.配色内联, 不新增 class.
// 状态契约(构建方编舞依赖, 逐条照契约实现; 节点由 app 平移到 state.x/y, 屏幕系
//   screenX=x - 1000, screenY=560−y - 500): 
//   悬点 pivot = world[frame_ref].x - 1000 + pivot_dx_px(屏幕 x), pivot_screenY =
//   (560−world[frame_ref].y - 500) + pivot_dy_px(frame 原点在桌面, 横杆在其上方
//   pivot_dy_px=-177px; frame_ref 读 properties, 缺省 "frame-1").
//   state.swing_p=0 或 1: 画在节点处(0=被拉开持握/悬挂 - 节点被拖到 pull 锚点时线
//   随之倾斜; 1=回摆结束静止在节点位置), 线自悬点画到球心(class string-line 细线).
//   0<swing_p<1: 渲染器接管.θ0=properties.pull_angle_deg(自竖直向左张角, 屏幕系负
//   方向); p∈[0,0.68]: θ=-θ0 - cos((π/2) - (p/0.68))(自释放角余弦式摆到最低点, 最低点
//   附近最快); p∈[0.68,1]: 阻尼回摆 θ=+θ0 - 0.25 - sin(π - (p-0.68)/0.32) - (1-(p-0.68)/0.32)
//   回到竖直静止.摆球心 = pivot + L - (sinθ, cosθ)(屏幕系), L=thread_len_px.
//   球体: r=properties.radius_px(13/22 两档); thread 用 renderString 细线画法; 
//   apparatus-shadow 仅在摆到最低点附近(|θ|<0.22rad, 球底恰好触桌)时绘制(cy=+r).
//   标签在摆动组之外(不随球摆动).
// properties 缺省回退(2026-09-19 资产代理核查: IR 实体 properties 当前仅有 frame_ref /
//   pivot_dx_px / pivot_dy_px / radius_px, 任务规格中的 thread_len_px / pull_angle_deg
//   尚未写入 IR - 构建方集成时请为 bob-small-1 补 thread_len_px=164, pull_angle_deg=56, 
//   为 bob-large-1 补 thread_len_px=155, pull_angle_deg=53): 
//   - thread_len_px 缺省: 按节点到悬点距离反推(swing_p=0/1 的悬挂位与拉起位都在线程
//     圆上, 该反推在两个相位都精确); 仍不可用时回退 164.
//   - pull_angle_deg 缺省: 回退 56(小球实测值; 大球需 IR 补 53, 否则摆幅偏大 ~3°).
// 证据不清处: frame-023 中两球的悬点间距在原始分辨率不可精确读数, 悬挂点几何以 IR
//   properties(pivot_dx_px 27/40)为准; 本渲染器不读 anchors(pull 锚点落位由场景处理).
// 导出签名与模板一致: renderPendulumBob(entity, state, context).
// 集成: renderer 键 physics/pendulum-bob(index.js 的 import/注册由构建方完成: 复制本文件
//   到 src/renderers/ 并在 index.js 注册 'physics/pendulum-bob').

const THREAD = '#6f767e'      // 摆线(renderString 细线族, 浅色台面上取中灰)
const LOW_POINT = 0.68        // 契约: 正摆段占比
const SHADOW_CONE = 0.22      // 最低点附近(|θ| 弧度)才画接地阴影

function bobBody(r) {
  return [
    svg('circle', {cx: 0, cy: 0, r, fill: '#d3d8dc', stroke: '#5a626a', 'stroke-width': 1.6}),
    svg('path', {d: `M${(-r * 0.52).toFixed(1)} ${(r * 0.42).toFixed(1)}A${(r * 0.62).toFixed(1)} ${(r * 0.62).toFixed(1)} 0 0 0 ${(r * 0.52).toFixed(1)} ${(r * 0.42).toFixed(1)}`, fill: 'none', stroke: '#8a929a', 'stroke-width': 1.3, opacity: 0.7}),
    svg('circle', {cx: -r * 0.26, cy: -r * 0.3, r: r * 0.24, class: 'ball-highlight'}),
    svg('circle', {cx: -r * 0.32, cy: -r * 0.36, r: r * 0.09, fill: '#ffffff', opacity: 0.9}),
  ]
}

export function renderPendulumBob(entity, state = {}, context = {}) {
  const group = svg('g')
  const props = entity.properties || {}
  const radius = Number(props.radius_px ?? 13)
  const frameRef = typeof props.frame_ref === 'string' && props.frame_ref ? props.frame_ref : 'frame-1'
  const frame = context.world?.[frameRef] || null
  const pivotDx = Number(props.pivot_dx_px ?? 0)
  const pivotDy = Number(props.pivot_dy_px ?? -177)
  const frameX = Number(frame?.x ?? 0.145)
  const frameY = Number(frame?.y ?? 0.305)
  const nodeX = Number(state.x ?? frameX + pivotDx / 1000)
  const nodeY = Number(state.y ?? 0.33)
  // 悬点屏幕坐标(560 常数与节点同式相消, 内部偏移不受其影响)
  const pivotPx = frameX * 1000 + pivotDx
  const pivotPy = 560 - frameY * 500 + pivotDy
  const nodePx = nodeX * 1000
  const nodePy = 560 - nodeY * 500
  const pivotLocal = {x: pivotPx - nodePx, y: pivotPy - nodePy}

  // 线长: properties 优先; 缺省按节点-悬点距离反推(悬挂位/拉起位均在线程圆上)
  let threadLen = Number(props.thread_len_px)
  if (!Number.isFinite(threadLen) || threadLen <= 0) {
    threadLen = Math.hypot(nodePx - pivotPx, nodePy - pivotPy)
  }
  if (!Number.isFinite(threadLen) || threadLen <= 0) threadLen = 164
  const theta0 = (Number.isFinite(Number(props.pull_angle_deg)) ? Number(props.pull_angle_deg) : 56) * Math.PI / 180

  const swingP = Math.max(0, Math.min(1, Number(state.swing_p || 0)))
  const takeOver = !context.preview && swingP > 0 && swingP < 1 && Boolean(frame)
  let theta = 0
  if (takeOver) {
    if (swingP <= LOW_POINT) {
      theta = -theta0 * Math.cos((Math.PI / 2) * (swingP / LOW_POINT))
    } else {
      const q = (swingP - LOW_POINT) / (1 - LOW_POINT)
      theta = theta0 * 0.25 * Math.sin(Math.PI * q) * (1 - q)
    }
  }
  // 摆球心(局部): 接管时 = 悬点 + L - (sinθ, cosθ); 否则球在节点 (0,0)
  const bobLocal = takeOver
    ? {x: pivotLocal.x + threadLen * Math.sin(theta), y: pivotLocal.y + threadLen * Math.cos(theta)}
    : {x: 0, y: 0}

  const swing = svg('g', takeOver ? {transform: `translate(${bobLocal.x.toFixed(1)} ${bobLocal.y.toFixed(1)})`} : {})
  if (takeOver && Math.abs(theta) < SHADOW_CONE) {
    swing.append(svg('ellipse', {cx: 0, cy: radius + 0.5, rx: radius - 2, ry: 3.5, class: 'apparatus-shadow'}))
  }
  swing.append(...bobBody(radius))
  add(group,
    // 摆线: 悬点 → 球心(renderString 细线画法)+ 悬点小锚点
    svg('line', {
      x1: pivotLocal.x.toFixed(1), y1: pivotLocal.y.toFixed(1),
      x2: bobLocal.x.toFixed(1), y2: bobLocal.y.toFixed(1),
      stroke: THREAD, 'stroke-width': 1.3, 'stroke-linecap': 'round', class: 'string-line',
    }),
    svg('circle', {cx: pivotLocal.x.toFixed(1), cy: pivotLocal.y.toFixed(1), r: 1.6, fill: '#5b6a6d'}),
  )
  group.append(swing)
  group.append(label(entity.label, 0, radius + 16))
  return group
}
