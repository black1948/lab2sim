export function cloneInitial(ir, scene = null) {
  const isPhysics = ir.experiment?.domain === 'physics'
  const isBiology = ir.experiment?.domain === 'biology'
  const isCircuits = ir.experiment?.domain === 'circuits'
  return Object.fromEntries(ir.entities.map(entity => {
    const transform = scene?.entities?.[entity.id]?.transform || entity.position
    const base = isPhysics
      ? {x: transform.x, y: transform.y, visible: true, tension_n: 0, extension: 0, angle_deg: 0, force_n: 0, arrow_length: 0, arrow_angle: 0, force_x: 0, force_y: 0, displacement: 0, velocity: 0, connected_to: null, above: null, attached_to: null, flash: null}
      : isBiology
      ? {x: transform.x, y: transform.y, visible: true, sterilized: false, colony_count: 0, contaminated: false, growth_stage: 'none', incubation_temp: 0, incubation_time_h: 0, sealed: false, observed: false, volume_ml: 0, delivered_ml: 0, drops: 0, color: null, above: null, attached_to: null, flash: null}
      : isCircuits
      ? {x: transform.x, y: transform.y, visible: true, above: null, attached_to: null, flash: null}
      : {x: transform.x, y: transform.y, visible: true, volume_ml: 0, delivered_ml: 0, drops: 0, valve_open: false, color: '#55b9cf', above: null, attached_to: null, ...(ir.initial_state[entity.id] || {})}
    return [entity.id, {...base, ...(ir.initial_state[entity.id] || {})}]
  }))
}

export function getPath(state, path) {
  const [entity, ...parts] = path.split('.')
  return parts.reduce((value, part) => value?.[part], state[entity])
}

function compare(actual, condition) {
  const expected = condition.value
  if (condition.op === 'eq') return actual === expected
  if (condition.op === 'neq') return actual !== expected
  if (condition.op === 'gt') return Number(actual) > Number(expected)
  if (condition.op === 'gte') return Number(actual) >= Number(expected)
  if (condition.op === 'lt') return Number(actual) < Number(expected)
  if (condition.op === 'lte') return Number(actual) <= Number(expected)
  if (condition.op === 'between') return Array.isArray(expected) && Number(actual) >= Number(expected[0]) && Number(actual) <= Number(expected[1])
  return false
}

function setPath(state, path, value) { const [entity, field] = path.split('.'); if (state[entity] && field) state[entity][field] = value }

