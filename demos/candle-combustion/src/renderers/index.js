import {renderBeaker, renderBench, renderBurette, renderCandle, renderConicalFlask, renderCylinder, renderDeliveryTube, renderDropper, renderElectronicScale, renderEvaporatingDish, renderFallback, renderFunnel, renderGasHolder, renderGlassPlate, renderGlassRod, renderIronStand, renderAlcoholLamp, renderLighter, renderMatch, renderPipette, renderReagentBottle, renderSeparatingFunnel, renderSteppedStand, renderTestTube, renderWeighingPaper} from './chemistry.js'
import {renderBench as renderBiologyBench, renderPetriDish, renderInoculationLoop, renderAlcoholLamp as renderBiologyAlcoholLamp, renderBunsenBurner, renderTestTube as renderBiologyTestTube, renderSlantCulture, renderAutoclave, renderIncubator, renderInoculationBox, renderMicroscopeSlide, renderFlask, renderPipette as renderBiologyPipette, renderForceps, renderCultureMedium, renderCTube, renderTissueDissociator, renderTubeRotator, renderCellStrainer, renderCentrifugeTube, renderCentrifuge, renderReagentVial, renderTissueSample, renderImageAsset} from './biology.js'
import {renderWallBracket, renderWeight, renderString, renderRubberBand, renderSpringScale, renderPulley, renderForceArrow, renderPhysicsBoard, renderAngleIndicator, renderProtractor, renderSlope, renderBall, renderStopBoard, renderForceDecomposer, renderIncline, renderCart, renderMetronome, renderFlag, renderBrinellTester, renderTestTable, renderBallIndenter, renderMetalSpecimen, renderMeasuringMicroscope, renderTrussStrut, renderTrussStand, renderOpticalBench, renderLightSource, renderConvexLens, renderPolarizer, renderScreen, renderHorseshoeMagnet, renderSuspendedCoil, renderGalvanometer, renderDryCell, renderKnifeSwitch} from './physics.js'
import {renderTrainer, renderOpAmpDip8, renderResistor, renderPatchLead, renderMultimeter, renderTestProbe, renderSocketZone, renderAmTrainer, renderOscilloscope, renderRotarySwitch, renderPotSlider, renderScopeProbe, renderTestPoint, renderSignalJack} from './circuits.js'
import {renderHydrogenJetTube} from './chemistry.hydrogen-jet-tube.v1.renderer.js'
import {renderBeakerInverted} from './chemistry.beaker-inverted.v1.renderer.js'
// 双缝干涉案例(01): 资产子代理生成的光学渲染模块(registries/discovered/ 集成)
import {renderLaserSource} from './physics.laser-source.v1.renderer.js'
import {renderDoubleSlit} from './physics.double-slit.v1.renderer.js'
import {renderFringeScreen} from './physics.fringe-screen.v1.renderer.js'
// 薄膜干涉案例(03): 资产子代理生成的裸火焰/薄膜片渲染模块(registries/discovered/ 集成)
import {renderFlame} from './physics.flame.v1.renderer.js'
import {renderThinFilm} from './physics.thin-film.v1.renderer.js'
// 薄膜干涉案例(04): 资产子代理生成的读数显微镜/钠光灯/白瓷环/半透明薄条/木盒(registries/discovered/ 集成)
import {renderReadingMicroscope} from './physics.reading-microscope.v1.renderer.js'
import {renderSodiumLamp} from './physics.sodium-lamp.v1.renderer.js'
import {renderRingVessel} from './physics.ring-vessel.v1.renderer.js'
import {renderFilmStrip} from './physics.film-strip.v1.renderer.js'
import {renderWoodenBox} from './physics.wooden-box.v1.renderer.js'
// 牛顿第三定律案例(106 物理): 资产子代理生成的蓝色演示轨道/镜像磁力小车 ×2(registries/discovered/ 集成)
import {renderDemoTrack} from './physics.demo-track.v1.renderer.js'
import {renderMagneticCartLeft} from './physics.magnetic-cart-left.v1.renderer.js'
import {renderMagneticCartRight} from './physics.magnetic-cart-right.v1.renderer.js'
// 铁钉锈蚀案例(04 化学): 资产子代理生成的铁钉/橡皮塞/脱脂棉渲染模块(registries/discovered/ 集成)
import {renderIronNail} from './chemistry.iron-nail.v1.renderer.js'
import {renderCopperSpiral} from './chemistry.copper-spiral.v1.renderer.js'
import {renderRubberStopper} from './chemistry.rubber-stopper.v1.renderer.js'
import {renderCottonWool} from './chemistry.cotton-wool.v1.renderer.js'
// 空气流动与蒸腾案例(14 生物): 资产子代理生成的芹菜茎/电吹风/封口膜/试管架/阳光区/可封口试管(registries/discovered/ 集成)
import {renderPlantStem} from './biology.plant-stem.v1.renderer.js'
import {renderHairDryer} from './biology.hair-dryer.v1.renderer.js'
import {renderSealFilm} from './biology.seal-film.v1.renderer.js'
import {renderTestTubeRack} from './biology.test-tube-rack.v1.renderer.js'
import {renderSunlitZone} from './biology.sunlit-zone.v1.renderer.js'
import {renderSealableTestTube} from './biology.test-tube-sealable.v1.renderer.js'
// 光合作用产生氧气案例(18 生物): 资产子代理生成的金鱼藻/倒扣集气漏斗/集气试管/带火星木条(registries/discovered/ 集成)
import {renderAquaticPlant} from './biology.aquatic-plant.v1.renderer.js'
import {renderFunnelInverted} from './chemistry.funnel-inverted.v1.renderer.js'
import {renderGasCollectorTube} from './biology.gas-collector-tube.v1.renderer.js'
import {renderGlowingSplint} from './biology.glowing-splint.v1.renderer.js'
// 运动合成案例(07 物理): 气垫导轨/演示小车复合装置/飞行态钢球变体/触点立柱/鳄鱼夹导线/
// 气源/x-y 轨迹记录板(code-native, 视觉依据 frame-008/009/011/014/016/019/021/030)
import {renderAirTrack} from './physics.air-track.v1.renderer.js'
import {renderAirGlider} from './physics.air-glider.v1.renderer.js'
import {renderBallFlight} from './physics.ball-flight.v1.renderer.js'
import {renderContactPost} from './physics.contact-post.v1.renderer.js'
import {renderClipLead} from './physics.clip-lead.v1.renderer.js'
import {renderAirSource} from './physics.air-source.v1.renderer.js'
import {renderGraphBoard} from './physics.graph-board.v1.renderer.js'
// 中和反应案例(05 化学): 资产子代理生成的蒸发载片渲染模块(registries/discovered/ 集成)
import {renderEvapSlide} from './chemistry.evap-slide.v1.renderer.js'
// 液体扩散与温度案例(101 物理 - 器材用化学域): 资产子代理生成的台式数字温度计
// (主机+缆线+钢针探针; state.display_c → 红色七段读数, state.above 切换 docked 入水位姿)
import {renderDigitalThermometer} from './chemistry.digital-thermometer.v1.renderer.js'
// 酯化反应案例(07 化学): 资产子代理生成的收集管双层液体渲染模块(registries/discovered/ 集成)
// (下层 volume_ml+color; layer_cm→无色油层带+顶面粉环; foam→界面泡沫团+品红界面环)
import {renderTestTubeLayered} from './chemistry.test-tube-layered.v1.renderer.js'
// 物体的动能案例(109 物理): 资产子代理生成的支架/弧形斜槽/30cm 刻度尺/木块/滚落钢球变体/
// 摆锤钢球变体(registries/discovered/ 集成; 视觉依据 frame-004/006/007/008/012/016/023/024/034/039)
// ramp-ball 按 roll_p 三段映射(下落加速段→水平匀段→撞后回弹段); pendulum-bob 按 swing_p
// 余弦摆动+阻尼回弹, pivot_dx/radius/thread_len/pull_angle 全读 properties
import {renderCurvedChute} from './physics.curved-chute.v1.renderer.js'
import {renderSupportFrame} from './physics.support-frame.v1.renderer.js'
import {renderScaleRuler} from './physics.scale-ruler.v1.renderer.js'
import {renderWoodBlock} from './physics.wood-block.v1.renderer.js'
import {renderRampBall} from './physics.ramp-ball.v1.renderer.js'
import {renderPendulumBob} from './physics.pendulum-bob.v1.renderer.js'
// 用其他方法观察电场线案例(110 物理): 资产子代理生成的静电演示器材(registries/discovered/ 集成; 
// 视觉依据 frame-005/006/007/008/010/013/016/018/021/023/025/028/032/034/037/039/041/043/044)
// 感应起电机(charge→双盘对转+电弧)/摇柄/双圆盘电极板/圆筒电容器(alignment→细屑辐射链)/
// 泪滴导体显示板(圈外辐射+圈内恒杂乱, conductor_mounted 遮盖)/实心泪滴导体/
// 纸条穗(variant=ball|rod 双样式)/平行圆盘电极(side=left|right 镜像)
import {renderWimshurstGenerator} from './physics.wimshurst-generator.v1.renderer.js'
import {renderCrankHandle} from './physics.crank-handle.v1.renderer.js'
import {renderAcGenerator} from './physics.ac-generator.v1.renderer.js'
import {renderCrankDisc} from './physics.crank-disc.v1.renderer.js'
import {renderLedPanel} from './physics.led-panel.v1.renderer.js'
import {renderElectrodePanel} from './physics.electrode-panel.v1.renderer.js'
import {renderCylinderCapacitor} from './physics.cylinder-capacitor.v1.renderer.js'
import {renderTeardropPanel} from './physics.teardrop-panel.v1.renderer.js'
import {renderTeardropConductor} from './physics.teardrop-conductor.v1.renderer.js'
import {renderStripTassel} from './physics.strip-tassel.v1.renderer.js'
import {renderPlateElectrode} from './physics.plate-electrode.v1.renderer.js'
// 对蜡烛燃烧的探究案例(10 化学): 资产子代理生成的小刀/小木条/带蜡屑玻璃片/
// 水面浮蜡烧杯/白烟蜡烛变体(registries/discovered/ 集成; 视觉依据
// frame-004/005/021/022/006/009/020/036  -  切削刀, 外焰炭化带, 液面蜡屑卷, 
// 浮蜡, 三层焰标注与熄灭白烟)
import {renderKnife} from './chemistry.knife.v1.renderer.js'
import {renderWoodSplint} from './chemistry.wood-splint.v1.renderer.js'
import {renderGlassPlateWax} from './chemistry.glass-plate-wax.v1.renderer.js'
import {renderBeakerFloating} from './chemistry.beaker-floating.v1.renderer.js'
import {renderCandleSmoke} from './chemistry.candle-smoke.v1.renderer.js'
// 用形变演示器演示形变产生弹力案例(116 物理): 资产子代理生成的形变演示器主机
// (指针角=渲染器状态推导: pull_disp×gain + 挂码 load, REST_Y=0.45)/演示杆
// (原点=杆顶导孔悬挂点, 挂钩承托点 (0,+95))/黑色圆柱钩码变体(顶挂环环顶 −25, 
// IR visual.asset_ref 显式选择, physics/weight 仍为 kind 默认)
// (registries/discovered/ 集成; 视觉依据 frame-015/021/025/026)
import {renderDeformDemoBody} from './physics.deform-demo-body.v1.renderer.js'
import {renderDeformDemoRod} from './physics.deform-demo-rod.v1.renderer.js'
import {renderWeightCylinder} from './physics.weight-cylinder.v1.renderer.js'

