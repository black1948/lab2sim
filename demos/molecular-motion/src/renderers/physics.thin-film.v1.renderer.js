import {add, label, shadow, svg} from './svg.js'

//  -  手持薄膜片(矩形透明膜, 薄膜干涉反射观察) - 
// 视觉依据: frame-004/008/016(细边框矩形透明薄膜片, 约 18° 倾斜, 长轴自左下到右上 - 
// IR visual.rotation_deg=18 固化该持握姿态; frame-016 长短边目测比约 3:1 → 板面 208x70; 
// 膜面透明度极高, frame-008 实测膜内 rgb(116,116,104) 与背景 rgb(116,112,101) 几乎一致, 
// 仅细暗边框可辨 → 低透明度淡玻璃填充+细边框); frame-008 火焰反射像为膜面上一条近对角
// 方向的暖粉色光带(实测亮部 #f6b37f), frame-007/008 画内字幕干涉条纹+箭头标注该光带, 
// 条纹本身在原始分辨率不可分辨(IR assumptions) - 条纹带为按薄膜干涉原理的重建示意.
// 与既有器材的关系(复用审查否决记录): chemistry.glass-plate 是横卧 80x6 集气瓶盖片, 
// biology.microscope-slide 是平放载玻片, physics.polarizer.v1 是圆盘拨盘 - 均非手持
// 矩形薄膜片+膜面反射光带, 故另立新 kind 渲染器.
// 风格依据: physics.js renderConvexLens 的玻璃画法(glass-body 透明填充+玻璃缘描边+
// 内圈淡高光线+白色高光斑), renderScreen 面板+接地阴影画法, physics.fringe-screen.v1
// 的条纹行画法(沿轴等距条纹+亮度衰减); 反射光带配色取 frame-008 实测 #f6b37f 系, 
// 与火焰暖橙同一色族; inline 配色, 不新增 styles.css class.
// 锚点: 局部 (0,0)=膜片中心(与其余 physics 板类器材一致); 板面 x ±104, y ±35, 
// 18° 倾斜由 IR visual.rotation_deg 驱动实体旋转(渲染器不内嵌板面倾角), 旋转后视觉
// 包络约 219x131, 落在 IR hit_shape 0.22x0.3(220x150px)内.
// 状态约定: state.reflecting=true → 膜面画火焰反射像光带: 沿膜面短轴方向(局部 y), 
// 顶部略偏膜片远端(组内 rotate(-15), 与 frame-008 实测光带方位一致)的对角暖粉渐变
// 光带(四层低透明度叠层羽化边缘), 内含 9 条与光带方向垂直的明暗相间条纹(重建示意, 
// frame-007/008 字幕所指), 整体 clip 在膜面矩形内; false → 膜面只有淡玻璃反光
// (两道白色高光滑条), 无光带.不画手(IR properties 手持证据不渲染持握者).
const HALF_W = 104         // 膜面半长(frame-016 长短比约 3:1 → 208x70)
const HALF_H = 35          // 膜面半宽
const BAND_LEAN = -15      // 光带相对膜面短轴的倾角(frame-008 实测约 -15°)
const STRIPES = 9          // 明暗相间条纹数(重建示意, 8-10 条约定)

function bandLayers() {
  // 对角光带: 四层低透明度叠层形成羽化边缘(中心最亮 #f6b37f 为 frame-008 实测色)
  const layers = svg('g', {transform: `rotate(${BAND_LEAN})`})
  return add(layers,
    svg('rect', {x: -32, y: -46, width: 64, height: 92, fill: '#ff9c72', opacity: .1}),
    svg('rect', {x: -26, y: -46, width: 52, height: 92, fill: '#ff9c72', opacity: .12}),
    svg('rect', {x: -20, y: -46, width: 40, height: 92, fill: '#ffab80', opacity: .16}),
    svg('rect', {x: -13, y: -46, width: 26, height: 92, fill: '#f6b37f', opacity: .22}),
  )
}

function bandStripes() {
  // 明暗相间条纹: 与光带方向垂直(组内水平短线), 中央条纹最亮, 向外衰减
  const stripes = svg('g', {transform: `rotate(${BAND_LEAN})`})
  for (let i = 0; i < STRIPES; i += 1) {
    const y = -36 + (72 * i) / (STRIPES - 1)
    const k = 1 - Math.abs(i - (STRIPES - 1) / 2) / ((STRIPES - 1) / 2) // 中央 1 → 外侧 0
    if (i % 2 === 0) {
      stripes.append(svg('path', {
        d: `M-15 ${y}H15`, stroke: '#ffd8ba', 'stroke-width': 2.6, 'stroke-linecap': 'round',
        opacity: (0.2 + 0.35 * k).toFixed(3), fill: 'none',
      }))
    } else {
      stripes.append(svg('path', {
        d: `M-15 ${y}H15`, stroke: '#8a4f38', 'stroke-width': 2.6, 'stroke-linecap': 'round',
        opacity: (0.1 + 0.14 * k).toFixed(3), fill: 'none',
      }))
    }
  }
  return stripes
}

export function renderThinFilm(entity, state = {}) {
  const group = svg('g')
  const reflecting = Boolean(state.reflecting)
  add(group,
    // 接地阴影(renderScreen 板类阴影画法)
    shadow(0, 58, 78, 6),
    // 膜面: 低透明度淡玻璃填充 + 细边框(renderConvexLens glass-body 画法)
    svg('rect', {x: -HALF_W, y: -HALF_H, width: HALF_W * 2, height: HALF_H * 2, rx: 3, class: 'glass-body'}),
    // 内圈淡高光线(膜面前表面反光, renderConvexLens 内圈画法)
    svg('rect', {x: -HALF_W + 3, y: -HALF_H + 3, width: HALF_W * 2 - 6, height: HALF_H * 2 - 6, rx: 2, fill: 'none', stroke: '#e8f2f4', 'stroke-width': 1, opacity: .55}),
  )
  if (reflecting) {
    // 反射像光带 clip 在膜面矩形内(id 随实体唯一, 避免多实例 clipPath 冲突)
    const clipId = `thin-film-clip-${entity.id || 'film'}`
    const defs = svg('defs')
    const clip = svg('clipPath', {id: clipId})
    clip.append(svg('rect', {x: -HALF_W, y: -HALF_H, width: HALF_W * 2, height: HALF_H * 2, rx: 3}))
    defs.append(clip)
    group.append(defs)
    const band = svg('g', {'clip-path': `url(#${clipId})`})
    add(band, bandLayers(), bandStripes())
    group.append(band)
  } else {
    // 淡玻璃反光: 两道白色高光滑条(frame-004 未承接反射光时膜面仅边框+微反光可辨)
    add(group,
      svg('path', {d: `M${-HALF_W + 22} ${-HALF_H + 8}L${-HALF_W + 58} ${HALF_H - 8}`, class: 'glass-highlight', 'stroke-width': 2.2, opacity: .5}),
      svg('path', {d: `M${HALF_W - 52} ${-HALF_H + 10}L${HALF_W - 30} ${HALF_H - 10}`, class: 'glass-highlight', 'stroke-width': 1.6, opacity: .4}),
    )
  }
  group.append(label(entity.label, 0, 84))
  return group
}
