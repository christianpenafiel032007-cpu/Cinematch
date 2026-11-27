/* CineMatch boost: reliable posters (cache + retry + fallback), loading skeletons, offline banner,
   accessibility, SEO/share meta, remembered quiz answers, "You might also like", share buttons, shortcuts.
   Load LAST in index.html:  <script src="cinematch-boost.js"></script> */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var safe = function (fn) { try { fn(); } catch (e) { if (window.console) console.warn("cinematch-boost:", e); } };
  var toast = function (m) { if (typeof window.toast === "function") window.toast(m); };

  /* ---------- CSS ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".cx-skip{position:fixed;left:12px;top:-60px;z-index:200;background:var(--amber);color:#2a1d00;padding:10px 18px;border-radius:999px;font-weight:700;text-decoration:none;transition:top .2s}.cx-skip:focus{top:12px}",
    "a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--coral);outline-offset:2px}",
    ".cx-skel::after{content:'';position:absolute;inset:0;z-index:2;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.14) 50%,transparent 70%);background-size:220% 100%;animation:cxSk 1.3s linear infinite}",
    "@keyframes cxSk{from{background-position:120% 0}to{background-position:-120% 0}}",
    ".cx-off{position:fixed;left:50%;top:12px;transform:translate(-50%,-90px);z-index:150;background:#0c0919;border:1px solid var(--coral);color:var(--text);padding:10px 18px;border-radius:999px;font-weight:600;font-size:.9rem;transition:transform .35s;max-width:calc(100vw - 24px);text-align:center}.cx-off.show{transform:translate(-50%,0)}",
    ".cx-sim{margin-top:20px}.cx-sim h4{margin:0 0 10px;font-family:'Fraunces',Georgia,serif;font-size:1.1rem}",
    ".cx-sim-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}",
    ".cx-sc{background:none;border:0;padding:0;cursor:pointer;color:var(--text);font:inherit;text-align:left;transition:transform .2s}.cx-sc:hover{transform:translateY(-3px)}",
    ".cx-sc .poster{min-height:0!important;aspect-ratio:2/3;border-radius:10px;font-size:0;border:1px solid rgba(255,255,255,.15)}.cx-sc .poster svg.art{margin:0!important;width:55%!important}",
    ".cx-sc span{display:block;font-size:.75rem;line-height:1.25;margin-top:6px;color:var(--muted)}",
    "@media(max-width:520px){.cx-sim-row{grid-template-columns:repeat(2,1fr)}}",
    "@media(prefers-reduced-motion:reduce){.cx-skel::after{animation:none}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- <head>: SEO, share card, favicon, preconnect ---------- */
  safe(function () {
    var h = document.head;
    function meta(attr, name, content) { if (h.querySelector("meta[" + attr + '="' + name + '"]')) return; var m = document.createElement("meta"); m.setAttribute(attr, name); m.content = content; h.appendChild(m); }
    var desc = "Tell CineMatch your mood and taste. It finds viewers like you and shows the movies they loved. Free, no sign-up.";
    meta("name", "description", desc);
    meta("property", "og:title", document.title); meta("property", "og:description", desc); meta("property", "og:type", "website");
    meta("name", "twitter:card", "summary");
    if (!h.querySelector("link[rel~=icon]")) {
      var l = document.createElement("link"); l.rel = "icon";
      l.href = "data:image/svg+xml," + encodeURIComponent(window.CMIcon ? "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='#15112a'/><g transform='translate(4 4)' fill='none' stroke='#ffb627' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" + window.CMIcon("clapperboard").slice(window.CMIcon("clapperboard").indexOf(">") + 1).replace("</" + "svg>", "") + "</g></svg>" : "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎬</text></svg>");
      h.appendChild(l);
    }
    ["https://api.themoviedb.org", "https://image.tmdb.org", "https://en.wikipedia.org"].forEach(function (u) {
      var p = document.createElement("link"); p.rel = "preconnect"; p.href = u; p.crossOrigin = ""; h.appendChild(p);
    });
  });

  /* ---------- accessibility: skip link + main landmark ---------- */
  safe(function () {
    var main = document.querySelector("main"); if (main) { main.id = main.id || "main"; main.tabIndex = -1; }
    var a = document.createElement("a"); a.className = "cx-skip"; a.href = "#main"; a.textContent = "Skip to content";
    document.body.insertBefore(a, document.body.firstChild);
    var tt = $("top"); if (tt && !tt.title) tt.title = "Back to top";
  });

  /* ---------- RELIABLE POSTERS ---------- */
  var PK = "cm_poster_cache_v1", cache = LS.get(PK, {}), inflight = {}, failedAt = {};
  function saveCache() { LS.set(PK, cache); }
  function tfetch(url, ms) {
    var c = window.AbortController ? new AbortController() : null, t = c && setTimeout(function () { c.abort(); }, ms);
    return fetch(url, c ? {signal: c.signal} : {}).then(function (r) { clearTimeout(t); return r; }, function (e) { clearTimeout(t); throw e; });
  }
  function keyOf(m) { return m.id + "|" + m.t + "|" + m.y; }
  window.posterSrc = function (m) {
    if (!m) return Promise.resolve(null);
    var k = keyOf(m);
    if (cache[k]) return Promise.resolve(cache[k]);
    if (inflight[k]) return inflight[k];
    if (failedAt[k] && Date.now() - failedAt[k] < 45000) return Promise.resolve(null);
    inflight[k] = (async function () {
      var url = null;
      if (typeof LOCAL_POSTERS !== "undefined" && LOCAL_POSTERS) url = "posters/" + m.id + ".jpg";
      if (!url && typeof TMDB_KEY !== "undefined" && TMDB_KEY) {
        for (var i = 0; i < 2 && !url; i++) {
          try {
            var r = await tfetch("https://api.themoviedb.org/3/search/movie?api_key=" + TMDB_KEY + "&query=" + encodeURIComponent(m.t) + "&year=" + m.y, 7000);
            if (!r.ok) break;                               // bad key or blocked: stop retrying, use fallback
            var d = await r.json(), f = d.results && d.results[0];
            if (f && f.poster_path) url = "https://image.tmdb.org/t/p/w342" + f.poster_path;
            else break;
          } catch (e) { /* timeout or network: retry once */ }
        }
      }
      if (!url) {
        try {
          var q = encodeURIComponent('"' + m.t + '" ' + m.y + " film");
          var w = await tfetch("https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=" + q + "&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*", 7000);
          var wd = await w.json(), p = wd.query && Object.values(wd.query.pages)[0];
          if (p && p.thumbnail) url = p.thumbnail.source;
        } catch (e) {}
      }
      if (url) { cache[k] = url; saveCache(); } else failedAt[k] = Date.now();
      delete inflight[k];
      return url;
    })();
    return inflight[k];
  };
  window.hydratePosters = function (root) {
    (root || document).querySelectorAll(".poster[data-id]").forEach(function (el) {
      if (el.querySelector("img") || el.dataset.pl) return;
      var m = byId(el.dataset.id); if (!m) return;
      el.dataset.pl = "1"; el.classList.add("cx-skel");
      posterSrc(m).then(function (src) {
        el.classList.remove("cx-skel"); delete el.dataset.pl;
        if (!src) return;
        var img = new Image(); img.alt = m.t + " poster"; img.decoding = "async";
        img.onload = function () { if (!el.querySelector("img")) el.appendChild(img); };
        img.onerror = function () { delete cache[keyOf(m)]; saveCache(); };
        img.src = src;
      });
    });
  };
  hydratePosters(document);

  /* ---------- offline banner ---------- */
  safe(function () {
    var b = document.createElement("div"); b.className = "cx-off"; b.setAttribute("role", "status");
    b.textContent = "You’re offline. Some posters and trailers may not load.";
    document.body.appendChild(b);
    function upd() { b.classList.toggle("show", navigator.onLine === false); }
    addEventListener("offline", upd);
    addEventListener("online", function () { upd(); toast("Back online"); hydratePosters(document); });
    upd();
  });

  /* ---------- remember age, gender and genres ---------- */
  safe(function () {
    var quiz = $("quiz"); if (!quiz) return;
    var p = LS.get("cm_prefs", null);
    function fire(el) { el.dispatchEvent(new Event("input", {bubbles: true})); el.dispatchEvent(new Event("change", {bubbles: true})); }
    if (p) {
      if (p.age && $("age")) { $("age").value = p.age; fire($("age")); }
      if (p.gender && $("gender")) { $("gender").value = p.gender; if (window.cxGenderSync) cxGenderSync(); }
      (p.genres || []).forEach(function (g) { var c = quiz.querySelector('input[name=genre][value="' + g.replace(/"/g, "") + '"]'); if (c) { c.checked = true; fire(c); } });
      if (p.age) setTimeout(function () { toast("Welcome back! We remembered your age and genres."); }, 1200);
    }
    quiz.addEventListener("submit", function () {
      LS.set("cm_prefs", {
        age: +$("age").value, gender: $("gender").value,
        genres: [].map.call(quiz.querySelectorAll("input[name=genre]:checked"), function (x) { return x.value; })
      });
    });
    document.addEventListener("click", function (e) { if (e.target.closest("#cxDel")) LS.del("cm_prefs"); }, true); // privacy "Delete all"
  });

  /* ---------- share ---------- */
  function share(title, text) {
    var url = location.href.split("#")[0];
    if (navigator.share) { navigator.share({title: title, text: text, url: url}).catch(function () {}); return; }
    var full = text + " " + url;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(full).then(function () { toast("Copied to clipboard"); }, function () { toast("Could not copy"); });
    else toast("Sharing isn’t supported here");
  }
  safe(function () {
    var ra = document.querySelector(".res-actions"); if (!ra) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "btn ghost sm"; b.textContent = "🔗 Share picks";
    b.addEventListener("click", function () {
      var recs = typeof lastRecs !== "undefined" ? lastRecs : [];
      share("My CineMatch picks", "My CineMatch picks: " + recs.map(function (r) { return r.m.t; }).join(", ") + ".");
    });
    ra.appendChild(b);
  });

  /* ---------- movie details: share + "You might also like" ---------- */
  var origOpen = window.openModal;
  if (typeof origOpen === "function") {
    window.openModal = function (id) {
      origOpen(id);
      safe(function () {
        var m = byId(id), info = document.querySelector("#modal .m-info"); if (!m || !info) return;
        var acts = info.querySelector(".m-actions");
        if (acts && !acts.querySelector(".cx-share")) {
          var sb = document.createElement("button"); sb.type = "button"; sb.className = "btn ghost cx-share"; sb.textContent = "🔗 Share";
          sb.onclick = function () { share(m.t, "Check out " + m.t + " (" + m.y + ") on CineMatch."); };
          acts.appendChild(sb);
        }
        var old = info.querySelector(".cx-sim"); if (old) old.remove();
        var sim = MOVIES.filter(function (x) { return x.id !== m.id; }).map(function (x) {
          var s = 0; x.g.forEach(function (g) { if (m.g.indexOf(g) > -1) s += 2; }); x.m.forEach(function (k) { if (m.m.indexOf(k) > -1) s += 1; });
          return {x: x, s: s};
        }).filter(function (o) { return o.s > 0; }).sort(function (a, b) { return b.s - a.s || b.x.y - a.x.y; }).slice(0, 4);
        if (!sim.length) return;
        var box = document.createElement("div"); box.className = "cx-sim";
        box.innerHTML = "<h4>You might also like</h4><div class=\"cx-sim-row\">" + sim.map(function (o) {
          return '<button type="button" class="cx-sc" data-sim="' + o.x.id + '"><div class="poster" data-id="' + o.x.id + '" style="background:' + posterBg(o.x) + '">' + artSvg(o.x.id) + "</div><span>" + esc(o.x.t) + "</span></button>";
        }).join("") + "</div>";
        box.addEventListener("click", function (e) {
          var b = e.target.closest("[data-sim]"); if (!b) return;
          openModal(b.dataset.sim); var c = document.querySelector("#modal .m-card"); if (c) c.scrollTo({top: 0, behavior: "smooth"});
        });
        info.appendChild(box); hydratePosters(box);
      });
    };
  }

  /* ---------- shortcuts: "/" focuses search ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName; if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    var s = $("movieSearch"); if (!s) return; e.preventDefault();
    var sec = $("searchSection"); if (sec) sec.scrollIntoView({behavior: "smooth", block: "center"}); s.focus();
  });
})();
