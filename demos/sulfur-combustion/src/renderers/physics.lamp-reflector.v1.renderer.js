import {add, label, shadow, svg} from './svg.js'

//  -  光源灯(墨绿搪瓷反光罩 + 悬挂球形磨砂灯泡, 13 案例光的偏振现象二) - 
// 视觉依据: frame-002(特写: 竖直支杆灯架顶端一只墨绿搪瓷反光罩, 罩口朝向检偏器, 
// 罩沿下方居中悬挂一颗点亮的球形磨砂灯泡 - 罩宽:泡径≈1.38, 泡心在罩心下方约 1.35 倍罩宽; 
// 灯下桌面有暖色光池); frame-003/004/005(全景: 灯头在支架上部, 灯泡朝向观察者); 
// frame-009/012(检偏器盘入位后灯罩出现在盘后上方).
// 证据帧取色: 罩体墨绿 #233021, 暗部 #182416(frame-012); 灯泡暖白(透射亮态膜区
// #e7eada 佐证); 灯下光池 #7f7f5e/#67654d(frame-002, 欠曝采样, 渲染时提亮为暖白系).
// 功能: 持续发光的点光源(IR: 视频全程点亮, 无开关, state.lit!==false 即渲染点亮态, 
// false 仅作为熄灭兜底变体).与 physics.light-source.v1(箱式灯箱), physics.laser-source.v1
// (激光箱), physics.sodium-lamp.v1(立式钠光灯)形状语义均不同, 不能互相顶替.
// 锚点: 局部 (0,0)=灯泡球心(IR entity position 即光源发光点, 便于光轴对齐); 
// 反光罩在上方(y -48..-112), 支杆/夹具再往上.悬挂灯无地面接触, 接地按 frame-002
// 灯下光池表现: shadow() 接地阴影上叠加两层低透明度暖色椭圆(renderLightSource 光晕画法).
// 风格依据: physics.js renderLightSource 的光晕/尾线画法, renderPolarizer 立柱画法, 
// iron-stand 的 clamp-knob 旋钮; inline 配色, 不新增 styles.css class.
const BULB_R = 24          // 灯泡半径(frame-002 泡径≈罩宽 0.72 → 罩半宽 40 时泡径 0.6 罩宽)
const SHADE_HALF = 40      // 反光罩半宽(罩口半径)
const SHADE_MOUTH = -48    // 罩口 y(灯泡顶 -BULB_R 与罩口之间为灯头灯座)
const SHADE_TOP = -112     // 罩顶 y

function withLabel(group, entity, y) {
  group.append(label(entity.label, 0, y))
  return group
}

export function renderLampReflector(entity, state = {}) {
  const group = svg('g')
  const lit = state.lit !== false

  // 接地: 灯下光池(frame-002 灯泡正下方桌面的暖色亮池)+ 接地阴影
  add(group,
    shadow(0, 62, 36, 6),
    lit ? svg('ellipse', {cx: 0, cy: 60, rx: 46, ry: 9, fill: '#ffedbe', opacity: .14}) : null,
    lit ? svg('ellipse', {cx: 0, cy: 60, rx: 28, ry: 6, fill: '#ffe9b8', opacity: .16}) : null,
  )

  // 竖直支杆灯架(frame-003/004 灯头在支架上部: 杆自罩顶向上延伸)+ 夹持旋钮
  add(group,
    svg('rect', {x: -2.5, y: SHADE_TOP - 26, width: 5, height: 24, rx: 2, fill: '#9aa6aa', stroke: '#5b6a6d', 'stroke-width': 1.4}),
    svg('circle', {cx: 0, cy: SHADE_TOP + 2, r: 5.5, class: 'clamp-knob'}),
  )

  // 墨绿搪瓷反光罩(罩口朝向检偏器; frame-012 墨绿 #233021/暗部 #182416)
  add(group,
    svg('path', {
      d: `M${-SHADE_HALF} ${SHADE_MOUTH}Q${-SHADE_HALF - 3} -84 0 ${SHADE_TOP}Q${SHADE_HALF + 3} -84 ${SHADE_HALF} ${SHADE_MOUTH}Z`,
      fill: '#2b4a3e', stroke: '#16281f', 'stroke-width': 2, 'stroke-linejoin': 'round',
    }),
    // 罩面左侧搪瓷高光(frame-012 罩左下缘亮边)
    svg('path', {d: `M${-SHADE_HALF + 7} ${SHADE_MOUTH - 6}Q-34 -80 -12 ${SHADE_TOP + 6}`, fill: 'none', stroke: '#4e7a66', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .7}),
    // 罩右下暗部
    svg('path', {d: `M${SHADE_HALF - 6} ${SHADE_MOUTH - 4}Q${SHADE_HALF - 1} -74 ${SHADE_HALF - 14} ${SHADE_TOP + 12}`, fill: 'none', stroke: '#182416', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .8}),
    // 罩口沿(椭圆短轴表现罩口朝向的透视)+ 口沿内圈暗部
    svg('ellipse', {cx: 0, cy: SHADE_MOUTH, rx: SHADE_HALF, ry: 9, fill: '#22403a', stroke: '#16281f', 'stroke-width': 1.6}),
    svg('ellipse', {cx: 0, cy: SHADE_MOUTH - 1.5, rx: SHADE_HALF - 5, ry: 6.5, fill: 'none', stroke: '#3d6656', 'stroke-width': 1.2, opacity: .8}),
  )

  // 灯座灯颈(罩口内伸向灯泡顶的短灯座)
  add(group,
    svg('rect', {x: -8, y: -46, width: 16, height: 26, rx: 3, fill: '#8b8578', stroke: '#57503f', 'stroke-width': 1.4}),
    svg('rect', {x: -8, y: -28, width: 16, height: 5, rx: 2, fill: '#6f6a5c', stroke: '#57503f', 'stroke-width': 1}),
  )

  if (lit) {
    // 点亮泛光晕(renderLightSource 光晕画法: 低透明度叠层椭圆; 恒亮不随 state 变化)
    add(group,
      svg('circle', {cx: 0, cy: 0, r: 58, fill: '#ffe9b8', opacity: .1}),
      svg('circle', {cx: 0, cy: 0, r: 42, fill: '#ffedb8', opacity: .12}),
      svg('circle', {cx: 0, cy: 0, r: 30, fill: '#fff3c4', opacity: .18}),
    )
  }

  // 球形磨砂灯泡(frame-002: 亮白磨砂球, 内见灯丝结构影)
  const bulb = svg('circle', {cx: 0, cy: 0, r: BULB_R, fill: lit ? '#efe9d4' : '#b9b4a4', stroke: lit ? '#b9b3a2' : '#8f8b7d', 'stroke-width': 1.6})
  group.append(bulb)
  add(group,
    // 磨砂质感: 上部高光 + 下缘次亮弧
    svg('ellipse', {cx: -7, cy: -8, rx: 8, ry: 5.5, fill: '#ffffff', opacity: lit ? .75 : .4}),
    svg('path', {d: 'M-13 12Q0 19 13 12', fill: 'none', stroke: '#fffdf0', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: lit ? .6 : .2}),
    // 灯丝结构影(frame-002 泡内下部曲折灯丝影)
    svg('path', {d: 'M-8 6q4 -7 8 -3t9 -1', fill: 'none', stroke: lit ? '#b8baa3' : '#8f8b7d', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: .8}),
  )
  if (lit) {
    // 灯芯亮核(frame-002 泡心最亮)
    group.append(svg('circle', {cx: 0, cy: 0, r: 9, fill: '#fffdf0', opacity: .9}))
  }

  return withLabel(group, entity, 88)
}
