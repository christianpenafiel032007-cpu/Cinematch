/* CineMatch UI upgrade: laptop + phone layouts, mobile step-by-step quiz, nicer form,
   poster-fan hero (replaces the fox image). Load AFTER cinematch-extras.js. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var safe = function (fn) { try { fn(); } catch (e) { if (window.console) console.warn("cinematch-ui:", e); } };

  /* ---------- device flag (CSS also uses media queries) ---------- */
  function device() { var w = innerWidth; return w <= 700 ? "mobile" : w < 1024 ? "tablet" : "desktop"; }
  function setDevice() { document.documentElement.dataset.device = device(); }
  setDevice(); addEventListener("resize", setDevice); addEventListener("orientationchange", setDevice);
  if (!document.querySelector('meta[name="theme-color"]')) {
    var tc = document.createElement("meta"); tc.name = "theme-color"; tc.content = "#15112a"; document.head.appendChild(tc);
  }

  /* ---------- CSS ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ":root{--cxw:880px}@media(min-width:1024px){:root{--cxw:1120px}}",
    "main,.cx-foot,.cx-copy{max-width:var(--cxw)!important}",
    ".top{position:sticky;top:0;z-index:35;max-width:none!important;margin:0!important;align-items:center;padding:12px max(16px,calc((100vw - var(--cxw))/2 + 20px));padding-top:calc(12px + env(safe-area-inset-top,0px));background:rgba(21,17,42,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.08)}",
    "@media(max-width:1099px){.top p{display:none}}",
    ".hero-img{display:none!important}",
    /* hero */
    ".hero{display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:24px;padding:36px 0 30px}",
    ".cx-ht h1{max-width:12em}.cx-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}",
    ".cx-badges span{font-size:.85rem;color:var(--muted);border:1px solid rgba(255,182,39,.3);background:rgba(255,182,39,.07);border-radius:999px;padding:5px 13px}",
    ".cx-fan{--w:150px;--h:225px;--dx:64px;position:relative;height:350px;isolation:isolate}",
    ".cx-fan::before{content:'';position:absolute;inset:8% 4%;z-index:-1;border-radius:50%;background:radial-gradient(circle,rgba(255,182,39,.32),rgba(255,93,115,.18) 45%,transparent 70%);filter:blur(30px);animation:cxGlow 5s ease-in-out infinite alternate}",
    "@keyframes cxGlow{to{transform:scale(1.12);opacity:.7}}",
    ".cx-pc{position:absolute;left:50%;top:50%;width:var(--w);height:var(--h);min-height:0!important;margin:calc(var(--h)/-2) 0 0 calc(var(--w)/-2);border-radius:14px;border:1px solid rgba(255,255,255,.28);box-shadow:0 26px 50px -14px rgba(0,0,0,.75);cursor:pointer;transform:translateX(calc(var(--i)*var(--dx))) rotate(calc(var(--i)*9deg));transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s;animation:cxFloat 6s ease-in-out infinite;animation-delay:calc(var(--i)*-.9s)}",
    "@keyframes cxFloat{50%{translate:0 -14px}}",
    ".cx-pc:hover{z-index:20!important;transform:translateX(calc(var(--i)*var(--dx))) rotate(0deg) scale(1.12);box-shadow:0 30px 60px -12px rgba(255,182,39,.45)}",
    ".cx-pc svg.art{margin:0!important;width:56%!important}",
    ".cx-rt{position:absolute;right:8px;top:8px;z-index:3;font:700 .75rem 'DM Sans',sans-serif;background:rgba(0,0,0,.65);color:var(--amber);border-radius:999px;padding:3px 9px}",
    /* quiz panel */
    ".cx-meter{margin:0 0 24px}.cx-meter div:first-child{display:flex;justify-content:space-between;gap:10px;font-size:.88rem;color:var(--muted);margin-bottom:8px}.cx-meter b{color:var(--amber)}",
    ".cx-mt{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}.cx-mt i{display:block;height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#ffb627,#ff5d73);transition:width .45s cubic-bezier(.2,.8,.2,1)}",
    ".tiles .chip span{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 8px}.tiles em{font-style:normal;font-size:1.9rem;line-height:1}",
    ".cx-age{display:flex;gap:8px}.cx-age input{order:1;flex:1;min-width:0;text-align:center;font-size:1.2rem!important;-moz-appearance:textfield;appearance:textfield}",
    ".cx-age input::-webkit-inner-spin-button,.cx-age input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}",
    ".cx-age button{width:48px;border-radius:12px;border:1px solid var(--line);background:#120e25;color:var(--text);font-size:1.4rem;cursor:pointer;transition:.2s}.cx-age button:hover{border-color:var(--amber);background:rgba(255,182,39,.1)}",
    ".cx-age .cx-mi{order:0}.cx-age .cx-pl{order:2}",
    ".cx-seg{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.cx-hidesel{display:none!important}",
    ".cx-seg button{font:600 .85rem 'DM Sans',sans-serif;padding:13px 6px;border-radius:12px;border:1px solid var(--line);background:#120e25;color:var(--muted);cursor:pointer;transition:.2s}",
    ".cx-seg button:hover{border-color:var(--amber);color:var(--text)}.cx-seg button[aria-pressed=true]{background:linear-gradient(135deg,#ffd978,#ffb627 50%,#ff7a59);color:#2a1d00;border-color:transparent;font-weight:700}",
    ".cx-gc{margin:12px 0 0;color:var(--muted);font-size:.88rem}",
    ".rate{display:grid!important;grid-template-columns:56px 1fr;gap:8px 12px;align-items:center}",
    ".cx-th{grid-row:1/3;width:56px;height:84px;min-height:0!important;border-radius:10px;font-size:0;border:1px solid rgba(255,255,255,.18)}.cx-th svg.art{margin:0!important;width:60%!important}",
    ".rate button{font-size:.78rem!important;padding:9px 4px!important}",
    /* laptop */
    "@media(min-width:1024px){",
    "#quiz{display:grid;grid-template-columns:1fr 1fr;gap:0 44px;align-items:start}",
    "#quiz>.cx-meter,#quiz>fieldset:first-of-type,#quiz>fieldset:nth-of-type(4),#quiz>.error,#quiz>.form-actions{grid-column:1/-1}",
    ".tiles{grid-template-columns:repeat(8,1fr)}#rate{grid-template-columns:repeat(3,1fr)!important}",
    ".scrollhint{display:none}.list{grid-template-columns:1fr 1fr}",
    ".ticket{grid-template-columns:96px 1fr 84px}.stub strong{font-size:1.7rem}",
    ".cx-fan{height:400px;--w:170px;--h:255px;--dx:74px}",
    "}",
    /* tablet */
    "@media(max-width:1023px){.hero{grid-template-columns:1fr}.cx-fan{height:310px}}",
    /* phone */
    "@media(max-width:700px){",
    ".hero{padding:22px 0 14px;gap:6px}.hero h1{font-size:clamp(2rem,10vw,2.8rem)}.cx-fan{height:250px;--w:104px;--h:156px;--dx:46px}.cx-pc:nth-child(1),.cx-pc:nth-child(5){display:none}",
    ".hero-cta .btn{flex:1 1 100%}.cx-nav{order:3;width:100%;overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none;margin:0}.cx-nav::-webkit-scrollbar{display:none}.cx-nav>*{flex:0 0 auto}",
    ".logo{font-size:1.5rem}.panel{padding:18px 16px}",
    "input[type=number],select,input[type=search]{font-size:16px!important}",
    ".btn,.chip span,.rate button{min-height:44px}.cx-seg{grid-template-columns:repeat(2,1fr)}.tiles{gap:8px}",
    ".ticket{grid-template-columns:84px 1fr}.stub{display:none}.toprated .tcard{flex-basis:132px}",
    ".cx-chat-btn{bottom:92px!important}.totop{right:auto;left:14px;bottom:86px}",
    ".cx-chat{left:8px!important;right:8px!important;width:auto!important;bottom:8px!important;height:min(78vh,620px)!important}",
    "}",
    /* touch: no sticky hover lifts */
    "@media(hover:none){.ticket:hover,.tcard:hover,.btn:hover,.mini:hover,.cx-step:hover,.cx-stat:hover{transform:none}.cx-pc:hover{transform:translateX(calc(var(--i)*var(--dx))) rotate(calc(var(--i)*9deg))}}",
    /* mobile wizard */
    ".cx-wbar{display:none}",
    ".cx-wiz fieldset.cx-hide{display:none}.cx-wiz fieldset{margin-bottom:6px;padding-bottom:10px}.cx-wiz fieldset::after{display:none!important}",
    ".cx-wiz>.form-actions{display:none}.cx-wiz.cx-last>.form-actions{display:flex}",
    ".cx-wiz .cx-wbar{display:flex;align-items:center;gap:10px;position:sticky;bottom:10px;z-index:5;margin-top:14px;padding:10px 12px;border-radius:999px;background:rgba(18,14,37,.94);backdrop-filter:blur(10px);border:1px solid rgba(255,182,39,.4);box-shadow:0 14px 30px -10px rgba(0,0,0,.7)}",
    ".cx-wbar .cx-dots{display:flex;gap:5px}.cx-wbar .cx-dots i{width:8px;height:8px;border-radius:99px;background:rgba(255,255,255,.2);transition:.3s}.cx-wbar .cx-dots i.on{width:22px;background:var(--amber)}.cx-wbar .cx-dots i.done{background:#34d399}",
    ".cx-wbar small{flex:1;color:var(--muted);font-size:.8rem;line-height:1.2}.cx-wiz.cx-last .cx-next{display:none}",
    ".cx-wbar .btn{padding:10px 20px}.cx-wiz .cx-last-bar-hide{display:none}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- remove the scrolling poster strip ---------- */
  document.querySelectorAll(".wall").forEach(function (w) { w.remove(); });

  /* ---------- HERO: replace fox image with poster fan ---------- */
  safe(function () {
    var old = document.querySelector(".hero-img"); if (old) old.remove();
    var hero = document.querySelector(".hero"); if (!hero) return;
    var wrap = document.createElement("div"); wrap.className = "cx-ht";
    while (hero.firstChild) wrap.appendChild(hero.firstChild);
    var b = document.createElement("div"); b.className = "cx-badges";
    b.innerHTML = "<span>🎬 " + MOVIES.length + " movies</span><span>👥 " + VIEWERS.length + " community viewers</span><span>🔒 No sign-up</span><span>⚡ Takes 1 minute</span>";
    wrap.appendChild(b); hero.appendChild(wrap);
    var src = (typeof TOP !== "undefined" && TOP.length >= 5 ? TOP : MOVIES).slice(0, 5);
    var fan = document.createElement("div"); fan.className = "cx-fan"; fan.setAttribute("aria-label", "Top rated movie posters");
    fan.innerHTML = src.map(function (m, i) {
      var st = STATS[m.id], n = i - 2;
      return '<div class="poster cx-pc" role="button" tabindex="0" aria-label="' + m.t + '" data-id="' + m.id + '" data-open="' + m.id + '" style="--i:' + n + ";z-index:" + (6 - Math.abs(n)) + ";background:" + posterBg(m) + '">' + artSvg(m.id) +
        (st.count ? '<span class="cx-rt">★ ' + st.avg.toFixed(1) + "</span>" : "") + '<span class="pt">' + m.t + "</span></div>";
    }).join("");
    hero.appendChild(fan); hydratePosters(fan);
    fan.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { var c = e.target.closest("[data-open]"); if (c) { e.preventDefault(); openModal(c.dataset.open); } } });
  });

  /* ---------- FORM UPGRADES ---------- */
  var quiz = $("quiz"); if (!quiz) return;

  safe(function () { // mood tiles: icon (or emoji) on top
    quiz.querySelectorAll(".tiles .chip span").forEach(function (s) {
      var ic = s.querySelector("svg.cm-i");
      if (ic) { var em = document.createElement("em"); ic.classList.remove("sp"); em.appendChild(ic); s.insertBefore(em, s.firstChild); return; }
      var t = s.textContent.trim(), i = t.indexOf(" ");
      if (i > 0) s.innerHTML = "<em>" + t.slice(0, i) + "</em>" + t.slice(i + 1);
    });
  });

  safe(function () { // genre emoji + counter
    var E = {Action: "💥", Adventure: "🧭", Animation: "✨", Comedy: "😂", Crime: "🕵️", Drama: "🎭", Family: "👨‍👩‍👧", Fantasy: "🧙", Horror: "👻", Music: "🎵", Musical: "🎤", Mystery: "🔍", Romance: "💕", "Sci-Fi": "🚀", Thriller: "🔪"};
    quiz.querySelectorAll("#genres .chip").forEach(function (c) {
      var s = c.querySelector("span"), v = c.querySelector("input").value; if (E[v]) s.textContent = E[v] + " " + v;
    });
    var p = document.createElement("p"); p.className = "cx-gc"; p.id = "cxGc"; p.textContent = "None selected: we’ll use every genre.";
    $("genres").after(p);
  });

  safe(function () { // age stepper
    var age = $("age"), w = document.createElement("div"); w.className = "cx-age";
    var mi = document.createElement("button"), pl = document.createElement("button");
    mi.type = pl.type = "button"; mi.className = "cx-mi"; pl.className = "cx-pl"; mi.textContent = "−"; pl.textContent = "+";
    mi.setAttribute("aria-label", "Decrease age"); pl.setAttribute("aria-label", "Increase age");
    age.parentNode.insertBefore(w, age); w.appendChild(age); w.appendChild(mi); w.appendChild(pl);
    function bump(d) { age.value = Math.max(5, Math.min(99, (+age.value || 20) + d)); age.dispatchEvent(new Event("input", {bubbles: true})); }
    mi.onclick = function () { bump(-1); }; pl.onclick = function () { bump(1); };
  });

  safe(function () { // gender segmented control (select stays as the data source)
    var sel = $("gender"); sel.required = false;
    var seg = document.createElement("div"); seg.className = "cx-seg"; seg.setAttribute("role", "group"); seg.setAttribute("aria-label", "Gender");
    [["female", "Female"], ["male", "Male"], ["other", "Non-binary"], ["none", "Skip"]].forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.dataset.v = o[0]; b.textContent = o[1]; seg.appendChild(b);
    });
    sel.after(seg); sel.classList.add("cx-hidesel");
    function sync() { if (!sel.value) sel.value = "none"; seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.v === sel.value); }); }
    seg.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; sel.value = b.dataset.v; sync(); upd(); });
    sync(); window.cxGenderSync = sync;
  });

  safe(function () { // poster thumbnails on rating cards
    quiz.querySelectorAll("#rate .rate").forEach(function (r) {
      var btn = r.querySelector("button"); if (!btn) return;
      var m = byId(btn.dataset.id), th = document.createElement("div");
      th.className = "poster cx-th"; th.dataset.id = m.id; th.style.background = posterBg(m); th.innerHTML = artSvg(m.id);
      r.insertBefore(th, r.firstChild);
    });
    hydratePosters($("rate"));
  });

  /* ---------- match-strength meter ---------- */
  var meter = document.createElement("div"); meter.className = "cx-meter";
  meter.innerHTML = '<div><span>Match strength</span><span><b id="cxPct">0%</b> <span id="cxTip">Pick a mood to begin</span></span></div><div class="cx-mt"><i id="cxFill"></i></div>';
  quiz.insertBefore(meter, quiz.firstChild);
  function ageOk() { var a = +$("age").value; return a >= 5 && a <= 99; }
  function upd() {
    var mood = !!quiz.querySelector("input[name=mood]:checked"), gn = quiz.querySelectorAll("input[name=genre]:checked").length;
    var rated = typeof myRatings !== "undefined" ? Object.keys(myRatings).length : 0;
    var pct = (mood ? 30 : 0) + (ageOk() ? 25 : 0) + (gn ? 15 : 0) + Math.min(30, rated * 6);
    $("cxPct").textContent = pct + "%"; $("cxFill").style.width = pct + "%";
    $("cxTip").textContent = !mood ? "Pick a mood to begin" : !ageOk() ? "Add your age" : rated < 3 ? "Rate a few movies for sharper picks" : "Great, your matches will be sharp";
    var g = $("cxGc"); if (g) g.textContent = gn ? gn + " genre" + (gn > 1 ? "s" : "") + " selected" : "None selected: we’ll use every genre.";
  }
  ["input", "change", "click"].forEach(function (ev) { quiz.addEventListener(ev, function () { setTimeout(upd, 0); }); });
  upd();

  /* ---------- MOBILE STEP-BY-STEP QUIZ ---------- */
  safe(function () {
    var steps = [].slice.call(quiz.querySelectorAll(":scope > fieldset")), cur = 0, on = false, err = $("error");
    var names = steps.map(function (f) { return f.querySelector("legend").textContent.replace(/^\s*\d+\s*/, "").trim(); });
    var bar = document.createElement("div"); bar.className = "cx-wbar";
    bar.innerHTML = '<button type="button" class="btn ghost sm cx-back" aria-label="Back">←</button><div class="cx-dots">' + steps.map(function () { return "<i></i>"; }).join("") + '</div><small></small><button type="button" class="btn sm cx-next">Next →</button>';
    quiz.insertBefore(bar, quiz.querySelector(":scope > .error"));
    var back = bar.querySelector(".cx-back"), next = bar.querySelector(".cx-next"), label = bar.querySelector("small"), dots = bar.querySelectorAll("i");
    function show(n, scroll) {
      cur = n;
      steps.forEach(function (f, i) { f.classList.toggle("cx-hide", i !== n); f.classList.add("in"); });
      dots.forEach(function (d, i) { d.className = i === n ? "on" : i < n ? "done" : ""; });
      label.textContent = "Step " + (n + 1) + " of " + steps.length + " · " + names[n];
      back.style.visibility = n ? "visible" : "hidden";
      quiz.classList.toggle("cx-last", n === steps.length - 1); err.textContent = "";
      if (scroll) quiz.scrollIntoView({behavior: "smooth", block: "start"});
    }
    function valid() {
      if (cur === 0 && !quiz.querySelector("input[name=mood]:checked")) { err.textContent = "Pick a mood to continue."; return false; }
      if (cur === 1 && !ageOk()) { err.textContent = "Enter an age between 5 and 99."; $("age").focus(); return false; }
      return true;
    }
    function go(d) { if (d > 0 && !valid()) return; var n = cur + d; if (n >= 0 && n < steps.length) show(n, true); }
    next.onclick = function () { go(1); }; back.onclick = function () { go(-1); };
    quiz.addEventListener("keydown", function (e) {
      if (on && e.key === "Enter" && e.target.tagName === "INPUT" && !quiz.classList.contains("cx-last")) { e.preventDefault(); go(1); }
    });
    ["reset", "again"].forEach(function (id) { var b = $(id); if (b) b.addEventListener("click", function () { setTimeout(function () { if (window.cxGenderSync) cxGenderSync(); upd(); if (on) show(0); }, 30); }); });
    var mq = matchMedia("(max-width:700px)");
    function apply() {
      on = mq.matches; quiz.classList.toggle("cx-wiz", on);
      if (on) show(cur); else { steps.forEach(function (f) { f.classList.remove("cx-hide"); }); quiz.classList.remove("cx-last"); }
    }
    (mq.addEventListener ? mq.addEventListener("change", apply) : mq.addListener(apply)); apply();
  });
})();