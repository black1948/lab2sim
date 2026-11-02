import {add, label, shadow, svg} from './svg.js'

//  -  正立宽口集气瓶(125mL 级: 直筒瓶身 + 短颈 + 平磨口沿, 开口无嘴无塞无旋塞) - 
// 视觉依据: frame-005/007(并排两只, 盖毛玻璃片: 瓶形/瓶口/盖片位置最清晰); frame-022
// (开盖后双瓶: 直筒瓶身, 圆肩收短颈, 口沿微扩唇, 厚玻璃底带); frame-023/024/025(瓶口
// 可伸入燃着木条, 瓶内长焰透过玻璃清晰可见 - 瓶身必须透亮); frame-030(持续态).
// 复用审查否决记录(trace assets-1-reuse-review): chemistry.beaker.v1 有倾倒嘴, 无颈无肩无
// 磨口沿; chemistry.gas-holder.v1 是下储水瓶+球形储气球+侧管旋塞+乳胶管复合装置; 
// chemistry.reagent-bottle.v1 棕色瓶+螺旋盖+标签贴(封闭瓶口); chemistry.graduated-cylinder.v1
// 细长带刻度带底座溢流嘴; chemistry.test-tube.v1 细管; 派生变体 beaker-inverted /
// funnel-inverted / biology.gas-collector-tube 均为倒扣集气语义.发现否决记录(trace
// assets-2-discover): discover_apparatus.py 唯一自动注册候选 twbs/icons gear-wide-connected.svg
// 为 16x16 单色 currentColor 齿轮图标(形状语义无关 + 风格断裂), 已否决, 未入正式注册表.
// 风格依据: chemistry.js renderBeaker/renderGasHolder 的玻璃画法 - glass-body 瓶体, 
// glass-rim 口沿唇线, glass-highlight 竖向高光, apparatus-shadow 接地阴影; 磨口沿双线画法
// 沿 renderGasHolder 磨口塞 inline 细线惯例(stroke #34545e 族, 低不透明度); 厚底带取
// renderGlassPlate 玻璃描边 #5f8f7c 同族 inline 低透明填充.不新增 styles.css class.
// 无状态绑定: IR jar-co2/jar-o2 的 cover_removed/color_observed/smelled/tested 均为过程
// 遥测态, 无器身视觉分支(毛玻璃片是独立实体 plate-*, 盖/开由该实体 dock/remove 表达); 
// 两瓶气体均无色(IR properties.color=无色), 不画雾层; 证据帧瓶身无刻度, 不画 markings.
// state 形参仅作签名一致(同 chemistry.knife.v1 先例).
// 局部几何(y 向下, (0,0)=瓶底面中心, 台面接触线): 瓶口沿顶线 y=-127(外唇半宽 ±24), 
// 颈 ±21(y=-112.5..-127), 肩弧(y=-112.5..-96), 直筒瓶身(上 ±35.5 → 下 ±33, y=-96..0, 
// 微上宽下窄), 厚玻璃底(底缘 y=+4); 总高 131, 瓶身宽 66..71 ≈ frame-022 实测比例
// (瓶宽/总高≈0.53, 颈/瓶宽≈0.6).
const RIM_Y = -127

export function renderGasJar(entity, state = {}) {
  const group = svg('g')
  void state  // 静态器身: IR 状态无器身视觉分支(见文件头)
  add(group,
    shadow(0, 7, 42, 7),
    // 瓶体轮廓: 口沿 → 颈 → 肩 → 直筒身 → 厚底(glass-body 半透明玻璃, 瓶内火焰可透过)
    svg('path', {
      d: 'M-21 -127L21 -127L21 -112.5Q35.5 -110 35.5 -96L33 0Q32.5 4 26 4L-26 4Q-33.5 4 -33 0L-35.5 -96Q-35.5 -110 -21 -112.5Z',
      class: 'glass-body',
    }),
    // 厚玻璃底带(frame-022 瓶底明显加厚, 淡绿玻璃色)+ 内底弧
    svg('path', {
      d: 'M-30.6 -8L30.6 -8L29.6 0Q29 3 24 3L-24 3Q-29 3 -29.6 0Z',
      fill: 'rgb(95 143 124 / 18%)', stroke: 'none',
    }),
    svg('path', {d: 'M-30.6 -8Q0 -5.2 30.6 -8', fill: 'none', stroke: '#5f8f7c', 'stroke-width': 1.2, opacity: 0.5}),
    // 平磨口沿: 外扩唇线(glass-rim)+ 磨砂密封带细线(renderGasHolder 磨口塞惯例)
    svg('path', {d: 'M-24 -127H24', class: 'glass-rim'}),
    svg('path', {d: 'M-21.5 -122H21.5', fill: 'none', stroke: '#34545e', 'stroke-width': 1.1, opacity: 0.5}),
    // 竖向高光: 瓶身主高光 + 颈部短高光
    svg('path', {d: 'M-26 -88V-14', class: 'glass-highlight'}),
    svg('path', {d: 'M-14 -124V-115', class: 'glass-highlight', opacity: 0.8}),
  )
  // 标签置于瓶身下方外侧(视频二氧化碳/氧气为后期字幕, IR assumptions 以常显瓶标签表达)
  group.append(label(entity.label, 0, 26))
  return group
}
