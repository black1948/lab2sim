import {applyEffect, assess, cloneInitial, dispatch, finalizeReaction} from './engine.js'
import {renderApparatus} from './renderers/index.js'
import {svg} from './renderers/svg.js'
import {
  applyEasing, applyLerp, clearFx, createTimeline, drawStream, geometryFor, interpolateReaction,
  motionEnabled, numericDiffs, planMotion, pourAnchor, pourPose, reactionStarts, setMotionOverride, settlePose,
  stirPose, streamProgress,
} from './motion.js'

const ids = [
  'title', 'goal', 'status', 'progress-label', 'progress-bar', 'entity-count', 'inventory',
  'model-badge', 'stage', 'snap-zones', 'entities', 'fx', 'message', 'failure', 'selected-title',
  'selected-kind', 'selection-empty', 'selection-detail', 'readouts', 'properties', 'controls',
  'step-index', 'step-title', 'step-apparatus', 'return-toast', 'steps', 'reset', 'motion-toggle', 'stockroom', 'stockroom-toggle', 'procedure',
  'procedure-toggle', 'credits-dialog', 'credits-open', 'credits-close', 'credits-list',
]
const dom = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]))

let ir
let scene
let assetManifest
let state
let selected = null
let dragging = null
// 旋转直接操纵: adjust 能力器材(如偏振片)按住拖动 = 绕器材中心旋转, 
// 松手时以最终角度派发其 adjust_angle 动作(规则据此重算科学状态)
let rotating = null
// 真实输入下, 可拖拽器材的 pointerdown 会启用指针捕获, 且放置后整树重建节点 - 
// Chrome 由此不再生成原生 click/dblclick 兼容事件(合成 dispatchEvent 会绕过该管线, 测试须用可信输入覆盖).
// 双击语义因此在指针层自行检测: 同一器材两次轻按(首按无明显拖动位移)且间隔 <450ms 视为双击.
let lastTap = {id: null, time: 0, moved: false}
let manualDblAt = 0
let completedActions = new Set()
let reaction = null
let reactionTimer = null
let prevEntityJson = null
// 动画层: motionRun 作为代数令牌, 重置时自增即可让进行中的手势作废
let motionRun = 0
let motionActive = false
let activeTimeline = null
// 分步领取: entities[].provisioning:"storage" 的器材开场收在器材柜(storedEntities), 
// 由当前步骤的"Apparatus for this step"chips 或器材柜卡片点击领取上台; 步骤推进后自动收起
// 后续不再需要的器材.默认(无 provisioning 声明)保持开场全上台的既有行为.
let storedEntities = new Set()
// 台面原位快照(领取落点 / 收起复位用), bootstrap 与 reset 时从初始状态重建
let initialPositions = new Map()
// 上次收起结算所处的步骤游标(当前未完成步骤下标; 全完成为 procedure.length), 
// 只在步骤边界触发收起 - 用户手动领取的器材至少保留到下一个步骤边界
let settledStepIndex = -1
let storageToastTimer = null
// 延迟反应结果(炭化带/内壁水珠等)落地后的展示宽限期: 期内不做边界收纳, 否则教具
// 与可见证据同帧消失(10 蜡烛案例复验 MAJOR - 木条刚炭化即被收进器材柜).窗口过后
// 补一次 render(), 边界收纳照常发生, 只是让位给画面证据.
const REACTION_SETTLE_GRACE_MS = 4000
const reactionSettledAt = new Map()
let settleGraceTimer = null

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))
const entityMap = () => new Map(ir.entities.map(entity => [entity.id, entity]))
const screenPoint = itemState => ({x: Number(itemState.x ?? 0.5) * 1000, y: 560 - Number(itemState.y ?? 0.2) * 500})

function assetFor(entityId) {
  const ref = scene?.entities?.[entityId]?.asset_ref
  return assetManifest?.assets?.find(asset => asset.id === ref) || null
}

