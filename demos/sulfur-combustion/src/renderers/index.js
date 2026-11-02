import {renderBeaker, renderBench, renderBurette, renderCandle, renderConicalFlask, renderCylinder, renderDeliveryTube, renderDropper, renderElectronicScale, renderEvaporatingDish, renderFallback, renderFunnel, renderGasHolder, renderGlassPlate, renderGlassRod, renderIronStand, renderAlcoholLamp, renderLighter, renderMatch, renderPipette, renderReagentBottle, renderSeparatingFunnel, renderSteppedStand, renderTestTube, renderWeighingPaper} from './chemistry.js'
import {renderBench as renderBiologyBench, renderPetriDish, renderInoculationLoop, renderAlcoholLamp as renderBiologyAlcoholLamp, renderBunsenBurner, renderTestTube as renderBiologyTestTube, renderSlantCulture, renderAutoclave, renderIncubator, renderInoculationBox, renderMicroscopeSlide, renderFlask, renderPipette as renderBiologyPipette, renderForceps, renderCultureMedium, renderCTube, renderTissueDissociator, renderTubeRotator, renderCellStrainer, renderCentrifugeTube, renderCentrifuge, renderReagentVial, renderTissueSample, renderImageAsset} from './biology.js'
import {renderWallBracket, renderWeight, renderString, renderRubberBand, renderSpringScale, renderPulley, renderForceArrow, renderPhysicsBoard, renderAngleIndicator, renderProtractor, renderSlope, renderBall, renderStopBoard, renderForceDecomposer, renderIncline, renderCart, renderMetronome, renderFlag, renderBrinellTester, renderTestTable, renderBallIndenter, renderMetalSpecimen, renderMeasuringMicroscope, renderTrussStrut, renderTrussStand, renderOpticalBench, renderLightSource, renderConvexLens, renderPolarizer, renderScreen, renderHorseshoeMagnet, renderSuspendedCoil, renderGalvanometer, renderDryCell, renderKnifeSwitch} from './physics.js'
import {renderTrainer, renderOpAmpDip8, renderResistor, renderPatchLead, renderMultimeter, renderTestProbe, renderSocketZone, renderAmTrainer, renderOscilloscope, renderRotarySwitch, renderPotSlider, renderScopeProbe, renderTestPoint, renderSignalJack} from './circuits.js'
// 微小压强计案例(117 物理): 资产子代理生成的 U形管压强计/橡皮膜探头/派生乳胶管/铬钢球钮砝码(registries/discovered/ 集成)
import {renderUTubeManometer} from './physics.u-tube-manometer.v1.renderer.js'
import {renderMembraneProbe} from './physics.membrane-probe.v1.renderer.js'
import {renderRubberTube} from './physics.rubber-tube.v1.renderer.js'
import {renderWeightKnob} from './physics.weight-knob.v1.renderer.js'
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
// 固体的溶解案例(15 化学): 资产子代理生成的研钵/药匙/塑料洗瓶/桥式试管架/
// 透明胆矾瓶变体/带未溶固体试管变体(registries/discovered/ 集成; 
// 视觉依据 frame-002/006/007/008/011/013/016/018/026/030; test-tube-solid 读
// solid_g+solid_form 画管底晶体块/粉堆, 振荡抖动沿用 .reacting)
import {renderMortar} from './chemistry.mortar.v1.renderer.js'
import {renderSpoon} from './chemistry.spoon.v1.renderer.js'
import {renderWashBottle} from './chemistry.wash-bottle.v1.renderer.js'
import {renderTestTubeRackBridge} from './chemistry.test-tube-rack-bridge.v1.renderer.js'
// 催化剂案例(16 化学): 过氧化氢催化反应试管变体(rate/suspension/foam 状态绑定)
import {renderH2O2CatalystTube} from './chemistry.h2o2-catalyst-tube.v1.renderer.js'
// 催化剂案例(16 化学): 红胶头滴管瓶(滴瓶), frame-010 形制 - 通用试剂瓶无法诚实代表
import {renderDropperBottle} from './chemistry.dropper-bottle.v1.renderer.js'
import {renderReagentBottleCuso4} from './chemistry.reagent-bottle-cuso4-solid.v1.renderer.js'
import {renderTestTubeSolid} from './chemistry.test-tube-solid.v1.renderer.js'
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
// 区分二氧化碳和氧气案例(11 化学): 资产子代理生成的正立宽口集气瓶(直筒瓶身+短颈+平磨口沿, 
// 静态器身无状态分支)/燃着的小木条(竖持尖端朝下; relit→尖端三层焰, flame_boost→助燃长焰, 
// charred→炭化尖端; relit/charred 全规则守卫防矛盾态)(registries/discovered/ 集成; 
// 视觉依据 frame-004/005/007/022/023/024/025/030)
import {renderGasJar} from './chemistry.gas-jar.v1.renderer.js'
// 硫在空气和氧气中燃烧案例(16 化学): 资产子代理生成的长柄燃烧匙(勺窝硫粉三态+
// 两档火焰: 空气微弱淡蓝/氧气明亮蓝紫)与带水层集气瓶派生变体(registries/discovered/ 集成)
import {renderCombustionSpoon} from './chemistry.combustion-spoon.v1.renderer.js'
import {renderGasJarWater} from './chemistry.gas-jar-water.v1.renderer.js'
import {renderBurningSplint} from './chemistry.burning-splint.v1.renderer.js'
// 二氧化氮和四氧化二氮案例(13 化学): 资产子代理生成的 H 形密封双球连通管
// (横管+中央加料尖嘴+两端下弯侧管各接球泡; state.left/right_color 球内气体色, 
// left/right_no2_frac 驱动径向渐变浓度, immersed 水膜; 视觉依据 frame-002/006/007/011/013)
// /冰水浴烧杯变体(renderBeaker 杯体+5 块确定性方冰, 液位>0 才画冰; frame-003/005/010/013)
// (registries/discovered/ 集成)
import {renderNo2Tube} from './chemistry.no2-tube.v1.renderer.js'
import {renderBeakerIce} from './chemistry.beaker-ice.v1.renderer.js'
// 用悬挂法确定薄板的重心案例(118 物理): 资产子代理生成的悬挂支架(原点=横臂端销钉尖, 
// anchors.pin 即此点)/重垂线(线顶原点, 恒竖直, string_len_px 读 properties)/三角形薄板
// (hole 0=桌上形心原点, k=1..3 挂孔原点+a_k−θ 阻尼摆动, 迹线 clipPath=entity.id 前缀, 
// cg_found 红点+直立"Center of mass")/不规则薄板(2 孔同套契约)/记号笔(无状态躺放)
// (registries/discovered/ 集成; 视觉依据 frame-001/002/004/011/013/014)
import {renderHangStand} from './physics.hang-stand.v1.renderer.js'
import {renderPlumbLine} from './physics.plumb-line.v1.renderer.js'
import {renderPlateTriangle} from './physics.plate-triangle.v1.renderer.js'
import {renderPlateIrregular} from './physics.plate-irregular.v1.renderer.js'
import {renderMarkerPen} from './physics.marker-pen.v1.renderer.js'
// 用打点计时器测匀加速直线运动的加速度案例(119 物理): 资产子代理生成的斜面刻度木板/
// 电磁打点计时器(powered→开关+指示点, stamping→振动片残影)/深色滑块小车
// (above==='board-1' 时按 s=120+450 - run_progress² 沿板面映射)/派生视觉纸带
// (穿孔/固车/点迹三态 + 放大分析带, 车尾系点用与 cart 同一映射公式)/深红棕木块垫块变体
// (registries/discovered/ 集成; 视觉依据 frame-002/003/004/005/006/007/008/013/014)
import {renderTickerBoard} from './physics.ticker-board.v1.renderer.js'
import {renderTickerTimer} from './physics.ticker-timer.v1.renderer.js'
import {renderTickerCart} from './physics.ticker-cart.v1.renderer.js'
import {renderPaperTape} from './physics.paper-tape.v1.renderer.js'
import {renderWoodBlockDark} from './physics.wood-block-dark.v1.renderer.js'
// 用打点计时器演示匀速直线运动案例(120 物理): 平置木板复用 119 板件(angle_deg=0), 
// 顶视圆盘打点计时器/匀速小车(线性律 s=release_offset+run_span - run_progress, 非 119 的 p²)/
// 匀速点迹纸带(等间距毫米表 + AB/BC/CD 测量与 v 计算)/驱动绳三段派生(车尾→轮顶→吊桶提环)/
// 端部小轮/吊桶/低压电源(powered→黄绿指示灯)(registries/discovered/ 集成; 视觉依据
// frame-001/002/004/005/006/007/009/011/012/014/015-027)
import {renderPowerSupply} from './physics.power-supply.v1.renderer.js'
// 阴极射线管演示案例(137 物理): 资产子代理生成的阴极射线管(beam_on/deflect_mode 驱动
// 阴极辉光+径迹+极板极性标识), 演示器主机(楔形机身+面板控件+背后遮光屏, power_on 驱动
// 白拨杆), 极性拨杆(polarity_up 三态: null 居中/true 上拨/false 下拨)
// (registries/discovered/ 集成; 视觉依据 frame-003/004/005/007/010/011/013/015)
import {renderCathodeRayTube} from './physics.cathode-ray-tube.v1.renderer.js'
import {renderCrtDemoConsole} from './physics.crt-demo-console.v1.renderer.js'
import {renderPanelLever} from './physics.panel-lever.v1.renderer.js'
// 洛伦兹力演示仪案例(138 物理): 资产子代理生成的球形电子束管(beam_on/beam_straight/gun_lit
// 驱动辉光束流圆轨迹/直线束/阴极辉光, r_norm 定半径泡壁裁剪), 亥姆霍兹线圈(properties.mount
// 前/后环明度), 演示仪主机(powered→红灯, meter_u_norm/meter_i_norm→V/A 表针), 面板旋钮
// (angle_deg 旋转直接操纵本体)(registries/discovered/ 集成; 视觉依据 frame-001/002/004/005/
// 006/007/008/014)
import {renderElectronBeamTube} from './physics.electron-beam-tube.v1.renderer.js'
import {renderHelmholtzCoil} from './physics.helmholtz-coil.v1.renderer.js'
import {renderLorentzDemonstrator} from './physics.lorentz-demonstrator.v1.renderer.js'
import {renderPanelKnob} from './physics.panel-knob.v1.renderer.js'
import {renderTickerTimerDisc} from './physics.ticker-timer-disc.v1.renderer.js'
import {renderTickerCartUniform} from './physics.ticker-cart-uniform.v1.renderer.js'
import {renderPaperTapeUniform} from './physics.paper-tape-uniform.v1.renderer.js'
import {renderTickerDriveString} from './physics.ticker-drive-string.v1.renderer.js'
import {renderHangingCup} from './physics.hanging-cup.v1.renderer.js'
import {renderTickerEndPulley} from './physics.ticker-end-pulley.v1.renderer.js'
// 用数字计时仪测气垫导轨上滑块的即时速度案例(121 物理): 资产子代理生成的光电门
// (LED 派生自 world: glider sliding 且线性映射位落入 ±14px 门窗)/数字计时器
// (剪式升降台+遮光罩+七段数码 display_text 逐字上屏, powered 熄/亮)/U 形挡光片滑块
// (匀速线性律 x=240−478 - run_progress, 与光电门挡光判定映射逐字一致副本)
// (registries/discovered/ 集成; 视觉依据 frame-005/006/007/008/016/019/020/022/023/028-031)
import {renderPhotogate} from './physics.photogate.v1.renderer.js'
import {renderDigitalTimer} from './physics.digital-timer.v1.renderer.js'
import {renderAirGliderVane} from './physics.air-glider-vane.v1.renderer.js'
import {renderInductionCoil} from './physics.induction-coil.v1.renderer.js'
import {renderDeflectionTube} from './physics.deflection-tube.v1.renderer.js'
import {renderFlaskRayTube} from './physics.flask-ray-tube.v1.renderer.js'
import {renderBarMagnet} from './physics.bar-magnet.v1.renderer.js'
import {renderHvLeadPair} from './physics.hv-lead-pair.v1.renderer.js'

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
  // 固体的溶解案例(15 化学): 新 kind(mortar/wash_bottle 走 --registry 扩展)
  // 与 reagent_bottle/test_tube/test_tube_rack 的变体键(IR visual.asset_ref 显式选择)
  ['chemistry/mortar', renderMortar],
  ['chemistry/spoon', renderSpoon],
  ['chemistry/wash-bottle', renderWashBottle],
  ['chemistry/test-tube-rack-bridge', renderTestTubeRackBridge],
  ['chemistry/reagent-bottle-cuso4', renderReagentBottleCuso4],
  ['chemistry/test-tube-solid', renderTestTubeSolid],
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
  // 微小压强计案例(117): U形管压强计(level_diff 驱动液柱)/橡皮膜探头/派生乳胶管/铬钢球钮砝码
  ['physics/u-tube-manometer', renderUTubeManometer],
  ['physics/membrane-probe', renderMembraneProbe],
  ['physics/rubber-tube', renderRubberTube],
  ['physics/weight-knob', renderWeightKnob],
  // 打点计时器案例(119): 斜面刻度木板/电磁打点计时器/滑块小车/派生纸带/深色木块变体
  ['physics/ticker-board', renderTickerBoard],
  ['physics/ticker-timer', renderTickerTimer],
  ['physics/ticker-cart', renderTickerCart],
  ['physics/paper-tape', renderPaperTape],
  ['physics/wood-block-dark', renderWoodBlockDark],
  // 打点计时器匀速案例(120): 圆盘计时器/匀速小车(线性律)/匀速纸带/驱动绳/端部小轮/吊桶/低压电源
  ['physics/power-supply', renderPowerSupply],
  // 阴极射线管演示案例(137): 射线管/演示器主机/极性拨杆
  ['physics/cathode-ray-tube', renderCathodeRayTube],
  ['physics/crt-demo-console', renderCrtDemoConsole],
  ['physics/panel-lever', renderPanelLever],
  // 洛伦兹力演示仪案例(138 物理)四件套(default_for_kind, 详见文件头注释)
  ['physics/electron-beam-tube', renderElectronBeamTube],
  ['physics/helmholtz-coil', renderHelmholtzCoil],
  ['physics/lorentz-demonstrator', renderLorentzDemonstrator],
  ['physics/panel-knob', renderPanelKnob],
  ['physics/ticker-timer-disc', renderTickerTimerDisc],
  ['physics/ticker-cart-uniform', renderTickerCartUniform],
  ['physics/paper-tape-uniform', renderPaperTapeUniform],
  ['physics/ticker-drive-string', renderTickerDriveString],
  ['physics/hanging-cup', renderHangingCup],
  ['physics/ticker-end-pulley', renderTickerEndPulley],
  // 区分二氧化碳和氧气案例(11 化学): 正立宽口集气瓶(kind=gas_jar 默认资产)/
  // 燃着的小木条(kind=burning_splint 默认资产; relit/flame_boost/charred 三态)
  ['chemistry/gas-jar', renderGasJar],
  // 硫燃烧案例(16 化学): 燃烧匙(kind=combustion_spoon 默认资产; sulfur_state 三态 /
  // flame_mode 两档火焰)/ 带水层集气瓶变体(IR visual.asset_ref 显式选择, gas-jar 仍为默认)
  ['chemistry/combustion-spoon', renderCombustionSpoon],
  ['chemistry/gas-jar-water', renderGasJarWater],
  ['chemistry/burning-splint', renderBurningSplint],
  // 二氧化氮和四氧化二氮案例(13 化学): H 形密封双球连通管(kind=no2_tube 默认资产)/
  // 冰水浴烧杯变体(IR visual.asset_ref 显式选择, chemistry/beaker 仍为默认)
  ['chemistry/no2-tube', renderNo2Tube],
  ['chemistry/beaker-ice', renderBeakerIce],
  // 用悬挂法确定薄板的重心案例(118 物理): hang-stand 为 kind=iron_stand 变体键
  // (IR visual.asset_ref 显式选择, chemistry/iron-stand 仍为默认); 
  // plumb-line / plate-triangle / marker-pen 为各自 kind 默认资产, plate-irregular 为变体键
  ['physics/hang-stand', renderHangStand],
  ['physics/plumb-line', renderPlumbLine],
  ['physics/plate-triangle', renderPlateTriangle],
  ['physics/plate-irregular', renderPlateIrregular],
  ['physics/marker-pen', renderMarkerPen],
  // 数字计时仪测即时速度案例(121 物理): 光电门(kind=photogate 默认资产)/
  // 数字计时器(kind=digital_timer 默认资产)/U 形挡光片滑块
  // (kind=air_glider 变体键, IR visual.asset_ref=physics.air-glider-vane.v1 显式选择, 
  // physics/air-glider 仍为 case-07 默认)
  ['physics/photogate', renderPhotogate],
  ['physics/digital-timer', renderDigitalTimer],
  ['physics/air-glider-vane', renderAirGliderVane],
  // 催化剂对化学反应速率的影响案例(16 化学): 过氧化氢催化反应试管变体
  // (rate/suspension/foam 状态绑定; IR visual.asset_ref=chemistry.h2o2-catalyst-tube.v1
  // 显式选择, chemistry/test-tube 仍为默认; 资产子代理生成的 code-native 模块, 
  // registries/discovered/ 集成)
  ['chemistry/h2o2-catalyst-tube', renderH2O2CatalystTube],
  // 催化剂对化学反应速率的影响案例(16 化学): 红胶头滴瓶(frame-010: 玻璃瓶身+红色
  // 橡胶胶头帽+黄棕液体; IR visual.asset_ref=chemistry.dropper-bottle.v1 显式选择, 
  // chemistry/indicator-bottle(通用试剂瓶画法)仍为 kind=indicator 默认; 
  // 资产子代理生成的 code-native 模块, registries/discovered/ 集成)
  ['chemistry/dropper-bottle', renderDropperBottle],
  // 139 案例(电子束在磁场中偏转): 感应圈/磁偏转长管/圆烧瓶射线管/条形磁铁/高压导线对
  // (资产子代理生成的 code-native 模块, registries/discovered/ 集成)
  ['physics/induction-coil', renderInductionCoil],
  ['physics/deflection-tube', renderDeflectionTube],
  ['physics/flask-ray-tube', renderFlaskRayTube],
  ['physics/bar-magnet', renderBarMagnet],
  ['physics/hv-lead-pair', renderHvLeadPair],
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
