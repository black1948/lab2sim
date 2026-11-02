import {svg} from './svg.js'

//  -  亥姆霍兹励磁线圈(前环/后环, kind=helmholtz_coil, case 138) - 
// 视觉依据: frame-001(特写: 白/象牙白环形线圈正对镜头环绕球泡, 环面近圆 - 两环同轴正对
//           观察者; 前环下沿在球泡颈前, 上沿被球泡遮挡; 环面宽, 内外缘有深色包边); frame-008
//           (暗室: 后环在球泡后方呈暗色环带, 亮度明显低于前环); frame-010/015(环带始终
//           环绕束流圆区域).
// 复用审查否决(注册表无 helmholtz_coil 条目): physics.suspended-coil.v1=矩形多匝绕线框(吊线
//           悬挂, 底边导体条), 非环形对置线圈对; physics.horseshoe-magnet.v1=蹄形磁铁 - 形状
//           语义均不符, 禁止顶替.可信源发现命中 feathericons activity.svg(心电脉冲折线
//           glyph, 词元误配)已回滚(trace assets/rollback-helmholtz_coil), 故代码原生生成.
// 风格基础: 象牙白体块沿 physics.js 白色体块画法(renderConvexLens 金属圈口 + CRT CERAMIC
//           #ece9df/#b5ae9d 象牙白同族采样归一化为 #ece7d8/#8f8877); 环面绕线纹理沿
//           suspended-coil 横向匝线做法改为沿环向 dasharray 细纹; 体积感用下缘暗带+上缘受光
//           亮带(physics.js 体块两色阶画法).配色全部内联, 不新增 styles.css class.
// 关键尺寸(局部原点=线圈圆心, y 向下为正): 环体外半径 113, 内半径 97(带宽 16, 以 r105
//           stroke-width16 圆环实现); 内外深缘 r113.2/r96.8 描边; 下缘暗带(体积), 上缘受光
//           亮带, 环向绕线细纹.总外径 226px.
// 实体区分: entity.properties.mount="rear"=后环整体调暗(组 opacity 0.75, 球泡后方, frame-008
//           暗色环带); "front"(缺省)=前环正常亮度.两环共用本单资产(default_for_kind=true), 
//           z 序由构建方 scene 顺序决定(后环 < 球管 < 前环).
// 状态契约: 无状态绑定(静态件).
// 证据不清处: ① 环面实际匝数/绕线方向帧内不可辨→以环向细纹示意; ② 线圈引线/接线走向在
//           frame-001/008 中隐入机箱不可辨→不绘制(引线由构建方按需另行处理); ③ 两环间距
//           (亥姆霍兹间距=半径)在正面视角下不可见, 本资产为正面投影圆环.
// 集成: 复制本文件到模板 src/renderers/ 并在 index.js 注册 'physics/helmholtz-coil'
//           (import {renderHelmholtzCoil} from './physics.helmholtz-coil.v1.renderer.js').
//           场景落位(构建方契约): 两线圈均 (0.5,0.574)→屏幕 px (500,273), scale 1.15, 
//           以 properties.mount 区分前后环.不画 label(环心即球泡所在, 环心打字必叠压球泡
//           玻璃面, panel-lever 不画 label 同理; 器材识别由主机与球管承担); 不画接地阴影
//           (环件悬空环绕球泡, 无落地接触).hit 区域由 IR visual.hit_shape 声明.

const IVORY = '#ece7d8'       // 环面象牙白(frame-001 前环采样归一化, CRT CERAMIC 同族)
const EDGE_DARK = '#8f8877'   // 内外深缘(象牙白同族暗缘)
const WIND = '#cfc7b2'        // 环向绕线细纹
const R_MID = 105             // 环带中线半径((113+97)/2)
const BAND = 16               // 环带宽(113-97)

export function renderHelmholtzCoil(entity, state = {}, context = {}) {
  const mount = entity && entity.properties && entity.properties.mount === 'rear' ? 'rear' : 'front'
  const group = svg('g', mount === 'rear' ? {opacity: '0.75'} : {})
  // 环体(外 113 / 内 97)
  group.append(svg('circle', {cx: 0, cy: 0, r: R_MID, fill: 'none', stroke: IVORY, 'stroke-width': BAND}))
  // 环向绕线细纹(dashes 沿环向断开=细纹横跨环带, 帧内匝线不可辨仅示意)
  group.append(svg('circle', {cx: 0, cy: 0, r: R_MID, fill: 'none', stroke: WIND, 'stroke-width': BAND - 4, 'stroke-dasharray': '1.4 3.4', opacity: .55}))
  // 体积感: 下缘暗带 + 上缘受光亮带(physics.js 体块两色阶画法)
  group.append(svg('path', {
    d: 'M101.4 27.2A105 105 0 0 1 -101.4 27.2',
    fill: 'none', stroke: 'rgb(90 80 60 / 25%)', 'stroke-width': BAND, 'stroke-linecap': 'butt',
  }))
  group.append(svg('path', {
    d: 'M-105.8 -28.3A109.5 109.5 0 0 1 105.8 -28.3',
    fill: 'none', stroke: 'rgb(255 255 255 / 40%)', 'stroke-width': 2.4, 'stroke-linecap': 'round',
  }))
  // 内外深缘
  group.append(svg('circle', {cx: 0, cy: 0, r: 113.2, fill: 'none', stroke: EDGE_DARK, 'stroke-width': 1.6}))
  group.append(svg('circle', {cx: 0, cy: 0, r: 96.8, fill: 'none', stroke: EDGE_DARK, 'stroke-width': 1.6}))
  return group
}