function stateText(key, value) {
  if (key === 'volume_ml' || key === 'delivered_ml') { const v = Number(value || 0); return `${v < 10 ? v.toFixed(2) : v.toFixed(1)} mL` }
  if (key === 'drops') return `${Number(value || 0)}  drops`
  if (['reading_g', 'salt_mass_g', 'refined_g', 'crystals_g', 'residue_g'].includes(key)) return `${Number(value || 0).toFixed(1)} g`
  if (key === 'dissolved') return value ? 'Dissolved' : 'Not dissolved'
  if (key === 'stirred') return value ? 'Stirred' : 'Not stirred'
  if (key === 'mixture') return value ? 'Contains turbid liquid' : 'empty'
  if (key === 'valve_open') return value ? 'Open' : 'Close'
  // 49 案例(右手定则)布尔状态键
  if (key === 'closed') return value ? 'Closed' : 'Disconnected'
  if (key === 'flipped') return value ? 'Flipped (S up, N down)' : 'Normal (N up, S down)'
  if (key === 'above') return value ? `located on ${entityMap().get(value)?.label || value} above` : 'Not attached'
  if (key === 'attached_to') return value ? `connected to ${entityMap().get(value)?.label || value}` : 'Not connected'
  if (key === 'gas_level' || key === 'co2_level') return `${Math.round(Number(value || 0) * 100)} % accumulation`
  if (key === 'sterilized') return value ? 'Sterilized' : 'Not sterilized'
  if (key === 'colony_count') return `${Number(value || 0)}  colonies`
  if (key === 'contaminated') return value ? 'Contaminated' : 'Not contaminated'
  if (key === 'growth_stage') return ({none: 'No growth', lag: 'Lag phase', log: 'Log phase', stationary: 'Stationary phase', death: 'Death phase'})[value] || value
  if (key === 'incubation_temp') return `${Number(value || 0)} °C`
  if (key === 'incubation_time_h') return `${Number(value || 0)} h`
  if (key === 'sealed') return value ? 'Sealed' : 'Not sealed'
  if (key === 'observed') return value ? 'Observed' : 'Not observed'
  if (key === 'force_n' || key === 'tension_n' || key === 'compression_n' || key === 'arrow_length' || key === 'force_x' || key === 'force_y') return `${Number(value || 0).toFixed(1)} N`
  if (key === 'mass_kg') return `${Number(value || 0)} kg`
  if (key === 'arrow_angle') return `${Number(value || 0).toFixed(0)}°`
  if (key === 'extension') return `${Math.round(Number(value || 0) * 100)} %`
  if (key === 'balanced') return value ? 'Forces balanced' : 'Not balanced'
  if (key === 'displacement') return `${Number(value || 0).toFixed(2)}`
  if (key === 'velocity') return `${Number(value || 0).toFixed(2)}`
  if (key === 'interval_s') return `${Number(value || 0).toFixed(2)} s`
  if (key === 'slope_len_m' || key === 'at_s') return `${Number(value || 0).toFixed(2)} m`
  if (key === 'a_ms2') return `${Number(value || 0).toFixed(2)} m/s²`
  if (key === 'run_progress') return `${Math.round(Number(value || 0) * 100)} %`
  if (key === 'ticking') return value ? 'Beat in progress' : 'Static'
  if (key === 'released') return value ? 'Released' : 'Not released'
  if (key === 'done') return value ? 'Reached' : 'Not reached'
  if (key === 'verified') return value ? 'Passed (1:4)' : 'Not verified'
  if (key === 'confirmed') return value ? 'Confirmed' : 'Not confirmed'
  // 324 案例(小鼠神经组织单细胞悬浮液)状态键
  if (key === 'mass_g') return `${Number(value || 0).toFixed(2)} g`
  if (key === 'pore_um') return `${Number(value || 0)} µm`
  if (key === 'temp_c') return `${Number(value || 0)} °C`
  if (key === 'speed_g') return `${Math.round(Number(value || 0))} × g`
  if (key === 'wash_ml') return `${Number(value || 0).toFixed(1)} mL`
  if (key === 'viability_pct') return `${Math.round(Number(value || 0))} %`
  if (key === 'rpm') return `${Number(value || 0)} RPM`
  if (key === 'capacity_ml') return `${Number(value || 0)} mL`
  if (key === 'dissociation_programs') return `${Number(value || 0)} / 3`
  if (key === 'incubations') return `${Number(value || 0)}  times`
  if (key === 'weighed') return value ? 'Weighed' : 'Not weighed'
  if (key === 'mix1_ready') return value ? 'Prepared' : 'Not prepared'
  if (key === 'washed') return value ? 'Rinsed' : 'Not rinsed'
  if (key === 'mix_incubated') return value ? 'Pre-warmed for incubation' : 'Not pre-warmed'
  if (key === 'tissue_added') return value ? 'Tissue added' : 'Tissue not added'
  if (key === 'mix2_added') return value ? 'Added enzyme mixture 2' : 'Enzyme mixture not added 2'
  if (key === 'sol2_added') return value ? 'Solution added 2' : 'Solution not added 2'
  if (key === 'sol4_added') return value ? 'Solution added 4' : 'Solution not added 4'
  if (key === 'pelleted') return value ? 'Precipitate collected' : 'No precipitate'
  if (key === 'filtered') return value ? 'Filtered' : 'Not filtered'
  if (key === 'mounted') return value ? 'Mounted' : 'Not mounted'
  if (key === 'resuspended') return value ? 'Resuspended' : 'Not resuspended'
  if (key === 'hbss_added') return value ? 'Added HBSS' : 'Not added HBSS'
  if (key === 'rotating') return value ? 'Rotating' : 'Static'
  if (key === 'running') return value ? 'Running' : 'Standby'
  if (key === 'contents') return String(value)
  // 29 案例(μA741 反相比例运算放大电路)状态键
  if (key === 'source_v') return `${Number(value || 0).toFixed(2)} V`
  if (key === 'output_v') return `${Number(value || 0).toFixed(2)} V`
  if (key === 'gain_actual') return `${Number(value || 0).toFixed(2)} x`
  if (key === 'powered') return value ? '±15V Powered' : 'Not powered'
  // calibrated 走末尾通用布尔兜底(是/否): 0.30V 为 29 案例的校准值, 不能泄漏给其他领域的同名词
  if (key === 'inspected') return value ? 'Pins confirmed' : 'Not confirmed'
  if (key === 'r1_installed') return value ? 'Connected (input - pin 2)' : 'Not plugged in'
  if (key === 'rf_installed') return value ? 'Connected (pin 2 - pin 6)' : 'Not plugged in'
  if (key === 'r2_installed') return value ? 'Connected (pin 3 - ground)' : 'Not plugged in'
  if (key === 'input_connected') return value ? 'Signal connected' : 'Signal not connected'
  if (key === 'saturated') return value ? 'Output saturated' : 'Linear region'
  if (key === 'reviewed') return value ? 'Confirmed' : 'Not confirmed'
  if (key === 'measured_out') return value ? 'Measurement confirmed' : 'Not confirmed'
  if (key === 'resistance_ohms') { const ohms = Number(value || 0); return ohms >= 1000 ? `${ohms / 1000} kΩ` : `${ohms} Ω` }
  if (key === 'tolerance_pct') return `±${value}%`
  // 01-AM 案例(BCT-01 调幅与解调训练箱)状态键
  if (key === 'message_freq_hz') return `${Number(value || 0).toFixed(1)} Hz`
  if (['message_amp_vpp', 'es_v', 'ec_v', 'v_max', 'v_min', 'am_vpp', 'demod_vpp'].includes(key)) return `${Number(value || 0).toFixed(2)} V`
  if (key === 'mod_index') return Number(value || 0).toFixed(3)
  if (key === 'distorted') return value ? 'Yes (Es>Ec)' : 'No'
  if (key === 'demod_patched') return value ? 'Connected' : 'Not linked'
  if (key === 'm_recorded') return value ? 'Recorded' : 'Not recorded'
  // 角度统一显示折算: 拖拽旋转写回 0..360, >180° 时并列给出等价负角(如 300°(−60°)), 
  // 仅改显示不改状态 - 物理量程确需 180..360 的场景仍能看到原值
  if (key === 'angle_deg') {
    const deg = Math.round(Number(value) || 0)
    return deg > 180 ? `${deg}°(−${360 - deg}°)` : `${deg}°`
  }
  // 01 案例(布氏硬度测试)状态键
  if (key === 'd1_mm' || key === 'd2_mm' || key === 'mean_d_mm') return `${Number(value || 0).toFixed(3)} mm`
  if (key === 'hb_result') return Number(value || 0) > 0 ? `${Math.round(Number(value))} HBW` : '—'
  if (key === 'force_display') return `${Number(value || 0).toFixed(1)} N`
  if (key === 'param_text') return String(value)
  if (key === 'program_ready') return value ? 'Set' : 'Not set'
  if (key === 'indenter_installed') return value ? 'Mounted into spindle' : 'Not mounted'
  if (key === 'specimen_seated') return value ? 'In place' : 'Not in place'
  if (key === 'contact') return value ? 'In contact with indenter' : 'Not in contact'
  if (key === 'indented') return value ? 'Indentation formed' : 'No indentation'
  if (key === 'cycle_done') return value ? 'Done' : 'Not completed'
  if (key === 'positioned') return value ? 'Aligned to specimen' : 'Not aligned'
  if (key === 'panel_read') return value ? 'Result read out' : 'Not read'
  // 01 案例(光的双缝干涉)光学状态键
  if (key === 'laser_powered') return value ? 'Lit' : 'Extinguished'
  if (key === 'fringe_mode') return ({wide: 'Dense fringes (wide-slit pair)', narrow: 'Sparse fringes (narrow-slit pair)', none: 'No pattern (light blocked)'})[value] || String(value)
  if (key === 'aligned_pair') return ({wide: 'Wide-slit pair', narrow: 'Narrow-slit pair', none: 'Not aligned'})[value] || String(value)
  if (key === 'engaged_wide' || key === 'engaged_narrow') return value ? 'Observed' : 'Not observed'
  // 通用布尔兜底: 案例经 state_labels 声明的布尔键(如 lit/covered/acid_added)在无专门
  // 分支时不再泄漏裸 true/false; 有语义化文案的键已在上方分支 return
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

// 状态键标签: 案例可在 IR 实体上声明 state_labels(经 resolve_assets 进 scene), 
// 优先于模板内置文案 - 新案例的状态键不再需要往模板里加 case 分支
function stateLabel(key, entityId = selected) {
  const declared = scene?.entities?.[entityId]?.state_labels?.[key]
  if (typeof declared === 'string' && declared.trim()) return declared
  return ({
    volume_ml: 'Current volume', delivered_ml: 'Added', drops: 'Drop count', valve_open: 'Stopcock',
    above: 'Position', attached_to: 'Connected', precipitate: 'Precipitate', bubbles: 'Bubbles',
    gas_level: 'Gas accumulation', co2_level: 'CO₂ accumulation',
    reading_g: 'Balance reading', salt_mass_g: 'Crude salt mass', refined_g: 'Refined salt mass',
    crystals_g: 'Crystal mass', residue_g: 'Residue mass', dissolved: 'Dissolution state',
    stirred: 'Stirring state', mixture: 'Funnel state',
    sterilized: 'Sterilization state', colony_count: 'Colony count', contaminated: 'Contamination state',
    growth_stage: 'Growth phase', incubation_temp: 'Incubation temperature', incubation_time_h: 'Incubation time',
    sealed: 'Sealing state', observed: 'Observation state',
    mass_kg: 'Mass', force_n: 'Force / reading', tension_n: 'Tension', extension: 'Elongation', compression_n: 'Rod-end pressure',
    angle_deg: 'Angle', arrow_angle: 'Arrow angle', arrow_length: 'Arrow length',
    force_x: 'Horizontal component', force_y: 'Vertical component', balanced: 'Resultant-force state',
    displacement: 'Displacement', velocity: 'Speed',
    interval_s: 'Beat interval', slope_len_m: 'Incline length', at_s: 'Distance from start', a_ms2: 'Acceleration',
    run_progress: 'Descent progress', ticking: 'Metronome', released: 'Cart released', done: 'Reached the end',
    verified: '1:4 verified', confirmed: 'Position confirmed',
    // 324 案例(小鼠神经组织单细胞悬浮液)状态键
    contents: 'Contents', dissociation_programs: 'Dissociation program', incubations: 'Rotating incubation',
    viability_pct: 'Cell viability', wash_ml: 'Rinse volume', mass_g: 'Mass', pore_um: 'Filter pore diameter',
    temp_c: 'Temperature', speed_g: 'Centrifugal force', rpm: 'Rotation speed', capacity_ml: 'Volume',
    weighed: 'Weighing state', mix1_ready: 'Enzyme mixture 1', washed: 'Rinsing state', mix_incubated: 'Enzyme mixture pre-warming', tissue_added: 'Brain tissue',
    mix2_added: 'Enzyme mixture 2', pelleted: 'Cell precipitate', filtered: 'Filtration state',
    sol2_added: 'Add solution 2', sol4_added: 'Add solution 4',
    hbss_added: 'HBSS added', color: 'Flow color',
    mounted: 'Mounting state', resuspended: 'Resuspension state', rotating: 'Rotation state', running: 'Running state',
    // 29 案例(μA741 反相比例运算放大电路)状态键
    source_v: 'Signal-source output', output_v: 'Output voltage Uo', gain_actual: 'Actual gain',
    powered: 'Chip power', calibrated: 'Input calibration', inspected: 'Pin confirmation',
    reviewed: 'Panel check', measured_out: 'Output measurement',
    r1_installed: 'R1 Input branch', rf_installed: 'Rf Feedback branch', r2_installed: 'R2 Balance branch',
    input_connected: 'Signal input', saturated: 'Output state',
    resistance_ohms: 'Nominal resistance', tolerance_pct: 'Allowed deviation',
    // 01 案例(布氏硬度测试)状态键
    d1_mm: 'Indentation diameter d₁', d2_mm: 'Indentation diameter d₂', mean_d_mm: 'Mean diameter d̄',
    hb_result: 'Brinell hardness', force_display: 'Test force', param_text: 'Test program',
    program_ready: 'Program setting', indenter_installed: 'Ball indenter', specimen_seated: 'Specimen placed',
    contact: 'Indenter contact', indented: 'Indentation', cycle_done: 'Loading loop',
    positioned: 'Microscope aligned', panel_read: 'Result readout',
  })[key] || key.replaceAll('_', ' ')
}

function stepComplete(step, index) {
  if (!completedActions.has(step.required_action)) return false
  return index < ir.procedure.length - 1 || assess(ir, state).success
}

function currentStep() {
  return ir.procedure.find((step, index) => !stepComplete(step, index)) || null
}

//  -  分步领取: 步骤器材推导, 领取/收起  - 
// 步骤所需器材: IR 显式声明(procedure[].apparatus, 可覆盖 vial/试剂瓶等非动作端点
// 的耗材)优先, 否则回退到动作的 actor/target.
function apparatusFor(step) {
  if (Array.isArray(step.apparatus) && step.apparatus.length) return step.apparatus
  const action = ir.actions.find(item => item.id === step.required_action)
  if (!action) return []
  return [action.actor, action.target].filter(Boolean)
}

// 当前及未来未完成步骤仍需要的器材集合(用于自动收起判定与器材柜"本步"高亮)
function apparatusNeededAhead() {
  const needed = new Set()
  ir.procedure.forEach((step, index) => {
    if (!stepComplete(step, index)) apparatusFor(step).forEach(id => needed.add(id))
  })
  return needed
}

// 领取器材上台: 放回台面原位(含初始挂载关系)并选中(选中后其操作按钮即可用)
function fetchEntity(entityId) {
  if (!storedEntities.has(entityId)) return
  storedEntities.delete(entityId)
  const home = initialPositions.get(entityId)
  if (home && state[entityId]) Object.assign(state[entityId], {x: home.x, y: home.y, above: home.above ?? null, attached_to: home.attached_to ?? null})
  selected = entityId
  dom.message.textContent = `collected${entityMap().get(entityId)?.label || entityId}, place it back on the bench.`
  dom.message.classList.remove('is-error')
  render()
}

// 步骤边界结算: 后续任何未完成步骤都不再需要的 storage 器材收回器材柜(位置复位, 
// 下次领取从原位出现).实验完成后保持终局画面不再收起; 消耗(visible:false)器材
// 不参与收起, 由器材柜标"Used up".
function settleStorage() {
  const step = currentStep()
  const frontier = step ? ir.procedure.indexOf(step) : ir.procedure.length
  if (frontier === settledStepIndex) return
  const needed = apparatusNeededAhead()
  // 反应结果展示宽限期内不消费边界游标, 不收起 - 炭化带/水珠刚落地就收走教具, 
  // 等于把教学证据藏进器材柜缩略图(10 蜡烛案例复验 MAJOR).窗口过后补一次结算.
  const now = Date.now()
  // 0 = 无待决(立即结算); >0 = 存在待决实体, 取最小剩余毫秒.不能用 Infinity 作
  // "无待决"哨兵: 非反应器材(如切削后的小刀)会把哨兵原样带进 defer 分支, 边界
  // 收纳整体失效且 setTimeout(Infinity) 被 Chrome 钳成 ~0ms 自续渲染循环
  // (10 蜡烛案例第三轮复验 MAJOR-3).
  let graceLeft = 0
  ir.entities.forEach(entity => {
    if (entity.provisioning !== 'storage' || storedEntities.has(entity.id)) return
    if (needed.has(entity.id) || state[entity.id]?.visible === false || state[entity.id]?.attached_to) return
    if (state[entity.id]?.__reaction) { graceLeft = graceLeft > 0 ? Math.min(graceLeft, 400) : 400; return }
    const finishedAt = reactionSettledAt.get(entity.id)
    if (finishedAt) {
      const left = REACTION_SETTLE_GRACE_MS - (now - finishedAt)
      if (left > 0) graceLeft = graceLeft > 0 ? Math.min(graceLeft, left) : left
    }
  })
  if (graceLeft > 0) {
    if (settleGraceTimer) clearTimeout(settleGraceTimer)
    settleGraceTimer = setTimeout(() => { settleGraceTimer = null; render() }, Math.ceil(graceLeft) + 50)
    return
  }
  settledStepIndex = frontier
  if (!step) return // 全部完成: 保留终局画面
  const returned = []
  ir.entities.forEach(entity => {
    if (entity.provisioning !== 'storage' || storedEntities.has(entity.id)) return
    // 已 dock 到宿主的器材(棉花/橡皮塞/漏斗等)是画面里装配体的一部分 - 
    // 收走它会让宿主呈现"回到装配前"的假象(04 铁钉锈蚀案例验证 major: 
    // 密封后的试管②被收空).装配体随终局保留, 与 post:"dock" 语义一致; 
    // 确需消失的消耗品应由规则置 visible:false 走"Used up", 而非自动收起.
    if (state[entity.id]?.attached_to) return
    if (needed.has(entity.id) || state[entity.id]?.visible === false) return
    storedEntities.add(entity.id)
    const home = initialPositions.get(entity.id)
    if (home && state[entity.id]) Object.assign(state[entity.id], {x: home.x, y: home.y, above: home.above ?? null, attached_to: home.attached_to ?? null})
    returned.push(entity.label)
  })
  if (returned.length) announceStorage(`Collapsed:${returned.join(', ')}`)
}

// 收起提示走独立短驻 toast, 不覆盖 #message 里的操作反馈
function announceStorage(text) {
  const toast = dom['return-toast']
  toast.textContent = text
  toast.hidden = false
  if (storageToastTimer) clearTimeout(storageToastTimer)
  storageToastTimer = setTimeout(() => { toast.hidden = true }, 2600)
}

function targetIdsFor(actorId) {
  // 排除自身: 观察类动作(observe)允许 actor === target, 但那走按钮/双击派发, 不经拖拽; 
  // 若把自身算进拖拽候选, 距离恒为 0 永远最近, 器材会被吸到自己身上(复审 BLOCKER).
  return [...new Set(ir.actions.filter(action => action.actor === actorId && action.target && action.target !== actorId).map(action => action.target))]
}

// 功能锚点: 器材在 scene 中可声明 snap_anchor(anchors 里的命名锚点, 如横杆自由端/悬挂钩).
// 吸附距离与吸附落点都相对锚点而非器材中心 - 教学上"挂到横杆自由端"的直观位置就是有效投放区, 
// 用户不必知道吸附圆心在器材几何中心.anchors 为屏幕归一化偏移(x/1000 右, y/500 下), 
// 此处换算回场景归一化坐标(y 向上), 与 finishDrag 的度量口径一致.返回 null 表示无锚点声明.
function snapPointFor(targetId, targetState) {
  const entity = scene.entities?.[targetId]
  const anchorName = entity?.snap_anchor
  const anchor = anchorName ? entity?.anchors?.[anchorName] : null
  if (!anchor) return null
  return {
    x: Number(targetState.x ?? 0.5) + Number(anchor.x || 0),
    y: Number(targetState.y ?? 0.5) - Number(anchor.y || 0),
  }
}

// 吸附悬停间距: 随 kind 走的场景元数据(scene.entities[].snap, resolve_assets 从注册表
// 默认 + IR visual.snap 覆盖合成), 模板只保留通用回退值 - 案例特化不进模板.
// 锚点吸附语义: 挂放类器材(钩码/砝码)直接落到功能锚点下方 - "挂到悬挂点/挂钩上"; 
// 电路类器材按器材类型取接插间距 - 电阻/导线落进插座区中点, 表笔针尖搭在插孔上; 
// 其余器材悬停在锚点上方; 无锚点目标维持既有"中心上方"语义(不回归化学类案例).
function snapGapFor(actorId, targetKind, anchored) {
  const snapMeta = scene.entities[actorId]?.snap || {}
  return anchored
    ? Number(snapMeta.anchored_gap_overrides?.[targetKind] ?? snapMeta.anchored_gap ?? 0.1)
    : Number(snapMeta.gap_overrides?.[targetKind] ?? snapMeta.gap ?? 0.18)
}

// 拖拽会自动触发的动作类型(按实验域); 吸附命中与落空提示共用
function autoActionTypes() {
  if (ir.experiment?.domain === 'biology') return ['place_above', 'sterilize', 'inoculate', 'transfer']
  if (ir.experiment?.domain === 'circuits') return ['place_above']
  // 物理: hang_weight(挂砝码)走拖拽吸附直接操纵 - 砝码拖到挂钩/悬挂点即触发
  if (ir.experiment?.domain === 'physics') return ['place_above', 'hang_weight']
  return ['place_above', 'transfer', 'add_drop']
}

// 同(actor→target)动作组内"当前应执行"的那个: 按 IR 声明序(即协议序)取第一个尚未完成的, 
// 拖拽与操作按钮共用这一口径; 全部完成后退回循环指针(最近成功执行的一个), 再派发时由
// 该动作的规则失败文案给出引导.此前拖拽直接 find() 首个命中, 同组后续动作(如移液器对
// 同一容器的多次加液)永远无法通过拖拽触发, 只能靠按钮轮换.
function currentActionIn(group, actorId, targetId) {
  if (!group || !group.length) return null
  return group.find(action => !completedActions.has(action.id))
    || actionCycle.get(`${actorId}:${targetId}`) || group[0]
}

function autoActionFor(actorId, targetId) {
  // 无 target 的 place_above 是"取下"语义(finishDrag 自由摆放分支派发), 不入吸附动作组: 
  // 否则组内循环指针会停在它上面, 吸附命中后永远派发不到真正的接入动作
  const group = ir.actions.filter(action =>
    autoActionTypes().includes(action.type) && action.actor === actorId &&
    action.target && action.target === targetId)
  return currentActionIn(group, actorId, targetId)
}

// 投放落空提示: 拖到目标附近但没进吸附半径(近距未中)时给出引导文案, 
// 而不是静默无反馈 - 用户按直觉松手(如挂到横杆自由端稍外侧)时能知道差在哪.
// 文案指明差的是"落点"并点出对应动作名, 不引用规则 failure 原文 - 那是前置条件
// 状态的描述, 前置未达成时(如尚未倒气却提示"已充满二氧化碳")会与当前状态矛盾; 
// 条件类引导由吸附命中后的派发反馈承担(失败时 failure 文案原样给出).
// 带宽取 0.26: 覆盖自由端周边的直觉投放区, 同时不把器材起始摆放位(约 0.30 外)也算作"没挂上".
// 更远的投放视为自由摆放(整理台面), 不打扰.
const NEAR_MISS_DISTANCE = 0.26
function hintMissedDrop(actorId, candidates) {
  const near = candidates.filter(item => item.distance <= NEAR_MISS_DISTANCE)
    .sort((a, b) => a.distance - b.distance)[0]
  if (!near) return false
  const action = autoActionFor(actorId, near.id)
  if (!action) return false
  const label = entityMap().get(near.id)?.label || near.id
  dom.message.textContent = `near${label}but not inside the placement zone - release right on a snap point to perform${action.label || action.id}.`
  dom.message.classList.add('is-error')
  return true
}

// 落在某个非声明目标器材附近且该器材对之间没有任何动作: 给出"无操作"引导, 
// 而不是静默自由摆放(04 案例验证 minor: 醋酸拖到试管③上方松手零反馈).
// 只统计"作为过动作 target 的实体", 铁钉等静态陪衬不产生噪声; 周围没有器材的
// 自由整理(家具式摆放)仍保持安静; 近失提示更具体, 命中时让位.
function hintIncompatibleDrop(actorId, x, y) {
  const targetIds = new Set(ir.actions.filter(action => action.target && autoActionTypes().includes(action.type)).map(action => action.target))
  const near = ir.entities.map(entity => ({id: entity.id, state: state[entity.id]}))
    .filter(item => item.id !== actorId && item.state && !storedEntities.has(item.id) && targetIds.has(item.id))
    .map(item => ({...item, distance: Math.hypot(Number(item.state.x) - x, Number(item.state.y) - y)}))
    .sort((a, b) => a.distance - b.distance)[0]
  if (!near || near.distance > NEAR_MISS_DISTANCE) return
  if (autoActionFor(actorId, near.id)) return
  const name = id => entityMap().get(id)?.label || id
  const targets = [...new Set(ir.actions.filter(action => action.actor === actorId && action.target && autoActionTypes().includes(action.type)).map(action => name(action.target)))]
  const where = targets.length ? `Its operation targets:${targets.join(', ')}.` : ''
  dom.message.textContent = `${name(actorId)}pair${name(near.id)}No executable action.${where}`
  dom.message.classList.add('is-error')
}

function renderSnapZones() {
  dom['snap-zones'].replaceChildren()
  if (!dragging || !scene.snap?.show_zones_while_dragging) return
  targetIdsFor(dragging.id).forEach(targetId => {
    // 收在器材柜里的目标不上台, 放置区光圈不为其渲染
    if (storedEntities.has(targetId)) return
    const target = state[targetId]
    if (!target) return
    const point = screenPoint(snapPointFor(targetId, target) || target)
    const zone = svg('g', {class: 'snap-zone', transform: `translate(${point.x} ${point.y})`})
    zone.append(svg('ellipse', {cx: 0, cy: 0, rx: 78, ry: 38}), svg('text', {x: 0, y: 5, 'text-anchor': 'middle'}))
    zone.querySelector('text').textContent = 'Placement zone'
    dom['snap-zones'].append(zone)
  })
}

// 选中态只更新类名与 aria, 避免整棵舞台重建(拖拽/手势期间尤其重要)
function updateSelection() {
  renderInspector()
  renderInventory()
  renderControls()
  document.querySelectorAll('#entities > g').forEach(node => {
    node.classList.toggle('selected', node.dataset.testid === `entity-${selected}`)
    node.setAttribute('aria-label', `${entityMap().get(node.dataset.testid?.replace('entity-', ''))?.label || ''}, ${node.dataset.testid === `entity-${selected}` ? 'selected' : 'selectable'}`)
  })
}

function selectEntity(entityId, focus = false) {
  selected = entityId
  updateSelection()
  if (focus) requestAnimationFrame(() => dom.entities.querySelector(`[data-testid="entity-${entityId}"]`)?.focus())
}

// 对比上次渲染, 找出科学状态发生变化的实体(位置/吸附/连接/反应进度除外), 用于 state-changed 高亮
function changedEntities() {
  const now = new Map(ir.entities.map(entity => {
    const item = {...state[entity.id]}
    delete item.x
    delete item.y
    delete item.above
    delete item.attached_to
    delete item.__reaction
    delete item.__motion
    return [entity.id, JSON.stringify(item)]
  }))
  const changed = new Set()
  if (prevEntityJson) {
    now.forEach((value, id) => { if (prevEntityJson.get(id) !== value) changed.add(id) })
  }
  prevEntityJson = now
  return changed
}

function renderStage() {
  dom.entities.replaceChildren()
  const ordered = [...ir.entities].sort((a, b) => (scene.entities[a.id]?.z_index || 0) - (scene.entities[b.id]?.z_index || 0))
  // 手势与延时反应期间数值逐帧插值, state-changed 动画会每帧重启, 故跳过; 结束时统一闪烁一次
  const changedIds = (motionActive || reaction) ? new Set() : changedEntities()
  ordered.forEach(entity => {
    const itemState = state[entity.id]
    // 器材被"消耗"(规则置 visible:false, 如组织样本转入管内)后不再上台; 
    // 其内容物由目标器材的状态渲染(如 C 管内组织块)表示.
    // 分步领取模式(provisioning:"storage")下, 收在器材柜里的器材同样不上台
    if (itemState.visible === false || storedEntities.has(entity.id)) return
    const visual = scene.entities[entity.id]
    const point = screenPoint(itemState)
    const scale = Number(visual?.transform?.scale || 1)
    const rotation = Number(visual?.transform?.rotation_deg || 0)
    // 动画层的姿态(tilt/dx/dy)叠加进定位 transform; CSS 抖动仍由内层 .reacting 承担
    const pose = itemState.__motion || {}
    const poseX = point.x + Number(pose.dx || 0)
    const poseY = point.y + Number(pose.dy || 0)
    const poseRotation = rotation + Number(pose.tilt || 0)
    const node = renderApparatus(visual?.renderer, entity, itemState, {visual, asset: assetFor(entity.id), world: state})
    node.setAttribute('transform', `translate(${poseX} ${poseY}) rotate(${poseRotation}) scale(${scale})`)
    node.setAttribute('data-testid', `entity-${entity.id}`)
    node.setAttribute('role', 'button')
    node.setAttribute('tabindex', '0')
    node.setAttribute('aria-label', `${entity.label}, ${selected === entity.id ? 'selected' : 'selectable'}${entity.capabilities?.includes('adjust') ? ', drag while holding to rotate' : ''}${entity.capabilities?.includes('drag') ? ', draggable' : ''}`)
    node.classList.add('apparatus')
    if (selected === entity.id) node.classList.add('selected')
    if (changedIds.has(entity.id)) node.classList.add('state-changed')
    if (entity.capabilities?.includes('drag')) node.classList.add('draggable')
    node.addEventListener('pointerdown', event => {
      event.preventDefault()
      node.focus({preventScroll: true}) // preventDefault 会抑制浏览器默认聚焦; 方向键微调依赖实体持有焦点, 须显式补上
      if (motionActive) return // 手势播放期间锁定拖拽, 避免状态被并发改写
      const now = performance.now()
      if (lastTap.id === entity.id && now - lastTap.time < 450 && !lastTap.moved) {
        // 指针层双击: 可拖拽器材的原生 dblclick 不会产生, 由此补齐; 部分浏览器仍会补发
        // 原生 dblclick, 由 manualDblAt 时间戳去重, 避免双触发
        lastTap = {id: null, time: 0, moved: false}
        manualDblAt = now
        selected = entity.id
        updateSelection()
        if (!tryToggleValve(entity.id)) tryObserve(entity.id)
        return
      }
      lastTap = {id: entity.id, time: now, moved: false}
      selected = entity.id
      const rotateAction = adjustAngleAction(entity.id)
      if (rotateAction) {
        dom.stage.setPointerCapture(event.pointerId)
        rotating = {
          id: entity.id,
          pointerId: event.pointerId,
          action: rotateAction,
          grabAngle: pointerAngleDeg(event, entity.id),
          baseAngle: Number(state[entity.id]?.angle_deg || 0)
        }
      } else if (entity.capabilities?.includes('drag')) {
        dom.stage.setPointerCapture(event.pointerId)
        // 拖拽开始时捕获起始吸附态: pointermove 一开始就会清 above(拖动中不渲染吸附态), 
        // finishDrag 松手时再读 actor.above 恒为 false(03 薄膜干涉案例第三轮验证 MAJOR-1)
        dragging = {id: entity.id, pointerId: event.pointerId, from: {x: Number(itemState.x), y: Number(itemState.y)}, wasDocked: Boolean(itemState.above)}
      }
      updateSelection()
    })
    node.addEventListener('click', () => selectEntity(entity.id))
    node.addEventListener('dblclick', event => {
      event.preventDefault()
      if (performance.now() - manualDblAt < 600) return // 指针层已处理本次双击
      if (!tryToggleValve(entity.id)) tryObserve(entity.id)
    })
    node.addEventListener('keydown', event => handleEntityKey(event, entity))
    dom.entities.append(node)
  })
  // 整树重建必然丢焦点: 鼠标点选在 pointerdown 里获焦后, 任何一次 render()(拖拽落定, 
  // 状态反馈, 反应计时)都会经 replaceChildren 使 activeElement 回到 BODY, 方向键微调
  // 随之失效.此处对 selected 实体恢复焦点; 仅在焦点确已旁落(body)时补挂, 不抢按钮/输入框的焦点
  if (selected && document.activeElement === document.body) {
    dom.entities.querySelector(`[data-testid="entity-${selected}"]`)?.focus({preventScroll: true})
  }
  renderSnapZones()
}

// 键盘放置(拖拽的可达性回退, 与 finishDrag 吸附分支同口径): 
// 焦点器材位于某目标吸附半径内按 Enter = 吸附落位并派发该放置动作; 
// 已吸附在宿主上时在别处按 Enter = 取下(无 target 的 place_above); 
// 两者皆不满足则只保持选中, 不弹干扰文案.
function keyboardPlace(entityId) {
  const item = state[entityId]
  if (!item) return
  const candidates = targetIdsFor(entityId).map(id => ({id, state: state[id]})).filter(x => x.state && !storedEntities.has(x.id))
    .map(x => {
      const anchor = snapPointFor(x.id, x.state)
      const point = anchor || {x: Number(x.state.x), y: Number(x.state.y)}
      return {...x, anchor, point, distance: Math.hypot(point.x - Number(item.x), point.y - Number(item.y))}
    })
  const nearest = candidates.sort((a, b) => a.distance - b.distance)[0]
  const docked = Boolean(item.above || item.attached_to)
  if (nearest && nearest.distance <= Number(scene.snap?.distance || 0.16)) {
    if (docked && item.above === nearest.id) return // 已吸附在该宿主上, Enter 不重复派发
    const anchored = Boolean(nearest.anchor)
    item.__fromX = Number(item.x)
    const snapPrevX = Number(item.x)
    const snapPrevY = Number(item.y)
    item.x = nearest.point.x
    item.y = clamp(nearest.point.y + snapGapFor(entityId, entityMap().get(nearest.id)?.kind, anchored), 0.08, 0.92)
    // 与 finishDrag 吸附分支同口径: 键盘落位的最后一段位移也要同步给附件
    moveFollowers(entityId, Number(item.x) - snapPrevX, Number(item.y) - snapPrevY)
    item.above = nearest.id
    const action = autoActionFor(entityId, nearest.id)
    if (action) { perform(action); return }
    render()
    return
  }
  if (docked) {
    const releaseAction = ir.actions.find(action => action.type === 'place_above' && action.actor === entityId
      && !action.target && !action.feedback_only)
    if (releaseAction) { perform(releaseAction); return }
  }
}

function handleEntityKey(event, entity) {
  if (motionActive) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    selectEntity(entity.id, true)
    if (entity.capabilities?.includes('drag')) keyboardPlace(entity.id)
    return
  }
  if (event.key === 'v' || event.key === 'V') {
    event.preventDefault()
    tryObserve(entity.id)
    return
  }
  // adjust 能力器材(不可平移): 左右方向键步进旋转(shift 大步长), 即转即派发动作重算状态
  if (!entity.capabilities?.includes('drag') && entity.capabilities?.includes('adjust')) {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const action = adjustAngleAction(entity.id)
    if (!action) return
    const step = event.shiftKey ? 15 : 5
    const current = Number(state[entity.id]?.angle_deg || 0)
    const next = ((event.key === 'ArrowRight' ? current + step : current - step) % 360 + 360) % 360
    perform({...action, params: {...(action.params || {}), value: next}})
    return
  }
  if (!entity.capabilities?.includes('drag') || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  const item = state[entity.id]
  const prevX = Number(item.x)
  const prevY = Number(item.y)
  const step = event.shiftKey ? 0.05 : 0.015
  if (event.key === 'ArrowLeft') item.x = clamp(Number(item.x) - step, 0.06, 0.94)
  if (event.key === 'ArrowRight') item.x = clamp(Number(item.x) + step, 0.06, 0.94)
  if (event.key === 'ArrowUp') item.y = clamp(Number(item.y) + step, 0.08, 0.92)
  if (event.key === 'ArrowDown') item.y = clamp(Number(item.y) - step, 0.08, 0.92)
  const wasDocked = Boolean(item.above)
  item.above = null
  item.attached_to = null // 键盘位移与拖拽自由摆放同语义: 从宿主上取下
  moveFollowers(entity.id, Number(item.x) - prevX, Number(item.y) - prevY)
  render() // 键盘微调后必须重绘舞台, 否则位移只发生在 state 中, 画面不动
  selectEntity(entity.id, true)
  // 与 finishDrag 自由摆放分支同语义: 键盘位移脱离吸附后也要派发无 target 的
  // place_above(取下)动作, 让引擎重算依赖宿主关系的派生状态 - 否则吸附态
  // (如反射像等状态绑定)会在键盘路径下滞留(首轮验证 MAJOR #1).
  if (wasDocked) {
    const releaseAction = ir.actions.find(action => action.type === 'place_above' && action.actor === entity.id
      && !action.target && !action.feedback_only)
    if (releaseAction) perform(releaseAction)
  }
}

function renderInventory() {
  dom.inventory.replaceChildren()
  dom['entity-count'].textContent = `${ir.entities.length}  items`
  // 器材柜三态: 暂存(可领取)/ 在台上 / 已用完; 当前步骤要用的卡片加"本步"高亮
  const currentApparatus = new Set((() => { const step = currentStep(); return step ? apparatusFor(step) : [] })())
  ir.entities.forEach(entity => {
    const stored = storedEntities.has(entity.id)
    const consumed = state[entity.id]?.visible === false
    const neededNow = currentApparatus.has(entity.id) && !consumed
    const button = document.createElement('button')
    button.className = `inventory-item${selected === entity.id ? ' is-selected' : ''}${stored ? ' is-stored' : ''}${neededNow ? ' is-needed' : ''}`
    button.setAttribute('aria-pressed', selected === entity.id ? 'true' : 'false')
    button.dataset.testid = `stock-${entity.id}`
    const preview = svg('svg', {viewBox: '-70 -80 140 160', class: 'inventory-preview', 'aria-hidden': 'true'})
    preview.append(renderApparatus(scene.entities[entity.id]?.renderer, entity, state[entity.id], {preview: true, asset: assetFor(entity.id), world: state}))
    const copy = document.createElement('span')
    const name = document.createElement('strong')
    const kind = document.createElement('small')
    const status = document.createElement('em')
    name.textContent = entity.label
    kind.textContent = entity.kind.replaceAll('_', ' ')
    status.className = 'inventory-status'
    status.textContent = stored ? 'Apparatus cabinet - click to collect' : consumed ? 'Used up' : neededNow ? 'Needed this step - on bench' : 'On bench'
    copy.append(name, kind, status)
    button.append(preview, copy)
    // 暂存卡片点击 = 领取上台; 已上台的点击 = 选中查看(保持既有行为)
    button.addEventListener('click', () => {
      if (stored) fetchEntity(entity.id)
      else selectEntity(entity.id)
    })
    dom.inventory.append(button)
    // 预览自适应: 器材几何差异巨大(如斜面整机 ~620px 宽), 固定 viewBox 窗口会裁切, 
    // 且 .inventory-preview 为 overflow:visible, 窗口外几何会直接溢出侧栏图标框.
    // 挂载后按内容包围盒重设 viewBox; .apparatus-label 等在预览中 display:none, 不参与包围盒.
    const content = preview.firstChild
    if (content) {
      try {
        const box = content.getBBox()
        if (box.width > 1 && box.height > 1) {
          const pad = Math.max(box.width, box.height) * 0.08 + 2
          preview.setAttribute('viewBox', `${(box.x - pad).toFixed(1)} ${(box.y - pad).toFixed(1)} ${(box.width + pad * 2).toFixed(1)} ${(box.height + pad * 2).toFixed(1)}`)
        }
      } catch { /* getBBox 不可用时保留默认窗口 */ }
    }
  })
}

function renderInspector() {
  const entity = ir.entities.find(item => item.id === selected)
  dom['selection-empty'].hidden = Boolean(entity)
  dom['selection-detail'].hidden = !entity
  dom['selected-title'].textContent = entity?.label || 'No apparatus selected'
  if (!entity) return
  dom['selected-kind'].textContent = entity.kind.replaceAll('_', ' ')
  dom.readouts.replaceChildren()
  const itemState = state[entity.id] || {}
  const allKeys = [
    'volume_ml', 'delivered_ml', 'drops', 'valve_open', 'above', 'attached_to', 'gas_level', 'co2_level',
    'sterilized', 'colony_count', 'contaminated', 'growth_stage', 'incubation_temp', 'incubation_time_h', 'sealed', 'observed',
    'reading_g', 'salt_mass_g', 'refined_g', 'crystals_g', 'residue_g', 'dissolved', 'stirred', 'mixture',
    'mass_kg', 'force_n', 'tension_n', 'extension', 'angle_deg', 'arrow_angle', 'force_x', 'force_y', 'balanced', 'displacement', 'velocity',
    // 324 案例新增键(无 state_bindings 的实体回退到此清单展示)
    'contents', 'dissociation_programs', 'incubations', 'mix1_ready', 'mix_incubated', 'tissue_added', 'mix2_added', 'pelleted',
    'filtered', 'mounted', 'washed', 'resuspended', 'rotating', 'running', 'viability_pct', 'wash_ml',
    'mass_g', 'pore_um', 'temp_c', 'speed_g', 'program',
    // 29 案例(μA741 反相比例运算放大电路)新增键
    'source_v', 'output_v', 'gain_actual', 'powered', 'calibrated', 'inspected', 'reviewed', 'measured_out',
    'r1_installed', 'rf_installed', 'r2_installed', 'input_connected', 'saturated',
  ]
  const boundKeys = Object.keys(scene?.entities?.[entity.id]?.state_bindings || {})
  // IR state_labels 声明的键(案例化检查器文案)一并展示 - 不合并会让
  // "已密封/棉花/锈蚀程度"等规则状态在界面上不可见(04 案例验证 minor).
  // 声明了 labels/bindings 的实体按白名单展示: cloneInitial 的模板种子键
  // (volume_ml/drops/valve_open 等)不再兜底泄漏进检查器(101 verified minor: 
  // 数字温度计面板出现 0 体积/滴数/旋塞行)
  const labeledKeys = Object.keys(scene?.entities?.[entity.id]?.state_labels || {})
  const declaredKeys = [...new Set([...boundKeys, ...labeledKeys])]
  const candidateKeys = [...new Set([...(declaredKeys.length ? declaredKeys : allKeys), 'above'])]
  const visibleKeys = candidateKeys.filter(key => {
    if (!(key in itemState)) return false
    if (key === 'above') return true
    const value = itemState[key]
    return value !== null && value !== '' && value !== undefined
  })
  visibleKeys.forEach(key => {
    const term = document.createElement('dt')
    const description = document.createElement('dd')
    term.textContent = stateLabel(key, entity.id)
    description.textContent = stateText(key, itemState[key])
    dom.readouts.append(term, description)
  })
  dom.properties.replaceChildren()
  Object.entries(entity.properties || {}).forEach(([key, value]) => {
    const row = document.createElement('div')
    const a = document.createElement('span')
    const b = document.createElement('strong')
    a.textContent = stateLabel(key, entity.id)
    b.textContent = String(value)
    row.append(a, b)
    dom.properties.append(row)
  })
}

const INTERACTION_HINT_CHEMISTRY = 'Direct manipulation: drag apparatus above a target to automatically pour or drip; double-click the burette stopcock or the alcohol lamp to ignite or extinguish; press V to observe the selected item; arrow keys nudge positions.'
const INTERACTION_HINT_CIRCUITS = 'Direct manipulation: drag resistors or leads into matching socket zones to auto-connect, and drag probes to test points for readings; select the trainer box and use buttons to adjust the signal-source knob; double-click the chip to view pins, the multimeter to confirm calibration, and the red probe to confirm output measurement; arrow keys nudge positions.'
const INTERACTION_HINT_PHYSICS = 'Direct manipulation: drag weights onto hooks or hanging points and snap apparatus into target positions (release near a snap point); with the keyboard, move a draggable item near a snap point and press Enter to place it, or press Enter outside the snap zone to detach; use the buttons of a selected item for reading or observing actions; arrow keys nudge positions.'
// 含 adjust 器材(偏振片等)的案例追加旋转提示 - 按 IR 实体能力判断, 非案例特化
const INTERACTION_HINT_PHYSICS_ROTATE = 'Direct manipulation: drag weights onto hooks or hanging points and snap apparatus into target positions (release near a snap point); with the keyboard, move a draggable item near a snap point and press Enter to place it, or press Enter outside the snap zone to detach; press and drag an adjustable item (e.g. a polarizer disc) to rotate it about its center, or use left and right arrow keys for stepped rotation (Shift for larger steps); double-click switches or flippable items to toggle them; use the buttons of a selected item for reading or observing actions; arrow keys nudge draggable positions.'
const INTERACTION_HINT = () => ir?.experiment?.domain === 'circuits' ? INTERACTION_HINT_CIRCUITS
  : ir?.experiment?.domain === 'physics'
    ? (ir?.entities?.some(entity => entity.capabilities?.includes('adjust')) ? INTERACTION_HINT_PHYSICS_ROTATE : INTERACTION_HINT_PHYSICS)
  : INTERACTION_HINT_CHEMISTRY

function renderControls() {
  dom.controls.replaceChildren()
  const hint = document.createElement('span')
  hint.className = 'control-hint'
  hint.dataset.testid = 'interaction-hint'
  hint.textContent = INTERACTION_HINT()
  dom.controls.append(hint)
  // 选中器材的显式动作按钮: 仅列出通过拖拽不便触发的操作(如读取/观察类), 
  // 按钮文案取自 IR action.label, 不引入通用数量.
  const entity = ir.entities.find(item => item.id === selected)
  if (!entity) return
  const draggable = entity.capabilities?.includes('drag')
  // feedback_only 动作(如"插错支路"的引导反馈)只在拖拽落错时派发, 不生成操作按钮; 
  // adjust_angle(旋转直接操纵: 拖拽/方向键派发)同理不生成按钮, 避免核心操作按钮化; 
  // 可拖器材的 place_above(装配/取下)是核心实验操作: 直接操纵 = 拖拽, 可达性回退 =
  // 对准吸附点后按 Enter(keyboardPlace), 一律不按钮化(07 案例验证 MAJOR #2)
  const actions = ir.actions.filter(action => action.actor === entity.id && action.type !== 'set_valve' && action.type !== 'reset' && action.type !== 'adjust_angle' && !action.feedback_only
    && !(action.type === 'place_above' && draggable))
  actions.forEach((action, index) => {
    const sameTarget = actions.filter(item => item.target === action.target)
    // 同 actor+target 存在多个动作时只渲染一个按钮, 点击执行组内"当前应做的那一个"
    // (与拖拽派发同口径, 见 currentActionIn), 执行完成后按钮自动指向下一个
    if (sameTarget.length > 1 && action !== sameTarget[0]) return
    const grouped = sameTarget.length > 1
    const button = document.createElement('button')
    button.className = 'control-action'
    button.dataset.testid = `control-${action.id}`
    const current = () => (grouped ? currentActionIn(sameTarget, action.actor, action.target) : action)
    button.textContent = current().label || current().id
    button.addEventListener('click', () => {
      perform(current())
    })
    dom.controls.append(button)
  })
}

// 同(actor→target)多动作的循环指针: 键含 actor, 避免不同器材对同一目标的组互相覆盖
const actionCycle = new Map()

// 成功执行的动作记入循环指针: 组内全部完成后, 拖拽/按钮派发退回指针动作, 
// 由其规则失败文案给出"已完成/需先完成..."的引导
function advanceCycle(action) {
  if (action?.target) actionCycle.set(`${action.actor}:${action.target}`, action)
}

function renderProcedure() {
  dom.steps.replaceChildren()
  let currentPhase = null
  ir.procedure.forEach((step, index) => {
    // 可选 procedure[].phase: 同阶段步骤聚为一组, 标题行整行贯通(无 phase 声明时不分组)
    if (step.phase && step.phase !== currentPhase) {
      currentPhase = step.phase
      const heading = document.createElement('h3')
      heading.className = 'phase-heading'
      heading.textContent = currentPhase
      dom.steps.append(heading)
    }
    const article = document.createElement('article')
    article.dataset.testid = `step-${step.id}`
    const done = stepComplete(step, index)
    if (done) article.classList.add('complete')
    const number = document.createElement('span')
    const copy = document.createElement('div')
    const title = document.createElement('strong')
    const confidence = document.createElement('small')
    number.textContent = done ? '✓' : String(index + 1).padStart(2, '0')
    title.textContent = step.title
    confidence.textContent = `${step.confidence} confidence`
    copy.append(title, confidence)
    article.append(number, copy)
    dom.steps.append(article)
  })
  const step = currentStep()
  const result = assess(ir, state)
  const completedCount = ir.procedure.filter((item, index) => stepComplete(item, index)).length
  const stepPosition = step ? Math.max(0, ir.procedure.indexOf(step)) : Math.max(0, ir.procedure.length - 1)
  dom['step-index'].textContent = result.success ? '✓' : String(stepPosition + 1).padStart(2, '0')
  dom['step-title'].textContent = result.success ? 'Experiment goals completed' : step?.title || 'Free exploration'
  dom['progress-label'].textContent = `${completedCount} / ${ir.procedure.length}`
  dom['progress-bar'].style.width = `${ir.procedure.length ? Math.min(100, completedCount / ir.procedure.length * 100) : 0}%`
}

// 当前步骤栏的"Apparatus for this step"chips: 暂存的显示"Click to collect"可直接领取, 
// 已消耗的标注"Used up", 在台上的纯展示.无步骤/无器材清单时整行隐藏.
function renderStepApparatus() {
  const wrap = dom['step-apparatus']
  if (!wrap) return
  const step = currentStep()
  const ids = step ? apparatusFor(step) : []
  const hasStaged = ir.entities.some(entity => entity.provisioning === 'storage')
  wrap.replaceChildren()
  if (!step || !ids.length || !hasStaged) {
    wrap.hidden = true
    return
  }
  const lead = document.createElement('span')
  lead.className = 'apparatus-lead'
  lead.textContent = 'Apparatus for this step'
  wrap.append(lead)
  ids.forEach(id => {
    const entity = entityMap().get(id)
    if (!entity) return
    const chip = document.createElement('button')
    chip.dataset.testid = `chip-${id}`
    chip.className = 'apparatus-chip'
    if (storedEntities.has(id)) chip.classList.add('is-stored')
    else if (state[id]?.visible === false) chip.classList.add('is-consumed')
    else chip.classList.add('is-placed')
    const name = document.createElement('strong')
    name.textContent = entity.label
    chip.append(name)
    if (storedEntities.has(id)) {
      const hint = document.createElement('em')
      hint.textContent = 'Click to collect'
      chip.append(hint)
      chip.addEventListener('click', () => fetchEntity(id))
    } else if (state[id]?.visible === false) {
      const hint = document.createElement('em')
      hint.textContent = 'Used up'
      chip.append(hint)
    }
    wrap.append(chip)
  })
  wrap.hidden = false
}

function renderAssessment() {
  const result = assess(ir, state)
  dom.status.textContent = result.success ? 'Experiment completed' : 'in progress'
  dom.status.classList.toggle('success', result.success)
  dom.failure.hidden = !result.failure
  dom.failure.textContent = result.failure || ''
}

function render() {
  // 步骤边界结算先行: 先把"后续不再需要"的暂存器材收起(settledStepIndex 游标保证只在边界触发), 
  // 再渲染, 避免用户看到刚收起的器材闪现
  settleStorage()
  renderStage()
  renderInventory()
  renderInspector()
  renderControls()
  renderProcedure()
  renderStepApparatus()
  renderAssessment()
}

// 三段式执行: 先 dispatch 算出结果(不提交), 再按结果播放手势动画(草稿状态逐帧渲染), 
// 动画结束后一次性提交.失败/无手势计划(或用户偏好减少动态)时退回瞬时提交.
async function perform(action, {from = null} = {}) {
  const resolved = action.type === 'set_valve'
    ? {...action, params: {...(action.params || {}), value: !Boolean(state[action.actor]?.[action.params?.field || 'valve_open'])}}
    : action
  const outcome = dispatch(ir, state, resolved)
  selected = action.actor || selected
  if (!outcome.ok) {
    commitOutcome(action, outcome, from)
    return
  }
  const plan = motionEnabled() ? planMotion(ir, resolved, state) : null
  if (!plan) {
    if (outcome.ok) applyPost(outcome, action, from)
    state = outcome.state
    if (outcome.pending) {
      advanceCycle(action)
      startReaction(outcome.pending, outcome.message, action.id)
      return
    }
    commitOutcome(action, outcome)
    return
  }
  await playGesture(action, outcome, plan, from)
}

//  -  动作后姿态(post): 声明动作提交后 actor 的位置语义  - 
// return_home: 滑回"家"(拖拽起点优先, 其次 home 槽位) - 倾倒类默认; 
// dock: 留在目标上并跟随目标移动(漏斗架在锥形瓶上) - 放置类默认; 
// stay: 原地不动(滴定管旋塞, 观察等).
function postPositionFor(action) {
  const declared = action.post?.position
  if (declared) return declared
  if (action.type === 'transfer' || action.type === 'add_drop') return 'return_home'
  if (action.type === 'place_above') return 'dock'
  return 'stay'
}

// home 槽位解析: 拖拽起点(视频操作习惯: 从哪拿来放回哪)> scene.home 契约 > 开局快照
function homeFor(entityId, from) {
  if (from && Number.isFinite(Number(from.x)) && Number.isFinite(Number(from.y))) return {x: Number(from.x), y: Number(from.y)}
  const declared = scene?.entities?.[entityId]?.home
  if (declared && Number.isFinite(Number(declared.x)) && Number.isFinite(Number(declared.y))) return {x: Number(declared.x), y: Number(declared.y)}
  const snapshot = initialPositions.get(entityId)
  return snapshot ? {x: snapshot.x, y: snapshot.y} : null
}

// 把 post 语义写进待提交的 outcome.state(只在动作成功时调用; 位置是呈现层状态, 引擎不管)
function applyPost(outcome, action, from) {
  const actorState = outcome?.state?.[action.actor]
  if (!actorState) return
  const post = postPositionFor(action)
  if (post === 'return_home') {
    // 取下类动作(无 target 的 place_above, 如把薄条从环口拿开): 拖拽起点就是被取下的
    // 位置, 回到起点等于没取下 - 回 scene.home 声明的槽位.有 target 的动作保持
    // 拖拽起点优先(从哪拿来放回哪).
    const home = action.target ? homeFor(action.actor, from) : homeFor(action.actor, null)
    if (home) {
      actorState.x = home.x
      actorState.y = home.y
      actorState.above = null
    }
    actorState.attached_to = null
  } else if (post === 'dock' && action.target) {
    actorState.attached_to = action.target
    // 按钮派发的放置类动作把 actor 实际摆到目标吸附位: 拖拽路径在 finishDrag 里已先落位
    // (此处写回同值, 幂等), 按钮路径此前只记账不落位 - 探头已接上而位置不动, 
    // above 为空, 波形与示波器读数同反馈脱节(复审 N1)
    const targetState = outcome.state[action.target]
    if (targetState && actorState.above !== action.target) {
      const anchor = snapPointFor(action.target, targetState)
      const point = anchor || {x: Number(targetState.x), y: Number(targetState.y)}
      actorState.__fromX = Number(actorState.x)
      // 与 finishDrag 吸附写位同口径: 锚点越出舞台时夹回可视范围(106 案例验证 major)
      actorState.x = clamp(point.x, 0.06, 0.94)
      actorState.y = clamp(point.y + snapGapFor(action.actor, entityMap().get(action.target)?.kind, Boolean(anchor)), 0.08, 0.92)
      actorState.above = action.target
    }
  }
}

// 附件跟随: attached_to 的器材随宿主平移(拖拽/键盘微调), 保持相对位置
function moveFollowers(targetId, dx, dy, _seen) {
  if (!dx && !dy) return
  const seen = _seen || new Set([targetId])
  ir.entities.forEach(ent => {
    const s = state[ent.id]
    if (!s || s.attached_to !== targetId || seen.has(ent.id)) return
    seen.add(ent.id)
    s.x = clamp(Number(s.x) + dx, 0.06, 0.94)
    s.y = clamp(Number(s.y) + dy, 0.08, 0.92)
    // 递归带动二级附件(案例 18: 试管倒扣在漏斗颈上, 漏斗又随烧杯移动 - 
    // 只挪直接附件会把试管留在原地, 视觉与状态脱节)
    moveFollowers(ent.id, dx, dy, seen)
  })
}

function commitOutcome(action, outcome, from = null) {
  state = outcome.state
  if (outcome.ok) { completedActions.add(action.id); advanceCycle(action); stickyError = null }
  else {
    stickyError = {until: Date.now() + REFUSAL_HOLD_MS}
    // post 语义为 return_home 的器材(摇柄等)派发失败也要弹回家位: 否则手柄停在吸附点, 
    // 叠加轻按判定(位移 ≤0.005 记为选中查看), 原地立即重试会被静默吞掉
    // (110 verified minor F2).与 applyPost 同口径: 带 target 的动作回拖拽起点优先.
    const actorState = state[action.actor]
    if (actorState && postPositionFor(action) === 'return_home') {
      const home = homeFor(action.actor, action.target ? from : null)
      if (home) { actorState.x = home.x; actorState.y = home.y; actorState.above = null }
    }
  }
  dom.message.textContent = outcome.message
  dom.message.classList.toggle('is-error', !outcome.ok)
  render()
}

// 局部锚点(含姿态)→ 舞台屏幕坐标, 供液流起点/落点计算
function localToScreen(itemState, entityId, local) {
  const scale = Number(scene.entities[entityId]?.transform?.scale || 1)
  const pose = itemState.__motion || {}
  const point = screenPoint(itemState)
  const rad = (Number(pose.tilt || 0) * Math.PI) / 180
  return {
    x: point.x + Number(pose.dx || 0) + (local.x * Math.cos(rad) - local.y * Math.sin(rad)) * scale,
    y: point.y + Number(pose.dy || 0) + (local.x * Math.sin(rad) + local.y * Math.cos(rad)) * scale,
  }
}

async function playGesture(action, outcome, plan, from = null) {
  const run = ++motionRun
  motionActive = true
  dom.stage.dataset.motion = 'busy'
  const actorId = action.actor
  const targetId = action.target
  const diffs = numericDiffs(state, outcome.state)
  const actorEntity = ir.entities.find(item => item.id === actorId)
  const targetEntity = ir.entities.find(item => item.id === targetId)
  // 吸附后 actor.x 已等于 target.x, 须用拖来前的 __fromX 判断倾斜方向
  const refX = Number.isFinite(Number(state[actorId]?.__fromX)) ? Number(state[actorId].__fromX) : Number(state[actorId]?.x ?? 0)
  const sign = Number(state[targetId]?.x ?? 0) < refX ? -1 : 1
  const stirRadius = Math.max(8, geometryFor(targetEntity?.kind, targetEntity, state[targetId]).halfWidth * 0.6)
  // 倾倒锚点: 满倾角时器嘴平移到目标口轴线上方, 液流从口落入而非穿壁(详见 motion.pourAnchor)
  if (plan.stream && actorEntity && targetEntity && state[actorId] && state[targetId]) {
    plan.anchor = pourAnchor(plan,
      geometryFor(actorEntity.kind, actorEntity, state[actorId]),
      geometryFor(targetEntity.kind, targetEntity, state[targetId]),
      {
        sign,
        gapPx: screenPoint(state[targetId]).y - screenPoint(state[actorId]).y,
        actorScale: Number(scene.entities[actorId]?.transform?.scale || 1),
        targetScale: Number(scene.entities[targetId]?.transform?.scale || 1),
        targetRotationDeg: Number(scene.entities[targetId]?.transform?.rotation_deg || 0),
      })
  }
  // 回位段: post=return_home 时手势后追加一段滑回"家"的动画(同一条时间线, 无定时器竞态)
  const home = postPositionFor(action) === 'return_home' ? homeFor(actorId, from) : null
  const returnShare = home ? 0.4 : 0
  const gestureFraction = 1 / (1 + returnShare)
  const startX = Number(state[actorId]?.x ?? 0)
  const startY = Number(state[actorId]?.y ?? 0)
  activeTimeline = createTimeline(plan.duration_ms * (1 + returnShare), p => {
    if (run !== motionRun) return
    if (p <= gestureFraction) {
      const g = p / gestureFraction
      // 1) 手势姿态(actor 的 __motion 由 renderStage 叠加)
      if (state[actorId]) {
        state[actorId].__motion = plan.kind === 'stir' ? stirPose(plan, g, stirRadius)
          : plan.kind === 'settle' ? settlePose(g)
          : pourPose(plan, g, sign)
      }
      // 2) 状态数值补间: 倒出类动作沿液流窗口线性推进, 与画面液流同步; 
      //    其余手势可由 IR motion.easing 声明缓动(如物理受载 back-out 的弹性过冲)
      const progress = plan.kind === 'pour' ? streamProgress(g) : applyEasing(plan.easing, g)
      applyLerp(state, diffs, progress)
      // 3) 液流/颗粒流(#fx 层): 仅倒出类手势且处于流动窗口内绘制
      const pouring = plan.stream && (plan.kind === 'pour' ? progress > 0 && progress < 1 : true)
      if (pouring) {
        const actorGeo = geometryFor(actorEntity?.kind, actorEntity, state[actorId])
        const targetGeo = geometryFor(targetEntity?.kind, targetEntity, state[targetId])
        const from2 = localToScreen(state[actorId], actorId, actorGeo.spout || {x: 20, y: -16})
        // 落点取目标口正下方的液面(口轴), 液流沿口轴落入, 与倾倒锚点对齐
        const to2 = localToScreen(state[targetId], targetId, {x: targetGeo.mouth?.x || 0, y: targetGeo.surfaceY})
        drawStream(dom.fx, from2, to2, plan.stream, (g * plan.duration_ms) / 1000)
      } else {
        clearFx(dom.fx)
      }
    } else if (home && state[actorId]) {
      // 4) 回位段: 姿态已回正, 器材从落点平滑滑回家(数值补间已在手势段完成)
      const r = applyEasing('ease-in-out', (p - gestureFraction) / Math.max(1e-6, 1 - gestureFraction))
      delete state[actorId].__motion
      state[actorId].x = startX + (home.x - startX) * r
      state[actorId].y = startY + (home.y - startY) * r
      clearFx(dom.fx)
    }
    renderStage()
  })
  await activeTimeline.done
  clearFx(dom.fx)
  if (run !== motionRun) return // 重置已打断本次手势
  if (state[actorId]) delete state[actorId].__motion
  motionActive = false
  dom.stage.dataset.motion = 'idle'
  activeTimeline = null
  if (outcome.ok) applyPost(outcome, action, from)
  state = outcome.state
  delete state[actorId]?.__fromX // 吸附前方位标记, 随手势结束清除(dispatch 快照里也带着)
  if (outcome.pending) {
    advanceCycle(action)
    startReaction(outcome.pending, outcome.message, action.id)
    return
  }
  if (outcome.ok) { completedActions.add(action.id); advanceCycle(action) }
  dom.message.textContent = outcome.message
  dom.message.classList.toggle('is-error', !outcome.ok)
  render()
}

const REACTION_TICK_MS = 50
// 拒绝文案保持期: 延时规则进行中被拒的操作(如滑行中拔线)若立即被进度文案接管, 
// 用户几乎看不到拒绝提示(07 案例验证 minor #4) - 保持期内 tickReaction 不改写消息行
const REFUSAL_HOLD_MS = 2500
let stickyError = null

// 反应计时器文案按学科域措辞: 化学"Reaction", 物理等域用"experiment"(如小车匀加速下滑的 2T 计时); 
// 案例可用 experiment.reaction_noun 覆盖(324 用"运行"统称解离/孵育/离心等延时过程)
const reactionNoun = () => ir?.experiment?.reaction_noun || (['physics', 'circuits'].includes(ir?.experiment?.domain) ? 'experiment' : 'Reaction')

// 并发延时规则: 新派发的批次合并进进行中的反应, 按各自 started_at 独立计时 - 
// 整体替换会冻结先入批次的插值(终色永不落地), 丢掉其动作完成标记(101 verified BLOCKER).
// 同一字段被并发批次同时插值时, batches 顺序后写, 后入批次自然接管该字段走向.
// message/actionIds 逐条累积: 延迟规则的 success 反馈与完成标记留在计时结束一并呈现.
function startReaction(batches, message = '', actionId = null) {
  const startedAt = reaction ? reaction.elapsed : 0
  const fresh = reactionStarts(batches, state).map(batch => ({...batch, started_at: startedAt, applied: false}))
  if (reaction) {
    reaction.batches.push(...fresh)
    reaction.total = Math.max(reaction.total, ...fresh.map(batch => startedAt + batch.delay_ms))
    if (actionId && !reaction.actionIds.includes(actionId)) reaction.actionIds.push(actionId)
    if (message) reaction.messages.push(message)
  } else {
    reaction = {
      batches: fresh,
      total: Math.max(...fresh.map(batch => startedAt + batch.delay_ms)),
      elapsed: 0,
      actionIds: actionId ? [actionId] : [],
      messages: message ? [message] : [],
    }
  }
  stickyError = null // 新的派发成功即清上一轮拒绝保持
  if (!reactionTimer) reactionTimer = setInterval(tickReaction, REACTION_TICK_MS)
  dom.message.textContent = `${reactionNoun()} in progress...`
  dom.message.classList.remove('is-error')
  render()
}

function tickReaction() {
  if (!reaction) return
  reaction.elapsed = Math.min(reaction.total, reaction.elapsed + REACTION_TICK_MS)
  const progress = Math.round((reaction.elapsed / Math.max(1, reaction.total)) * 100)
  // 每 batch 用自己的 started_at 推进比例; 同实体跨 batch 取最大进度
  const batchRatio = batch => Math.min(1, Math.max(0, (reaction.elapsed - batch.started_at) / Math.max(1, batch.delay_ms)))
  const entityProgress = new Map()
  reaction.batches.forEach(batch => {
    const own = Math.round(batchRatio(batch) * 100)
    batch.entities.forEach(id => entityProgress.set(id, Math.max(entityProgress.get(id) ?? 0, own)))
  })
  entityProgress.forEach((own, id) => {
    const item = state[id]
    if (item?.__reaction) { item.__reaction.progress = own; item.__reaction.phase = own < 35 ? 'mixing' : own < 70 ? 'changing' : 'settling' }
  })
  interpolateReaction(state, reaction.batches, reaction.batches.map(batchRatio))
  // 到点的 batch 立即落地其不可插值效果(布尔/枚举等, 如阶梯蜡烛先后熄灭), 
  // 不等总时长后 finalize 一次性应用 - 各 batch 的 delay_ms 差异才在画面上可见; 
  // 数值/颜色字段不在其列(starts 有记录), 仍按进度插值, 由 finalize 定值
  reaction.batches.forEach(batch => {
    if (batch.applied || reaction.elapsed - batch.started_at < batch.delay_ms) return
    batch.applied = true
    batch.effects.forEach(effect => {
      if (effect.path in (batch.starts || {})) return
      applyEffect(state, effect, {})
    })
  })
  if (reaction.elapsed >= reaction.total) {
    finishReaction()
    return
  }
  // 反应中失败的派发会把 is-error 挂上消息行(commitOutcome); 进度文案接管时必须同步清掉, 
  // 否则"in progress...%"一直带错误样式直到 finishReaction(首轮复审 minor(1)) - 
  // 但拒绝保持期内(stickyError)保留拒绝原文与错误样式, 不被进度百分比淹没(07 verified minor #4)
  if (!(stickyError && Date.now() < stickyError.until)) {
    dom.message.classList.remove('is-error')
    dom.message.textContent = `${reactionNoun()} in progress... ${progress}%`
  }
  render()
}

function finishReaction() {
  clearInterval(reactionTimer)
  reactionTimer = null
  const messages = reaction ? reaction.messages : []
  if (reaction) {
    state = finalizeReaction(state, reaction.batches)
    // 记录各实体反应结果落地时刻: 边界收纳的展示宽限期由此起算(见 settleStorage)
    reaction.batches.forEach(batch => batch.entities.forEach(id => reactionSettledAt.set(id, Date.now())))
    // 合并反应的所有发起动作一并记为完成 - 被顶掉丢标记是 101 验证 BLOCKER 的另一半
    reaction.actionIds.forEach(id => completedActions.add(id))
  }
  const result = assess(ir, state)
  // 完成语后拼接派发成功文案: 延迟规则(delay_ms>0)的 success 反馈只在计时结束时呈现
// 前缀只在全局评估真正达成时给出("Experiment completed."); 中途延迟规则的完成语直接用规则
  // 自带的 success 文案 - 此前中途也拼 "实验已结束.", 与进行中的实验自相矛盾
  // (110 verified minor F3)
  const done = result.success ? `${reactionNoun()} done.` : ''
  stickyError = null
  dom.message.textContent = messages.length ? `${done} ${messages.join(' ')}`.trim() : (done || `${reactionNoun()} finished.`)
  dom.message.classList.remove('is-error')
  reaction = null
  render()
}

function finishDrag() {
  if (!dragging) return
  const actorId = dragging.id
  const start = dragging.from || null
  const actor = state[actorId]
  // 只有轻按(无明显位移)计入双击序列: 拖动后的快速再抓取是继续调整位置, 不应误触观察/确认
  const moved = Boolean(start) && Math.hypot(Number(actor.x) - start.x, Number(actor.y) - start.y) > 0.005
  if (lastTap.id === actorId) {
    lastTap.moved = moved
  }
  // 点选闸门: 轻按(无明显位移)的按-放是"选中查看", 不是拖拽 - 不吸附, 不派发动作, 不弹近距提示.
  // 否则落点恰在吸附半径内的家位点选会被静默执行为倾倒(首轮复审 MAJOR: 点选即倾倒).
  // 阈值与双击判定的轻按阈值一致(0.005 归一化坐标); 选中语义已在 pointerdown 完成, 此处无需补偿.
  if (!moved) {
    dragging = null
    return
  }
  // 候选目标: 吸附点取功能锚点(snap_anchor, 如横杆自由端), 无声明时退回器材中心.
  // 距离与落点一致地相对吸附点度量.收在器材柜里的目标不可见, 不参与吸附/近距提示.
  const candidates = targetIdsFor(actorId).map(id => ({id, state: state[id]})).filter(item => item.state && !storedEntities.has(item.id))
    .map(item => {
      const anchor = snapPointFor(item.id, item.state)
      const point = anchor || {x: Number(item.state.x), y: Number(item.state.y)}
      return {...item, anchor, point, distance: Math.hypot(point.x - Number(actor.x), point.y - Number(actor.y))}
    })
  const nearest = candidates.sort((a, b) => a.distance - b.distance)[0]
  let autoAction = null
  if (nearest && nearest.distance <= Number(scene.snap?.distance || 0.16)) {
    const entity = entityMap().get(actorId)
    const targetEntity = entityMap().get(nearest.id)
    const anchored = Boolean(nearest.anchor)
    const gap = snapGapFor(actorId, targetEntity?.kind, anchored)
    // 吸附会重写 x; 留下拖来前的 x 供手势判断倾斜方向(从哪侧拖来就往哪侧倾)
    actor.__fromX = Number(actor.x)
    const snapPrevX = Number(actor.x)
    const snapPrevY = Number(actor.y)
    // 吸附写位与拖拽路径同口径钳制: 目标停在轨道/台面边缘时锚点可能越出舞台
    // (106 案例验证 major: cart 被吸到 x=-0.115 完全移出舞台), 写位前夹回可视范围
    actor.x = clamp(nearest.point.x, 0.06, 0.94)
    actor.y = clamp(nearest.point.y + gap, 0.08, 0.92)
    // 吸附落位对宿主的最后一次位移同样要带给附件, 否则叠放装置(底座被拖动, 
    // 漏斗/植株随动)在松手瞬间会相对宿主错位吸附点两倍 gap(案例 18 首轮冒烟发现)
    moveFollowers(actorId, Number(actor.x) - snapPrevX, Number(actor.y) - snapPrevY)
    actor.above = nearest.id
    const targetLabel = entityMap().get(nearest.id)?.label || nearest.id
    dom.message.textContent = anchored && gap < 0
      ? `${entity.label} hung on ${targetLabel} on.`
      : `${entity.label} snapped onto ${targetLabel} above.`
    dom.message.classList.remove('is-error')
    // 同(器材→目标)多动作时按进度取当前应执行的(见 autoActionFor), 而非永远首个命中
    autoAction = autoActionFor(actorId, nearest.id)
  } else {
    // wasDocked 是拖拽开始时捕获的起始吸附态(dragging.wasDocked, 见 pointerdown) - 
    // 此时 actor.above 已被 pointermove 清空, 不能再作为判断依据
    const wasDocked = Boolean(dragging.wasDocked)
    actor.above = null
    actor.attached_to = null // 自由摆放 = 从宿主上取下
    const hinted = hintMissedDrop(actorId, candidates)
    // "取下"语义动作(无 target 的 place_above, 如跳线从插孔拔出): 从宿主上拖离时
    // 即使吸附不中也要派发, 让引擎重算依赖宿主关系的派生量(解调支路连通等), 
    // 否则读数滞留在取下前的状态; 本来就没吸附在宿主上(如近失/整理台面的自由落放)
    // 则不派发 - 空反馈会清掉 hintMissedDrop 刚写入的近失引导并残留空白气泡
    // (03 薄膜干涉案例第二轮验证 minor #1, 与 handleEntityKey 的 wasDocked 守卫同口径).
    const releaseAction = wasDocked && ir.actions.find(action => action.type === 'place_above' && action.actor === actorId
      && !action.target && !action.feedback_only)
    if (releaseAction) {
      dragging = null
      perform(releaseAction, {from: start})
      return
    }
    if (!hinted) hintIncompatibleDrop(actorId, Number(actor.x), Number(actor.y))
  }
  dragging = null
  if (autoAction) {
    // 倾倒/滴加类动作完成后由 post 语义回位(回位段并入手势时间线, 见 playGesture), 
    // 拖拽起点作为"从哪拿来放回哪"的家
    perform(autoAction, {from: start})
  } else {
    render()
  }
}

function tryToggleValve(entityId) {
  const action = ir.actions.find(item => item.type === 'set_valve' && item.actor === entityId)
  if (!action) return false
  perform(action)
  return true
}

// adjust 能力器材的旋转入口: 声明了 adjust_angle 动作才可旋转(能力与契约双向约束)
function adjustAngleAction(entityId) {
  const entity = ir.entities.find(item => item.id === entityId)
  if (!entity?.capabilities?.includes('adjust')) return null
  return ir.actions.find(item => item.type === 'adjust_angle' && item.actor === entityId) || null
}

// 指针相对器材中心的角度(度).世界坐标与拖拽换算互逆: x*1000, (560 - y*500); 
// 0° = 指针竖直向上, 顺时针为正(与 SVG rotate 及拨盘渲染一致)
function pointerAngleDeg(event, entityId) {
  const ctm = dom.stage.getScreenCTM()
  if (!ctm) return null
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse())
  const item = state[entityId]
  if (!item) return null
  const cx = Number(item.x) * 1000
  const cy = 560 - Number(item.y) * 500
  return (Math.atan2(point.y - cy, point.x - cx) * 180 / Math.PI + 90 + 360) % 360
}

