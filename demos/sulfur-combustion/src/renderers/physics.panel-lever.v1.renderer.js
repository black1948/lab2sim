import {svg} from './svg.js'

//  -  偏转电压极性拨杆(kind=panel_lever, case 137; 主机面板右侧的小型红色拨杆) - 
// 证据帧: frame-004/005(面板特写右缘: 红色小拨杆位于大黑旋钮右侧的杆座板上); frame-010/011
//          (视频中实际拨动未入镜, 极性仅由字幕'加上正下负的偏转电压'与径迹方向表明).
// 复用否决: 注册表无 panel_lever 条目; physics.knife-switch.v1(台式闸刀开关: 手柄+双接线柱)
//          形状/安装位/功能均不符; 可信源发现命中 twbs/icons nintendo-switch.svg(游戏机品牌
//          logo, 'switch' 词元误配)已回滚出注册表并删除 svg(trace assets/discover-panel_lever
//          →rollback), 故代码原生生成.
// 风格基础: 红色 #c23a2a/#8f2c20(域内红族: power-supply RED, plate-electrode 红纸条同族); 
//          杆座象牙白衬套 #d9d6c8/#8f8877(瓷件象牙白同族); 杆帽高光点白.配色内联, 不新增
//          styles.css class.
// 状态契约(读实体自身 state): state.polarity_up 三态 - null/undefined=居中(未接通偏转
//          电压, 杆竖直); true=拨向上(上板正, 杆上倾 38°); false=拨向下(下板正, 杆下倾
//          38°).小型件: 组内含 r22 透明 hit 圆盘(fill-opacity 0 仍接收 pointerdown), 
//          hit 区域大于可视几何(可视约 r10).
// 关键尺寸(局部原点=面板杆座枢轴中心; crt-demo-console 杆座板位于其局部 (62,-29), scene
//          落位请对准该点): 衬套 r4.5, 杆长 9.5, 杆帽 r3.总可视 bbox 约 13×26.
// 证据不清处: ① 拨杆杆臂倾角幅度视频未入镜(拨动未拍到), ±38° 为可读示意值; ② 杆座细节
//          (螺钉/字牌)在源分辨率不可辨, 由主机渲染器画座板, 本渲染器只画衬套+杆.
// 不画 label: 杆件总高约 26px, 13px 标签大于本体且必与主机面板图形叠压(plate-electrode
//          '不画 label' 先例); 器材识别由主机杆座板与动作 label 承担.
// 集成: 复制本文件到 src/renderers/ 并在 index.js 注册 'physics/panel-lever'
//          (import {renderPanelLever} from './physics.panel-lever.v1.renderer.js').
//          z 序: 三件套最高层(杆画在主机面板之上).

const LEVER_RED = '#c23a2a'      // 杆臂红(frame-004/005)
const LEVER_RED_EDGE = '#8f2c20'
const LEVER_CAP = '#d0524a'      // 杆帽亮红
const LEVER_CAP_EDGE = '#7e241b'
const BUSHING = '#d9d6c8'        // 衬套象牙白
const BUSHING_EDGE = '#8f8877'

function leverTip(polarity) {
  // 杆帽中心: 居中=竖直 / 上拨=上倾 38° / 下拨=下倾 38°(视频未拍到拨动, 幅度为示意)
  if (polarity === true) return {x: 5.9, y: -7.5}
  if (polarity === false) return {x: 5.9, y: 7.5}
  return {x: 0, y: -9.5}
}

export function renderPanelLever(entity, state = {}, context = {}) {
  const group = svg('g')
  const tip = leverTip(state.polarity_up)
  // 透明 hit 圆盘: 大于可视几何(可视约 r10), fill-opacity 0 仍可接收 pointerdown
  group.append(svg('circle', {cx: 0, cy: -1, r: 22, fill: '#000', 'fill-opacity': 0, stroke: 'none'}))
  // 衬套(杆座枢轴)
  group.append(svg('circle', {cx: 0, cy: 0, r: 4.5, fill: BUSHING, stroke: BUSHING_EDGE, 'stroke-width': 1.2}))
  // 杆臂(红, 双描边出体块感)+ 杆帽
  group.append(svg('line', {x1: 0, y1: 0, x2: tip.x, y2: tip.y, stroke: LEVER_RED_EDGE, 'stroke-width': 4.4, 'stroke-linecap': 'round'}))
  group.append(svg('line', {x1: 0, y1: 0, x2: tip.x, y2: tip.y, stroke: LEVER_RED, 'stroke-width': 3, 'stroke-linecap': 'round'}))
  group.append(svg('circle', {cx: tip.x, cy: tip.y, r: 3, fill: LEVER_CAP, stroke: LEVER_CAP_EDGE, 'stroke-width': 1.1}))
  group.append(svg('circle', {cx: tip.x - 1, cy: tip.y - 1.1, r: .9, fill: '#ffffff', opacity: .8}))
  // 枢轴帽(画在杆臂之上)
  group.append(svg('circle', {cx: 0, cy: 0, r: 1.6, fill: '#5b6a6d', stroke: '#3d474b', 'stroke-width': .8}))
  return group
}
