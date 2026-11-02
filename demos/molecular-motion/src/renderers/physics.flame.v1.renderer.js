import {add, label, svg} from './svg.js'

//  -  裸火焰(薄膜干涉演示光源) - 
// 视觉依据: frame-001/004/016(暖橙色火焰自画面下缘升起, 燃具全程未入画, 火焰下端被画面
// 下缘截断; 焰柱近竖直, 近平行侧, 尖端略侧倾).比例依验证方 frame-016 实测: 焰柱宽
// 96~130/960, 可见高 651/786 → h/w≈5.0, 本渲染整体 253/46≈5.5 接近该值(外焰最大半宽
// 23, 落在验证约定 20~24 区间).配色取自证据帧采样: 焰心淡黄 #f2eaa9(frame-001 y=500
// 行), 焰体橙 #cd865c(frame-016 y=600 行, 视频低照度偏灰, 模拟中按 template 火焰明度
// 还原为 #ff8f3d 系), 内焰黄 #e0ba73 → #ffc95e.
// 与既有器材的关系(复用审查否决记录): physics.light-source.v1 是灯箱光源, 无火焰; 
// biology.alcohol-lamp.v1 与 chemistry candle/lighter/match 均带器身且火焰仅 ~20px 图标尺寸, 
// 锚定在器身顶芯上 - IR assumptions 明确燃具从未入画, 不渲染臆造的灯体, 故本渲染器
// 只画裸焰, 不画任何灯体/灯座/支杆.
// 风格依据: chemistry.js renderCandle / biology.js renderAlcoholLamp 的三层火焰画法
// (flame-outer/flame-inner/flame-core 既有 class 携带 styles.css flame-flicker 闪烁动画, 
// 且 @media (prefers-reduced-motion: reduce) 下静止 - 复用既有 class, 不新增 class); 
// 泛光晕参照 physics.js renderLightSource 口径光晕的低透明度椭圆叠层; inline 配色.
// 锚点: 局部 (0,0)=实体锚点(与其余 physics 器材一致).焰形基部延伸至实体局部 y≈+93: 
// 按验证方模拟实测(焰底屏幕 402, 台面线 445, 截图缩放 k≈1.534)台面线对应舞台局部
// y≈290 = 实体局部 +80(锚点 stage y=210), 基部越过台面线约 13 局部 px, 使火焰呈现
// 自台面/画面下缘升起, 下端被截断; 截断观感不画接地阴影.焰尖 y=-160.
// IR hit_shape 0.09x0.34(90x170px)覆盖锚点上方焰体主段, 基部延伸段为视觉余量.
// 状态约定: state.lit=true → 四层暖橙焰形(泛光晕+外焰+焰体+内焰+焰心)+ 轻微闪烁(CSS
// flame-flicker, reduced-motion 下静止); false → 只画熄灭的灯芯残端(深色焦芯短柱, 位于
// 焰柱底段/台面线附近; 证据帧全程燃烧, 熄灭态为 IR 状态机的重建示意).
const TIP_Y = -160         // 焰尖
const BASE_Y = 95          // 焰柱基部(越过台面线: 舞台局部 290 = 实体局部 +80)

export function renderFlame(entity, state = {}) {
  const group = svg('g')
  const lit = Boolean(state.lit)
  if (!lit) {
    // 熄灭态: 灯芯残端(深色焦芯短柱, 位于焰柱底段; 无焰, 无器身, 无落影)
    add(group,
      svg('path', {d: `M0 ${BASE_Y - 3}L0 56`, stroke: '#3a2f24', 'stroke-width': 5.5, 'stroke-linecap': 'round', fill: 'none'}),
      svg('path', {d: 'M0 58L0 48', stroke: '#211a13', 'stroke-width': 5.5, 'stroke-linecap': 'round', fill: 'none'}),
      svg('ellipse', {cx: 0, cy: BASE_Y - 5, rx: 6.5, ry: 2.8, fill: '#3a2f24', opacity: .5}),
    )
    group.append(label(entity.label, 0, 84))
    return group
  }
  add(group,
    // 暖色泛光晕(frame-001/016 火焰周围的环境暖光; renderLightSource 光晕画法)
    svg('ellipse', {cx: 0, cy: -30, rx: 34, ry: 128, fill: '#ff9440', opacity: .1}),
    // 外焰软边(最宽轮廓, 低透明度形成羽化缘; 最大半宽 23, 验证约定 20~24)
    svg('path', {
      d: `M2 ${TIP_Y}Q-10 -122 -16 -78Q-21.5 -34 -23 4L-23 78Q-23 90 -11.5 92Q0 94 11.5 92Q23 90 23 78L23 4Q21.5 -34 16 -78Q10 -122 2 ${TIP_Y}Z`,
      fill: '#ff8f3d', opacity: .4, class: 'flame-outer',
    }),
    // 焰体(主轮廓: 近平行侧焰柱 + 上段收尖, frame-016 实测近并行柱状)
    svg('path', {
      d: `M1.5 ${TIP_Y + 8}Q-8.5 -114 -14 -72Q-19.5 -30 -20.5 4L-20.5 74Q-20.5 84 -10.5 86Q0 88 10.5 86Q20.5 84 20.5 74L20.5 4Q19.5 -30 14 -72Q8.5 -114 1.5 ${TIP_Y + 8}Z`,
      fill: '#ff8f3d', class: 'flame-outer',
    }),
    // Inner flame(frame-001 #e0ba73 → 模拟明度 #ffc95e; 亮区占可见焰柱中下段)
    svg('path', {
      d: `M1 -118Q-4 -84 -7.5 -52Q-10.3 -18 -11 4L-11 62Q-11 71 -5.5 72.5Q0 74 5.5 72.5Q11 71 11 62L11 4Q10.3 -18 7.5 -52Q4 -84 1 -118Z`,
      fill: '#ffc95e', class: 'flame-inner',
    }),
    // Flame core(frame-001 实测 #f2eaa9, 取 template 光色 #fff3c4 一致色系)
    svg('path', {
      d: `M0.8 -78Q-2.4 -52 -4.2 -28Q-5.7 -6 -6 8L-6 40Q-6 48 0 49.5Q6 48 6 40L6 8Q5.7 -6 4.2 -28Q2.4 -52 0.8 -78Z`,
      fill: '#fff3c4', class: 'flame-core',
    }),
  )
  group.append(label(entity.label, 0, 84))
  return group
}
