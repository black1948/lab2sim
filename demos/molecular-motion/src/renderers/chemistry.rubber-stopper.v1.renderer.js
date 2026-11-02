import {add, label, shadow, svg} from './svg.js'

//  -  橡皮塞(密封试管②口的实心锥形橡胶塞) - 
// 视觉依据: frame-027/047(塞紧试管②口: 外露段顶宽下窄的锥形, 顶略圆隆, 
// 暗光下采样均色 #8e876d 的棕褐橡胶); frame-019~021 为塞入前的棉花步骤.
// 证据引用修正: 任务给的 frame-045(台面上的塞)实为醋酸瓶的磨口玻璃塞(透明磨砂, 
// 带翻边, frame-044 可见它正被从醋酸瓶上取下), 非橡皮塞 - 橡皮塞的台面散置状态在
// 证据帧中未出现, 台面姿态按锥塞宽端朝下的自然放置重建(已记入 trace 复用审查结论).
// 形状: 宽约 26, 高约 18+2(底部略越过原点使其塞入管口); 底部(插入端)半宽 8, 
// 肩部半宽 12.5, 顶部圆隆 - 与 frame-027 外露段上宽下窄一致.
// 原点约定: 塞的底部贴近实体原点(y=+2 轻微下探), dock 到试管口(chemistry.js
// renderTestTube 的 glass-rim 在局部 y≈-52, 口沿半宽 12)时呈现盖住管口的观感.
// 配色: 沿 chemistry.js renderDeliveryTube 双孔塞既有橡胶配色族(fill #c9a06a /
// stroke #8a6a42)加暗侧与高光(#96693f / #e8cfa4) - 证据帧暗光棕褐归一化后与该族
// 一致; 否决 styles.css .rubber 的红色 #bc4d58(那是滴管胶帽的红, 与证据帧不符).
// 全部内联属性, 不新增 styles.css class.
// 状态约定: state.placed=true(IR 规则 stopper-2-rule 写入)→ 已塞入试管②: 隐去
// 接地阴影与器械标签(避免在管口/管身上叠字, visual-quality标签不得压器材轮廓); 
// false → 台面/备货姿态, 带阴影与标签.
// 渲染层级: z_index 30(盖在试管玻璃 z 22 之上).

export function renderRubberStopper(entity, state = {}) {
  const group = svg('g')
  const placed = Boolean(state.placed)
  add(group,
    placed ? null : shadow(0, 3.4, 14, 3.4),
    // 锥塞主体: 底缘微隆(椭圆底)→ 肩部最宽 → 顶部圆隆
    svg('path', {
      d: 'M-8 2L-11 -10.5Q-12.8 -17 -7.2 -18.6Q0 -20.6 7.2 -18.6Q12.8 -17 11 -10.5L8 2Q0 4.4 -8 2Z',
      fill: '#c9a06a', stroke: '#8a6a42', 'stroke-width': 2, 'stroke-linejoin': 'round',
    }),
    // 右侧暗面(2.5D 圆锥暗侧)
    svg('path', {
      d: 'M3.5 -18.4Q10.9 -15.7 9.9 -9.6L7.3 1.4Q4.9 2.7 2.6 2.2L5.2 -8.6Q6.4 -14.2 3.5 -18.4Z',
      fill: '#96693f', opacity: 0.55,
    }),
    // 左肩高光 + 顶部圆隆高光弧
    svg('path', {d: 'M-6.5 -14.5L-4.6 -2', stroke: '#e8cfa4', 'stroke-width': 1.6, opacity: 0.85, 'stroke-linecap': 'round', fill: 'none'}),
    svg('path', {d: 'M-6 -16.8Q0 -19.6 6 -16.8', stroke: '#e8cfa4', 'stroke-width': 1.4, opacity: 0.7, 'stroke-linecap': 'round', fill: 'none'}),
  )
  if (!placed) group.append(label(entity.label, 0, -32))
  return group
}
