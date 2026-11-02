//  -  芹菜茎(带叶芹菜段, 有状态视觉) - 
// 视觉依据: frame-002/003(整段芹菜: 浅黄绿肉质茎, 白色根端, 顶部深绿羽状裂叶), 
// frame-016/021/024(插入试管后: 细长绿茎直立, 顶部锯齿叶冠, 茎中部 1~2 枚小叶), 
// frame-025/026/031(吹风时整株被吹向一侧, 叶冠偏向喷口下风侧, 叶片发暗), 
// frame-036(吹风组叶冠蔫软下垂, 塌向一侧; 对照组仍挺立).
// 风格依据: biology.js 玻璃器皿以外的 code-native 有机件画法(renderInoculationLoop 的
// 曲线描边 + renderTissueSample 的 inline 配色), 线宽/描边约定与 apparatus-shadow /
// apparatus-label 既有 class 一致; inline 配色, 不新增 styles.css class.
// 状态绑定(IR visual.state_bindings, 渲染器只读 state 字段): 
//   state.inserted=true  → 自原点以上 46px 不画(下段被管口遮住/变短, frame-016 茎下部
//                          没入管内); 场景需把插入后的茎实体原点置于管口下方约 46px
//                          (管内, 即试管的 renderSealableTestTube 局部 y≈-52+46=-6 处), 
//                          可见茎段恰好自管口/封口膜收拢处起(拼合冒烟已验证)
//   state.airflow=true   → 茎顶向 -x 侧偏摆 58px, 叶冠整体同向旋转 42°(frame-025 植株
//                          被吹离喷口; 本案例喷口在植株右侧 → 缺省向左); 可选
//                          state.airflow_dir(+1/-1)覆盖风向, 缺省 -1
//   state.turgor_pct     → 100=挺立; ≤85 完全萎蔫(frame-036): 茎顶塌落 62px, 叶冠下垂
//                          旋转, 各羽叶向两侧下方瘫倒 75°, 茎叶配色转暗橄榄
//   wiltT = clamp((100 - turgor_pct)/15, 0, 1), turgor_pct 缺省按 100(挺立)
// 导出签名沿用既有模块先例: export function renderPlantStem(entity, state) 返回 SVG group; 
// svg()/add()/label()/shadow() 在模块内自含最小实现(不 import biology.js, 避免改动既有文件).

const NS = 'http://www.w3.org/2000/svg'

function svg(tag, attributes = {}) {
  const node = document.createElementNS(NS, tag)
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value))
  })
  return node
}

function add(parent, ...children) {
  children.flat().filter(Boolean).forEach(child => parent.append(child))
  return parent
}

function label(content, x, y, className = 'apparatus-label') {
  const node = svg('text', {x, y, class: className, 'text-anchor': 'middle'})
  node.textContent = content
  return node
}

function shadow(cx = 0, cy = 0, rx = 28, ry = 7) {
  return svg('ellipse', {cx, cy, rx, ry, class: 'apparatus-shadow'})
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0))
}

// 健康绿 → 萎蔫暗橄榄(frame-031/036 萎蔫叶色发暗)
function mixColor(from, to, t) {
  const parse = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  const a = parse(from)
  const b = parse(to)
  const channel = (i) => Math.round(a[i] + (b[i] - a[i]) * t).toString(16).padStart(2, '0')
  return `#${channel(0)}${channel(1)}${channel(2)}`
}

// 锯齿状小叶(frame-002/016 芹菜羽状裂叶的锯齿边缘), 起点在叶柄端, 指向 +x
function leafletPath(len, width) {
  const f = (k) => (len * k).toFixed(1)
  const w = (k) => (width * k).toFixed(1)
  return 'M0 0' +
    `Q${f(0.22)} ${w(-1)} ${f(0.4)} ${w(-0.85)}` +
    `L${f(0.5)} ${w(-0.2)}L${f(0.62)} ${w(-0.95)}L${f(0.74)} ${w(-0.3)}` +
    `L${f(0.86)} ${w(-0.8)}L${f(1)} 0` +
    `L${f(0.86)} ${w(0.8)}L${f(0.74)} ${w(0.3)}L${f(0.62)} ${w(0.95)}L${f(0.5)} ${w(0.2)}` +
    `Q${f(0.22)} ${w(1)} 0 0Z`
}

// 一片羽状复叶(沿中脉交替上下布置锯齿小叶, 向叶尖渐小)
function frondGroup(length, leafFill, leafStroke) {
  const group = svg('g')
  add(group, svg('path', {
    d: `M0 0L${length.toFixed(1)} 0`,
    stroke: leafStroke, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round',
  }))
  const count = 5
  for (let index = 0; index < count; index += 1) {
    const t = 0.18 + 0.8 * (index / (count - 1))
    const leafletLen = length * (0.36 - 0.17 * (index / (count - 1)))
    const x = length * t
    add(group, svg('path', {
      d: leafletPath(leafletLen, leafletLen * 0.34),
      fill: leafFill, stroke: leafStroke, 'stroke-width': 0.5,
      transform: `translate(${x.toFixed(1)} 0) rotate(${-38 - index * 6})`,
    }))
    if (index < count - 1) {
      add(group, svg('path', {
        d: leafletPath(leafletLen * 0.9, leafletLen * 0.31),
        fill: leafFill, stroke: leafStroke, 'stroke-width': 0.5,
        transform: `translate(${(x + 2).toFixed(1)} 0) rotate(${38 + index * 6})`,
      }))
    }
  }
  return group
}