function finishRotate() {
  if (!rotating) return
  const {id, action} = rotating
  rotating = null
  if (!action) return
  const angle = Math.round(Number(state[id]?.angle_deg || 0)) % 360
  // 以最终角度派发动作: 规则 copy_action_value 写回角度并重算派生量(如透射光强)
  perform({...action, params: {...(action.params || {}), value: angle}})
}

function tryObserve(entityId) {
  const action = ir.actions.find(item => item.type === 'observe' && (item.actor === entityId || item.target === entityId))
  if (!action) {
    dom.message.textContent = 'This apparatus does not support the observe action.'
    dom.message.classList.add('is-error')
    render()
    return
  }
  perform(action)
}

dom.stage.addEventListener('pointermove', event => {
  // 旋转拖拽: 角度实时写入 state 渲染(与平移拖拽同口径), 科学状态在松手派发时提交
  if (rotating && event.pointerId === rotating.pointerId) {
    const angle = pointerAngleDeg(event, rotating.id)
    if (angle == null) return
    let next = (rotating.baseAngle + angle - rotating.grabAngle) % 360
    if (next < 0) next += 360
    state[rotating.id].angle_deg = Math.round(next) % 360
    render()
    return
  }
  if (!dragging || event.pointerId !== dragging.pointerId) return
  // 用 SVG CTM 逆变换换算, 缩放/嵌套变换下坐标依然精确
  const ctm = dom.stage.getScreenCTM()
  if (!ctm) return
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse())
  const actor = state[dragging.id]
  const prevX = Number(actor.x)
  const prevY = Number(actor.y)
  actor.x = clamp(point.x / 1000, 0.06, 0.94)
  actor.y = clamp((560 - point.y) / 500, 0.08, 0.92)
  actor.above = null
  moveFollowers(dragging.id, Number(actor.x) - prevX, Number(actor.y) - prevY)
  render()
})
dom.stage.addEventListener('pointerup', event => {
  if (rotating && event.pointerId === rotating.pointerId) {
    finishRotate()
    return
  }
  finishDrag()
})
dom.stage.addEventListener('pointercancel', () => { rotating = null; dragging = null; render() })

