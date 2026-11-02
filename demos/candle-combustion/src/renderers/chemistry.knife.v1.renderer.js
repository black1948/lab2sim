import {add, label, shadow, svg} from './svg.js'

//  -  Knife(手持切削蜡烛的操作件, "拖到蜡烛上切削"的拖拽端点) - 
// 视觉依据: frame-004/005(深色刀柄 + 金属刀刃斜向切削白蜡烛: 刀柄近黑褐, 柱状微上扬, 
// 刀刃自柄部向尖端收窄, 切缘靠下带一线亮刃口; 证据帧逆光下刀刃整体偏暗, 按实验室浅色
// 主题归一化为钢灰色族); frame-006(切削后玻璃片上留白色蜡屑, 刀已离画面).
// 风格依据: chemistry.js renderMatch / renderLighter 的手持小器件画法(apparatus-shadow
// 接地阴影 + apparatus-label 器械标签 + inline 配色不新增 styles.css class); 金属色取
// styles.css .metal 族(#b4c0c2/#5b6a6d)同系亮钢 #c9d2d6, 刃口高光 #f2f6f7; 刀柄深色取
// renderMatch 火柴头深褐族(#4a3a33/#2e241f)加深至近黑(frame-004/005 刀柄近黑无铆钉可辨).
// 局部几何(y 向下, (0,0)=刀全长中心): 刀尖在左 (-60,0.5), 柄尾在右 (+58); 全长 ~118, 
// 刃长 ~72, 柄长 ~46, 柄厚 ~14, 刃根厚 ~9.5.拖拽操作件 hit_shape 建议取外接框
// x -60..58 / y -9..8(大于细视觉几何, 见 references/visual-quality.md Apparatus).
// 无状态绑定: IR knife-1 initial_state 为空对象, 渲染器只读 entity.label.
export function renderKnife(entity, state = {}) {
  const group = svg('g')
  add(group,
    shadow(0, 12, 52, 5),
    // 刀刃: 脊线微弧压低, 切缘回弧收尖(frame-004/005 刀刃向尖端收窄趋势)
    svg('path', {
      d: 'M-60 0.5Q-30 -3.2 12 -6L12 3.5Q-24 4.2 -60 0.5Z',
      fill: '#c9d2d6', stroke: '#5b6a6d', 'stroke-width': 1.6, 'stroke-linejoin': 'round',
    }),
    // 刃口高光: 切缘一线亮(frame-005 切缘细亮线)
    svg('path', {d: 'M-55 0.9Q-26 2.9 9 2.7', fill: 'none', stroke: '#f2f6f7', 'stroke-width': 1.3, opacity: 0.9, 'stroke-linecap': 'round'}),
    // 刀柄: 近黑深色柱状柄, 尾端圆角(frame-004/005)
    svg('path', {
      d: 'M12 -6.2Q14 -7.5 19 -7.5H50Q58 -7.5 58 0Q58 6.5 50 6.5H19Q14 6.5 12 4.5Z',
      fill: '#33302e', stroke: '#1f1c1a', 'stroke-width': 1.6, 'stroke-linejoin': 'round',
    }),
    // 柄上缘弱高光(2.5D 受光面)
    svg('path', {d: 'M17 -4.4H48', fill: 'none', stroke: '#5a544f', 'stroke-width': 1.4, opacity: 0.85, 'stroke-linecap': 'round'}),
  )
  group.append(label(entity.label, 0, 26))
  return group
}
