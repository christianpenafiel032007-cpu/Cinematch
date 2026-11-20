/* CineMatch games: "Swipe Night" (swipe movies, get a movie personality + picks) and
   "Plot Twist" (guess the movie from its one-line plot).
   Self-contained: adds a "Movie games" section + a "Games" nav button and its own panel.
   Uses existing globals only (MOVIES, STATS, MOODS, MOOD_TEXT, posterBg, artSvg, hydratePosters,
   openModal, render, showLoading, myRatings, updateRateCount, lastUser, lastShuffle).
   Swipe Night ratings go through the normal recommendation API via render().
   Load LAST in index.html:  <script src="cinematch-game.js"></script> */
(function () {
  "use strict";
  if (typeof MOVIES === "undefined" || typeof STATS === "undefined") return;

  var $ = function (i) { return document.getElementById(i); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; }); };
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var reduced = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var moodIcon = function (k) { return String(MOODS[k] || "").split(" ")[0]; };
  var moodName = function (k) { return String(MOODS[k] || k).replace(/^\S+\s/, ""); };

  /* Age/gender already known from the quiz or remembered preferences (cm_prefs). */
  function knownProfile() {
    var p = LS.get("cm_prefs", {}) || {}, a = $("age"), g = $("gender");
    var age = +(a && a.value) || +p.age || 0, gender = (g && g.value) || p.gender || "";
    return {age: age >= 5 && age <= 99 ? age : 0, gender: gender};
  }

  /* ---------- styles (theme variables from the site) ---------- */
  var css = [
    ".cmg-hub{margin:56px 0}",
    ".cmg-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}",
    ".cmg-gc{position:relative;display:flex;flex-direction:column;gap:10px;padding:22px;border-radius:20px;border:1px solid var(--line);overflow:hidden;" +
      "background:radial-gradient(120% 90% at 100% 0%,rgba(255,93,115,.16),transparent 55%),radial-gradient(90% 80% at 0% 100%,rgba(255,182,39,.12),transparent 60%),var(--panel)}",
    ".cmg-gc h3{margin:4px 0 0;font:800 1.45rem 'Fraunces',Georgia,serif}",
    ".cmg-gc p{margin:0;color:var(--muted);line-height:1.5}",
    ".cmg-gc .cmg-meta{font-size:.86rem;color:var(--text);min-height:1.3em}",
    ".cmg-gc .btn{align-self:flex-start;margin-top:6px}",
    ".cmg-ico{display:inline-grid;place-items:center;width:3.4rem;height:3.4rem;border-radius:18px;font-size:1.6rem;line-height:1;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}",
    ".cmg-ico .cm-i{margin:0!important;width:1.7rem;height:1.7rem;vertical-align:0}",
    ".cmg-panel{position:fixed;inset:0;z-index:48;display:none;overflow-y:auto;overscroll-behavior:contain;padding:16px;padding-top:calc(16px + env(safe-area-inset-top,0px));padding-bottom:calc(24px + env(safe-area-inset-bottom,0px));background:rgba(10,7,22,.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}",
    ".cmg-panel.open{display:block;animation:fade .2s}",
    ".cmg-box{width:min(600px,100%);margin:0 auto}",
    ".cmg-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 2px 14px}",
    ".cmg-head h2{margin:0;font:800 clamp(1.4rem,5vw,2rem) 'Fraunces',Georgia,serif}",
    ".cmg-bar{height:6px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}",
    ".cmg-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--amber),var(--coral));transition:width .3s}",
    ".cmg-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin:10px 2px 14px;color:var(--muted);font-size:.9rem}",
    ".cmg-row b{color:var(--text)}",
    /* swipe */
    ".cmg-stack{position:relative;height:min(540px,68vh);min-height:400px;touch-action:none;user-select:none;-webkit-user-select:none}",
    ".cmg-sc{position:absolute;inset:0;display:flex;flex-direction:column;border-radius:22px;overflow:hidden;border:1px solid var(--line);background:var(--panel);box-shadow:0 24px 50px -24px rgba(0,0,0,.8);cursor:grab;will-change:transform}",
    ".cmg-sc:focus-visible{outline:3px solid var(--amber);outline-offset:3px}",
    ".cmg-sc.drag{cursor:grabbing;transition:none!important}",
    ".cmg-sc.back{transform:scale(.95) translateY(12px);opacity:.55;pointer-events:none;filter:saturate(.7)}",
    ".cmg-sc .poster{position:relative;flex:1;min-height:0;display:grid;place-items:center;overflow:hidden}",
    ".cmg-sc .poster img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}",
    ".cmg-sc img,.cmg-sc svg{pointer-events:none;-webkit-user-drag:none;user-select:none}",
    ".cmg-sc .poster .art{width:42%;opacity:.85}",
    ".cmg-info{padding:14px 16px 16px;background:linear-gradient(180deg,rgba(21,17,42,.6),var(--panel))}",
    ".cmg-info h3{margin:0 0 4px;font:800 1.3rem 'Fraunces',Georgia,serif}",
    ".cmg-info p{margin:0;color:var(--muted);font-size:.9rem;line-height:1.45}",
    ".cmg-stamp{position:absolute;top:22px;padding:6px 14px;border-radius:12px;border:3px solid;font:800 1.3rem 'DM Sans',sans-serif;letter-spacing:.06em;opacity:0;pointer-events:none;background:rgba(10,7,22,.55);z-index:2}",
    ".cmg-stamp.love{left:18px;color:#4ade9a;border-color:#4ade9a;transform:rotate(-12deg)}",
    ".cmg-stamp.nope{right:18px;color:#ff7a9c;border-color:#ff7a9c;transform:rotate(12deg)}",
    ".cmg-stamp.skip{left:50%;top:auto;bottom:38%;transform:translateX(-50%);color:#7cb8ff;border-color:#7cb8ff}",
    ".cmg-acts{display:flex;justify-content:center;align-items:center;gap:16px;margin:18px 0 6px}",
    ".cmg-rb{display:grid;place-items:center;gap:2px;width:68px;height:68px;border-radius:50%;border:1px solid var(--line);background:var(--panel);color:var(--text);cursor:pointer;font:700 .66rem 'DM Sans',sans-serif;transition:transform .15s,border-color .15s,box-shadow .15s;-webkit-tap-highlight-color:transparent}",
    ".cmg-rb .cm-i{width:1.6rem;height:1.6rem;margin:0!important}",
    ".cmg-rb span{white-space:nowrap}",
    ".cmg-rb.sm{width:60px;height:60px;font-size:.6rem}.cmg-rb.sm .cm-i{width:1.3rem;height:1.3rem}",
    ".cmg-rb:hover{transform:translateY(-2px) scale(1.05)}",
    ".cmg-rb.love:hover{border-color:#4ade9a;box-shadow:0 10px 24px -10px rgba(74,222,154,.7)}",
    ".cmg-rb.nope:hover{border-color:#ff7a9c;box-shadow:0 10px 24px -10px rgba(255,122,156,.7)}",
    ".cmg-rb.skip:hover{border-color:#7cb8ff;box-shadow:0 10px 24px -10px rgba(124,184,255,.7)}",
    ".cmg-rb:focus-visible{outline:3px solid var(--amber);outline-offset:2px}",
    ".cmg-hint{text-align:center;color:var(--muted);font-size:.82rem;margin:4px 0 0}",
    ".cmg-link{background:none;border:0;color:var(--amber);font:700 .88rem 'DM Sans',sans-serif;cursor:pointer;padding:6px;text-decoration:underline;text-underline-offset:3px}",
    /* results */
    ".cmg-res{text-align:center;padding:22px;border-radius:22px;border:1px solid var(--line);background:radial-gradient(120% 80% at 50% 0%,rgba(255,182,39,.14),transparent 60%),var(--panel)}",
    ".cmg-res .cmg-ico{width:5rem;height:5rem;border-radius:24px;margin:4px auto 10px}",
    ".cmg-res .cmg-ico .cm-i{width:2.6rem;height:2.6rem}",
    ".cmg-res small{display:block;color:var(--muted);text-transform:uppercase;letter-spacing:.12em;font-size:.72rem;font-weight:700}",
    ".cmg-res h3{margin:4px 0 8px;font:800 clamp(1.6rem,6vw,2.2rem) 'Fraunces',Georgia,serif;background:linear-gradient(135deg,#ffe08a,#ffb627 45%,#ff5d73);-webkit-background-clip:text;background-clip:text;color:transparent}",
    ".cmg-res p{color:var(--muted);line-height:1.55;margin:0 auto 12px;max-width:44ch}",
    ".cmg-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:6px 0 14px}",
    ".cmg-chips span{padding:6px 12px;border-radius:99px;border:1px solid var(--line);background:rgba(255,255,255,.04);font-size:.85rem;font-weight:700}",
    ".cmg-form{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:8px 0 14px}",
    ".cmg-form label{display:grid;gap:4px;text-align:left;font-size:.8rem;color:var(--muted);font-weight:700}",
    ".cmg-form input,.cmg-form select{min-width:130px;height:44px;padding:0 12px;border-radius:12px;border:1px solid var(--line);background:#15112a;color:var(--text);font:500 1rem 'DM Sans',sans-serif}",
    ".cmg-err{color:#ff8fa3;min-height:1.2em;margin:0 0 6px;font-size:.88rem}",
    ".cmg-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:6px}",
    /* plot twist */
    ".cmg-q{position:relative;margin:0 0 14px;padding:22px 22px 22px 26px;border-radius:20px;border:1px solid var(--line);background:var(--panel);font:600 clamp(1.05rem,3.6vw,1.25rem)/1.55 'DM Sans',sans-serif}",
    ".cmg-q::before{content:'\\201C';position:absolute;left:10px;top:-6px;font:800 3.2rem 'Fraunces',Georgia,serif;color:var(--amber);opacity:.55}",
    ".cmg-hints{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px;min-height:0}",
    ".cmg-hints span{padding:6px 12px;border-radius:99px;background:rgba(124,184,255,.12);border:1px solid rgba(124,184,255,.35);font-size:.85rem;font-weight:700;animation:fade .25s}",
    ".cmg-hints .poster{width:64px;height:92px;border-radius:10px;overflow:hidden;display:grid;place-items:center;position:relative}",
    ".cmg-hints .poster img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.cmg-hints .poster .art{width:60%}",
    ".cmg-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
    ".cmg-opt{display:flex;align-items:center;gap:10px;min-height:56px;padding:10px 14px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--text);font:700 .95rem 'DM Sans',sans-serif;text-align:left;cursor:pointer;transition:border-color .15s,background .15s,transform .15s}",
    ".cmg-opt i{flex:0 0 auto;display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:rgba(255,255,255,.08);font-style:normal;font-size:.8rem;color:var(--muted)}",
    ".cmg-opt:hover:not(:disabled){border-color:var(--amber);transform:translateY(-1px)}",
    ".cmg-opt:focus-visible{outline:3px solid var(--amber);outline-offset:2px}",
    ".cmg-opt.wrong{border-color:rgba(255,122,156,.6);background:rgba(255,122,156,.1);color:var(--muted);text-decoration:line-through;cursor:not-allowed}",
    ".cmg-opt.right{border-color:#4ade9a;background:rgba(74,222,154,.14);cursor:default}",
    ".cmg-opt:disabled:not(.right):not(.wrong){opacity:.5;cursor:default}",
    ".cmg-fb{min-height:1.5em;margin:12px 2px;font-weight:700}",
    ".cmg-fb.ok{color:#4ade9a}.cmg-fb.no{color:#ff9fb5}",
    ".cmg-next{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}",
    "@media(max-width:640px){.cmg-cards{grid-template-columns:1fr}.cmg-opts{grid-template-columns:1fr}.cmg-stack{height:min(500px,62vh);min-height:360px}.cmg-acts{gap:12px}.cmg-panel{padding-left:12px;padding-right:12px}}",
    "@media(prefers-reduced-motion:reduce){.cmg-sc,.cmg-rb,.cmg-opt,.cmg-bar i{transition:none!important}.cmg-panel.open,.cmg-hints span{animation:none}}"
  ].join("");
  var st = document.createElement("style"); st.id = "cmGameCss"; st.textContent = css; document.head.appendChild(st);

  /* ---------- hub section + nav button ---------- */
  var hub = document.createElement("section");
  hub.id = "cmGames"; hub.className = "cmg-hub"; hub.setAttribute("aria-labelledby", "cmgHubTitle");
  var topSec = $("topSection"), main = document.querySelector("main");
  if (topSec && topSec.parentNode) topSec.parentNode.insertBefore(hub, topSec); else if (main) main.appendChild(hub); else return;

  function hubHtml() {
    var persona = LS.get("cm_game_persona", null), best = LS.get("cm_game_best", null);
    hub.innerHTML = '<div class="section-title"><h2 id="cmgHubTitle">🎲 Movie games</h2><p>Play a quick round, then get picks that fit you</p></div><div class="cmg-cards">' +
      '<article class="cmg-gc"><span class="cmg-ico">🔥</span><h3>Swipe Night</h3><p>Swipe through movies you’ve seen. Love it or not, your swipes reveal your movie personality and power your picks.</p>' +
      '<span class="cmg-meta">' + (persona && persona.name ? "Last result: <b>" + esc(persona.name) + "</b>" : "12 cards · about 1 minute") + "</span>" +
      '<button type="button" class="btn" data-cmg-play="swipe">▶ Play Swipe Night</button></article>' +
      '<article class="cmg-gc"><span class="cmg-ico">🎞</span><h3>Plot Twist</h3><p>Guess the movie from its one-line plot. Wrong guesses unlock hints, but each hint costs a point.</p>' +
      '<span class="cmg-meta">' + (best ? "Best score: <b>" + best.score + " / " + best.max + "</b>" : "10 rounds · up to 30 points") + "</span>" +
      '<button type="button" class="btn" data-cmg-play="plot">▶ Play Plot Twist</button></article></div>';
  }
  hubHtml();

  var nav = document.querySelector(".cx-nav");
  if (nav && !nav.querySelector("[data-cmg-nav]")) {
    var nb = document.createElement("button"); nb.type = "button"; nb.setAttribute("data-cmg-nav", ""); nb.textContent = "🎲 Games";
    var contact = nav.querySelector('[data-cx="contact"]');
    nav.insertBefore(nb, contact || null);
    nb.addEventListener("click", function () { hub.scrollIntoView({behavior: reduced() ? "auto" : "smooth", block: "start"}); });
  }

  /* ---------- panel ---------- */
  var panel = document.createElement("div");
  panel.className = "cmg-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-labelledby", "cmgTitle");
  panel.innerHTML = '<div class="cmg-box"><div class="cmg-head"><h2 id="cmgTitle"></h2><button type="button" class="qp-x" data-cmg-close aria-label="Close game">✕</button></div><div id="cmgBody"></div></div>';
  document.body.appendChild(panel);
  var body = $("cmgBody"), lastFocus = null, keyHandler = null;

  function openPanel(title) {
    lastFocus = document.activeElement;
    $("cmgTitle").textContent = title;
    panel.classList.add("open"); panel.scrollTop = 0;
    document.body.style.overflow = "hidden";
  }
  function closePanel() {
    panel.classList.remove("open"); keyHandler = null; body.innerHTML = "";
    var qp = $("quizPanel");
    if (!(qp && qp.classList.contains("open")) && $("modal").classList.contains("hidden")) document.body.style.overflow = "";
    hubHtml();
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
  }
  panel.addEventListener("click", function (e) {
    if (e.target === panel || e.target.closest("[data-cmg-close]")) closePanel();
  });
  // capture phase: decide before the site's own Escape handlers close the movie details
  window.addEventListener("keydown", function (e) {
    if (!panel.classList.contains("open")) return;
    if (!$("modal").classList.contains("hidden")) return; // movie details open on top: let it handle keys
    if (e.key === "Escape") { e.preventDefault(); closePanel(); return; }
    var tag = (e.target && e.target.tagName) || "";
    if (/INPUT|SELECT|TEXTAREA/.test(tag)) return;
    if (keyHandler) keyHandler(e);
  }, true);
  // keep the page locked while a game is open after the movie details close
  new MutationObserver(function () { if (panel.classList.contains("open")) document.body.style.overflow = "hidden"; })
    .observe($("modal"), {attributes: true, attributeFilter: ["class"]});

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-cmg-play]"); if (!b) return;
    if (b.getAttribute("data-cmg-play") === "swipe") startSwipe(); else startPlot();
  });

  function posterHtml(m) { return '<div class="poster" data-id="' + m.id + '" style="background:' + posterBg(m) + '">' + artSvg(m.id) + "</div>"; }

  /* =====================================================================
     SWIPE NIGHT
     ===================================================================== */
  var PERSONAS = {
    happy: ["The Feel-Good Fan", "You watch to leave the couch smiling: warm stories, big laughs and happy endings."],
    sad: ["The Tearjerker Devotee", "You love a story that hits the heart. A good cry is part of a good movie night."],
    excited: ["The Thrill Seeker", "Explosions, chases and high stakes. If it gets your pulse up, you’re in."],
    calm: ["The Cozy Watcher", "Gentle pace, beautiful worlds and comfort viewing. Blanket required."],
    romantic: ["The Midnight Romantic", "Meet-cutes, slow burns and grand gestures. You’re here for the love story."],
    curious: ["The Mind-Bender", "Twists, puzzles and big ideas. You like movies that keep you thinking afterwards."],
    scared: ["The Fearless Night Owl", "Lights off, volume up. Jump scares and creeping dread are your comfort zone."],
    inspired: ["The Underdog Champion", "Comebacks, dreamers and against-the-odds stories. You watch to feel unstoppable."]
  };
  var SW = null;

  function buildDeck() {
    var age = knownProfile().age;
    var pool = shuffle(MOVIES.filter(function (m) { return STATS[m.id] && STATS[m.id].count >= 2 && (!age || (m.min || 0) <= age); }));
    var deck = [], perGenre = {};
    pool.forEach(function (m) { var g = m.g[0]; if (deck.length < 12 && (perGenre[g] || 0) < 2) { deck.push(m); perGenre[g] = (perGenre[g] || 0) + 1; } });
    pool.forEach(function (m) { if (deck.length < 12 && deck.indexOf(m) < 0) deck.push(m); });
    return deck;
  }

  function startSwipe() {
    SW = {deck: buildDeck(), i: 0, ratings: {}, loved: [], nope: []};
    openPanel("Swipe Night");
    drawSwipe();
  }

  function drawSwipe() {
    var d = SW.deck, i = SW.i;
    if (i >= d.length) { swipeResult(); return; }
    var m = d[i], next = d[i + 1], rated = SW.loved.length + SW.nope.length;
    body.innerHTML =
      '<div class="cmg-bar" aria-hidden="true"><i style="width:' + (i / d.length * 100) + '%"></i></div>' +
      '<div class="cmg-row"><span>Card <b>' + (i + 1) + "</b> of " + d.length + "</span><span>♥ <b>" + SW.loved.length + "</b> loved · 👎 <b>" + SW.nope.length + "</b> not for me</span></div>" +
      '<div class="cmg-stack">' +
        (next ? '<div class="cmg-sc back" aria-hidden="true">' + posterHtml(next) + '<div class="cmg-info"><h3>' + esc(next.t) + "</h3></div></div>" : "") +
        '<div class="cmg-sc" id="cmgCard" tabindex="0" role="group" aria-roledescription="movie card" aria-label="' + esc(m.t + ", " + m.y + ". Use the buttons or arrow keys: right loved it, left not for me, up haven’t seen it.") + '">' +
          '<span class="cmg-stamp love" aria-hidden="true">LOVED</span><span class="cmg-stamp nope" aria-hidden="true">NOPE</span><span class="cmg-stamp skip" aria-hidden="true">NOT SEEN</span>' +
          posterHtml(m) +
          '<div class="cmg-info"><h3>' + esc(m.t) + "</h3><p>" + m.y + " · " + esc(m.g.join(", ")) + "</p></div>" +
        "</div>" +
      "</div>" +
      '<div class="cmg-acts">' +
        '<button type="button" class="cmg-rb nope" data-sw="nope" aria-label="Not for me">👎<span>Nope</span></button>' +
        '<button type="button" class="cmg-rb sm skip" data-sw="skip" aria-label="Haven’t seen it">⬆<span>Not seen</span></button>' +
        '<button type="button" class="cmg-rb love" data-sw="love" aria-label="Loved it">♥<span>Loved</span></button>' +
      "</div>" +
      '<p class="cmg-hint">Swipe the card, tap a button, or use ← ↑ → keys.' +
      (rated >= 4 && SW.loved.length ? ' <button type="button" class="cmg-link" data-sw="finish">See my result now</button>' : "") + "</p>";
    hydratePosters(body);
    var card = $("cmgCard");
    bindDrag(card);
    body.querySelectorAll("[data-sw]").forEach(function (b) {
      b.addEventListener("click", function () { var k = b.getAttribute("data-sw"); if (k === "finish") swipeResult(); else decide(k); });
    });
    keyHandler = function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); decide("love"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); decide("nope"); }
      else if (e.key === "ArrowUp") { e.preventDefault(); decide("skip"); }
    };
    if (document.activeElement === document.body || !panel.contains(document.activeElement)) card.focus({preventScroll: true});
  }

  function stamp(card, dx, dy) {
    var love = card.querySelector(".love"), nope = card.querySelector(".nope"), skip = card.querySelector(".skip");
    love.style.opacity = Math.max(0, Math.min(1, dx / 90));
    nope.style.opacity = Math.max(0, Math.min(1, -dx / 90));
    skip.style.opacity = Math.abs(dx) < 50 ? Math.max(0, Math.min(1, -dy / 90)) : 0;
  }

  function bindDrag(card) {
    var sx = 0, sy = 0, dx = 0, dy = 0, dragging = false, id = null;
    card.addEventListener("dragstart", function (e) { e.preventDefault(); }); // no native image drag
    card.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true; id = e.pointerId; sx = e.clientX; sy = e.clientY; dx = dy = 0;
      card.setPointerCapture(id); card.classList.add("drag");
    });
    card.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== id) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      card.style.transform = "translate(" + dx + "px," + Math.min(dy, 40) + "px) rotate(" + dx / 18 + "deg)";
      stamp(card, dx, dy);
    });
    function end(e) {
      if (!dragging || e.pointerId !== id) return;
      dragging = false; card.classList.remove("drag");
      if (dx > 90) decide("love");
      else if (dx < -90) decide("nope");
      else if (dy < -90 && Math.abs(dx) < 60) decide("skip");
      else { card.style.transition = "transform .25s ease"; card.style.transform = ""; stamp(card, 0, 0); }
    }
    card.addEventListener("pointerup", end);
    card.addEventListener("pointercancel", end);
  }

  function decide(kind) {
    var card = $("cmgCard"); if (!card || card.dataset.done) return;
    card.dataset.done = "1";
    var m = SW.deck[SW.i];
    if (kind === "love") { SW.ratings[m.id] = 5; SW.loved.push(m); }
    else if (kind === "nope") { SW.ratings[m.id] = 1; SW.nope.push(m); }
    var go = function () { SW.i++; drawSwipe(); };
    if (reduced()) { go(); return; }
    stamp(card, kind === "love" ? 120 : kind === "nope" ? -120 : 0, kind === "skip" ? -120 : 0);
    card.style.transition = "transform .32s ease, opacity .32s ease";
    card.style.transform = kind === "love" ? "translate(140%,20px) rotate(18deg)" : kind === "nope" ? "translate(-140%,20px) rotate(-18deg)" : "translate(0,-120%)";
    card.style.opacity = "0";
    setTimeout(go, 280);
  }

  function personality() {
    var mood = {}, genre = {};
    SW.loved.forEach(function (m) { m.m.forEach(function (k) { mood[k] = (mood[k] || 0) + 1; }); m.g.forEach(function (g) { genre[g] = (genre[g] || 0) + 1; }); });
    SW.nope.forEach(function (m) { m.m.forEach(function (k) { mood[k] = (mood[k] || 0) - 0.5; }); m.g.forEach(function (g) { genre[g] = (genre[g] || 0) - 0.5; }); });
    var bestMood = Object.keys(mood).sort(function (a, b) { return mood[b] - mood[a]; })[0];
    var genres = Object.keys(genre).filter(function (g) { return genre[g] > 0; }).sort(function (a, b) { return genre[b] - genre[a]; }).slice(0, 3);
    return {mood: bestMood, genres: genres};
  }

  function swipeResult() {
    keyHandler = null;
    if (!SW.loved.length) {
      body.innerHTML = '<div class="cmg-res"><span class="cmg-ico">🍿</span><small>No favourites yet</small><h3>Mystery Guest</h3>' +
        "<p>Swipe right on at least one movie you loved and we’ll work out your movie personality.</p>" +
        '<div class="cmg-btns"><button type="button" class="btn" data-r="again">🔀 Play again</button><button type="button" class="btn ghost" data-cmg-close>Close</button></div></div>';
      body.querySelector('[data-r="again"]').addEventListener("click", startSwipe);
      return;
    }
    var p = personality(), info = PERSONAS[p.mood] || ["The Movie Explorer", "You enjoy a bit of everything."], prof = knownProfile();
    LS.set("cm_game_persona", {name: info[0], mood: p.mood, at: Date.now()});
    var loved = SW.loved.slice(0, 4).map(function (m) { return esc(m.t); }).join(", ") + (SW.loved.length > 4 ? " and " + (SW.loved.length - 4) + " more" : "");
    body.innerHTML = '<div class="cmg-res" aria-live="polite"><span class="cmg-ico">' + moodIcon(p.mood) + "</span><small>Your movie personality</small><h3>" + esc(info[0]) + "</h3>" +
      "<p>" + esc(info[1]) + "</p>" +
      (p.genres.length ? '<div class="cmg-chips" aria-label="Your top genres">' + p.genres.map(function (g) { return "<span>" + esc(g) + "</span>"; }).join("") + "</div>" : "") +
      "<p><b>You loved:</b> " + loved + "</p>" +
      (prof.age ? "" :
        '<div class="cmg-form"><label>Your age<input id="cmgAge" type="number" min="5" max="99" inputmode="numeric" placeholder="e.g. 20"></label>' +
        '<label>Gender<select id="cmgGender"><option value="none">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="other">Non-binary</option></select></label></div>') +
      '<p class="cmg-err" id="cmgErr" role="alert"></p>' +
      '<div class="cmg-btns"><button type="button" class="btn" data-r="picks">🍿 Get my picks</button><button type="button" class="btn ghost" data-r="again">🔀 Play again</button></div></div>';
    body.querySelector('[data-r="again"]').addEventListener("click", startSwipe);
    body.querySelector('[data-r="picks"]').addEventListener("click", function () { getPicks(p, prof); });
    var a = $("cmgAge"); if (a) a.focus(); else body.querySelector('[data-r="picks"]').focus();
  }

  /* Send the swipes through the normal recommendation flow (API + results screen in the quiz panel). */
  function getPicks(p, prof) {
    var age = prof.age, gender = prof.gender || "none";
    if (!age) {
      age = +$("cmgAge").value; gender = $("cmgGender").value;
      if (!(age >= 5 && age <= 99)) { $("cmgErr").textContent = "Enter an age between 5 and 99."; $("cmgAge").focus(); return; }
    }
    var ratings = {};
    if (typeof myRatings === "object" && myRatings) Object.keys(myRatings).forEach(function (k) { ratings[k] = myRatings[k]; });
    Object.keys(SW.ratings).forEach(function (k) { ratings[k] = SW.ratings[k]; });
    // also give the quiz these ratings + mood, so "Start over" keeps them
    if (typeof myRatings === "object" && myRatings) { Object.keys(SW.ratings).forEach(function (k) { myRatings[k] = SW.ratings[k]; }); if (typeof updateRateCount === "function") updateRateCount(); }
    var mr = document.querySelector('input[name=mood][value="' + p.mood + '"]'); if (mr) { mr.checked = true; mr.dispatchEvent(new Event("change", {bubbles: true})); }
    var user = {mood: p.mood, age: age, gender: gender, genres: p.genres, ratings: ratings};
    closePanel();
    var qp = $("quizPanel"); if (qp) { qp.classList.add("open"); document.body.style.overflow = "hidden"; qp.scrollTop = 0; }
    lastUser = user; lastShuffle = false;
    showLoading(function () { return render(user); });
  }

  /* =====================================================================
     PLOT TWIST
     ===================================================================== */
  var ROUNDS = 10, STOP = {the: 1, and: 1, "for": 1, "with": 1, from: 1, that: 1, "this": 1, into: 1, part: 1, love: 1, life: 1, story: 1, your: 1};
  var PT = null;

  function maskPlot(m) {
    var words = m.t.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(function (w) { return w.length >= 4 && !STOP[w]; });
    var out = esc(m.d);
    words.forEach(function (w) { out = out.replace(new RegExp("\\b" + w + "\\w*", "gi"), "_____"); });
    return out;
  }
  function options(m) {
    var same = shuffle(MOVIES.filter(function (x) { return x.id !== m.id && x.g.some(function (g) { return m.g.indexOf(g) > -1; }); }));
    var rest = shuffle(MOVIES.filter(function (x) { return x.id !== m.id && same.indexOf(x) < 0; }));
    return shuffle([m].concat(same.concat(rest).slice(0, 3)));
  }

  function startPlot() {
    PT = {qs: shuffle(MOVIES).slice(0, ROUNDS), qi: 0, score: 0, streak: 0, bestStreak: 0, firstTry: 0};
    openPanel("Plot Twist");
    drawQuestion();
  }

  function drawQuestion() {
    var m = PT.qs[PT.qi];
    PT.tries = 0; PT.done = false; PT.opts = options(m);
    body.innerHTML =
      '<div class="cmg-bar" aria-hidden="true"><i style="width:' + (PT.qi / ROUNDS * 100) + '%"></i></div>' +
      '<div class="cmg-row"><span>Question <b>' + (PT.qi + 1) + "</b> of " + ROUNDS + "</span><span>⭐ <b>" + PT.score + "</b> pts" + (PT.streak > 1 ? " · 🔥 <b>" + PT.streak + "</b> streak" : "") + "</span></div>" +
      '<p class="cmg-q">' + maskPlot(m) + "</p>" +
      '<div class="cmg-hints" id="cmgHints" aria-live="polite"></div>' +
      '<div class="cmg-opts" role="group" aria-label="Which movie is it?">' +
        PT.opts.map(function (o, i) { return '<button type="button" class="cmg-opt" data-o="' + i + '"><i>' + (i + 1) + "</i>" + esc(o.t) + "</button>"; }).join("") +
      "</div>" +
      '<p class="cmg-fb" id="cmgFb" aria-live="assertive"></p><div class="cmg-next" id="cmgNext"></div>';
    body.querySelectorAll("[data-o]").forEach(function (b) { b.addEventListener("click", function () { answer(+b.getAttribute("data-o")); }); });
    keyHandler = function (e) {
      if (/^[1-4]$/.test(e.key) && !PT.done) { e.preventDefault(); answer(+e.key - 1); }
      else if (e.key === "Enter" && PT.done) { e.preventDefault(); var n = $("cmgGo"); if (n) n.click(); }
    };
    var first = body.querySelector("[data-o]"); if (first) first.focus({preventScroll: true});
  }

  function addHint(m) {
    var h = $("cmgHints");
    if (PT.tries === 1) h.insertAdjacentHTML("beforeend", "<span>Released in " + m.y + "</span>");
    else if (PT.tries === 2) h.insertAdjacentHTML("beforeend", "<span>" + esc(m.g.join(" · ")) + "</span>");
    else if (PT.tries === 3) { h.insertAdjacentHTML("beforeend", posterHtml(m)); hydratePosters(h); }
  }

  function answer(i) {
    if (PT.done) return;
    var m = PT.qs[PT.qi], pick = PT.opts[i], btn = body.querySelector('[data-o="' + i + '"]');
    if (!pick || !btn || btn.disabled) return;
    var fb = $("cmgFb");
    if (pick.id !== m.id) {
      btn.classList.add("wrong"); btn.disabled = true; PT.tries++; PT.streak = 0;
      addHint(m);
      fb.className = "cmg-fb no"; fb.textContent = PT.tries < 3 ? "Not quite. Here’s a hint." : "Last hint: the poster.";
      var left = body.querySelector(".cmg-opt:not(:disabled)"); if (left) left.focus({preventScroll: true});
      return;
    }
    var pts = [3, 2, 1, 0][PT.tries] || 0;
    PT.done = true; PT.score += pts;
    if (PT.tries === 0) { PT.firstTry++; PT.streak++; PT.bestStreak = Math.max(PT.bestStreak, PT.streak); }
    btn.classList.add("right");
    body.querySelectorAll(".cmg-opt").forEach(function (b) { b.disabled = true; });
    fb.className = "cmg-fb ok";
    fb.textContent = (pts === 3 ? "Perfect! " : pts ? "Got it! " : "That’s the one. ") + "+" + pts + " point" + (pts === 1 ? "" : "s") + ": " + m.t + " (" + m.y + ")";
    var last = PT.qi + 1 >= ROUNDS;
    $("cmgNext").innerHTML = '<button type="button" class="btn ghost sm" data-n="details">🎞 Details</button>' +
      '<button type="button" class="btn sm" id="cmgGo">' + (last ? "⭐ See my score" : "Next ▶") + "</button>";
    $("cmgNext").querySelector('[data-n="details"]').addEventListener("click", function () { openModal(m.id); });
    $("cmgGo").addEventListener("click", function () { PT.qi++; if (PT.qi >= ROUNDS) plotResult(); else drawQuestion(); });
    $("cmgGo").focus({preventScroll: true});
  }

  function plotResult() {
    keyHandler = null;
    var max = ROUNDS * 3, s = PT.score, best = LS.get("cm_game_best", null), isBest = !best || s > best.score;
    if (isBest) LS.set("cm_game_best", {score: s, max: max, at: Date.now()});
    var rank = s >= 27 ? ["Film Oracle", "🎬"] : s >= 20 ? ["Cinephile", "⭐"] : s >= 12 ? ["Movie Buff", "🍿"] : ["Popcorn Rookie", "🎟"];
    body.innerHTML = '<div class="cmg-bar" aria-hidden="true"><i style="width:100%"></i></div>' +
      '<div class="cmg-res" style="margin-top:14px" aria-live="polite"><span class="cmg-ico">' + rank[1] + "</span><small>" + (isBest ? "🎉 New best score" : "Your score") + "</small>" +
      "<h3>" + s + " / " + max + "</h3><p>You’re a <b>" + rank[0] + "</b>. " + PT.firstTry + " of " + ROUNDS + " guessed on the first try" + (PT.bestStreak > 1 ? ", best streak " + PT.bestStreak : "") + ".</p>" +
      (!isBest ? "<p>Best so far: " + best.score + " / " + best.max + "</p>" : "") +
      '<div class="cmg-btns"><button type="button" class="btn" data-r="again">🔀 Play again</button><button type="button" class="btn ghost" data-cmg-close>Close</button></div></div>';
    body.querySelector('[data-r="again"]').addEventListener("click", startPlot);
    body.querySelector('[data-r="again"]').focus();
  }
})();