dom.reset.addEventListener('click', () => {
  if (reactionTimer) clearInterval(reactionTimer)
  reactionTimer = null
  reaction = null
  // 作废进行中的手势动画并清空 fx 层
  motionRun += 1
  motionActive = false
  activeTimeline?.cancel()
  activeTimeline = null
  dom.stage.dataset.motion = 'idle'
  clearFx(dom.fx)
  state = cloneInitial(ir, scene)
  selected = null
  rotating = null
  dragging = null
  completedActions = new Set()
  actionCycle.clear()
  seedProvisioning()
  if (storageToastTimer) clearTimeout(storageToastTimer)
  dom['return-toast'].hidden = true
  dom.message.textContent = 'Experiment reset.'
  dom.message.classList.remove('is-error')
  render()
})

// 开局/重置时重建分步领取的三个集合: 器材柜清单, 台面原位快照, 收起结算游标.
// 初始位置的来源是 cloneInitial 后的 state 本身(此后用户拖动会改 state, 快照不变).
function seedProvisioning() {
  storedEntities = new Set(ir.entities.filter(entity => entity.provisioning === 'storage').map(entity => entity.id))
  initialPositions = new Map(ir.entities.map(entity => {
    const s = state[entity.id]
    return [entity.id, s ? {x: s.x, y: s.y, above: s.above ?? null, attached_to: s.attached_to ?? null} : null]
  }))
  settledStepIndex = -1
  reactionSettledAt.clear()
  if (settleGraceTimer) { clearTimeout(settleGraceTimer); settleGraceTimer = null }
}