const rendererRegistry = new Map([
  ['chemistry/bench', renderBench],
  ['chemistry/beaker', renderBeaker],
  ['chemistry/conical-flask', renderConicalFlask],
  ['chemistry/graduated-cylinder', renderCylinder],
  ['chemistry/burette', renderBurette],
  ['chemistry/pipette', renderPipette],
  ['chemistry/dropper', renderDropper],
  ['chemistry/reagent-bottle', renderReagentBottle],
  ['chemistry/test-tube', renderTestTube],
  ['chemistry/funnel', renderFunnel],
  ['chemistry/funnel-inverted', renderFunnelInverted],
  ['chemistry/separating-funnel', renderSeparatingFunnel],
  ['chemistry/delivery-tube', renderDeliveryTube],
  ['chemistry/gas-holder', renderGasHolder],
  ['chemistry/hydrogen-jet-tube', renderHydrogenJetTube],
  ['chemistry/beaker-inverted', renderBeakerInverted],
  ['chemistry/match', renderMatch],
  ['chemistry/electronic-scale', renderElectronicScale],
  ['chemistry/weighing-paper', renderWeighingPaper],
  ['chemistry/glass-rod', renderGlassRod],
  ['chemistry/candle', renderCandle],
  ['chemistry/glass-plate', renderGlassPlate],
  ['chemistry/evap-slide', renderEvapSlide],
  ['chemistry/test-tube-layered', renderTestTubeLayered],
  ['chemistry/stepped-stand', renderSteppedStand],
  ['chemistry/lighter', renderLighter],
  ['chemistry/iron-stand', renderIronStand],
  ['chemistry/evaporating-dish', renderEvaporatingDish],
  ['chemistry/alcohol-lamp', renderAlcoholLamp],
  ['biology/bench', renderBiologyBench],
  ['biology/petri-dish', renderPetriDish],
  ['biology/inoculation-loop', renderInoculationLoop],
  ['biology/alcohol-lamp', renderBiologyAlcoholLamp],
  ['biology/bunsen-burner', renderBunsenBurner],
  ['biology/test-tube', renderBiologyTestTube],
  ['biology/slant-culture', renderSlantCulture],
  ['biology/autoclave', renderAutoclave],
  ['biology/incubator', renderIncubator],
  ['biology/inoculation-box', renderInoculationBox],
  ['biology/microscope-slide', renderMicroscopeSlide],
  ['biology/flask', renderFlask],
  ['biology/pipette', renderBiologyPipette],
  ['biology/forceps', renderForceps],
  ['biology/culture-medium', renderCultureMedium],
  ['biology/c-tube', renderCTube],
  ['biology/tissue-dissociator', renderTissueDissociator],
  ['biology/tube-rotator', renderTubeRotator],
  ['biology/cell-strainer', renderCellStrainer],
  ['biology/centrifuge-tube', renderCentrifugeTube],
  ['biology/centrifuge', renderCentrifuge],
  ['biology/reagent-vial', renderReagentVial],
  ['biology/tissue-sample', renderTissueSample],
  ['biology/image', renderImageAsset],
  ['biology/aquatic-plant', renderAquaticPlant],
  ['biology/gas-collector-tube', renderGasCollectorTube],
  ['biology/glowing-splint', renderGlowingSplint],
  ['chemistry/image', renderImageAsset],
  ['physics/wall-bracket', renderWallBracket],
  ['physics/weight', renderWeight],
  ['physics/string', renderString],
  ['physics/rubber-band', renderRubberBand],
  ['physics/spring-scale', renderSpringScale],
  ['physics/pulley', renderPulley],
  ['physics/force-arrow', renderForceArrow],
  ['physics/board', renderPhysicsBoard],
  ['physics/angle-indicator', renderAngleIndicator],
  ['physics/protractor', renderProtractor],
  ['physics/slope', renderSlope],
  ['physics/ball', renderBall],
  ['physics/stop-board', renderStopBoard],
  ['physics/force-decomposer', renderForceDecomposer],
  ['physics/incline', renderIncline],
  ['physics/cart', renderCart],
  ['physics/metronome', renderMetronome],
  ['physics/flag', renderFlag],
  ['physics/brinell-tester', renderBrinellTester],
  ['physics/test-table', renderTestTable],
  ['physics/ball-indenter', renderBallIndenter],
  ['physics/metal-specimen', renderMetalSpecimen],
  ['physics/measuring-microscope', renderMeasuringMicroscope],
  ['physics/truss-strut', renderTrussStrut],
  ['physics/truss-stand', renderTrussStand],
  ['physics/optical-bench', renderOpticalBench],
  ['physics/light-source', renderLightSource],
  ['physics/convex-lens', renderConvexLens],
  ['physics/polarizer', renderPolarizer],
  ['physics/screen', renderScreen],
  ['circuits/trainer', renderTrainer],
  ['circuits/op-amp-dip8', renderOpAmpDip8],
  ['circuits/resistor', renderResistor],
  ['circuits/patch-lead', renderPatchLead],
  ['circuits/multimeter', renderMultimeter],
  ['circuits/test-probe', renderTestProbe],
  ['circuits/socket-zone', renderSocketZone],
  // AM 调幅与解调(BCT-01 案例): 资产子代理生成的渲染键(registries/discovered/ 集成)
  ['circuits/am-trainer', renderAmTrainer],
  ['circuits/oscilloscope', renderOscilloscope],
  ['circuits/rotary-switch', renderRotarySwitch],
  ['circuits/pot-slider', renderPotSlider],
  ['circuits/scope-probe', renderScopeProbe],
  ['circuits/test-point', renderTestPoint],
  ['circuits/signal-jack', renderSignalJack],
  // 右手定则案例(49)电磁器材: 资产子代理设计稿(registries/discovered/)的集成渲染键
  ['physics/horseshoe-magnet', renderHorseshoeMagnet],
  ['physics/suspended-coil', renderSuspendedCoil],
  ['physics/galvanometer', renderGalvanometer],
  ['physics/dry-cell', renderDryCell],
  ['physics/knife-switch', renderKnifeSwitch],
  // 双缝干涉案例(01): 红激光光源/双缝转盘/干涉条纹屏(变体键, IR visual.asset_ref 选择)
  ['physics/laser', renderLaserSource],
  ['physics/double-slit', renderDoubleSlit],
  ['physics/fringe-screen', renderFringeScreen],
  // 薄膜干涉案例(03): 裸暖橙火焰(无灯体, state.lit)/ 手持矩形薄膜片(state.reflecting 反射光带)
  ['physics/flame', renderFlame],
  ['physics/thin-film', renderThinFilm],
  // 薄膜干涉案例(04): 盒式读数显微镜(focused+fringe_* 目镜条纹观察窗)/ 圆柱钠光灯(state.lit)/
  // 白瓷环(film_mode: probe|strip 覆口膜)/ 半透明薄条 / 木盒静物
  ['physics/reading-microscope', renderReadingMicroscope],
  ['physics/sodium-lamp', renderSodiumLamp],
  ['physics/ring-vessel', renderRingVessel],
  ['physics/film-strip', renderFilmStrip],
  ['physics/wooden-box', renderWoodenBox],
  // 铁钉锈蚀案例(04 化学): 铁钉(state.color 锈色)/ 橡皮塞(state.placed 盖试管②口)/
  // 脱脂棉(state.loaded 叠画吸附的无水氯化钙颗粒)
  ['chemistry/iron-nail', renderIronNail],
  ['chemistry/copper-spiral', renderCopperSpiral],
  ['chemistry/rubber-stopper', renderRubberStopper],
  ['chemistry/cotton-wool', renderCottonWool],
  // 液体扩散案例(101): 台式数字温度计(kind=digital_thermometer 默认资产)
  ['chemistry/digital-thermometer', renderDigitalThermometer],
  // 空气流动与蒸腾案例(14 生物): 芹菜茎(inserted 原点上 46px 不画 / airflow 偏摆 /
  // turgor_pct 萎蔫塌落)/ 电吹风(running 气流线)/ 封口膜 / 双孔试管架 / 阳光区底景 /
  // 可封口试管(sealed 覆口膜 + in_sun 暖晕, IR 经 visual.asset_ref 显式选择)
  ['biology/plant-stem', renderPlantStem],
  ['biology/hair-dryer', renderHairDryer],
  ['biology/seal-film', renderSealFilm],
  ['biology/test-tube-rack', renderTestTubeRack],
  ['biology/sunlit-zone', renderSunlitZone],
  ['biology/test-tube-sealable', renderSealableTestTube],
  // 运动合成案例(07 物理): 新器材渲染键(ball-flight 为 kind=ball 的变体键, 
  // IR visual.asset_ref=physics.ball-flight.v1 显式选择; physics/ball 仍为默认)
  ['physics/air-track', renderAirTrack],
  ['physics/air-glider', renderAirGlider],
  ['physics/ball-flight', renderBallFlight],
  ['physics/contact-post', renderContactPost],
  // 牛顿第三定律案例(106 物理): 蓝色演示轨道(kind=demo_track 默认资产)/
  // 镜像磁力小车 ×2(IR visual.asset_ref=physics.magnetic-cart-left|right.v1 显式选择)
  ['physics/demo-track', renderDemoTrack],
  ['physics/magnetic-cart-left', renderMagneticCartLeft],
  ['physics/magnetic-cart-right', renderMagneticCartRight],
  ['physics/clip-lead', renderClipLead],
  ['physics/air-source', renderAirSource],
  ['physics/graph-board', renderGraphBoard],
  // 物体的动能案例(109 物理): 支架/弧形斜槽/刻度尺/木块为 kind 默认资产; 
  // ramp-ball / pendulum-bob 为 kind=ball 变体键(IR visual.asset_ref 显式选择, 
  // physics/ball 仍为默认), 变体先例同 physics/ball-flight
  ['physics/support-frame', renderSupportFrame],
  ['physics/curved-chute', renderCurvedChute],
  ['physics/scale-ruler', renderScaleRuler],
  ['physics/wood-block', renderWoodBlock],
  ['physics/ramp-ball', renderRampBall],
  ['physics/pendulum-bob', renderPendulumBob],
  // 用其他方法观察电场线案例(110 物理): 静电演示器材渲染键(kind 默认资产; 
  // strip-tassel / plate-electrode 各一个条目, 双样式由 entity.properties 驱动)
  ['physics/wimshurst-generator', renderWimshurstGenerator],
  ['physics/crank-handle', renderCrankHandle],
  ['physics/electrode-panel', renderElectrodePanel],
  ['physics/cylinder-capacitor', renderCylinderCapacitor],
  ['physics/teardrop-panel', renderTeardropPanel],
  ['physics/teardrop-conductor', renderTeardropConductor],
  ['physics/strip-tassel', renderStripTassel],
  ['physics/plate-electrode', renderPlateElectrode],
  // 用发光二极管观察交流电案例(112 物理): 手摇交流发电机(rotor_angle_deg→转子红蓝面
  // 换位+叶轮旋转)/盘式传动转轮(无状态小件)/红绿 LED 显示板(ac_phase_deg→红 =max(0,sin), 
  // 绿 =max(0,−sin) 轮流发光, 已预接线)
  ['physics/ac-generator', renderAcGenerator],
  ['physics/crank-disc', renderCrankDisc],
  ['physics/led-panel', renderLedPanel],
  // 对蜡烛燃烧的探究案例(10 化学): knife/wood-splint 为 kind 默认资产; 
  // glass-plate-wax / beaker-floating / candle-smoke 为 kind 变体键
  // (IR visual.asset_ref 显式选择, chemistry/glass-plate, chemistry/beaker, 
  // chemistry/candle 仍为默认)
  ['chemistry/knife', renderKnife],
  ['chemistry/wood-splint', renderWoodSplint],
  ['chemistry/glass-plate-wax', renderGlassPlateWax],
  ['chemistry/beaker-floating', renderBeakerFloating],
  ['chemistry/candle-smoke', renderCandleSmoke],
  // 形变演示器案例(116 物理): 主机(指针状态推导)/演示杆/圆柱钩码变体
  // (weight-cylinder 为 kind=weight 变体键, IR visual.asset_ref 显式选择)
  ['physics/deform-demo-body', renderDeformDemoBody],
  ['physics/deform-demo-rod', renderDeformDemoRod],
  ['physics/weight-cylinder', renderWeightCylinder],
])

export function renderApparatus(renderer, entity, state, context = {}) {
  const factory = rendererRegistry.get(renderer) || renderFallback
  const node = factory(entity, state, context)
  node.dataset.renderer = renderer
  return node
}

export function registeredRenderers() {
  return [...rendererRegistry.keys()]
}
