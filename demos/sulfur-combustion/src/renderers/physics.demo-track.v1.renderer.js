import {add, label, shadow, svg} from './svg.js'

//  -  演示轨道(106-牛顿第三定律: 蓝色扁平演示轨道, 磁力小车在其上滑行) - 
// 视觉依据: frame-004 特写(深蓝扁平轨道横贯画面: 顶面蓝, 前缘亮, 前立面同族深蓝, 
//           无支脚, 无气源, 无标尺, 直接坐在玻璃桌面上); frame-011/012(两车压合时轨道
//           仍为一条水平蓝带, 无任何立柱/脚座); frame-020(弹开后轨道不变, 两端未见
//           明显端头细节); frame-018(压合近景, 轨道顶面与车轮接触线即车底所在水平线).
// 复用审查否决记录: physics.air-track.v1 为 24-匀加速案例的绿色三角截面气垫导轨(白色
//           滑行面+标尺+T 形支脚+通气槽+进气盒), 形状/颜色/语义均不符; physics.slope.v1
//           为 20° 木质斜面; physics.optical-bench.v1 为光学导轨(铝型材+标尺+支脚).
//           均不得顶替.可信源发现亦失败(GitHub 图标库无匹配矢量, 单色线稿与本域 2.5D
//           风格断裂).
// 风格依据: physics.air-track.v1.renderer.js 的板件+接地阴影画法, physics.js renderSlope
//           底缘线约定; 配色取 frame-004 实拍深蓝族(采样 #0c1533/#0e1733, 低照度归一化
//           提亮到实验室浅色主题的同族 #2d5493/#234477/#1a3157), 描边/白高光线宽同域约定
//           (1.6/1.4/1.2).配色全部内联, 不新增 styles.css class.
// 局部几何(y 向下, (0,0)=轨道顶面中心=小车车轮接触线): 
//   含两端挡边总长 800(x∈[-400,400]); 蓝色轨体面 x∈[-393,393]; 
//   顶面受光条 y∈[0,5](前缘亮线 y≈1); 前立面 y∈[5,31](下段压深 y∈[24,31]); 
//   两端挡边 x∈[-400,-388]/[388,400], y∈[-8,31](微翘 8px, 总高 39 落在 36-44 约定内); 
//   接地阴影椭圆 (0,33) rx380.轨道直接坐桌面(无支脚), IR z_index=12 为最低 z 序.
// 状态契约: 静态器材, 无状态绑定(IR state_bindings 空).
// 证据不清处: ① 两端挡边在帧内被画面边缘/虚焦截断, "两端微翘/有挡边"依构建方对帧的判读
//   补形, 端头几何为示意; ② frame-004 轨道前立面下沿有一条更亮的窄带(玻璃桌面反光), 
//   属桌面反光不属轨道, 未绘制.
// 导出签名与模板一致: renderDemoTrack(entity, state, context).
// 集成: renderer 键 physics/demo-track(index.js 的 import/注册由构建方完成: 复制本文件到
// src/renderers/ 并在 index.js 注册 'physics/demo-track').

const TRACK_TOP = '#2d5493'        // 顶面受光条(frame-004 轨道顶面蓝, 低照度归一化)
const TRACK_FACE = '#234477'       // 前立面主色
const TRACK_FACE_DEEP = '#1a3157'  // 前立面下段压深
const TRACK_EDGE = '#101f3c'       // 描边/底缘
const STOP_FACE = '#2b4f8b'        // 两端挡边(同族微亮, 示微翘受光)

export function renderDemoTrack(entity, state = {}, context = {}) {
  const group = svg('g')
  add(group,
    shadow(0, 33, 380, 6),
    // 前立面(主体蓝带)
    svg('rect', {x: -393, y: 5, width: 786, height: 26, fill: TRACK_FACE, stroke: TRACK_EDGE, 'stroke-width': 1.6}),
    // 前立面下段压深(frame-004 前立面下部更暗)
    svg('rect', {x: -393, y: 24, width: 786, height: 7, fill: TRACK_FACE_DEEP}),
    // 顶面受光条(车轮接触面)
    svg('rect', {x: -393, y: 0, width: 786, height: 5, fill: TRACK_TOP, stroke: TRACK_EDGE, 'stroke-width': 1.2}),
    // 前缘亮线(frame-004 特写: 顶面前缘亮)
    svg('line', {x1: -391, y1: 1.2, x2: 391, y2: 1.2, stroke: 'rgb(255 255 255 / 55%)', 'stroke-width': 1.6, 'stroke-linecap': 'round'}),
    // 底缘线(坐桌面)
    svg('line', {x1: -393, y1: 30.4, x2: 393, y2: 30.4, stroke: TRACK_EDGE, 'stroke-width': 1.4, 'stroke-linecap': 'round'}),
  )
  // 两端挡边(微翘, frame 内端头不可辨, 依构建方判读补形)
  for (const side of [-1, 1]) {
    const xOuter = side * 400
    const xInner = side * 388
    const left = Math.min(xOuter, xInner)
    add(group,
      svg('rect', {x: left, y: -8, width: 12, height: 39, rx: 1.5, fill: STOP_FACE, stroke: TRACK_EDGE, 'stroke-width': 1.6}),
      svg('line', {x1: left + 3, y1: -7, x2: left + 11, y2: -7, stroke: 'rgb(255 255 255 / 50%)', 'stroke-width': 1.3, 'stroke-linecap': 'round'}),
    )
  }
  group.append(label(entity.label, 0, 55))
  return group
}