// 动效开关: 默认跟随系统 prefers-reduced-motion(无障碍优先), 允许使用者显式开启/关闭.
// 物理演示实验里动画即教学内容(弹性形变过程), 用户应能知道"没有动画"的原因并一键恢复.
function renderMotionToggle() {
  const enabled = motionEnabled()
  dom['motion-toggle'].textContent = enabled ? 'Motion on' : 'Motion off'
  dom['motion-toggle'].setAttribute('aria-pressed', String(enabled))
  dom['motion-toggle'].title = enabled
    ? 'Gesture animation enabled (click to disable)'
    : 'Animation is currently off (following the system reduced-motion preference); click to enable'
}
dom['motion-toggle'].addEventListener('click', () => {
  setMotionOverride(!motionEnabled())
  renderMotionToggle()
})
renderMotionToggle()
// 系统偏好运行中变化时同步开关显示(未显式 override 的场合)
if (typeof matchMedia === 'function') {
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', renderMotionToggle)
}

dom['stockroom-toggle'].addEventListener('click', () => {
  const collapsed = document.querySelector('.lab-shell').classList.toggle('stockroom-collapsed')
  dom['stockroom-toggle'].setAttribute('aria-expanded', String(!collapsed))
  dom['stockroom-toggle'].setAttribute('aria-label', collapsed ? 'Expand apparatus library' : 'Collapse apparatus library')
})

