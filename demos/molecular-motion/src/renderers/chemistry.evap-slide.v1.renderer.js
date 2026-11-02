import {add, label, liquidColor, shadow, svg} from './svg.js'

//  -  Glass plate(中和反应案例: 蒸发载片, 承接中和液滴并加热蒸干) - 
// 视觉依据: frame-022(玻璃棒尖端带一滴中和液触碰平放的长条玻璃片: 细长矩形, 
// 近水平侧视, 白色半透明玻璃质感); frame-023~025(坩埚钳夹持移到酒精灯火焰上方
// 加热, 液滴蒸干); frame-026(蒸干后玻璃片中央偏左一堆白色粉末状结晶).
// 与既有 chemistry.glass-plate.v1 的关系: 那是集气瓶盖片的静态画法
// (renderGlassPlate(entity) 不接收 state), 无法表达本案例干净片→带液滴→
// 加热蒸干→白色残留的状态链(复用审查已记 trace), 故按案例专属渲染模块生成.
// 画法依据: 片体沿用 chemistry.js renderGlassPlate 的全部惯例 - 圆角矩形
// (80x6, rx2)+ .glass-body 半透明玻璃质感 + glass-plate-edge 淡绿描边
// #5f8f7c + glass-highlight 高光线 + apparatus-shadow 接地阴影; 液滴画法参照
// renderFunnel 的 wet 液层与 falling-drop 液滴形(带高光); 白色粉末堆画法参照
// renderFunnel 的 residue 底堆 + undissolvedPile 的确定性小颗粒堆(白色系取
// renderWeighingPaper 精盐晶粒 #fbfdff/#cdd8da 与 cotton-wool 颗粒描边 #a4b9bf).
// 状态约定(只读 has_drop / residue / color, 不做分支外计算): 
//   state.has_drop=true  → 片面上方一滴湿润液滴(颜色读 state.color, 默认近无色
//                          #dfeef2), 带湿痕光晕与高光点; 
//   state.residue=true   → 片面上方(液滴同位置)一堆白色粉末小颗粒(mound 底堆
//                          class residue + 11 颗确定性坐标晶粒 class crystal, 二者
//                          均携带 styles.css state-changed 的 crystal-grow 出现动画); 
//   两者都为假           → 干净玻璃片; 
//   residue 优先于 has_drop(蒸干后液滴不复存在, 防规则状态泄漏时同时叠画).
// 液滴与残留同锚点(局部 x=-14, 约自片左端 30%, 对应 frame-022 棒尖落点与
// frame-026 粉堆位置): 滴在哪里, 蒸干后残留就在哪里.frame-023~025 的蒸干过程
// 在 IR 中为 delay_ms 3500 的延时过渡(无中间蒸干量状态), 二态切换的表现由
// .liquid/.residue/.crystal 的 state-changed CSS 动画承担, 渲染端不做插值.
// 证据读法说明: frame-026 为俯视片面(粉堆在片面上), 场景沿用该 kind 既有的
// 近水平侧视条形画法, 故粉堆按侧视惯例画在条形顶缘上方(同 undissolvedPile 画在
// 杯底线上的约定).标签位置与 renderGlassPlate 一致(条形上方 y=-14, 与液滴/
// 粉堆轮廓不相交).

// 残留晶粒(确定性坐标, 渲染可复现; 锚点 x=-14, 片顶面 y=-4 之上)
const RESIDUE_GRAINS = [
  {cx: -22.6, cy: -4.6, r: 1.15},
  {cx: -20.1, cy: -5.8, r: 0.95},
  {cx: -17.8, cy: -4.9, r: 1.3},
  {cx: -15.4, cy: -6.6, r: 1.05},
  {cx: -13.9, cy: -4.7, r: 1.2},
  {cx: -11.8, cy: -7.4, r: 0.9},
  {cx: -10.4, cy: -5.5, r: 1.35},
  {cx: -8.2, cy: -6.8, r: 1.0},
  {cx: -6.4, cy: -4.8, r: 1.15},
  {cx: -18.9, cy: -3.8, r: 1.0},
  {cx: -12.9, cy: -3.9, r: 0.9},
]

export function renderEvapSlide(entity, state = {}) {
  const group = svg('g')
  const hasDrop = Boolean(state.has_drop) && !state.residue
  const hasResidue = Boolean(state.residue)
  // 液滴颜色读 state.color(liquidColor 同口径校验), 默认近无色 #dfeef2
  const dropColor = liquidColor(state, '#dfeef2')
  add(group,
    shadow(0, 5, 40, 3),
    // 片体: 圆角矩形 + 半透明玻璃质感(renderGlassPlate 同款几何与 class)
    svg('rect', {x: -40, y: -4, width: 80, height: 6, rx: 2, class: 'glass-body'}),
    svg('rect', {x: -40, y: -4, width: 80, height: 6, rx: 2, fill: 'none', stroke: '#5f8f7c', 'stroke-width': 1.6, class: 'glass-plate-edge'}),
    svg('path', {d: 'M-30 0H16', class: 'glass-highlight'}),
    // 湿润液滴(frame-022: 棒尖滴落在片面上的一滴;  dome 贴片顶面 y=-4)
    hasDrop ? svg('ellipse', {cx: -14, cy: -3.7, rx: 7.6, ry: 1.5, fill: dropColor, opacity: 0.3}) : null,
    hasDrop ? svg('path', {d: 'M-18.9 -4Q-18.6 -8 -14 -9.4Q-9.4 -8 -9.1 -4Z', fill: dropColor, class: 'liquid'}) : null,
    hasDrop ? svg('circle', {cx: -16.3, cy: -6.6, r: 1.1, fill: '#ffffff', opacity: 0.85}) : null,
    // 白色粉末残留(frame-026: 白色结晶粉末堆, mound 底堆 + 确定性晶粒)
    hasResidue ? svg('path', {
      d: 'M-24.6 -3.7Q-23.6 -6 -19.4 -6.8Q-16.4 -9 -12.2 -7.6Q-7.6 -8.2 -5.4 -5.4Q-3.6 -4.6 -3.8 -3.7Z',
      fill: '#f6f9fa', stroke: '#cdd8da', 'stroke-width': 0.8, 'stroke-linejoin': 'round', class: 'residue',
    }) : null,
    hasResidue ? RESIDUE_GRAINS.map(({cx, cy, r}) => svg('circle', {
      cx, cy, r,
      fill: '#fbfdff', stroke: '#a4b9bf', 'stroke-width': 0.6, class: 'crystal',
    })) : null,
  )
  group.append(label(entity.label, 0, -14))
  return group
}
