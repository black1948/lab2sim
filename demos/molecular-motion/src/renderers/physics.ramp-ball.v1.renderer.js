import {label, svg} from './svg.js'

//  -  钢球 - 斜面滚落态(kind=ball 的状态驱动变体, 109-物体的动能; IR visual.asset_ref /
// scene renderer=physics/ramp-ball 选择, physics.ball.v1 仍为 kind=ball 的 default) - 
// 视觉依据: frame-006/008/016(银灰钢球沿弧形斜槽滚下, 贴桌面滚向木块, 撞击后回弹; 
//           frame-016 近景球体深灰钢质+左上高光).复用审查: physics.ball.v1(球体类)
//           无滚落位移语义, kind=ball 的变体先例 physics.ball-flight.v1(07 案例)同理
//           另立变体不改默认.
// 风格依据: physics.js renderBall 的球体画法结构(body 圆+左上高光+接地阴影)+
//           physics.ball-flight.v1.renderer.js 的钢球金属配色(#c9cfd5 族, frame-016 实拍
//           深灰钢球归一化; 高光沿用既有 ball-highlight class).如需字面使用 ball-body
//           类(模板铜色球), 改 body 圆的 class/fill 一行即可.配色内联, 不新增 class.
// 状态契约(构建方编舞依赖, 逐条照契约实现; 节点由 app 平移到 state.x/y, 屏幕系
//   screenX=x - 1000, screenY=560−y - 500, 内部偏移=绘制位−节点位): 
//   state.armed=true 且 0<state.roll_p<1 时渲染器完全接管球的绘制位置; 否则不加内部
//   偏移(画在节点处; context.preview 同样不接管).
//   roll_p 三段映射(p=state.roll_p): 
//     段A p∈[0,0.42]: 沿斜槽圆弧自释放点滑到槽口.释放角 β_release: release_mark==="10"
//       → 135°(chute 局部 -92,-38), 否则(含 "20")→ 160°(局部 -122,-86); 段A随
//       β 自释放角递减到 90°(槽口), 角度推进用 ease-in 二次缓动(q², 先慢后快, 
//       进入水平段最快 - 释放点速度最小, 槽口速度最大).斜槽弧几何: 四分之一圆
//       R=130, 圆心在 chute 原点局部 (0,-130)(屏幕系 y 向下), 局部弧点 ly=-130+130sinβ; 
//       chute 世界位置 = world[chute_ref].x/.y(chute_ref 读 properties, 缺省 "chute-1").
//     段B p∈[0.42,0.66]: 槽口 → (contact_x - 1000, run_y) 世界位置, 线性插值(贴桌面
//       匀速滚向木块原左缘; contact_x=0.209=块左缘 225px−球半径 16px).
//     段C p∈[0.66,1]: contact → (rebound_x - 1000, run_y), ease-out(1-(1-q)²)减速回退
//       (frame-008: 撞击后球回退到约 1.5cm 处, rebound_x=0.183).
//   球体: r=properties.radius_px(缺省 16); apparatus-shadow 接地阴影仅在段B/C 且球心
//   距槽口 ≥34px(已离开槽口薄唇, 不与斜槽重叠)时绘制, 阴影贴桌面(cy=+r).
//   标签在移动组之外(不随球滑动).
// 证据不清处: 段A 的"加速感"缓动方向契约原文("先快后慢...用 ease-in")存在歧义, 按
//   物理正确与 ease-in 字面取 q²(先慢后快); 若构建方要减速进入水平段, 把 q² 改为
//   1-(1-q)² 一行即可.
// 导出签名与模板一致: renderRampBall(entity, state, context).
// 集成: renderer 键 physics/ramp-ball(index.js 的 import/注册由构建方完成: 复制本文件
//   到 src/renderers/ 并在 index.js 注册 'physics/ramp-ball').