dom['procedure-toggle'].addEventListener('click', () => {
  const expanded = dom.procedure.hidden
  dom.procedure.hidden = !expanded
  dom['procedure-toggle'].setAttribute('aria-expanded', String(expanded))
  dom['procedure-toggle'].textContent = expanded ? 'Collapse all steps' : 'View all steps'
})

dom['credits-open'].addEventListener('click', () => dom['credits-dialog'].showModal())
dom['credits-close'].addEventListener('click', () => dom['credits-dialog'].close())

// 连续装饰动画(节拍器摆锤 data-swing / 响声闪烁 data-pulse): renderStage 用 replaceChildren
// 整树重建节点, CSS/SMIL 动画会在每次重绘(如 50ms 反应计时, 拖拽 pointermove)时被重置, 
// 故由 rAF 每帧直接驱动 transform/opacity; 每帧重查节点以兼容整树重建.
// reduced-motion 或动效关闭时保持静态(摆锤停在手拨角度); 周期取自 data-swing/data-pulse(毫秒).
function driveAmbientAnimations() {
  if (motionEnabled()) {
    const now = performance.now()
    document.querySelectorAll('[data-swing]').forEach(node => {
      const period = Number(node.dataset.swing)
      if (period > 0) node.style.transform = `rotate(${(26 * Math.sin(2 * Math.PI * now / period)).toFixed(2)}deg)`
    })
    document.querySelectorAll('[data-pulse]').forEach(node => {
      const period = Number(node.dataset.pulse)
      if (period > 0) {
        const phase = (now % period) / period
        node.style.opacity = phase < 0.24 ? String(1 - phase / 0.24) : '0'
      }
    })
  }
  requestAnimationFrame(driveAmbientAnimations)
}
requestAnimationFrame(driveAmbientAnimations)

Promise.all([
  fetch('./public/experiment.json').then(response => { if (!response.ok) throw new Error('experiment.json missing'); return response.json() }),
  fetch('./public/scene.json').then(response => { if (!response.ok) throw new Error('scene.json missing'); return response.json() }),
  fetch('./public/assets.json').then(response => { if (!response.ok) throw new Error('assets.json missing'); return response.json() }),
]).then(([experiment, sceneData, assets]) => {
  ir = experiment
  scene = sceneData
  assetManifest = assets
  state = cloneInitial(ir, scene)
  seedProvisioning()
  dom.title.textContent = ir.experiment.title
  dom.goal.textContent = ir.experiment.goal
  dom['model-badge'].textContent = `${scene.renderer}  -  ${ir.experiment.fidelity}`
  dom['credits-list'].replaceChildren(...assetManifest.assets.map(asset => {
    const row = document.createElement('div')
    const name = document.createElement('strong')
    const source = document.createElement('span')
    name.textContent = asset.id
    source.textContent = `${asset.source.author}  -  ${asset.source.license}`
    row.append(name, source)
    return row
  }))
  render()
}).catch(error => {
  dom.title.textContent = 'Failed to load experiment'
  dom.message.textContent = error.message
  dom.message.classList.add('is-error')
})
