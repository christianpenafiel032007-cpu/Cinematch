/* CineMatch browse: a streaming-style home screen. Rotating featured billboard, mood filter,
   Top 10, "Just added", genre rows, pop-out cards on hover, and your own list.
   Add LAST in index.html (after cinematch-polish.js):  <script src="cinematch-browse.js"></script> */
(function () {
  "use strict";
  if (typeof MOVIES === "undefined" || typeof STATS === "undefined") return;
  var $ = function (i) { return document.getElementById(i); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var host = document.querySelector("main"), anchor = $("searchSection");
  if (!host || !anchor) return;

  /* ---------- CSS ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".bw{margin:0 0 var(--sec,64px)}",
    "#searchSection{margin:8px 0 28px!important}",
    /* billboard */
    ".bw-bill{position:relative;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.1);min-height:420px;display:flex;align-items:center;isolation:isolate;box-shadow:0 30px 60px -30px rgba(0,0,0,.9)}",
    ".bw-bg{position:absolute;inset:0;z-index:-2;transition:background .6s}",
    ".bw-bill::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(10,7,23,.92) 0%,rgba(10,7,23,.7) 45%,rgba(10,7,23,.15) 100%),linear-gradient(0deg,rgba(10,7,23,.85),transparent 45%)}",
    ".bw-in{display:grid;grid-template-columns:1fr 230px;gap:40px;align-items:center;width:100%;padding:44px clamp(22px,5vw,56px) 64px;animation:bwIn .5s ease both}",
    "@keyframes bwIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}",
    ".bw-txt h2{font-size:clamp(2rem,4.6vw,3.6rem);line-height:1.03;margin:0 0 14px;max-width:14em}",
    ".bw-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin:0 0 14px;color:var(--muted);font-size:.92rem}",
    ".bw-age{border:1px solid rgba(255,255,255,.35);border-radius:6px;padding:1px 8px;font-size:.8rem;color:var(--text)}",
    ".bw-txt p{margin:0 0 24px;max-width:34em;font-size:1.05rem;line-height:1.6;color:#e4def2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}",
    ".bw-btns{display:flex;flex-wrap:wrap;gap:12px}",
    ".bw-post{transform:rotate(3deg);filter:drop-shadow(0 24px 30px rgba(0,0,0,.6))}",
    ".bw-post .poster{width:100%}",
    ".bw-dots{position:absolute;left:clamp(22px,5vw,56px);bottom:22px;display:flex;gap:8px}",
    ".bw-dots button{width:34px;height:6px;padding:0;border:0;border-radius:3px;background:rgba(255,255,255,.25);cursor:pointer;transition:background .2s,width .2s}",
    ".bw-dots button.on{width:54px;background:var(--amber)}",
    /* moods */
    ".bw-moods{display:flex;gap:8px;overflow-x:auto;padding:22px 2px 6px;scrollbar-width:none}",
    ".bw-moods::-webkit-scrollbar{display:none}",
    ".bw-mood{flex:0 0 auto;font:600 .9rem 'DM Sans',sans-serif;color:var(--muted);background:rgba(0,0,0,.2);border:1px solid var(--line);border-radius:999px;padding:9px 16px;cursor:pointer;transition:.15s}",
    ".bw-mood:hover{color:var(--text);border-color:var(--amber)}",
    ".bw-mood.on{background:var(--amber);border-color:var(--amber);color:#2a1d00}",
    /* rows */
    ".bw-row{position:relative;margin-top:22px}",
    ".bw-row h3{margin:0 0 4px;font-size:1.3rem;padding-left:2px}",
    ".bw-sc{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x proximity;scrollbar-width:none;padding:30px 2px 34px;margin:-22px 0 -26px}",
    ".bw-sc::-webkit-scrollbar{display:none}",
    ".bw-c{position:relative;flex:0 0 150px;scroll-snap-align:start;transition:transform .25s,z-index 0s .25s}",
    ".bw-c:hover,.bw-c:focus-within{transform:scale(1.16);z-index:5;transition:transform .25s}",
    ".bw-sc>.bw-c:first-child:hover,.bw-sc>.bw-c:first-child:focus-within{transform-origin:left center}",
    ".bw-p{display:block;width:100%;padding:0;border:0;background:none;cursor:pointer;color:inherit;border-radius:12px;overflow:hidden}",
    ".bw .poster{min-height:0!important;aspect-ratio:2/3;border-radius:12px;font-size:0;border:1px solid rgba(255,255,255,.14)}",
    ".bw .poster svg.art{margin:0!important;width:46%!important}",
    ".bw .poster img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1}",
    ".bw-ov{position:absolute;left:0;right:0;bottom:0;z-index:3;padding:34px 10px 10px;border-radius:0 0 12px 12px;background:linear-gradient(0deg,rgba(8,5,18,.96) 25%,transparent);opacity:0;transition:opacity .2s;pointer-events:none}",
    ".bw-c:hover .bw-ov,.bw-c:focus-within .bw-ov{opacity:1;pointer-events:auto}",
    ".bw-ov strong{display:block;font-size:.82rem;line-height:1.2;margin-bottom:5px}",
    ".bw-ov .stars-row{font-size:.74rem}",
    ".bw-b{display:flex;gap:6px;margin-top:8px}",
    ".bw-i{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.5);background:rgba(20,15,40,.8);color:var(--text);font-size:.85rem;cursor:pointer;display:grid;place-items:center;padding:0;transition:.15s}",
    ".bw-i:hover{background:var(--amber);border-color:var(--amber);color:#2a1d00}",
    ".bw-i.on{background:var(--coral);border-color:var(--coral)}",
    ".bw-t{flex-basis:196px;padding-left:46px}",
    ".bw-t .bw-p{width:150px}",
    ".bw-t .bw-ov{left:46px}",
    ".bw-n{position:absolute;left:-2px;bottom:-14px;font:800 7.2rem/1 'Fraunces',serif;letter-spacing:-.08em;color:transparent;-webkit-text-stroke:2px var(--amber);pointer-events:none;user-select:none;z-index:0}",
    ".bw-a{position:absolute;top:50%;z-index:8;width:44px;height:84px;margin-top:-18px;border:0;color:#fff;font-size:1.8rem;cursor:pointer;opacity:0;transition:opacity .2s;background:rgba(10,7,23,.75)}",
    ".bw-row:hover .bw-a{opacity:1}",
    ".bw-a.l{left:0;border-radius:0 12px 12px 0}.bw-a.r{right:0;border-radius:12px 0 0 12px}",
    ".bw-empty{margin:22px 0 0;color:var(--muted)}",
    "@media(max-width:820px){.bw-in{grid-template-columns:1fr;padding-bottom:70px}.bw-post{display:none}.bw-bill{min-height:360px}.bw-a{display:none}}",
    "@media(hover:none){.bw-c:hover,.bw-c:focus-within{transform:none}.bw-ov{opacity:1;padding-top:26px}.bw-b,.bw-ov .stars-row{display:none}}",
    "@media(max-width:520px){.bw-c{flex-basis:128px}.bw-t{flex-basis:172px;padding-left:40px}.bw-t .bw-p{width:128px}.bw-t .bw-ov{left:40px}.bw-n{font-size:6rem}}",
    "@media(prefers-reduced-motion:reduce){.bw-in{animation:none}.bw-c,.bw-c:hover{transition:none}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- skeleton ---------- */
  var sec = document.createElement("section");
  sec.id = "browse"; sec.className = "bw"; sec.setAttribute("aria-label", "Browse movies");
  sec.innerHTML = '<div class="bw-bill" id="bwBill"></div><div class="bw-moods" id="bwMoods" role="group" aria-label="Pick a mood"></div><div id="bwMy"></div><div id="bwRows"></div>';
  host.insertBefore(sec, anchor);
  host.insertBefore(anchor, host.firstChild); /* search goes to the very top */

  /* ---------- data helpers ---------- */
  var avg = function (m) { return STATS[m.id] ? STATS[m.id].avg : 0; };
  var cnt = function (m) { return STATS[m.id] ? STATS[m.id].count : 0; };
  var ranked = MOVIES.slice().sort(function (a, b) { return avg(b) - avg(a) || cnt(b) - cnt(a) || b.y - a.y; });
  var mood = null, idx = 0, timer = null, paused = false;
  var wl = function () { return typeof getWL === "function" ? getWL() : []; };
  var inWL = function (id) { return wl().indexOf(+id) > -1; };
  var pool = function () { return mood ? ranked.filter(function (m) { return m.m.indexOf(mood) > -1; }) : ranked; };
  var featured = function () { return pool().filter(function (m) { return cnt(m) >= 2; }).slice(0, 5); };
  var hydrate = function (r) { if (typeof hydratePosters === "function") hydratePosters(r); };
  var poster = function (m) { return '<div class="poster" data-id="' + m.id + '" style="background:' + posterBg(m) + '">' + artSvg(m.id) + "</div>"; };

  /* ---------- billboard ---------- */
  function renderBill() {
    var list = featured(); if (!list.length) list = ranked.slice(0, 5);
    if (idx >= list.length) idx = 0;
    var m = list[idx], on = inWL(m.id);
    $("bwBill").innerHTML =
      '<div class="bw-bg" style="background:' + posterBg(m) + '"></div>' +
      '<div class="bw-in"><div class="bw-txt"><h2>' + esc(m.t) + '</h2>' +
      '<div class="bw-meta"><span>' + m.y + '</span><span>' + esc(m.g.join(", ")) + '</span><span class="bw-age">' + m.min + '+</span>' + (cnt(m) ? starsHtml(avg(m), cnt(m), true) : "") + '</div>' +
      '<p>' + esc(m.d || "") + '</p>' +
      '<div class="bw-btns"><button type="button" class="btn lg" data-open="' + m.id + '">▶ Trailer &amp; details</button>' +
      '<button type="button" class="btn ghost lg" data-bwsave="' + m.id + '">' + (on ? "✓ On my list" : "＋ My list") + '</button></div></div>' +
      '<div class="bw-post">' + poster(m) + '</div></div>' +
      '<div class="bw-dots">' + list.map(function (_, i) { return '<button type="button" data-dot="' + i + '" class="' + (i === idx ? "on" : "") + '" aria-label="Show pick ' + (i + 1) + '"></button>'; }).join("") + '</div>';
    hydrate($("bwBill"));
  }
  function startTimer() {
    clearInterval(timer);
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(function () {
      if (paused || document.hidden) return;
      idx++; renderBill();
    }, 8000);
  }
  var bill = $("bwBill");
  bill.addEventListener("mouseenter", function () { paused = true; });
  bill.addEventListener("mouseleave", function () { paused = false; });
  bill.addEventListener("focusin", function () { paused = true; });
  bill.addEventListener("focusout", function () { paused = false; });

  /* ---------- moods ---------- */
  function renderMoods() {
    var h = '<button type="button" class="bw-mood' + (mood ? "" : " on") + '" data-mood="">All</button>';
    Object.keys(MOODS).forEach(function (k) { h += '<button type="button" class="bw-mood' + (mood === k ? " on" : "") + '" data-mood="' + k + '" aria-pressed="' + (mood === k) + '">' + MOODS[k] + "</button>"; });
    $("bwMoods").innerHTML = h;
  }

  /* ---------- rows ---------- */
  function card(m, rank) {
    var on = inWL(m.id);
    return '<article class="bw-c' + (rank ? " bw-t" : "") + '">' + (rank ? '<span class="bw-n" aria-hidden="true">' + rank + "</span>" : "") +
      '<button type="button" class="bw-p" data-open="' + m.id + '" aria-label="' + esc(m.t) + ', details">' + poster(m) + "</button>" +
      '<div class="bw-ov"><strong>' + esc(m.t) + "</strong>" + (cnt(m) ? starsHtml(avg(m), cnt(m), true) : "") +
      '<div class="bw-b"><button type="button" class="bw-i" data-open="' + m.id + '" aria-label="Trailer and details">▶</button>' +
      '<button type="button" class="bw-i' + (on ? " on" : "") + '" data-bwsave="' + m.id + '" aria-label="' + (on ? "Remove from my list" : "Add to my list") + '">' + (on ? "✓" : "＋") + "</button></div></div></article>";
  }
  function row(title, list, top10) {
    if (!list.length) return "";
    return '<div class="bw-row"><h3>' + esc(title) + '</h3><button type="button" class="bw-a l" aria-label="Scroll left">‹</button><div class="bw-sc">' +
      list.map(function (m, i) { return card(m, top10 ? i + 1 : 0); }).join("") + '</div><button type="button" class="bw-a r" aria-label="Scroll right">›</button></div>';
  }
  var GENRE_TITLES = {Drama: "Stories that stay with you", Action: "Big, loud and thrilling", Comedy: "Easy laughs", Romance: "Falling in love", Animation: "Animated favorites", Horror: "Lights on, please", "Sci-Fi": "Other worlds and future shock", Thriller: "Edge of your seat", Crime: "Crime and consequence", Fantasy: "Magic and myth", Family: "Family night", Mystery: "Whodunit"};
  function renderRows() {
    var p = pool(), html = "";
    if (mood) html += row("Fits your " + (MOOD_TEXT[mood] || mood) + " mood", p.slice(0, 20));
    html += row("Just added", MOVIES.slice().sort(function (a, b) { return b.id - a.id; }).slice(0, 16));
    var gc = {}; MOVIES.forEach(function (m) { m.g.forEach(function (g) { gc[g] = (gc[g] || 0) + 1; }); });
    Object.keys(gc).filter(function (g) { return gc[g] >= 6 && g !== "Music" && g !== "Adventure"; }).sort(function (a, b) { return gc[b] - gc[a]; }).slice(0, 8).forEach(function (g) {
      html += row(GENRE_TITLES[g] || g, p.filter(function (m) { return m.g.indexOf(g) > -1; }).slice(0, 20));
    });
    if (!html) html = '<p class="bw-empty">Nothing here yet.</p>';
    $("bwRows").innerHTML = html;
    hydrate($("bwRows"));
  }
  function renderMy() {
    var ids = wl(), list = ids.map(byId).filter(Boolean).reverse();
    $("bwMy").innerHTML = row("My list", list);
    hydrate($("bwMy"));
  }

  function syncMine() {
    sec.querySelectorAll("[data-bwsave]").forEach(function (b) {
      var on = inWL(b.dataset.bwsave), big = b.classList.contains("btn");
      b.classList.toggle("on", on && !big);
      b.textContent = big ? (on ? "✓ On my list" : "＋ My list") : (on ? "✓" : "＋");
      if (!big) b.setAttribute("aria-label", on ? "Remove from my list" : "Add to my list");
    });
  }

  /* ---------- events ---------- */
  sec.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target : e.target.parentNode;
    var mb = t.closest("[data-mood]");
    if (mb) { mood = mb.dataset.mood || null; idx = 0; renderMoods(); renderBill(); renderRows(); startTimer(); return; }
    var dot = t.closest("[data-dot]");
    if (dot) { idx = +dot.dataset.dot; renderBill(); startTimer(); return; }
    var sv = t.closest("[data-bwsave]");
    if (sv) {
      toggleWL(sv.dataset.bwsave);
      renderMy(); syncMine();
      return;
    }
    var ar = t.closest(".bw-a");
    if (ar) { var sc = ar.parentNode.querySelector(".bw-sc"); sc.scrollBy({left: (ar.classList.contains("l") ? -1 : 1) * sc.clientWidth * .85, behavior: "smooth"}); }
  });
  /* keep "My list" in step when the list is changed from elsewhere (results, popup, watchlist panel) */
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-save], #m-save, #cxM")) setTimeout(function () { renderMy(); syncMine(); }, 80);
  }, true);

  renderMoods(); renderBill(); renderMy(); renderRows(); startTimer();
})();