export function renderPlantStem(entity, state = {}) {
  const group = svg('g')
  const inserted = Boolean(state.inserted)
  const airflow = Boolean(state.airflow)
  const wiltT = clamp01((100 - Number(state.turgor_pct ?? 100)) / 15)
  const airT = airflow ? 1 : 0
  const dir = Number(state.airflow_dir) === 1 ? 1 : -1  // 风向: 缺省 -1(喷口在右, 吹向左, frame-025)

  // 茎顶位置: 挺立 (6,-150); 萎蔫塌落 62px 并向风向侧倒 14px; 吹风再偏 58px, 压低 18px
  const topX = 6 + dir * (14 * wiltT + 58 * airT)
  const topY = -150 + 62 * wiltT + 18 * airT
  const ctrlX = 4 + dir * (5 * wiltT + 26 * airT)
  const ctrlY = -78

  const stalkFill = mixColor('#a5cb72', '#93a968', wiltT)
  const stalkShade = mixColor('#7ba651', '#6f8350', wiltT)
  const stalkLight = mixColor('#cfe7a6', '#bac48f', wiltT)
  const leafFill = mixColor('#5d9a41', '#8f9c60', wiltT)
  const leafStroke = mixColor('#3e7a2c', '#66733f', wiltT)

  const baseY = inserted ? -46 : 4  // 插入后下段 46px 被管口遮住(frame-016)
  const q = (t) => ({
    x: (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * ctrlX + t * t * topX,
    y: (1 - t) * (1 - t) * baseY + 2 * (1 - t) * t * ctrlY + t * t * topY,
  })

  add(group,
    shadow(0, 6, 30, 5),
    // 肉质茎(二次曲线主茎 + 明暗双脊线, frame-002 茎面纵沟)
    svg('path', {
      d: `M0 ${baseY.toFixed(1)}Q${ctrlX.toFixed(1)} ${ctrlY} ${topX.toFixed(1)} ${topY.toFixed(1)}`,
      stroke: stalkFill, 'stroke-width': 6.5, fill: 'none', 'stroke-linecap': 'round',
    }),
    svg('path', {
      d: `M-1 ${baseY.toFixed(1)}Q${(ctrlX - 1.5).toFixed(1)} ${ctrlY} ${(topX - 1.5).toFixed(1)} ${(topY + 4).toFixed(1)}`,
      stroke: stalkLight, 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round', opacity: 0.9,
    }),
    svg('path', {
      d: `M2 ${baseY.toFixed(1)}Q${(ctrlX + 2).toFixed(1)} ${ctrlY} ${(topX + 2).toFixed(1)} ${(topY + 5).toFixed(1)}`,
      stroke: stalkShade, 'stroke-width': 1.2, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8,
    }),
  )
  if (!inserted) {
    // 未插入: 白色根端/切端(frame-002/003)
    add(group,
      svg('ellipse', {cx: 0, cy: baseY, rx: 4.2, ry: 2.6, fill: '#dfe9c2', stroke: '#9dba72', 'stroke-width': 0.7}),
      svg('path', {d: 'M-2 5Q-4 10-6 12M0 6Q0 11 1 14M2 5Q4 9 6 11', stroke: '#cfdcb0', 'stroke-width': 1, fill: 'none', 'stroke-linecap': 'round'}),
    )
  }

  // 茎中部小叶(frame-016 茎上段两侧各一枚小羽叶), 萎蔫时向同侧瘫倒
  const petioles = [
    {t: 0.52, angle: -146, len: 34},
    {t: 0.74, angle: -34, len: 30},
  ]
  petioles.forEach((petiole) => {
    const point = q(petiole.t)
    const droop = (petiole.angle < -90 ? -1 : 1) * 58 * wiltT
    const holder = svg('g', {
      transform: `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) rotate(${(petiole.angle + droop).toFixed(1)})`,
    })
    add(holder, frondGroup(petiole.len * (1 - 0.12 * wiltT), leafFill, leafStroke))
    group.append(holder)
  })

  // 顶部叶冠: 4 片羽叶呈放射状(frame-016/021 锯齿叶冠); 吹风整体同向偏摆, 萎蔫逐片下垂
  const crown = svg('g', {transform: `translate(${topX.toFixed(1)} ${topY.toFixed(1)}) rotate(${(dir * (14 * wiltT + 42 * airT)).toFixed(1)})`})
  const fronds = [
    {angle: -132, len: 50},
    {angle: -98, len: 62},
    {angle: -62, len: 57},
    {angle: -24, len: 43},
  ]
  fronds.forEach((frond) => {
    const droop = (frond.angle < -90 ? -1 : 1) * 75 * wiltT
    const holder = svg('g', {transform: `rotate(${(frond.angle + droop).toFixed(1)})`})
    add(holder, frondGroup(frond.len * (1 - 0.1 * wiltT), leafFill, leafStroke))
    crown.append(holder)
  })
  group.append(crown)

  // 标签置于叶冠上方外侧(避开插入后的试管与台面道具)
  const labelY = Math.min(-186, topY - 96)
  group.append(label(entity.label, 0, labelY))
  return group
}