const R = 130          // 斜槽弧半径(契约)
const CY = -130        // 圆心局部 y(槽口正上方)
const A_END = 0.42     // 段A 结束(槽口)
const B_END = 0.66     // 段B 结束(接触木块)

function ballBody(r) {
  return [
    svg('circle', {cx: 0, cy: 0, r, fill: '#c9cfd5', stroke: '#5a626a', 'stroke-width': 1.6}),
    svg('path', {d: `M${(-r * 0.52).toFixed(1)} ${(r * 0.42).toFixed(1)}A${(r * 0.62).toFixed(1)} ${(r * 0.62).toFixed(1)} 0 0 0 ${(r * 0.52).toFixed(1)} ${(r * 0.42).toFixed(1)}`, fill: 'none', stroke: '#8a929a', 'stroke-width': 1.3, opacity: 0.7}),
    svg('circle', {cx: -r * 0.26, cy: -r * 0.3, r: r * 0.24, class: 'ball-highlight'}),
    svg('circle', {cx: -r * 0.32, cy: -r * 0.36, r: r * 0.09, fill: '#ffffff', opacity: 0.9}),
  ]
}

export function renderRampBall(entity, state = {}, context = {}) {
  const group = svg('g')
  const props = entity.properties || {}
  const radius = Number(props.radius_px ?? 16)
  const chuteRef = typeof props.chute_ref === 'string' && props.chute_ref ? props.chute_ref : 'chute-1'
  const chute = context.world?.[chuteRef] || null
  const armed = Boolean(state.armed)
  const p = Math.max(0, Math.min(1, Number(state.roll_p || 0)))
  const takeOver = !context.preview && armed && p > 0 && p < 1 && Boolean(chute)

  let offset = null
  let showShadow = false
  if (takeOver) {
    const chuteX = Number(chute.x ?? 0.158)
    const chuteY = Number(chute.y ?? 0.305)
    const runY = Number(props.run_y ?? 0.337)
    const contactX = Number(props.contact_x ?? 0.209)
    const reboundX = Number(props.rebound_x ?? 0.183)
    // 段A 释放角: 10cm 刻度 → 135°, 20cm(缺省)→ 160°
    const betaRelease = String(state.release_mark) === '10' ? 135 : 160
    let drawX = chuteX
    let drawY = chuteY
    if (p < A_END) {
      const q = p / A_END
      const beta = (betaRelease - (betaRelease - 90) * q * q) * Math.PI / 180   // ease-in: q²
      const localY = CY + R * Math.sin(beta)          // 弧点局部 ly(屏幕系 y 向下)
      drawX = chuteX + R * Math.cos(beta) / 1000
      drawY = chuteY - localY / 500                    // 状态 y 向上: y = chuteY − ly/500
    } else if (p < B_END) {
      const q = (p - A_END) / (B_END - A_END)
      drawX = chuteX + (contactX - chuteX) * q
      drawY = chuteY + (runY - chuteY) * q
    } else {
      const q = (p - B_END) / (1 - B_END)
      const ease = 1 - (1 - q) * (1 - q)               // ease-out 减速回退
      drawX = contactX + (reboundX - contactX) * ease
      drawY = runY
    }
    // 内部偏移 = 绘制位 − 节点位(屏幕系; 560 常数相消)
    offset = {
      x: (drawX - Number(state.x ?? chuteX)) * 1000,
      y: (Number(state.y ?? runY) - drawY) * 500,
    }
    showShadow = p >= A_END && (drawX - chuteX) * 1000 >= 34   // 段B/C 且离开槽口薄唇
  }

  const ball = svg('g', offset ? {transform: `translate(${offset.x.toFixed(1)} ${offset.y.toFixed(1)})`} : {})
  if (showShadow) ball.append(svg('ellipse', {cx: 0, cy: radius + 0.5, rx: radius - 2, ry: 4, class: 'apparatus-shadow'}))
  ball.append(...ballBody(radius))
  group.append(ball)
  group.append(label(entity.label, 0, radius + 20))
  return group
}
