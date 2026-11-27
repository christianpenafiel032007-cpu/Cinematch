/* CineMatch collaborative-filtering explainer.
   Load LAST in index.html, after cinematch-icons.js:
   <script src="cinematch-cf.js"></script>

   What it adds
   1. A "using collaborative filtering" tag (with a short explainer) beside "Find your next movie".
   2. In every movie's details: a step-by-step "How this was calculated" panel that shows the real
      numbers behind the match % (your mood, age, gender, genres and ratings -> neighbours -> prediction -> score).
   3. A 1-5 star "Rate this movie" control. Rating (or un-rating) re-runs the whole algorithm: viewer
      similarities, predicted ratings, scores and the picks list all update, and the panel shows what changed.

   recommend() is replaced by an equivalent version (same maths, same results) that also records the
   per-movie shuffle bonus so the panel can show exact numbers. */
(function () {
  "use strict";
  if (typeof MOVIES === "undefined" || typeof VIEWERS === "undefined" || typeof recommend !== "function") return;

  var $ = function (i) { return document.getElementById(i); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; }); };
  var f2 = function (x) { return x.toFixed(2); }, f3 = function (x) { return x.toFixed(3); };
  var LSKEY = "cm_myratings";

  /* ======================================================================
     ENGINE  (identical maths to the original recommend())
     ====================================================================== */
  var K = 8; // neighbours kept
  var origRecommend = recommend;
  var noiseMap = {}; // movie id -> shuffle bonus used by the most recent recommend() call

  function ageSim(u, v) { return Math.max(0, 1 - Math.abs(u.age - v.a) / 30); }
  function genderSim(u, v) { return u.gender === "none" ? 0.6 : (u.gender === v.g ? 1 : 0.4); }

  // Similarity of the user to every viewer, with the full breakdown. `top` = the K nearest.
  function neighborsOf(user) {
    var ratings = user.ratings || {};
    var all = VIEWERS.map(function (v, i) {
      var as = ageSim(user, v), gs = genderSim(user, v), prof = 0.65 * as + 0.35 * gs;
      var shared = Object.keys(ratings).filter(function (id) { return v.r[id] != null; }).map(function (id) {
        return {id: +id, mine: ratings[id], theirs: v.r[id], diff: Math.abs(ratings[id] - v.r[id])};
      });
      var taste = null, avgDiff = null;
      if (shared.length) {
        avgDiff = shared.reduce(function (s, x) { return s + x.diff; }, 0) / shared.length;
        taste = 1 - avgDiff / 4;
      }
      var sim = taste === null ? prof : 0.65 * taste + 0.35 * prof;
      return {i: i, v: v, ageSim: as, genderSim: gs, prof: prof, shared: shared, avgDiff: avgDiff, taste: taste, sim: sim};
    });
    var top = all.slice().sort(function (a, b) { return b.sim - a.sim; }).slice(0, K);
    return {all: all, top: top};
  }

  // Full calculation for one movie given the neighbours.
  function traceFor(user, m, nb, noise) {
    var num = 0, den = 0, fans = 0, rows = [];
    nb.top.forEach(function (n) {
      var r = n.v.r[m.id];
      if (r != null) { num += n.sim * r; den += n.sim; if (r >= 4) fans++; rows.push({n: n, rating: r, part: n.sim * r}); }
    });
    var predicted = den ? num / den : 3;
    var picked = m.g.filter(function (g) { return (user.genres || []).indexOf(g) > -1; });
    var moodHit = m.m.indexOf(user.mood) > -1 ? 1 : 0;
    var genreHit = picked.length ? 1 : 0;
    var base = (predicted / 5) * 0.6;
    noise = noise || 0;
    var score = base + moodHit * 0.25 + genreHit * 0.15 + noise;
    return {num: num, den: den, rows: rows, fans: fans, predicted: predicted, noPred: !den, moodHit: moodHit, genreHit: genreHit,
      picked: picked, base: base, noise: noise, score: score, pct: Math.min(99, Math.round(score * 100)),
      eligible: user.age >= (m.min || 0), rated: (user.ratings || {})[m.id] != null};
  }

  // Same signature/results as the original recommend(); also records the shuffle bonus per movie.
  window.recommend = function (user, shuffle) {
    var nb = neighborsOf(user), out = [];
    noiseMap = {};
    for (var k = 0; k < MOVIES.length; k++) {
      var m = MOVIES[k];
      if (user.ratings[m.id] != null || user.age < m.min) continue;
      var t = traceFor(user, m, nb, 0);
      var noise = shuffle ? Math.random() * 0.12 : 0;
      noiseMap[m.id] = noise;
      out.push({m: m, score: t.base + t.moodHit * 0.25 + t.genreHit * 0.15 + noise, fans: t.fans, moodHit: t.moodHit, genreHit: t.genreHit, predicted: t.predicted});
    }
    return out.sort(function (a, b) { return b.score - a.score; }).slice(0, 6);
  };

  // Noise-free ranking of every eligible movie (used for before/after comparisons).
  function rankAll(user) {
    var nb = neighborsOf(user), list = [];
    MOVIES.forEach(function (m) {
      if (user.ratings[m.id] != null || user.age < m.min) return;
      var t = traceFor(user, m, nb, 0);
      list.push({m: m, score: t.score, pct: t.pct});
    });
    list.sort(function (a, b) { return b.score - a.score; });
    return {nb: nb, list: list};
  }

  window.CF = {neighborsOf: neighborsOf, traceFor: traceFor, rankAll: rankAll, original: origRecommend};

  /* ======================================================================
     STYLES
     ====================================================================== */
  var css = document.createElement("style");
  css.textContent = [
    /* header tag */
    ".qp-title{display:flex;align-items:center;gap:8px 14px;flex-wrap:wrap;min-width:0}",
    ".qp-title h2{margin:0}",
    ".cf-pill{display:inline-flex;align-items:center;gap:7px;font:600 .82rem/1 'DM Sans',sans-serif;color:var(--amber);background:rgba(255,182,39,.1);border:1px solid rgba(255,182,39,.45);border-radius:999px;padding:7px 12px;cursor:pointer;transition:.2s}",
    ".cf-pill:hover,.cf-pill[aria-expanded=true]{background:rgba(255,182,39,.2);box-shadow:0 0 18px -4px rgba(255,182,39,.6)}",
    ".cf-pill svg{width:15px;height:15px;flex:none}",
    ".cf-explain{margin:0 0 14px;padding:12px 16px;border:1px solid var(--line);border-left:3px solid var(--amber);border-radius:12px;background:rgba(31,26,58,.9);color:var(--muted);font-size:.92rem}",
    ".cf-explain b{color:var(--text)}",
    ".cf-explain[hidden]{display:none}",
    ".cf-hdr{color:var(--amber);font-weight:700}",
    /* keep the offline notice off the title */
    ".cx-off{top:auto!important;bottom:18px;transform:translate(-50%,90px)!important}.cx-off.show{transform:translate(-50%,0)!important}",
    /* modal */
    "#modal .m-card{width:min(900px,100%)}",
    /* rating */
    ".cf-rate{margin-top:16px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:rgba(0,0,0,.18)}",
    ".cf-rate-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}",
    ".cf-rate-h b{font-size:.95rem}.cf-rate-s{color:var(--muted);font-size:.85rem}",
    ".cf-stars{display:flex;gap:4px;margin:6px 0 4px}",
    ".cf-stars button{background:none;border:0;padding:0 2px;font-size:1.9rem;line-height:1;color:rgba(255,255,255,.22);cursor:pointer;transition:transform .12s,color .12s}",
    ".cf-stars button.on,.cf-stars button.hv{color:var(--amber);text-shadow:0 0 14px rgba(255,182,39,.55)}",
    ".cf-stars button:hover{transform:scale(1.18)}",
    ".cf-rate small{color:var(--muted);font-size:.8rem}",
    /* calc panel */
    ".cf{margin-top:22px;padding:18px;border:1px solid var(--line);border-radius:14px;background:rgba(10,7,22,.55);font-size:.92rem}",
    ".cf-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}",
    ".cf-head h4{margin:0;font-family:'Fraunces',Georgia,serif;font-size:1.2rem}",
    ".cf-tag{font-size:.74rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--amber);border:1px solid rgba(255,182,39,.4);border-radius:999px;padding:4px 10px}",
    ".cf-lead{margin:6px 0 12px;color:var(--muted)}",
    ".cf-banner{margin:0 0 12px;padding:9px 12px;border-radius:10px;background:rgba(255,93,115,.12);border:1px solid rgba(255,93,115,.45);color:var(--text)}",
    ".cf-total{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin:6px 0 14px}",
    ".cf-big{font:800 2.4rem/1 'Fraunces',Georgia,serif;color:var(--amber)}",
    ".cf-big small{display:block;font:500 .75rem 'DM Sans',sans-serif;color:var(--muted)}",
    ".cf-bar{flex:1;min-width:220px}",
    ".cf-seg{display:flex;height:12px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.07)}",
    ".cf-seg i{display:block;height:100%}.cf-seg .s1{background:#ff5d73}.cf-seg .s2{background:#ffb627}.cf-seg .s3{background:#6ee7b7}.cf-seg .s4{background:#8b8fa8}",
    ".cf-key{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;font-size:.78rem;color:var(--muted)}",
    ".cf-key span:before{content:'';display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;background:var(--c)}",
    ".cf details{border-top:1px solid var(--line);padding:10px 0}",
    ".cf summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px;font-weight:700}",
    ".cf summary::-webkit-details-marker{display:none}",
    ".cf summary i{font:800 .85rem 'Fraunces',Georgia,serif;font-style:normal;display:grid;place-items:center;flex:none;width:24px;height:24px;border-radius:50%;background:var(--amber);color:#2a1d00}",
    ".cf summary em{font-style:normal;font-weight:500;color:var(--muted);font-size:.85rem;margin-left:auto;text-align:right}",
    ".cf summary:after{content:'\\25BE';color:var(--muted);transition:transform .2s}",
    ".cf details[open]>summary:after{transform:rotate(180deg)}",
    ".cf-body{padding:10px 0 2px 34px}",
    "@media(max-width:560px){.cf-body{padding-left:0}.cf summary em{display:none}.cf-eq{white-space:pre-wrap!important}}",
    ".cf-eq{font:500 .84rem/1.7 ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',monospace;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 12px;margin:0 0 10px;overflow-x:auto;white-space:pre;color:#e9e2f7}",
    ".cf-eq b{color:var(--amber)}.cf-eq u{text-decoration:none;color:#6ee7b7}",
    ".cf-chips{display:flex;flex-wrap:wrap;gap:6px}",
    ".cf-chips span{border:1px solid var(--line);border-radius:999px;padding:4px 10px;font-size:.83rem;background:rgba(0,0,0,.2)}",
    ".cf-chips span b{color:var(--amber)}",
    ".cf-tw{overflow-x:auto;margin:0 0 8px}",
    ".cf table{border-collapse:collapse;width:100%;min-width:520px;font-size:.82rem}",
    ".cf th{color:var(--muted);font-weight:600;text-align:right;padding:5px 8px;border-bottom:1px solid var(--line);white-space:nowrap}",
    ".cf td{padding:5px 8px;text-align:right;border-bottom:1px solid rgba(255,255,255,.05);white-space:nowrap}",
    ".cf th:first-child,.cf td:first-child{text-align:left}",
    ".cf tr.dim td{opacity:.45}",
    ".cf tr.hit td{background:rgba(255,182,39,.07)}",
    ".cf td.cfk{color:var(--amber);font-weight:700}",
    ".cf-note{color:var(--muted);font-size:.82rem;margin:6px 0 0}",
    ".cf-list{margin:6px 0 0;padding-left:18px;color:var(--muted);font-size:.84rem}.cf-list b{color:var(--text)}",
    ".cf-diff{margin:0 0 14px;padding:12px 14px;border-radius:12px;border:1px solid rgba(110,231,183,.5);background:rgba(110,231,183,.07);animation:fade .3s}",
    ".cf-diff h5{margin:0 0 8px;font-size:.98rem}",
    ".cf-diff ul{margin:4px 0 8px;padding-left:18px;font-size:.84rem}",
    ".cf-up{color:#6ee7b7}.cf-dn{color:#ff8fa3}",
    ".cf-go{margin-top:10px}"
  ].join("\n");
  document.head.appendChild(css);

  /* ======================================================================
     1. TAG BESIDE "Find your next movie"
     ====================================================================== */
  (function () {
    var head = document.querySelector("#quizPanel .qp-head"), h2 = head && head.querySelector("h2");
    if (!h2) return;
    var wrap = document.createElement("div"); wrap.className = "qp-title";
    head.insertBefore(wrap, h2); wrap.appendChild(h2);
    var pill = document.createElement("button"); pill.type = "button"; pill.className = "cf-pill";
    pill.setAttribute("aria-expanded", "false"); pill.setAttribute("aria-controls", "cfExplain");
    pill.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6"/><path d="M15.5 14.3c.5-.2 1-.3 1.5-.3 2.2 0 4 1.8 4 4"/></svg>using collaborative filtering';
    wrap.appendChild(pill);
    var note = document.createElement("p"); note.id = "cfExplain"; note.className = "cf-explain"; note.hidden = true;
    note.innerHTML = "<b>Collaborative filtering</b> recommends what people <b>like you</b> enjoyed. CineMatch finds the " + K +
      " viewers closest to you (by age, gender and the movies you rate), then predicts how you would rate each film from <i>their</i> ratings. " +
      "Open any recommended movie to see the exact calculation.";
    head.parentNode.insertBefore(note, head.nextSibling);
    pill.addEventListener("click", function () {
      var open = note.hidden; note.hidden = !open; pill.setAttribute("aria-expanded", String(open));
    });
  })();

  /* ======================================================================
     RATINGS: persistence + sync with the quiz's "Seen any of these?" buttons
     ====================================================================== */
  function persist() { try { localStorage.setItem(LSKEY, JSON.stringify(myRatings)); } catch (e) {} }
  function forget() { try { localStorage.removeItem(LSKEY); } catch (e) {} }
  function syncQuiz() {
    document.querySelectorAll(".rate button[data-id][data-v]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(myRatings[b.dataset.id] === +b.dataset.v));
    });
    if (typeof updateRateCount === "function") updateRateCount();
    var q = $("quiz"); if (q) q.dispatchEvent(new Event("input", {bubbles: true}));
  }
  try {
    var saved = JSON.parse(localStorage.getItem(LSKEY) || "{}");
    Object.keys(saved).forEach(function (k) { var n = +saved[k]; if (n >= 1 && n <= 5 && byId(k) && myRatings[k] == null) myRatings[k] = n; });
    if (Object.keys(myRatings).length) syncQuiz();
  } catch (e) {}
  ["reset", "again"].forEach(function (id) { var b = $(id); if (b) b.addEventListener("click", forget); });

  /* ======================================================================
     2. CALCULATION PANEL
     ====================================================================== */
  var lastDiff = null;
  var MOOD_NAME = {happy: "Happy", sad: "Sad", excited: "Excited", calm: "Relaxed", romantic: "Romantic", curious: "Curious", scared: "Want a scare", inspired: "Need motivation"};
  var moodName = function (k) { return MOOD_NAME[k] || k; };
  var viewerLabel = function (n) { return "Viewer " + (n.i + 1) + " (" + n.v.a + ", " + n.v.g + ")"; };
  var stars = function (n) { return "★".repeat(n) + "☆".repeat(5 - n); };
  var hasUser = function () { return typeof lastUser !== "undefined" && lastUser && lastUser.mood && lastUser.ratings; };

  function neighborTable(nb, movie) {
    var rows = nb.top.map(function (n, idx) {
      var r = movie ? n.v.r[movie.id] : null;
      return '<tr class="' + (r != null ? "hit" : "") + '"><td>' + (idx + 1) + ". " + esc(viewerLabel(n)) + "</td><td>" + f3(n.ageSim) + "</td><td>" + f3(n.genderSim) +
        "</td><td>" + f3(n.prof) + "</td><td>" + (n.taste === null ? "–" : f3(n.taste) + " <small>(" + n.shared.length + " shared)</small>") +
        '</td><td class="cfk">' + f3(n.sim) + "</td></tr>";
    }).join("");
    return '<div class="cf-tw"><table><thead><tr><th>Closest viewers</th><th>ageSim</th><th>genderSim</th><th>profile</th><th>taste</th><th>similarity</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
  }

  function tasteDetail(nb) {
    var withShared = nb.top.filter(function (n) { return n.shared.length; });
    if (!withShared.length) return '<p class="cf-note">You haven\'t rated any movies that these viewers rated, so similarity = profile similarity only. Rate movies to add taste similarity.</p>';
    return '<ul class="cf-list">' + withShared.map(function (n) {
      var parts = n.shared.map(function (s) { var mv = byId(s.id); return esc(mv ? mv.t : "#" + s.id) + ": you " + s.mine + " vs " + s.theirs + " → |Δ| " + s.diff; }).join("; ");
      return "<li><b>" + esc(viewerLabel(n)) + "</b> – " + parts + " → avg Δ " + f2(n.avgDiff) + " → taste = 1 − " + f2(n.avgDiff) + "/4 = <b>" + f3(n.taste) + "</b></li>";
    }).join("") + "</ul>";
  }

  function diffHtml(d) {
    if (!d) return "";
    var title = d.n ? "You rated this " + stars(d.n) + " (" + d.n + "/5)" : "You removed your rating";
    var h = '<div class="cf-diff"><h5>⚡ Recalculated: ' + title + "</h5>";
    // neighbour changes
    var topBefore = {}, topAfter = {};
    d.before.nb.top.forEach(function (n) { topBefore[n.i] = 1; }); d.after.nb.top.forEach(function (n) { topAfter[n.i] = 1; });
    var ch = d.after.nb.all.map(function (a) { return {a: a, delta: a.sim - d.before.nb.all[a.i].sim, was: d.before.nb.all[a.i].sim}; })
      .filter(function (x) { return Math.abs(x.delta) > 0.0005; }).sort(function (x, y) { return Math.abs(y.delta) - Math.abs(x.delta); }).slice(0, 4);
    if (ch.length) {
      h += "<div>Viewer similarity changed (taste similarity now includes your rating):</div><ul>" + ch.map(function (x) {
        var flag = topAfter[x.a.i] && !topBefore[x.a.i] ? " · <b>joined your top " + K + "</b>" : (!topAfter[x.a.i] && topBefore[x.a.i] ? " · <b>left your top " + K + "</b>" : "");
        return "<li>" + esc(viewerLabel(x.a)) + ": " + f3(x.was) + " → <b>" + f3(x.a.sim) + '</b> <span class="' + (x.delta > 0 ? "cf-up\">▲ " : "cf-dn\">▼ ") + f3(Math.abs(x.delta)) + "</span>" + flag + "</li>";
      }).join("") + "</ul>";
    } else {
      h += "<div>No viewer rated this movie, so similarities stay the same.</div>";
    }
    // pick changes
    var beforePct = {}; d.before.list.forEach(function (x) { beforePct[x.m.id] = x.pct; });
    var top = d.after.list.slice(0, 6);
    h += "<div>Your top picks now (match % before → after):</div><ul>" + top.map(function (x, i) {
      var b = beforePct[x.m.id], dl = b == null ? "" : x.pct - b;
      return "<li>#" + (i + 1) + " " + esc(x.m.t) + ": " + (b == null ? "" : b + "% → ") + "<b>" + x.pct + "%</b>" +
        (dl > 0 ? ' <span class="cf-up">▲ ' + dl + "</span>" : dl < 0 ? ' <span class="cf-dn">▼ ' + Math.abs(dl) + "</span>" : "") + "</li>";
    }).join("") + "</ul>";
    if (d.n) h += '<p class="cf-note">' + esc(d.title) + " is now excluded from your picks because you've seen it.</p>";
    return h + "</div>";
  }

  function calcHtml(m) {
    var head = '<div class="cf-head"><h4>🧮 How this was calculated</h4><span class="cf-tag">collaborative filtering</span></div>';
    if (!hasUser()) {
      return head + '<p class="cf-lead">Answer the quiz and this panel will show the exact formula and numbers behind your match for <b>' + esc(m.t) +
        '</b>: your mood, age, gender, genres and ratings, step by step.</p><button type="button" class="btn sm cf-go" data-go="quiz">Take the quiz</button>';
    }
    var u = lastUser, nb = neighborsOf(u);
    var noise = (typeof lastShuffle !== "undefined" && lastShuffle && noiseMap[m.id]) ? noiseMap[m.id] : 0;
    var t = traceFor(u, m, nb, noise);
    var ratedN = u.ratings[m.id];
    var h = head;
    h += diffHtml(lastDiff && lastDiff.id == m.id ? lastDiff : null);

    if (t.rated) h += '<div class="cf-banner">You rated this <b>' + stars(ratedN) + "</b>, so it isn't recommended again. Your rating now counts in Step 2 (taste similarity). The numbers below are for reference.</div>";
    else if (!t.eligible) h += '<div class="cf-banner">Not in your picks: this movie is suggested for ages <b>' + (m.min || 0) + "+</b> and you entered <b>" + u.age + "</b>. The numbers below are for reference.</div>";

    // total + bar
    var p1 = t.base, p2 = t.moodHit * 0.25, p3 = t.genreHit * 0.15, p4 = t.noise;
    var tot = Math.max(t.score, 0.0001);
    h += '<div class="cf-total"><div class="cf-big">' + t.pct + '%<small>match</small></div><div class="cf-bar"><div class="cf-seg">' +
      '<i class="s1" style="width:' + (p1 / 1 * 100) + '%"></i><i class="s2" style="width:' + (p2 * 100) + '%"></i><i class="s3" style="width:' + (p3 * 100) + '%"></i>' + (p4 ? '<i class="s4" style="width:' + (p4 * 100) + '%"></i>' : "") +
      '</div><div class="cf-key"><span style="--c:#ff5d73">Taste prediction ' + f3(p1) + '</span><span style="--c:#ffb627">Mood ' + f3(p2) + '</span><span style="--c:#6ee7b7">Genre ' + f3(p3) + "</span>" + (p4 ? '<span style="--c:#8b8fa8">Shuffle ' + f3(p4) + "</span>" : "") + "</div></div></div>";
    void tot;

    // Step 1: inputs
    var rk = Object.keys(u.ratings);
    h += '<details open><summary><i>1</i> Your quiz answers<em>mood · age · gender · genres · ratings</em></summary><div class="cf-body"><div class="cf-chips">' +
      "<span>Mood: <b>" + esc(moodName(u.mood)) + "</b></span><span>Age: <b>" + u.age + "</b></span><span>Gender: <b>" + (u.gender === "none" ? "skipped" : esc(u.gender)) + "</b></span>" +
      "<span>Genres: <b>" + (u.genres && u.genres.length ? esc(u.genres.join(", ")) : "none picked") + "</b></span></div>" +
      '<p class="cf-note">' + (rk.length ? "Your ratings: " + rk.map(function (id) { var mv = byId(id); return esc(mv ? mv.t : "#" + id) + " " + stars(u.ratings[id]); }).join(" · ") : "You haven't rated any movies yet. Rate some (here or in the quiz) to personalise the taste part.") + "</p></div></details>";

    // Step 2: neighbours
    h += "<details open><summary><i>2</i> Find viewers like you<em>top " + K + " of " + VIEWERS.length + " viewers</em></summary><div class=\"cf-body\">" +
      '<div class="cf-eq"><b>ageSim</b>     = max(0, 1 − |your age − their age| ÷ 30)\n<b>genderSim</b>  = 1 same · 0.4 different · 0.6 skipped\n<b>profile</b>    = 0.65 × ageSim + 0.35 × genderSim\n<b>taste</b>      = 1 − (average |your rating − their rating|) ÷ 4   <u>(movies you both rated)</u>\n<b>similarity</b> = 0.65 × taste + 0.35 × profile   <u>(no shared ratings → profile only)</u></div>' +
      neighborTable(nb, m) + tasteDetail(nb) + '<p class="cf-note">Highlighted rows rated <b>' + esc(m.t) + "</b>.</p></div></details>";

    // Step 3: predicted rating
    h += "<details open><summary><i>3</i> Predict your rating<em>" + (t.noPred ? "default 3.00" : f2(t.predicted) + " / 5") + "</em></summary><div class=\"cf-body\">" +
      '<div class="cf-eq"><b>predicted</b> = Σ(similarity × their rating) ÷ Σ similarity   <u>(neighbours who rated this movie)</u></div>';
    if (t.noPred) {
      h += '<p class="cf-note">None of your ' + K + " closest viewers rated this movie, so it falls back to a neutral <b>3.00</b>.</p>";
    } else {
      h += '<div class="cf-tw"><table><thead><tr><th>Viewer</th><th>similarity</th><th>their rating</th><th>similarity × rating</th></tr></thead><tbody>' +
        t.rows.map(function (r) { return "<tr><td>" + esc(viewerLabel(r.n)) + "</td><td>" + f3(r.n.sim) + "</td><td>" + r.rating + "</td><td>" + f3(r.part) + "</td></tr>"; }).join("") +
        '<tr><td class="cfk">Total</td><td class="cfk">' + f3(t.den) + '</td><td></td><td class="cfk">' + f3(t.num) + "</td></tr></tbody></table></div>" +
        '<div class="cf-eq">predicted = ' + f3(t.num) + " ÷ " + f3(t.den) + " = <b>" + f2(t.predicted) + "</b> / 5   (" + t.fans + " of them gave 4★ or more)</div>";
    }
    h += "</div></details>";

    // Step 4: final score
    h += "<details open><summary><i>4</i> Final score<em>" + t.pct + "% match</em></summary><div class=\"cf-body\">" +
      '<div class="cf-eq"><b>score</b> = 0.60 × (predicted ÷ 5) + 0.25 × mood fit + 0.15 × genre fit\n' +
      "       = 0.60 × (" + f2(t.predicted) + " ÷ 5)  = <b>" + f3(p1) + "</b>   taste prediction\n" +
      "       + 0.25 × " + t.moodHit + "              = <b>" + f3(p2) + "</b>   " + (t.moodHit ? "fits your " + esc(moodName(u.mood)) + " mood ✓" : "doesn't list your " + esc(moodName(u.mood)) + " mood ✗") + "\n" +
      "       + 0.15 × " + t.genreHit + "              = <b>" + f3(p3) + "</b>   " + (t.genreHit ? "matches " + esc(t.picked.join(", ")) + " ✓" : (u.genres && u.genres.length ? "none of its genres (" + esc(m.g.join(", ")) + ") picked ✗" : "no genres picked ✗")) + "\n" +
      (t.noise ? "       + shuffle bonus        = <b>" + f3(p4) + "</b>   random nudge from “Shuffle picks”\n" : "") +
      "       = <b>" + f3(t.score) + "</b>  →  min(99, round(score × 100)) = <b>" + t.pct + "%</b></div>" +
      '<p class="cf-note">Age check: you are ' + u.age + ", this movie suggests " + (m.min || 0) + "+ → " + (t.eligible ? "eligible ✓" : "excluded ✗") + ". Movies you've already rated are never recommended again.</p></div></details>";
    return '<section class="cf">' + h + "</section>";
  }

  function ratingHtml(m) {
    var n = myRatings[m.id] || 0;
    return '<div class="cf-rate" id="cfRate"><div class="cf-rate-h"><b>Rate this movie</b><span class="cf-rate-s">' + (n ? "Your rating: " + n + "/5 · tap the same star to clear" : "Not rated yet") + "</span></div>" +
      '<div class="cf-stars" role="group" aria-label="Your rating for ' + esc(m.t) + '">' +
      [1, 2, 3, 4, 5].map(function (i) { return '<button type="button" data-cfr="' + i + '" class="' + (i <= n ? "on" : "") + '" aria-pressed="' + (i === n) + '" aria-label="' + i + " star" + (i > 1 ? "s" : "") + '">★</button>'; }).join("") +
      "</div><small>" + (hasUser() ? "Your rating instantly re-runs the calculation for all your picks." : "Saved on this device. It will be used when you take the quiz.") + "</small></div>";
  }

  function paint(id) {
    var m = byId(id), card = document.querySelector("#modal .m-card"), info = document.querySelector("#modal .m-info");
    if (!m || !card || !info) return;
    var oldR = $("cfRate"); if (oldR) oldR.remove();
    var oldC = card.querySelector(".cf"); if (oldC) oldC.remove();
    var oldS = card.querySelector(".cf-solo"); if (oldS) oldS.remove();
    var acts = info.querySelector(".m-actions");
    var r = document.createElement("div"); r.innerHTML = ratingHtml(m);
    if (acts) acts.after(r.firstChild); else info.appendChild(r.firstChild);
    var c = document.createElement("div"); c.innerHTML = calcHtml(m);
    var sec = c.firstElementChild;
    if (sec && !sec.classList.contains("cf")) { sec = document.createElement("section"); sec.className = "cf cf-solo"; sec.innerHTML = c.innerHTML; }
    card.appendChild(sec);
  }

  /* wrap openModal (already wrapped by cinematch-boost.js) */
  var prevOpen = window.openModal;
  window.openModal = function (id) {
    if (lastDiff && lastDiff.id != id) lastDiff = null;
    prevOpen.apply(this, arguments);
    try { paint(id); } catch (e) { console.error(e); }
  };

  /* star clicks + hover */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#cfRate [data-cfr]"); if (!b || openId == null) return;
    var id = openId, n = +b.dataset.cfr, m = byId(id); if (!m) return;
    var beforeUser = hasUser() ? lastUser : null;
    var before = beforeUser ? rankAll(beforeUser) : null;
    if (myRatings[id] === n) { delete myRatings[id]; n = 0; } else myRatings[id] = n;
    persist(); syncQuiz();
    if (beforeUser) {
      var user = Object.assign({}, beforeUser, {ratings: Object.assign({}, myRatings)});
      lastUser = user; lastShuffle = false;
      lastDiff = {id: id, n: n, title: m.t, before: before, after: rankAll(user)};
      render(user); // re-run everything: neighbours, predictions, scores, picks list
      var qp = $("quizPanel");
      if (!(qp && qp.classList.contains("open"))) { var ts = $("topSection"); if (ts) ts.classList.remove("hidden"); }
      toast(n ? "Rated " + m.t + " " + n + "/5. Picks recalculated." : "Rating removed. Picks recalculated.");
    } else {
      toast(n ? "Saved your " + n + "/5 rating for " + m.t : "Rating removed");
    }
    paint(id);
  });
  document.addEventListener("mouseover", function (e) {
    var b = e.target.closest && e.target.closest("#cfRate [data-cfr]"); if (!b) return;
    var n = +b.dataset.cfr; b.parentNode.querySelectorAll("button").forEach(function (x) { x.classList.toggle("hv", +x.dataset.cfr <= n); });
  });
  document.addEventListener("mouseout", function (e) {
    var g = e.target.closest && e.target.closest("#cfRate .cf-stars"); if (g) g.querySelectorAll("button").forEach(function (x) { x.classList.remove("hv"); });
  });

  /* "Take the quiz" inside the panel: close the details first, then let the quiz panel open */
  document.addEventListener("click", function (e) {
    var g = e.target.closest && e.target.closest("#modal .cf-go"); if (g && typeof closeModal === "function") closeModal();
  }, true);
})();
