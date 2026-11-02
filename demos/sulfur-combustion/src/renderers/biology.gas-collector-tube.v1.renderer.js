import {add, label, liquidColor, shadow, svg} from './svg.js'

//  -  倒扣集气试管(15×150 mm: 封闭圆端朝上, 管口朝下; 气体聚集在封闭端下方的气帽) - 
// 视觉依据: frame-008/010(15×150 试管, 水下拇指封口); frame-016(水下倒扣: 管口朝下, 
// 管内满水, 口沿水面微凹); frame-021(集气后: 封闭圆端在视觉上方, 其下方亮色气帽, 气帽
// 与水之间有明显分界, 下段为水); frame-027(管身印有 15×150 竖排字样).
// 复用审查否决记录: biology.test-tube.v1 只有正立液位无气帽; biology.test-tube-sealable.v1
// 的 sealed 是封口膜语义(覆口膜+收拢褶), 均不能诚实表达倒扣 + 封闭端气帽(trace
// assets/reuse-review:test_tube).发现记录: discover_apparatus.py --kind test_tube 唯一候选
// 为 twbs/icons youtube.svg(形状语义完全错误), 已否决并撤销自动注册.
// 风格依据: biology.js renderTestTube 的玻璃画法原样承接 - glass-body 管体, glass-rim 口沿, 
// glass-highlight 竖向高光, liquid/meniscus 液层与弯月面, apparatus-shadow 接地阴影; 刻度
// 字样沿用 measure-marks 既有 class + inline 配色(同 chemistry.beaker-inverted.v1 先例).
// 局部几何(与 IR 对齐): (0,0)=管身中心; 封闭圆端在 -y(视觉上方, 穹顶顶点 y=-102, 圆柱段
// 自 y=-82 起); 管口端在 +y(y=100, 口沿椭圆 + 唇线).总高 202px, 外径 21px ≈ 15×150mm
// 比例(≈10:1).IR anchors mouth={x:0,y:0.2} → 0.2×500=+100 局部 px = 管口端, 一致.
// 状态绑定(IR visual.state_bindings, 与构建方要求逐一对应): 
//   state.volume_ml → liquid.level: 水位自管口端(y=+100)起算, level=clamp(volume_ml/
//     capacity,0,1)(capacity 取 entity.properties.capacity_ml, 缺省 45); volume_ml<=0
//     不画水; level>0.955(近满管)时水充满圆柱段并进入封闭穹顶(frame-016 满管无气泡).
//   state.gas_ml → gas.dome: 0..45 线性映射封闭端下方气帽厚度 0..118px(gasBottom=
//     -82+gas_ml/45*118, 上限 +92); gas_ml<=0 不画气帽.
//   气帽与水面之间画 meniscus 分界(frame-021).gas_ml>0 时水面取气帽下缘(气体把水向下
//     排出管口, 水柱始终自管口填充至气水分界) - volume_ml 仍控制有无水(volume<=0 全干); 
//   整管恒为倒扣姿态(口在下), 无正立渲染分支.
const MOUTH_Y = 100
const DOME_BASE_Y = -82
const DOME_TIP_Y = -102
const BODY_RX = 10.5
const GAS_MAX_ML = 45
const GAS_MAX_THICKNESS = 118

