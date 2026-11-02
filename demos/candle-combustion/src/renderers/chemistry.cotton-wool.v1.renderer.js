import {add, label, shadow, svg} from './svg.js'

//  -  脱脂棉(试管②干燥装置: 承托无水氯化钙的棉团) - 
// 视觉依据: frame-019/020/021(镊子夹持白色蓬松棉团推入试管②, 棉团为不规则
// 近球形白团); frame-026/058/059(棉团塞在试管②口段, 暗光下白 #b7beb6, 归一化
// 为模板白色系).
// 形状: 不规则蓬松棉团, 直径约 22(局部单位; 试管内径约 ±9, 塞入后棉团微凸出
// 管口, 贴住玻璃内壁, 符合 frame-058 观感), 以一条 lumpy 闭合轮廓 + 内层蓬松
// 圆斑 + 高光斑 + 两道褶皱细弧表现不规则蓬松.
// 配色/画法依据: 白色系沿用 chemistry.js renderEvaporatingDish ceramic-crystals
// 既有白(#f8fafb/#ffffff, 描边 #cdd8da 系), 褶皱暗线用 #d5e0e2; 不新增 styles.css
// class.
// 状态约定: state.loaded=true(IR initial_state cotton-1.loaded, 装载后)→ 棉团上
// 叠画 9 颗确定性白色小颗粒表示吸附的无水氯化钙(画法参照 renderWeighingPaper 精盐
// 晶粒与 funnel residue 的淡色颗粒: fill #fbfdff / stroke #a4b9bf, class crystal 携带
// styles.css crystal-grow 状态变化动画; 白底棉团上以略深描边保证颗粒可辨); 
// state.cacl2 作为别名兼容.loaded 时同时隐去接地阴影与器械标签(棉团已在试管②
// 轮廓内, 标签压管违反 visual-quality).
// 渲染层级: z_index 14(试管玻璃 z 22 之后, 被 35% 透明玻璃覆盖仍可见).

// 棉团上吸附的无水氯化钙颗粒(确定性坐标, 渲染可复现)
const CACL2_GRAINS = [
  {cx: -4.8, cy: 0.8, r: 1.2},
  {cx: -1.6, cy: -2.6, r: 1},
  {cx: 1.6, cy: -1.3, r: 1.3},
  {cx: 4.8, cy: 0.5, r: 1},
  {cx: -3.2, cy: 3.7, r: 1.05},
  {cx: 1.1, cy: 2.9, r: 1.2},
  {cx: 4.3, cy: 3.4, r: 0.9},
  {cx: -0.5, cy: -5, r: 0.9},
  {cx: 2.6, cy: -4.3, r: 1.05},
]

export function renderCottonWool(entity, state = {}) {
  const group = svg('g')
  const loaded = Boolean(state.loaded || state.cacl2)
  add(group,
    loaded ? null : shadow(0, 11, 11, 3),
    // 蓬松轮廓(lumpy 闭合曲线, 半宽约 10, 直径约 21)
    svg('path', {
      d: 'M-9.8 1.2Q-10.5 -3.5 -6.2 -5.1Q-4.7 -9 -0.4 -8.2Q2.7 -10.5 5.5 -7.4Q9.4 -7.4 9.8 -3.1Q12.1 0.4 9.4 3.5Q8.6 7.4 4.3 7Q1.2 9.4 -2.3 7.4Q-7 8.6 -8.2 4.7Q-10.5 4.3 -9.8 1.2Z',
      fill: '#eef4f5', stroke: '#c6d3d6', 'stroke-width': 1.1, 'stroke-linejoin': 'round',
    }),
    // 内层蓬松圆斑
    svg('circle', {cx: -4.3, cy: -1.2, r: 4.4, fill: '#f8fbfc'}),
    svg('circle', {cx: 3.1, cy: -2, r: 3.9, fill: '#f8fbfc'}),
    svg('circle', {cx: -0.4, cy: 2.7, r: 4.5, fill: '#f4f8f9'}),
    // 高光斑
    svg('circle', {cx: -2.3, cy: -3.5, r: 2.5, fill: '#ffffff'}),
    svg('circle', {cx: 4.3, cy: 0.4, r: 2, fill: '#ffffff'}),
    // 褶皱细弧(两道)
    svg('path', {d: 'M-5.5 3.5Q-2.7 5.1 -0.4 3.7', stroke: '#d5e0e2', 'stroke-width': 1, opacity: 0.8, 'stroke-linecap': 'round', fill: 'none'}),
    svg('path', {d: 'M1.2 -5.9Q3.5 -4.8 5.1 -6.1', stroke: '#d5e0e2', 'stroke-width': 0.9, opacity: 0.7, 'stroke-linecap': 'round', fill: 'none'}),
    // 吸附的无水氯化钙白色小颗粒(loaded 后叠画)
    loaded ? CACL2_GRAINS.map(({cx, cy, r}) => svg('circle', {
      cx, cy, r,
      fill: '#fbfdff', stroke: '#a4b9bf', 'stroke-width': 0.6, class: 'crystal',
    })) : null,
  )
  if (!loaded) group.append(label(entity.label, 0, 22))
  return group
}