export function applyEffect(state, effect, action) {
  const old = getPath(state, effect.path)
  const value = effect.op === 'add_action_value' ? Number(action.params?.value ?? action.params?.amount ?? action.params?.volume_ml ?? 0) : effect.op === 'copy_action_value' ? action.params?.value : effect.value
  if (effect.op === 'set' || effect.op === 'copy_action_value') setPath(state, effect.path, value)
  else if (effect.op === 'add' || effect.op === 'add_action_value') setPath(state, effect.path, Number(old || 0) + Number(value || 0))
  else if (effect.op === 'endpoint_color') {
    const amount = Number(getPath(state, `${effect.path.split('.')[0]}.delivered_ml`) || 0)
    const endpoint = Number(effect.params?.endpoint_ml || 0), tolerance = Number(effect.params?.tolerance_ml || 0)
    setPath(state, effect.path, Math.abs(amount - endpoint) <= tolerance ? '#f8b4d9' : amount > endpoint ? '#e578b8' : '#bde8ef')
  }
  else if (effect.op === 'colony_growth') {
    const current = Number(getPath(state, effect.path) || 0)
    setPath(state, effect.path, current + Number(effect.params?.count || 1))
  }
  else if (effect.op === 'contamination_check') {
    const source = Boolean(getPath(state, String(effect.params?.source_path || '')))
    setPath(state, effect.path, source)
  }
  else if (effect.op === 'sterilization_state') {
    setPath(state, effect.path, Boolean(effect.params?.value))
  }
  else if (effect.op === 'growth_stage_update') {
    const trigger = Number(getPath(state, String(effect.params?.trigger || '')) || 0)
    const stages = Array.isArray(effect.params?.stages) ? effect.params.stages : []
    const at = Array.isArray(effect.params?.at) ? effect.params.at.map(Number) : []
    let stage = 'none'
    for (let i = at.length - 1; i >= 0; i--) {
      if (trigger >= at[i]) { stage = stages[i] || 'none'; break }
    }
    setPath(state, effect.path, stage)
  }
  else if (effect.op === 'set_tension') {
    setPath(state, effect.path, Number(effect.params?.value || 0))
  }
  else if (effect.op === 'extension_update') {
    const ext = Math.max(0, Math.min(1, Number((effect.params?.value ?? effect.params?.extension) || 0)))
    setPath(state, effect.path, ext)
  }
  else if (effect.op === 'update_force_arrow') {
    const magnitude = Number((effect.params?.value ?? effect.params?.magnitude) || 0)
    const angle = Number(effect.params?.angle_deg || 0)
    const entity = String(effect.path).split('.')[0]
    setPath(state, `${entity}.force_n`, magnitude)
    setPath(state, `${entity}.arrow_length`, magnitude)
    setPath(state, `${entity}.arrow_angle`, angle)
    setPath(state, `${entity}.angle_deg`, angle)
  }
  else if (effect.op === 'decompose_force') {
    const magnitude = Number(effect.params?.magnitude || 0)
    const angle = Number(effect.params?.angle_deg || 0)
    const rad = angle * Math.PI / 180
    const entity = String(effect.path).split('.')[0]
    setPath(state, `${entity}.force_x`, magnitude * Math.cos(rad))
    setPath(state, `${entity}.force_y`, magnitude * Math.sin(rad))
  }
  else if (effect.op === 'force_balance_check') {
    const fx = Number(getPath(state, String(effect.params?.force_x_path || '')) || 0)
    const fy = Number(getPath(state, String(effect.params?.force_y_path || '')) || 0)
    const tolerance = Number(effect.params?.tolerance || 0.01)
    setPath(state, effect.path, Math.abs(fx) <= tolerance && Math.abs(fy) <= tolerance)
  }
  // 光的偏振(12 案例): 马吕斯定律定性演示.理想偏振片对自然光透过 1/2, 
  // 第二片再乘 cos²(Δθ)(Δθ 为两透振方向夹角, mod 180° 自动成立, cos² 偶函数).
  // inserted1/2_path 缺省或为假时该片视作不在光路中, 不衰减; 结果为 0..i0 的相对光强.
  else if (effect.op === 'malus_intensity') {
    const params = effect.params || {}
    const i0 = Number(params.i0 ?? 1)
    const a1 = Number(getPath(state, String(params.angle1_path || '')) || 0)
    const a2 = Number(getPath(state, String(params.angle2_path || '')) || 0)
    const in1 = params.inserted1_path != null ? Boolean(getPath(state, String(params.inserted1_path))) : false
    const in2 = params.inserted2_path != null ? Boolean(getPath(state, String(params.inserted2_path))) : false
    let intensity = i0
    if (in1) intensity *= 0.5
    if (in2) {
      const rad = (a1 - a2) * Math.PI / 180
      intensity *= Math.cos(rad) * Math.cos(rad)
    }
    setPath(state, effect.path, Math.max(0, Math.min(i0, intensity)))
  }
  // 反相比例运算放大电路(29 案例): Uo = -(Rf/R1) - Ui.
  // gates 为状态路径清单(供电/R1/Rf/输入支路等接线标志), 全部为真才放大, 否则输出 0; 
  // r1_ohms/rf_ohms 取实际阻值(含容差取样, 复现视频实测增益 ≈ -11); 输出限幅 ±rail_v 并置 saturated.
  // gain_actual 为该实际阻值下的增益(供电且接线完成时非空, 供检查器展示).
  else if (effect.op === 'opamp_output') {
    const params = effect.params || {}
    const gates = Array.isArray(params.gates) ? params.gates : []
    const ready = gates.every(gate => Boolean(getPath(state, String(gate))))
    const ui = Number(getPath(state, String(params.ui_path || '')) || 0)
    const r1 = Number(params.r1_ohms || 10000)
    const rf = Number(params.rf_ohms || 100000)
    const rail = Number(params.rail_v || 13.5)
    const entity = String(effect.path).split('.')[0]
    const gain = -(rf / r1)
    if (ready) {
      const raw = gain * ui
      setPath(state, effect.path, Math.max(-rail, Math.min(rail, raw)))
      setPath(state, `${entity}.saturated`, Math.abs(raw) > rail)
      setPath(state, `${entity}.gain_actual`, gain)
    } else {
      setPath(state, effect.path, 0)
      setPath(state, `${entity}.saturated`, false)
      setPath(state, `${entity}.gain_actual`, null)
    }
  }
  // AM 调幅与解调(BCT-01 案例): 已调波 v(t)=Ec - (1+m - sinωs t) - sinωc t, m=Es/Ec.
  // 面板三个调节量均以 angle_deg 归一化读入(键盘/旋转直接操纵写入 ±[0,360), 此处折返 [-180,180)
  // 并按机械行程 clamp): PT2 消息幅度 Vpp∈[1,13](内部定标 Es=0.1×Vpp, 由 frame-008 消息 5.07Vpp
  // 与 frame-016 m≈0.39, Ec≈1.285V 联合反推); PT3 载波幅度 Ec∈[0.87,1.7]V(默认 1.285V=frame-016
  // 载波带 2.57Vpp 之半); 频率选择开关三档 [-60,0,60]°→20/200/1996.8Hz(2kHz 档取 frame-008 实测).
  // 包络检波解调输出 Vpp=2Es; 解调支路通断由 patched_path(patch-1.above)实时比对
  // patched_value(zone-am-ip)推导 - 跳线被自由拖开时无需规则即自动失效率, 避免状态滞留.
  // Es>Ec 时过调制置 distorted.
  else if (effect.op === 'am_modulation') {
    const params = effect.params || {}
    const entity = String(effect.path).split('.')[0]
    const normalize = deg => {
      let a = ((Number(deg) || 0) % 360 + 360) % 360
      if (a > 180) a -= 360
      return a
    }
    const msgAngle = Math.max(-90, Math.min(90, normalize(getPath(state, String(params.message_amp_angle_path || '')) || 0)))
    const carrierAngle = Math.max(-90, Math.min(90, normalize(getPath(state, String(params.carrier_amp_angle_path || '')) || 0)))
    const selectorAngle = normalize(getPath(state, String(params.selector_angle_path || '')) || 0)
    const detentFreqs = Array.isArray(params.detent_freqs) ? params.detent_freqs : [20, 200, 1996.8]
    const detents = [-60, 0, 60]
    const nearest = detents.reduce((best, d) => (Math.abs(selectorAngle - d) < Math.abs(selectorAngle - best) ? d : best), detents[0])
    const freqHz = detentFreqs[detents.indexOf(nearest)]
    const messageVpp = 1 + ((msgAngle + 90) / 180) * 12
    const es = 0.1 * messageVpp
    const ec = 1.285 + (carrierAngle / 90) * 0.415
    const patched = params.patched_path
      ? String(getPath(state, String(params.patched_path)) ?? '') === String(params.patched_value ?? '')
      : false
    const round = v => Math.round(v * 1000) / 1000
    setPath(state, `${entity}.message_freq_hz`, freqHz)
    setPath(state, `${entity}.message_amp_vpp`, round(messageVpp))
    setPath(state, `${entity}.es_v`, round(es))
    setPath(state, `${entity}.ec_v`, round(ec))
    setPath(state, `${entity}.v_max`, round(ec + es))
    setPath(state, `${entity}.v_min`, round(ec - es))
    setPath(state, effect.path, round(es / ec))
    setPath(state, `${entity}.am_vpp`, round(2 * ec))
    setPath(state, `${entity}.demod_patched`, patched)
    setPath(state, `${entity}.demod_vpp`, patched ? round(2 * es) : 0)
    setPath(state, `${entity}.distorted`, es > ec)
  }
  // 三角桁架力的分解(06 案例): θ = 斜杆与横杆夹角, 砝码重 G(load_g, 单位 G).
  // 悬挂点汇交平衡按二力杆分解: 沿斜杆分力 G₁ = G/sinθ(斜杆受拉), 沿横杆分力 G₂ = G/tanθ(横杆受压).
  // angle_path/loaded_path 为状态路径; 同时把 G₁/G₂/G 三个力箭头写入状态, 
  // 合力箭头携带 para1/para2(长度, 角度)供平行四边形虚线作图, 与分力箭头共用同一 px 缩放.
  else if (effect.op === 'truss_strut_load') {
    const params = effect.params || {}
    const angle = Number(getPath(state, String(params.angle_path || '')) || 30)
    const loaded = params.loaded_path ? Boolean(getPath(state, String(params.loaded_path))) : true
    const load = Number(params.load_g ?? 1)
    const entity = String(effect.path).split('.')[0]
    const rad = angle * Math.PI / 180
    const sin = Math.abs(Math.sin(rad)) < 0.05 ? 0.05 * Math.sign(Math.sin(rad) || 1) : Math.sin(rad)
    const tan = Math.abs(Math.tan(rad)) < 0.05 ? 0.05 * Math.sign(Math.tan(rad) || 1) : Math.tan(rad)
    const g1 = loaded ? load / sin : 0
    const g2 = loaded ? load / tan : 0
    const r2 = value => Math.round(value * 100) / 100
    setPath(state, `${entity}.incline_tension_g`, r2(g1))
    setPath(state, `${entity}.horizontal_compression_g`, r2(g2))
    if (params.incline_arrow) {
      setPath(state, `${params.incline_arrow}.force_n`, r2(g1))
      setPath(state, `${params.incline_arrow}.arrow_length`, r2(g1))
      setPath(state, `${params.incline_arrow}.arrow_angle`, -angle)
      setPath(state, `${params.incline_arrow}.angle_deg`, -angle)
    }
    if (params.horizontal_arrow) {
      setPath(state, `${params.horizontal_arrow}.force_n`, r2(g2))
      setPath(state, `${params.horizontal_arrow}.arrow_length`, r2(g2))
      setPath(state, `${params.horizontal_arrow}.arrow_angle`, 180)
      setPath(state, `${params.horizontal_arrow}.angle_deg`, 180)
    }
    if (params.resultant_arrow) {
      const resultant = String(params.resultant_arrow)
      setPath(state, `${resultant}.force_n`, r2(load))
      setPath(state, `${resultant}.arrow_length`, r2(load))
      setPath(state, `${resultant}.arrow_angle`, -90)
      setPath(state, `${resultant}.angle_deg`, -90)
      setPath(state, `${resultant}.para1_len`, r2(g1))
      setPath(state, `${resultant}.para1_angle`, -angle)
      setPath(state, `${resultant}.para2_len`, r2(g2))
      setPath(state, `${resultant}.para2_angle`, 180)
    }
  }
  // 布氏硬度测试(01 案例): HB = 0.102 - 2F/(πD(D−√(D²−d²))), 压痕直径 d 取两次显微镜读数的平均.
  // d1_path/d2_path 为 "entityId.field" 状态路径(两次测量值), force_n 为试验力, ball_mm 为压头球直径 D.
  // 读数无效(d≤0 或 d≥D)时输出 0, 不给出误导性硬度值; mean_d_mm 同步写给检查器展示.
  else if (effect.op === 'brinell_hardness') {
    const params = effect.params || {}
    const d1 = Number(getPath(state, String(params.d1_path || '')) || 0)
    const d2 = Number(getPath(state, String(params.d2_path || '')) || 0)
    const force = Number(params.force_n || 0)
    const ball = Number(params.ball_mm || 10)
    const entity = String(effect.path).split('.')[0]
    const meanD = (d1 + d2) / 2
    const root = ball * ball - meanD * meanD
    const denom = meanD > 0 && meanD < ball && root > 0 ? Math.PI * ball * (ball - Math.sqrt(root)) : 0
    const hb = denom > 0 ? (0.102 * 2 * force) / denom : 0
    setPath(state, effect.path, Math.round(hb * 10) / 10)
    setPath(state, `${entity}.mean_d_mm`, Math.round(meanD * 1000) / 1000)
  }
}