export function renderGasCollectorTube(entity, state = {}) {
  const group = svg('g')
  const capacity = Number(entity.properties?.capacity_ml) || 45
  const volume = Number(state.volume_ml || 0)
  const gasMl = Number(state.gas_ml || 0)
  const hasLiquid = Number.isFinite(volume) && volume > 0
  const gasT = Number.isFinite(gasMl) ? Math.max(0, Math.min(1, gasMl / GAS_MAX_ML)) : 0
  const hasGas = gasMl > 0

  // 气帽下缘(封闭端下方厚度); 水面: 有气时取气帽下缘, 无气时按 volume 自管口起算
  const gasBottomY = Math.min(92, DOME_BASE_Y + gasT * GAS_MAX_THICKNESS)
  const level = hasLiquid ? Math.max(0, Math.min(1, volume / Math.max(capacity, 1))) : 0
  const domeFull = hasLiquid && level > 0.955  // 近满管: 水进入封闭穹顶(frame-016)
  const volumeTopY = MOUTH_Y - Math.min(level, 0.955) * (MOUTH_Y - DOME_BASE_Y)
  // 满管时圆柱段水顶与穹顶水在穹顶基部处无缝相接
  const waterTopY = hasGas ? gasBottomY : (domeFull ? DOME_BASE_Y + 2 : volumeTopY)

  add(group,
    shadow(0, MOUTH_Y + 4, 13, 4),
    // 管体: 圆柱段 + 封闭圆端(圆顶在视觉上方); 口在 +y
    svg('path', {
      d: `M${-BODY_RX} ${MOUTH_Y}V${DOME_BASE_Y}Q${-BODY_RX} ${DOME_TIP_Y} 0 ${DOME_TIP_Y}Q${BODY_RX} ${DOME_TIP_Y} ${BODY_RX} ${DOME_BASE_Y}V${MOUTH_Y}Z`,
      class: 'glass-body',
    }),
  )
  if (hasGas) {
    // 气帽: 封闭端穹顶内 + 其下方柱段, 下缘弧线为气水分界(frame-021 亮色气帽)
    add(group, svg('path', {
      d: `M${-BODY_RX + 1.8} ${gasBottomY}Q0 ${gasBottomY + 2.6} ${BODY_RX - 1.8} ${gasBottomY}V${DOME_BASE_Y + 2}Q${BODY_RX - 1.8} ${DOME_TIP_Y + 7} 0 ${DOME_TIP_Y + 7}Q${-BODY_RX + 1.8} ${DOME_TIP_Y + 7} ${-BODY_RX + 1.8} ${DOME_BASE_Y + 2}Z`,
      fill: 'rgb(230 245 250 / 68%)', class: 'gas-layer',
    }))
    // 气帽与水面之间的 meniscus 分界
    add(group, svg('path', {
      d: `M${-BODY_RX + 1.8} ${gasBottomY}Q0 ${gasBottomY + 3.4} ${BODY_RX - 1.8} ${gasBottomY}`,
      class: 'meniscus',
    }))
  } else if (domeFull) {
    // 满管无气: 封闭穹顶内也充满水(frame-016 水下倒扣满管), 无自由液面
    add(group, svg('path', {
      d: `M${-BODY_RX + 1.8} ${DOME_BASE_Y + 2}Q${-BODY_RX + 1.8} ${DOME_TIP_Y + 7} 0 ${DOME_TIP_Y + 7}Q${BODY_RX - 1.8} ${DOME_TIP_Y + 7} ${BODY_RX - 1.8} ${DOME_BASE_Y + 2}Q0 ${DOME_BASE_Y - 1.4} ${-BODY_RX + 1.8} ${DOME_BASE_Y + 2}Z`,
      fill: liquidColor(state, '#B8D8E8'), class: 'liquid',
    }))
  }
  if (hasLiquid && level > 0) {
    // 水层: 自管口端向上至 waterTopY(满管时圆柱段顶至穹顶基部), 口沿水面微凹
    // (frame-016 表面张力); 有气时顶即气帽下缘
    add(group,
      svg('path', {
        d: `M${-BODY_RX + 1.8} ${waterTopY}Q0 ${waterTopY - 2.2} ${BODY_RX - 1.8} ${waterTopY}V${MOUTH_Y - 3.5}Q${BODY_RX - 1.8} ${MOUTH_Y + 1} 0 ${MOUTH_Y + 1}Q${-BODY_RX + 1.8} ${MOUTH_Y + 1} ${-BODY_RX + 1.8} ${MOUTH_Y - 3.5}Z`,
        fill: liquidColor(state, '#B8D8E8'), class: 'liquid',
      }),
    )
    if (!hasGas && !domeFull) {
      // 自由液面 meniscus(有气时分界线已由气帽下缘承担; 满管无液面)
      add(group, svg('path', {
        d: `M${-BODY_RX + 1.8} ${waterTopY}Q0 ${waterTopY - 3} ${BODY_RX - 1.8} ${waterTopY}`,
        class: 'meniscus',
      }))
    }
  }
  add(group,
    // 口沿(开口朝下): 唇线 + 下唇弧(renderTestTube 口沿画法的翻转)
    svg('path', {d: `M-12 ${MOUTH_Y}H12`, class: 'glass-rim'}),
    svg('path', {d: `M-9 ${MOUTH_Y + 4}Q0 ${MOUTH_Y + 7} 9 ${MOUTH_Y + 4}`, class: 'glass-rim'}),
    // 竖向高光 + 封闭穹顶高光弧
    svg('path', {d: `M-4.5 ${DOME_BASE_Y + 4}V${MOUTH_Y - 4}`, class: 'glass-highlight'}),
    svg('path', {d: `M-6.5 ${DOME_BASE_Y - 6}Q-3 ${DOME_TIP_Y + 5} 1 ${DOME_TIP_Y + 5}`, class: 'glass-highlight', opacity: 0.75}),
  )
  // 管身 15×150 竖排字样(frame-027; measure-marks 既有 class + inline 配色)
  const marking = svg('text', {
    x: 4.2, y: 58, 'text-anchor': 'middle',
    transform: `rotate(-90 4.2 58)`,
    fill: '#4c6b74', opacity: 0.8,
    'font-family': 'ui-sans-serif, system-ui, sans-serif', 'font-size': 5.4, 'font-weight': 600,
    class: 'measure-marks',
  })
  marking.textContent = '15×150'
  group.append(marking)
  // 标签置于封闭端上方外侧(倒扣管的视觉顶端; 不与漏斗颈/试管口区冲突)
  group.append(label(entity.label, 0, DOME_TIP_Y - 18))
  return group
}
