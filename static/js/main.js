/* ============================================================
   Lab2Sim project page — interactions
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- nav + scroll progress ---------------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 24);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- hero canvas: drifting molecules ---------------- */
  const canvas = $("#heroCanvas");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let W, H, dpr, atoms = [];
    const N = 64, LINK = 130;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      atoms = [];
      for (let i = 0; i < N; i++) {
        atoms.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1.4 + Math.random() * 2.4,
          hue: Math.random() < 0.16 ? "amber" : Math.random() < 0.5 ? "cyan" : "teal",
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      // bonds
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = atoms[i], b = atoms[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const alpha = (1 - Math.sqrt(d2) / LINK) * 0.16;
            ctx.strokeStyle = "rgba(90, 200, 220," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // atoms
      for (const a of atoms) {
        const c = a.hue === "amber" ? "rgba(255,180,84," : a.hue === "cyan" ? "rgba(76,195,255," : "rgba(53,224,212,";
        ctx.fillStyle = c + "0.75)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c + "0.12)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r * 3.4, 0, Math.PI * 2); ctx.fill();
        a.x += a.vx; a.y += a.vy;
        if (a.x < -20) a.x = W + 20; if (a.x > W + 20) a.x = -20;
        if (a.y < -20) a.y = H + 20; if (a.y > H + 20) a.y = -20;
      }
      requestAnimationFrame(tick);
    }
    resize(); init();
    window.addEventListener("resize", () => { resize(); init(); });
    requestAnimationFrame(tick);
  }

  /* ---------------- hero typer ---------------- */
  const typerEl = $("#typer");
  const PHRASES = [
    "218 videos \u2192 11,881 executable rubric items",
    "compile the procedure into a state machine M=(S, A, \u03A6)",
    "\u03A6 blocks every step whose precondition fails",
    "verify in a browser \u00B7 repair \u00B7 repeat (\u03B8 = 0.8)",
    "apparatus fidelity +24.15 points",
  ];
  if (typerEl && !reduced) {
    let p = 0, c = 0, del = false;
    (function type() {
      const phrase = PHRASES[p];
      typerEl.textContent = phrase.slice(0, c);
      if (!del && c < phrase.length) { c++; setTimeout(type, 34 + Math.random() * 40); }
      else if (!del) { del = true; setTimeout(type, 1900); }
      else if (c > 0) { c--; setTimeout(type, 14); }
      else { del = false; p = (p + 1) % PHRASES.length; setTimeout(type, 350); }
    })();
  } else if (typerEl) {
    typerEl.textContent = PHRASES[0];
  }

  /* ---------------- reveal on scroll ---------------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------------- spotlight cards ---------------- */
  $$(".spot").forEach((el) => {
    el.addEventListener("pointermove", (ev) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (ev.clientX - r.left) + "px");
      el.style.setProperty("--my", (ev.clientY - r.top) + "px");
    });
  });

  /* ---------------- animated counters ---------------- */
  function fmt(v, el) {
    const dec = parseInt(el.dataset.decimals || "0", 10);
    let s = v.toFixed(dec);
    if (el.dataset.format === "comma") s = Number(s).toLocaleString("en-US");
    return (el.dataset.prefix || "") + s + (el.dataset.suffix || "");
  }
  const counterIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      counterIO.unobserve(e.target);
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const dur = 1400, t0 = performance.now();
      (function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(target * eased, el);
        if (k < 1) requestAnimationFrame(step);
        else el.textContent = fmt(target, el);
      })(t0);
    }
  }, { threshold: 0.6 });
  $$(".count").forEach((el) => counterIO.observe(el));

  /* ---------------- demo videos: sync-free lazy autoplay ---------------- */
  const demoVideos = $$(".video-frame video");
  if ("IntersectionObserver" in window && demoVideos.length) {
    const vio = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.play().catch(() => {}); }
        else { e.target.pause(); }
      }
    }, { threshold: 0.35 });
    demoVideos.forEach((v) => vio.observe(v));
  }

  /* ---------------- pipeline terminal ---------------- */
  const pipeOut = $("#pipeOut");
  const pipeStatus = $("#pipeStatus");
  const pipeStats = $("#pipeStats");
  const pipeLed = $("#pipeLed");
  const LINES = [
    { cls: "t-cmd", text: "eduvideo2code --video molecular_motion.mp4" },
    { cls: "", text: "" },
    { cls: "t-stage", text: "[HPE] ", plain: "pass 1 \u00B7 phases: setup \u2192 combine \u2192 cover \u2192 observe \u00B7 apparatus: 6 identified" },
    { cls: "t-stage", text: "[HPE] ", plain: "pass 2 \u00B7 re-inspecting 2 marked segments at 4\u00D7 density \u00B7 liquid levels, connections" },
    { cls: "t-stage", text: "[HPE] ", plain: "procedure P extracted: 7 steps \u00B7 23 state transitions \u00B7 every step cites frames" },
    { cls: "", text: "" },
    { cls: "t-stage", text: "[SMG] ", plain: "compile M = (S, A, \u03A6): 19 states \u00B7 7 operations \u00B7 7 preconditions" },
    { cls: "t-stage", text: "[SMG] ", plain: "science doc + layout doc + asset list written \u00B7 assets: 6 (2 code-drawn, 4 attributed)" },
    { cls: "t-stage", text: "[SMG] ", plain: "page generated \u2014 each operation becomes a gesture: drag \u00B7 pour \u00B7 cover" },
    { cls: "", text: "" },
    { cls: "t-stage", text: "[EBV] ", plain: "round 1 \u00B7 score " , val: "0.47", plain2: " \u00B7 ", verdict: "\u2717", note: " apparatus: large beaker missing \u00B7 step 'cover the beaker' not executable" },
    { cls: "t-dim", text: "      repair \u2192 re-search asset 'large beaker' \u00B7 revise operation binding" },
    { cls: "t-stage", text: "[EBV] ", plain: "round 2 \u00B7 score ", val: "0.71", plain2: " \u00B7 ", verdict: "\u2717", note: " covering before combining is not blocked" },
    { cls: "t-dim", text: "      repair \u2192 add precondition \u03A6(cover) = combined \u00B7 feedback message" },
    { cls: "t-stage", text: "[EBV] ", plain: "round 3 \u00B7 score ", val: "0.86", plain2: " \u00B7 ", verdict: "\u2713", ok: true, note: " accepted (\u03B8 = 0.8) \u00B7 apparatus matches video \u00B7 states match evidence" },
    { cls: "", text: "" },
    { cls: "t-ok", text: "\u2713 virtual experiment accepted after 3 repair rounds \u00B7 try it above \u2191" },
  ];

  let pipeTimer = null, pipeRunning = false;
  function runPipeline() {
    if (!pipeOut) return;
    if (pipeTimer) { clearTimeout(pipeTimer); pipeTimer = null; }
    pipeOut.innerHTML = "";
    pipeStatus.textContent = "compiling";
    pipeLed.classList.add("busy");
    pipeStats.textContent = "";
    pipeRunning = true;

    let li = 0;
    function nextLine() {
      if (li >= LINES.length) {
        pipeStatus.textContent = "accepted";
        pipeLed.classList.remove("busy");
        pipeStats.textContent = "\u03B8 = 0.8 \u00B7 Tmax = 10 \u00B7 avg 5.3 rounds";
        pipeRunning = false;
        return;
      }
      const L = LINES[li++];
      const span = document.createElement("span");
      span.className = "ln " + L.cls;
      const line = document.createElement("span");
      if (L.cls === "t-cmd") {
        line.className = "t-cmd"; line.textContent = L.text;
        span.appendChild(line);
      } else {
        if (L.text) { const s = document.createElement("span"); s.className = L.cls; s.textContent = L.text; span.appendChild(s); }
        if (L.plain) { const s = document.createElement("span"); s.className = "t-note"; s.textContent = L.plain; span.appendChild(s); }
        if (L.val) { const s = document.createElement("span"); s.className = L.val.startsWith("0.8") ? "t-ok" : "t-val"; s.textContent = L.val; span.appendChild(s); }
        if (L.plain2) { const s = document.createElement("span"); s.className = "t-note"; s.textContent = L.plain2; span.appendChild(s); }
        if (L.verdict) { const s = document.createElement("span"); s.className = L.ok ? "t-ok" : "t-bad"; s.textContent = L.verdict; span.appendChild(s); }
        if (L.note) { const s = document.createElement("span"); s.className = "t-dim"; s.textContent = L.note; span.appendChild(s); }
      }
      const cursor = document.createElement("span"); cursor.className = "cursor";
      span.appendChild(cursor);
      pipeOut.appendChild(span);
      pipeOut.scrollTop = pipeOut.scrollHeight;
      const isCmd = L.cls === "t-cmd";
      const isRound = L.plain && L.plain.startsWith("round");
      pipeTimer = setTimeout(nextLine, reduced ? 0 : isCmd ? 800 : isRound ? 1350 : 520);
    }
    nextLine();
  }

  const pipeIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !pipeRunning) { runPipeline(); pipeIO.unobserve(e.target); }
    }
  }, { threshold: 0.35 });
  if (pipeOut) {
    pipeIO.observe(pipeOut.closest(".pipeline"));
    $("#pipeReplay").addEventListener("click", runPipeline);
  }

  /* ---------------- lightbox ---------------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  $$(".zoomable").forEach((card) => {
    card.addEventListener("click", () => {
      lbImg.src = card.dataset.full;
      lbCap.textContent = card.dataset.caption || "";
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
    });
  });
  function closeLb() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); }
  $("#lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", (ev) => { if (ev.target === lb) closeLb(); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closeLb(); });

  /* ---------------- copy bibtex ---------------- */
  $$(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const src = document.getElementById(btn.dataset.copy);
      try {
        await navigator.clipboard.writeText(src.innerText);
        btn.textContent = "Copied!";
      } catch {
        const r = document.createRange(); r.selectNodeContents(src);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        btn.textContent = "Select + Ctrl+C";
      }
      setTimeout(() => (btn.textContent = "Copy"), 1600);
    });
  });
})();