export function dispatch(ir, previous, action) {
  const state = structuredClone(previous), matching = ir.rules.filter(rule => rule.on === action.id)
  if (!matching.length) return {state, message: `Action ${action.id} is not modeled.`, ok: false, pending: null}
  // 同一动作的上下文规则(如调焦时环口未覆盖/已覆盖两种分支)只输出命中分支的文案; 
  // 全部未命中时才汇总未命中规则的 failure 文案(说明动作为何未生效), 不再与成功文案拼接.
  let ok = false; const successes = []; const failures = []; const pending = []
  // 延时批次的动作相关算子(add_action_value/copy_action_value)在入队时即物化为
  // add/set 具体数值: reactionStarts/tickReaction/finalizeReaction 只认 set/add, 
  // 且批内重放用空 action 上下文 - 不物化的动作值会在结算时丢失(加 0, 验证组阻断缺陷).
  // 立即 effects 不经此转换, 保持与 v1.1 语义逐字一致.
  const materialize = effect => {
    if (effect.op === 'add_action_value') return {...effect, op: 'add', value: Number(action.params?.value ?? action.params?.amount ?? action.params?.volume_ml ?? 0)}
    if (effect.op === 'copy_action_value') return {...effect, op: 'set', value: action.params?.value}
    return effect
  }
  matching.forEach(rule => { const passed = rule.conditions.every(condition => compare(getPath(state, condition.path), condition)); if (!passed) { failures.push(rule.feedback.failure) } else { ok = true; rule.effects.forEach(effect => applyEffect(state, effect, action)); successes.push(rule.feedback.success); if (Array.isArray(rule.result_effects) && rule.result_effects.length && rule.delay_ms > 0) { const effects = rule.result_effects.map(materialize); const entities = [...new Set(effects.map(effect => String(effect.path).split('.')[0]))]; entities.forEach(id => { if (state[id]) state[id].__reaction = {running: true, progress: 0, phase: 'mixing'} }); pending.push({delay_ms: rule.delay_ms, effects, entities}) } } })
  const messages = ok ? successes : failures
  return {state, message: messages.filter(Boolean).join(' '), ok, pending: pending.length ? pending : null}
}

export function finalizeReaction(state, pending) {
  // 只为 starts 登记过的可插值字段写入终值(span.to): 布尔/枚举效果已在批次边界应用过
  // (app.js tickReaction), 且不能用 applyEffect 重放 - 'add' 的终值是 from+增量, 
  // 再按增量应用一次会双重扣减(14 案例验证组阻断缺陷)
  pending.forEach(batch => {
    Object.entries(batch.starts || {}).forEach(([path, span]) => {
      if (span && typeof span === 'object') setPath(state, path, span.to)
    })
    batch.entities.forEach(id => { if (state[id]) delete state[id].__reaction })
  })
  return state
}

export function assess(ir, state) {
  const failed = ir.assessment.failure_conditions.find(condition => compare(getPath(state, condition.path), condition))
  if (failed) return {success: false, failure: failed.message || 'Assessment failure condition reached.'}
  return {success: ir.assessment.success_conditions.length > 0 && ir.assessment.success_conditions.every(condition => compare(getPath(state, condition.path), condition))}
}
