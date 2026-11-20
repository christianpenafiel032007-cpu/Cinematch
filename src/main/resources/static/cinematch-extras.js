/* CineMatch extras: animated background, support chat, contact us, browser database,
   nav bar, FAQ, footer, watchlist + privacy panels. Load AFTER your main script. */
(function () {
  "use strict";
  var CONTACT_EMAIL = (function(){try{return JSON.parse(localStorage.getItem("cm_admin_cfg")||"{}").email}catch(e){}})() || "mariscal.johnlucas@dnsc.edu.ph"; // <- put your real email here
  var $ = function (i) { return document.getElementById(i); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var say = function (m) { if (typeof toast === "function") toast(m); };

  /* ---------- remove foxes ---------- */
  document.querySelectorAll(".fox").forEach(function (f) { f.remove(); });

  /* ---------- CSS ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".toast{z-index:95}",
    ".cx-nav{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;align-items:center}",
    ".cx-nav a,.cx-nav button{font:600 .88rem 'DM Sans',sans-serif;color:var(--muted);background:none;border:0;padding:7px 12px;border-radius:999px;cursor:pointer;text-decoration:none;transition:.2s}",
    ".cx-nav a:hover,.cx-nav button:hover{color:var(--text);background:rgba(255,182,39,.12)}",
    ".cx-nav .cx-pill{color:#2a1d00;background:linear-gradient(135deg,#ffd978,#ffb627 50%,#ff7a59)}",
    ".cx-nav .cx-pill:hover{color:#2a1d00;filter:brightness(1.07)}",
    ".cx-rv{opacity:0;transform:translateY(22px);transition:opacity .7s,transform .7s}.cx-rv.in{opacity:1;transform:none}",
    /* info section */
    ".cx-info{margin-top:44px}",
    ".cx-steps,.cx-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:6px 0 26px}",
    ".cx-step,.cx-stat{background:var(--panel);border:1px solid rgba(255,255,255,.1);border-radius:var(--radius);padding:20px;transition:transform .25s,border-color .25s}",
    ".cx-step:hover,.cx-stat:hover{transform:translateY(-4px);border-color:rgba(255,182,39,.5)}",
    ".cx-step b{display:block;font-size:1.8rem;margin-bottom:6px}.cx-step h3{margin:0 0 6px;font-size:1.15rem}.cx-step p{margin:0;color:var(--muted);font-size:.92rem}",
    ".cx-stat{text-align:center}.cx-stat strong{display:block;font:800 2.2rem 'Fraunces',Georgia,serif;color:var(--amber);line-height:1.1}.cx-stat span{color:var(--muted);font-size:.88rem}",
    ".cx-faq details{background:var(--panel);border:1px solid rgba(255,255,255,.1);border-radius:14px;margin-bottom:10px;overflow:hidden}",
    ".cx-faq summary{cursor:pointer;padding:15px 18px;font-weight:700;list-style:none;display:flex;justify-content:space-between;gap:12px}",
    ".cx-faq summary::-webkit-details-marker{display:none}.cx-faq summary::after{content:'+';color:var(--amber);font-size:1.3rem;line-height:1}",
    ".cx-faq details[open] summary::after{content:'\\2212'}.cx-faq details p{margin:0;padding:0 18px 16px;color:var(--muted)}",
    ".cx-cta{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:26px;padding:22px;border-radius:var(--radius);background:linear-gradient(135deg,rgba(255,182,39,.14),rgba(255,93,115,.14));border:1px solid rgba(255,182,39,.35)}",
    ".cx-cta div{flex:1 1 220px}.cx-cta h3{margin:0 0 4px}.cx-cta p{margin:0;color:var(--muted)}",
    /* footer */
    ".cx-foot{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:28px;text-align:left;max-width:880px;margin:0 auto;padding:6px 0 18px}",
    ".cx-foot h4{margin:0 0 10px;color:var(--text);font-size:.95rem}.cx-foot p{margin:0}",
    ".cx-foot button,.cx-foot a{display:block;background:none;border:0;padding:3px 0;color:var(--muted);font:inherit;cursor:pointer;text-decoration:none;text-align:left}",
    ".cx-foot button:hover,.cx-foot a:hover{color:var(--amber)}.cx-copy{border-top:1px solid rgba(255,255,255,.08);padding-top:16px;max-width:880px;margin:0 auto}",
    /* chat */
    ".cx-chat-btn{position:fixed;right:18px;bottom:78px;z-index:45;display:flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:12px 18px;cursor:pointer;color:#2a1d00;font:700 .95rem 'DM Sans',sans-serif;background:linear-gradient(135deg,#ff9aa8,#ff5d73 55%,#e0245e);color:#fff;box-shadow:0 12px 28px -8px rgba(255,93,115,.7);transition:transform .25s,box-shadow .25s;animation:cxPulse 2.8s ease-in-out infinite}",
    ".cx-chat-btn:hover{transform:translateY(-3px) scale(1.03)}.cx-chat-btn .cx-ico{font-size:1.2rem}",
    ".cx-dot{position:absolute;top:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:#34d399;border:2px solid var(--bg)}",
    "@keyframes cxPulse{0%,100%{box-shadow:0 12px 28px -8px rgba(255,93,115,.7),0 0 0 0 rgba(255,93,115,.45)}50%{box-shadow:0 12px 28px -8px rgba(255,93,115,.7),0 0 0 12px rgba(255,93,115,0)}}",
    ".cx-chat{position:fixed;right:18px;bottom:140px;z-index:46;width:min(370px,calc(100vw - 24px));height:min(540px,calc(100vh - 170px));display:flex;flex-direction:column;background:var(--panel);border:1px solid rgba(255,182,39,.45);border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.6);overflow:hidden;animation:cxIn .28s cubic-bezier(.2,.9,.3,1.2)}",
    "@keyframes cxIn{from{opacity:0;transform:translateY(20px) scale(.95)}}",
    ".cx-ch{display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(135deg,#2b2350,#3a2468)}",
    ".cx-av{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--amber);font-size:1.2rem}",
    ".cx-ch div{flex:1}.cx-ch strong{display:block}.cx-ch small{color:#9ef0c8}",
    ".cx-ch button,.cx-x{background:rgba(255,255,255,.08);border:0;color:var(--text);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:.95rem}",
    ".cx-log{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}",
    ".cx-m{max-width:86%;padding:10px 14px;border-radius:16px;font-size:.93rem;line-height:1.45;animation:cxIn .25s}",
    ".cx-bot{align-self:flex-start;background:#2b2350;border-bottom-left-radius:4px}.cx-me{align-self:flex-end;background:linear-gradient(135deg,#ffcf5c,#ffb627);color:#2a1d00;border-bottom-right-radius:4px;font-weight:500}",
    ".cx-acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.cx-acts button,.cx-quick button{font:600 .8rem 'DM Sans',sans-serif;color:var(--text);background:rgba(255,182,39,.1);border:1px solid rgba(255,182,39,.4);border-radius:999px;padding:5px 11px;cursor:pointer}",
    ".cx-acts button:hover,.cx-quick button:hover{background:rgba(255,182,39,.25)}",
    ".cx-typing{align-self:flex-start;color:var(--muted);font-size:1.4rem;letter-spacing:3px;animation:cxBlink 1s infinite}@keyframes cxBlink{50%{opacity:.3}}",
    ".cx-quick{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 10px}",
    ".cx-send{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}",
    ".cx-send input{flex:1;min-width:0;font:inherit;color:var(--text);background:#120e25;border:1px solid var(--line);border-radius:999px;padding:10px 16px}",
    ".cx-send input:focus{outline:0;border-color:var(--amber)}",
    ".cx-send button{border:0;border-radius:999px;padding:0 18px;font:700 .9rem 'DM Sans',sans-serif;cursor:pointer;color:#2a1d00;background:linear-gradient(135deg,#ffd978,#ffb627)}",
    /* modals + forms */
    ".cx-modal{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:16px;background:rgba(10,7,22,.86);animation:fade .2s}",
    ".cx-card{position:relative;width:min(560px,100%);max-height:92vh;overflow:auto;background:var(--panel);border:1px solid rgba(255,182,39,.45);border-radius:var(--radius);padding:26px;animation:cxIn .3s}",
    ".cx-card h3{margin:0 40px 6px 0;font-size:1.6rem}.cx-x{position:absolute;top:12px;right:12px}",
    ".cx-sub{color:var(--muted);margin:0 0 16px}",
    ".cx-card label{margin-bottom:12px;font-size:.92rem}",
    ".cx-card input:not([type=checkbox]),.cx-card select,.cx-card textarea{font:inherit;color:var(--text);background:#120e25;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:11px 13px;width:100%;resize:vertical}",
    ".cx-card input:focus,.cx-card select:focus,.cx-card textarea:focus{outline:0;border-color:var(--amber);box-shadow:0 0 0 4px rgba(255,182,39,.18)}",
    ".cx-hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0}",
    ".cx-err{color:var(--coral);min-height:1.3em;margin:0 0 8px;font-size:.9rem}.cx-row{display:flex;gap:10px;flex-wrap:wrap}",
    ".cx-btn{font:700 .95rem 'DM Sans',sans-serif;border:0;border-radius:999px;padding:11px 22px;cursor:pointer;color:#2a1d00;background:linear-gradient(135deg,#ffd978,#ffb627 55%,#ff9a1f);text-decoration:none;display:inline-block}",
    ".cx-btn.ghost{color:var(--text);background:rgba(255,255,255,.05);border:1px solid var(--line)}.cx-btn.red{background:linear-gradient(135deg,#ff7d8f,#e11d48);color:#fff}",
    ".cx-wl{display:grid;gap:10px;margin-top:14px}.cx-wi{display:grid;grid-template-columns:54px 1fr auto;gap:12px;align-items:center;background:rgba(0,0,0,.2);border:1px solid var(--line);border-radius:12px;padding:8px}",
    ".cx-wp{width:54px;height:72px;border-radius:8px;display:grid;place-items:center;overflow:hidden}.cx-wp svg{width:70%}",
    ".cx-wi h4{margin:0;font-size:1rem}.cx-wi small{color:var(--muted)}.cx-wi div:last-child{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}",
    ".cx-kv{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:14px 0}.cx-kv div{background:rgba(0,0,0,.2);border:1px solid var(--line);border-radius:12px;padding:12px;text-align:center}.cx-kv b{display:block;font-size:1.5rem;color:var(--amber)}",
    ".cx-card ul{padding-left:18px;color:var(--muted)}",
    "@media(max-width:700px){.cx-steps,.cx-stats{grid-template-columns:1fr}.cx-foot{grid-template-columns:1fr}.cx-chat-btn .cx-lbl{display:none}.cx-chat-btn{padding:13px}.cx-nav{margin-left:0}.cx-wi{grid-template-columns:44px 1fr}.cx-wi div:last-child{grid-column:1/-1;justify-content:flex-start}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- DATABASE (IndexedDB, with graceful fallback) ---------- */
  var STORES = ["watchlist", "sessions", "messages", "chats"];
  var DB = {
    db: null,
    open: function () {
      return new Promise(function (res) {
        if (!window.indexedDB) return res(null);
        var r = indexedDB.open("cinematch", 1);
        r.onupgradeneeded = function () {
          STORES.forEach(function (n) {
            if (!r.result.objectStoreNames.contains(n))
              r.result.createObjectStore(n, n === "watchlist" ? {keyPath: "id"} : {keyPath: "id", autoIncrement: true});
          });
        };
        r.onsuccess = function () { DB.db = r.result; res(DB.db); };
        r.onerror = function () { res(null); };
      });
    },
    run: function (store, mode, fn) {
      return new Promise(function (res) {
        if (!DB.db) return res(null);
        try {
          var t = DB.db.transaction(store, mode), rq = fn(t.objectStore(store));
          t.oncomplete = function () { res(rq && rq.result !== undefined ? rq.result : true); };
          t.onerror = t.onabort = function () { res(null); };
        } catch (e) { res(null); }
      });
    },
    add: function (s, o) { o.at = Date.now(); return DB.run(s, "readwrite", function (st) { return st.add(o); }); },
    all: function (s) { return DB.run(s, "readonly", function (st) { return st.getAll(); }).then(function (r) { return r || []; }); },
    clear: function (s) { return DB.run(s, "readwrite", function (st) { return st.clear(); }); },
    saveWatchlist: function (ids) {
      if (!DB.db) return;
      try {
        var t = DB.db.transaction("watchlist", "readwrite"), s = t.objectStore("watchlist");
        s.clear();
        ids.forEach(function (id) { var m = byId(id); s.put({id: +id, title: m ? m.t : "", at: Date.now()}); });
      } catch (e) {}
    }
  };

  var origSetWL = window.setWL;
  if (typeof origSetWL === "function") {
    window.setWL = function (a) { origSetWL(a); DB.saveWatchlist(a); };
  }
  var dbReady = DB.open().then(function () {
    DB.all("watchlist").then(function (rows) {
      if (rows.length && typeof getWL === "function" && !getWL().length && origSetWL) {
        origSetWL(rows.map(function (r) { return r.id; }));
        if (typeof syncSaveButtons === "function") syncSaveButtons();
      } else if (typeof getWL === "function") { DB.saveWatchlist(getWL()); }
    });
  });

  var quiz = $("quiz");
  if (quiz) quiz.addEventListener("submit", function () {
    try {
      var m = document.querySelector("input[name=mood]:checked");
      DB.add("sessions", {
        mood: m ? m.value : null, age: +$("age").value, gender: $("gender").value,
        genres: [].map.call(document.querySelectorAll("input[name=genre]:checked"), function (x) { return x.value; }),
        ratings: Object.assign({}, myRatings)
      });
    } catch (e) {}
  });

  /* ---------- ANIMATED BACKGROUND ---------- */
  (function () {
    var c = document.createElement("canvas");
    c.setAttribute("aria-hidden", "true");
    c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none";
    document.body.insertBefore(c, document.body.firstChild);
    var x = c.getContext("2d"), W, H, dpr = Math.min(window.devicePixelRatio || 1, 1.5), mx = 0, my = 0, tx = 0, ty = 0, raf = 0, P = [], shoot = null, nextShoot = 2500;
    var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cols = ["255,182,39", "255,93,115", "106,76,147", "43,179,192", "255,138,100"];
    var orbs = cols.map(function (col, i) {
      return {c: col, bx: Math.random(), by: Math.random(), ax: .1 + Math.random() * .15, ay: .1 + Math.random() * .15, sp: .00012 + Math.random() * .0002, ph: Math.random() * 6.28, r: .3 + Math.random() * .22, a: i < 2 ? .17 : .22};
    });
    function size() {
      W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = []; var n = Math.round(Math.min(80, W * H / 15000));
      for (var i = 0; i < n; i++) P.push({x: Math.random() * W, y: Math.random() * H, r: .6 + Math.random() * 1.6, vx: (Math.random() - .5) * .18, vy: -.05 - Math.random() * .22, tw: Math.random() * 6.28, ts: .001 + Math.random() * .003, g: Math.random() < .3});
    }
    function frame(t) {
      x.clearRect(0, 0, W, H);
      tx += (mx - tx) * .04; ty += (my - ty) * .04;
      x.globalCompositeOperation = "lighter";
      orbs.forEach(function (o) {
        var px = (o.bx + Math.sin(t * o.sp + o.ph) * o.ax) * W + tx * 36, py = (o.by + Math.cos(t * o.sp * 1.3 + o.ph) * o.ay) * H + ty * 36, r = o.r * Math.max(W, H) * .55;
        var g = x.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, "rgba(" + o.c + "," + o.a + ")"); g.addColorStop(1, "rgba(" + o.c + ",0)");
        x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
      });
      x.globalCompositeOperation = "source-over";
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
        var a = .35 + Math.sin(t * p.ts + p.tw) * .3;
        x.fillStyle = p.g ? "rgba(255,200,100," + a + ")" : "rgba(255,255,255," + a + ")";
        x.beginPath(); x.arc(p.x + tx * 8 * p.r, p.y + ty * 8 * p.r, p.r, 0, 6.283); x.fill();
        for (var j = i + 1; j < P.length; j++) {
          var q = P[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 11000) { x.strokeStyle = "rgba(255,214,140," + (1 - d / 11000) * .16 + ")"; x.lineWidth = .7; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke(); }
        }
      }
      if (!shoot && t > nextShoot) { shoot = {x: Math.random() * W * .8, y: Math.random() * H * .35, life: 0}; nextShoot = t + 4000 + Math.random() * 6000; }
      if (shoot) {
        shoot.x += 11; shoot.y += 5; shoot.life++;
        var sg = x.createLinearGradient(shoot.x, shoot.y, shoot.x - 90, shoot.y - 41);
        sg.addColorStop(0, "rgba(255,255,255,.9)"); sg.addColorStop(1, "rgba(255,255,255,0)");
        x.strokeStyle = sg; x.lineWidth = 2; x.beginPath(); x.moveTo(shoot.x, shoot.y); x.lineTo(shoot.x - 90, shoot.y - 41); x.stroke();
        if (shoot.life > 70) shoot = null;
      }
      if (!still) raf = requestAnimationFrame(frame);
    }
    size(); addEventListener("resize", size);
    addEventListener("pointermove", function (e) { mx = (e.clientX / W - .5) * 2; my = (e.clientY / H - .5) * 2; }, {passive: true});
    document.addEventListener("visibilitychange", function () { cancelAnimationFrame(raf); if (!document.hidden && !still) raf = requestAnimationFrame(frame); });
    raf = requestAnimationFrame(frame);
  })();

  /* ---------- MODAL HELPERS ---------- */
  function closeM() { var o = $("cxM"); if (o) { o.remove(); document.body.style.overflow = ""; } }
  function openM(title, html) {
    closeM();
    var o = document.createElement("div"); o.className = "cx-modal"; o.id = "cxM";
    o.innerHTML = '<div class="cx-card" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><button class="cx-x" type="button" aria-label="Close">✕</button><h3>' + title + "</h3>" + html + "</div>";
    o.addEventListener("click", function (e) { if (e.target === o || e.target.closest(".cx-x") || e.target.closest("[data-close]")) closeM(); });
    document.body.appendChild(o); document.body.style.overflow = "hidden";
    var f = o.querySelector("input,textarea"); if (f) f.focus();
    return o;
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeM(); chatPanel.classList.add("hidden"); chatBtn.setAttribute("aria-expanded", "false"); } });

  /* ---------- CONTACT ---------- */
  function openContact(topic, note) {
    var o = openM("✉️ Contact us",
      '<p class="cx-sub">Questions, bugs or a movie we should add? We read every message.</p>' +
      '<form id="cxContact" novalidate>' +
      '<label>Name<input name="name" required maxlength="60" autocomplete="name"></label>' +
      '<label>Email<input name="email" type="email" required maxlength="120" autocomplete="email"></label>' +
      '<label>Topic<select name="topic"><option>Feedback</option><option>Report a bug</option><option>Request a movie</option><option>Something else</option></select></label>' +
      '<label>Message<textarea name="message" rows="5" required maxlength="1000"></textarea></label>' +
      '<input class="cx-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<p class="cx-err" id="cxErr" role="alert"></p>' +
      '<div class="cx-row"><button class="cx-btn" type="submit">Send message</button><button class="cx-btn ghost" type="button" data-close>Cancel</button></div></form>');
    var f = o.querySelector("form");
    if (topic) f.topic.value = topic;
    if (note) f.message.value = note;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = {name: f.name.value.trim(), email: f.email.value.trim(), topic: f.topic.value, message: f.message.value.trim()};
      var err = !d.name ? "Please enter your name." : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email) ? "Please enter a valid email." : d.message.length < 10 ? "Message should be at least 10 characters." : "";
      $("cxErr").textContent = err; if (err) return;
      if (!f.website.value) DB.add("messages", d);
      var mail = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("[CineMatch] " + d.topic) + "&body=" + encodeURIComponent(d.message + "\n\n— " + d.name + " (" + d.email + ")");
      o.querySelector(".cx-card").innerHTML = '<button class="cx-x" type="button" aria-label="Close">✕</button><h3>Thanks, ' + esc(d.name) + "! 🎉</h3><p class=\"cx-sub\">Your message was saved. Want it to reach us right away? Send it by email too.</p><div class=\"cx-row\"><a class=\"cx-btn\" href=\"" + mail + "\">📧 Email us</a><button class=\"cx-btn ghost\" type=\"button\" data-close>Close</button></div>";
    });
  }

  /* ---------- WATCHLIST ---------- */
  function openWatchlist() {
    var ids = typeof getWL === "function" ? getWL() : [];
    var html = ids.length ? '<p class="cx-sub">' + ids.length + " saved. Stored in your browser.</p><div class=\"cx-wl\">" + ids.map(function (id) {
      var m = byId(id); if (!m) return "";
      return '<div class="cx-wi"><div class="cx-wp" style="background:' + posterBg(m) + '">' + artSvg(m.id) + '</div><div><h4>' + esc(m.t) + "</h4><small>" + m.y + " · " + esc(m.g.join(", ")) + '</small></div><div><button class="cx-btn" type="button" data-open="' + m.id + '">Details</button><button class="cx-btn ghost" type="button" data-rm="' + m.id + '">Remove</button></div></div>';
    }).join("") + "</div>" : '<p class="cx-sub">Nothing saved yet. Tap ♡ Watchlist on any movie to keep it here.</p><div class="cx-row"><button class="cx-btn" type="button" data-close data-go="quiz">🎬 Find movies</button></div>';
    var o = openM("♥ My watchlist", html);
    o.addEventListener("click", function (e) {
      var rm = e.target.closest("[data-rm]"); if (rm) { toggleWL(rm.dataset.rm); openWatchlist(); }
      if (e.target.closest("[data-go]")) go("quiz");
    });
  }

  /* ---------- PRIVACY / MY DATA ---------- */
  function openData() {
    var o = openM("🔒 Privacy & my data", '<p class="cx-sub">CineMatch has no accounts. Quiz answers, ratings, watchlist, messages and chats are stored only in this browser (IndexedDB) on this device. Posters and trailers load from TMDB and YouTube, which have their own policies.</p><div id="cxStats" class="cx-sub">Loading…</div><div class="cx-row"><button class="cx-btn" id="cxExp" type="button">⬇ Export my data</button><button class="cx-btn red" id="cxDel" type="button">🗑 Delete all</button></div>');
    Promise.all(STORES.map(function (s) { return DB.all(s); })).then(function (r) {
      var all = {}; STORES.forEach(function (s, i) { all[s] = r[i]; });
      var last = r[1].slice(-5).reverse().map(function (s) { return "<li>" + new Date(s.at).toLocaleDateString() + " · " + esc(MOODS[s.mood] || s.mood) + "</li>"; }).join("");
      $("cxStats").innerHTML = '<div class="cx-kv"><div><b>' + r[0].length + "</b>Watchlist</div><div><b>" + r[1].length + "</b>Quizzes</div><div><b>" + r[2].length + "</b>Messages</div><div><b>" + r[3].length + "</b>Chat lines</div></div>" + (last ? "<strong>Recent quizzes</strong><ul>" + last + "</ul>" : "");
      $("cxExp").onclick = function () {
        var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(all, null, 2)], {type: "application/json"}));
        a.download = "cinematch-data.json"; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      };
    });
    $("cxDel").onclick = function () {
      if (!confirm("Delete your watchlist, quiz history, messages and chats from this browser?")) return;
      Promise.all(STORES.map(DB.clear)).then(function () {
        try { localStorage.removeItem("cm_watchlist"); } catch (e) {}
        if (typeof syncSaveButtons === "function") syncSaveButtons();
        $("cxLog").innerHTML = ""; chatLoaded = false;
        closeM(); say("All your data was deleted");
      });
    };
  }

  /* ---------- SUPPORT CHAT ---------- */
  var chatBtn = document.createElement("button");
  chatBtn.type = "button"; chatBtn.className = "cx-chat-btn"; chatBtn.setAttribute("aria-label", "Open support chat"); chatBtn.setAttribute("aria-expanded", "false");
  chatBtn.innerHTML = '<span class="cx-ico">💬</span><span class="cx-lbl">Support</span><i class="cx-dot"></i>';
  var chatPanel = document.createElement("section");
  chatPanel.className = "cx-chat hidden"; chatPanel.setAttribute("role", "dialog"); chatPanel.setAttribute("aria-label", "Support chat");
  chatPanel.innerHTML = '<div class="cx-ch"><span class="cx-av">🎬</span><div><strong>CineMatch Support</strong><small>● Online · replies instantly</small></div><button type="button" id="cxMin" aria-label="Close chat">✕</button></div>' +
    '<div class="cx-log" id="cxLog" aria-live="polite"></div>' +
    '<div class="cx-quick" id="cxQuick"></div>' +
    '<form class="cx-send" id="cxForm"><input id="cxInput" placeholder="Type your question…" maxlength="300" autocomplete="off" aria-label="Message"><button type="submit">Send</button></form>';
  document.body.appendChild(chatPanel); document.body.appendChild(chatBtn);

  var KB = [
    {k: /\b(hi|hello|hey|kumusta|good (morning|afternoon|evening))\b/, a: "Hi! 👋 I’m the CineMatch helper. Ask me how recommendations work, how to save movies, or tap a question below."},
    {k: /thank|salamat/, a: "You’re welcome! Enjoy the movie 🍿"},
    {k: /recommend|match|how.*work|algorithm|collaborative|filter/, a: "CineMatch uses collaborative filtering: it compares your age, gender and any movies you rate with our community viewers, finds the closest matches, then ranks films they loved, boosted by your mood and favorite genres.", act: ["quiz"]},
    {k: /rate|rating|stars|liked/, a: "In step 4 of the quiz tap 👍 Liked, 😐 Okay or 👎 Nope on movies you’ve seen. The more you rate, the sharper your matches."},
    {k: /watchlist|save|favou?rite|bookmark/, a: "Tap ♡ Watchlist on any movie. Your list is saved in this browser and you can open it anytime.", act: ["watchlist"]},
    {k: /trailer|video|play/, a: "Open a movie card and press ▶ Play trailer. If it can’t load, use the Open on YouTube link that appears."},
    {k: /poster|image|picture/, a: "Posters come from TMDB. If one is missing you’ll see a colored placeholder instead. Check your internet connection and refresh."},
    {k: /stream|netflix|where.*watch|watch.*where/, a: "In a movie’s details, press 📺 Where to watch to see streaming options for the Philippines (via JustWatch)."},
    {k: /account|sign ?(up|in)|log ?in|register|password|free|price|cost/, a: "No account, no password and it’s free. Just answer the quiz and get your movies."},
    {k: /privacy|data|store|safe|delete|cookie/, a: "Your answers stay in your browser on this device. You can export or delete everything anytime.", act: ["privacy"]},
    {k: /age|kid|child|family|minor/, a: "We hide movies that are above the age you enter, so younger viewers only see suitable picks."},
    {k: /surprise|random|shuffle/, a: "Press 🎲 Surprise me for a random mood, or 🔀 Shuffle picks on the results page for a fresh set."},
    {k: /contact|human|agent|person|email|bug|problem|error|broken|not working|request|add (a )?movie/, a: "Sorry about that! Send us a message and we’ll look into it.", act: ["contact"]}
  ];
  var ACTS = {contact: "✉️ Contact us", watchlist: "♥ Open watchlist", quiz: "🎬 Start the quiz", privacy: "🔒 Privacy & data"};
  var QUICK = ["How does it work?", "Save movies", "Trailers", "Talk to a human"];
  var chatLoaded = false;
  function bubble(role, text, acts) {
    var d = document.createElement("div"); d.className = "cx-m " + (role === "me" ? "cx-me" : "cx-bot"); d.textContent = text;
    if (acts && acts.length) {
      var w = document.createElement("div"); w.className = "cx-acts";
      acts.forEach(function (a) { var b = document.createElement("button"); b.type = "button"; b.dataset.act = a; b.textContent = ACTS[a]; w.appendChild(b); });
      d.appendChild(w);
    }
    $("cxLog").appendChild(d); $("cxLog").scrollTop = 1e6;
  }
  function doAct(a) {
    if (a === "contact") openContact("Report a bug"); else if (a === "watchlist") openWatchlist(); else if (a === "privacy") openData(); else if (a === "quiz") go("quiz");
    if (a !== "quiz") return; chatPanel.classList.add("hidden");
  }
  function ask(text) {
    text = text.trim(); if (!text) return;
    bubble("me", text); DB.add("chats", {role: "me", text: text});
    var t = document.createElement("div"); t.className = "cx-typing"; t.textContent = "•••"; $("cxLog").appendChild(t); $("cxLog").scrollTop = 1e6;
    var low = text.toLowerCase(), hit = null;
    for (var i = 0; i < KB.length; i++) if (KB[i].k.test(low)) { hit = KB[i]; break; }
    setTimeout(function () {
      t.remove();
      var a = hit ? hit.a : "I’m not sure about that one. I can help with recommendations, ratings, watchlist, trailers and privacy, or you can message our team.";
      var acts = hit ? hit.act : ["contact"];
      bubble("bot", a, acts); DB.add("chats", {role: "bot", text: a});
    }, 550 + Math.random() * 400);
  }
  function loadChat() {
    if (chatLoaded) return; chatLoaded = true;
    $("cxQuick").innerHTML = QUICK.map(function (q) { return '<button type="button">' + q + "</button>"; }).join("");
    dbReady.then(function () { return DB.all("chats"); }).then(function (rows) {
      $("cxLog").innerHTML = "";
      if (!rows.length) bubble("bot", "Hi! 👋 Welcome to CineMatch. How can I help you today?");
      else rows.slice(-20).forEach(function (r) { bubble(r.role, r.text); });
    });
  }
  chatBtn.addEventListener("click", function () {
    var open = chatPanel.classList.toggle("hidden") === false;
    chatBtn.setAttribute("aria-expanded", open); var dot = chatBtn.querySelector(".cx-dot"); if (dot) dot.remove();
    if (open) { loadChat(); setTimeout(function () { $("cxInput").focus(); }, 50); }
  });
  $("cxMin").addEventListener("click", function () { chatPanel.classList.add("hidden"); chatBtn.setAttribute("aria-expanded", "false"); });
  $("cxForm").addEventListener("submit", function (e) { e.preventDefault(); var i = $("cxInput"); ask(i.value); i.value = ""; });
  $("cxQuick").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) ask(b.textContent); });
  $("cxLog").addEventListener("click", function (e) { var b = e.target.closest("[data-act]"); if (b) doAct(b.dataset.act); });

  /* ---------- NAV, INFO SECTION, FOOTER ---------- */
  function go(id) {
    var res = $("results");
    if ((id === "quiz" || id === "topSection") && res && !res.classList.contains("hidden") && $("again")) $("again").click();
    setTimeout(function () { var t = $(id); if (t) t.scrollIntoView({behavior: "smooth", block: "start"}); }, 60);
  }
  var top = document.querySelector(".top");
  if (top) {
    var nav = document.createElement("nav"); nav.className = "cx-nav"; nav.setAttribute("aria-label", "Main");
    nav.innerHTML = '<a href="#" data-go="top">Home</a><button type="button" data-go="searchSection">Search</button><button type="button" data-go="topSection">Top rated</button><button type="button" data-cx="watchlist">♥ Watchlist</button><button type="button" data-cx="contact">Contact</button><button type="button" class="cx-pill" data-go="quiz">🎬 Take the quiz</button>';
    top.appendChild(nav);
  }
  var main = document.querySelector("main"), totalRatings = VIEWERS.reduce(function (a, v) { return a + Object.keys(v.r).length; }, 0);
  if (main) {
    var info = document.createElement("section"); info.id = "cxInfo"; info.className = "cx-info cx-rv";
    var faq = [
      ["How does CineMatch pick my movies?", "It finds community viewers closest to you by age, gender and the movies you rate, then ranks what they loved, boosted by your mood and genres."],
      ["Do I need to sign up?", "No. There are no accounts or passwords. Everything works instantly."],
      ["Where is my data stored?", "In your own browser on this device. You can export or delete it anytime from the Privacy panel in the footer."],
      ["Why are some movies hidden?", "Movies are filtered by the age you enter so the picks stay suitable."],
      ["A poster or trailer won’t load. What now?", "Check your connection and refresh. You can always open the trailer on YouTube from the movie details."],
      ["Can I suggest a movie?", "Yes! Use Contact us and choose “Request a movie”."]
    ];
    info.innerHTML = '<div class="section-title"><h2>🎞️ How CineMatch works</h2><p>Simple, private, no sign-up</p></div>' +
      '<div class="cx-steps"><div class="cx-step"><b>🎭</b><h3>1. Tell us your mood</h3><p>Pick how you feel, your age and favorite genres.</p></div><div class="cx-step"><b>👥</b><h3>2. We find viewers like you</h3><p>Collaborative filtering compares your taste with the community.</p></div><div class="cx-step"><b>🍿</b><h3>3. Watch what they loved</h3><p>Get ranked picks with trailers and where to watch.</p></div></div>' +
      '<div class="cx-stats"><div class="cx-stat"><strong>' + MOVIES.length + '</strong><span>movies</span></div><div class="cx-stat"><strong>' + VIEWERS.length + '</strong><span>community viewers</span></div><div class="cx-stat"><strong>' + totalRatings + '</strong><span>ratings learned from</span></div></div>' +
      '<div class="section-title" id="cxFaq"><h2>❓ FAQ</h2></div><div class="cx-faq">' + faq.map(function (f) { return "<details><summary>" + f[0] + "</summary><p>" + f[1] + "</p></details>"; }).join("") + "</div>" +
      '<div class="cx-cta"><div><h3>Still need help?</h3><p>Chat with our assistant or send us a message.</p></div><button class="btn coral" type="button" data-cx="chat">💬 Chat with support</button><button class="btn" type="button" data-cx="contact">✉️ Contact us</button></div>';
    main.appendChild(info);
  }
  var foot = document.querySelector("footer");
  if (foot) foot.innerHTML = '<div class="cx-foot"><div><h4 style="font-family:Fraunces,Georgia,serif;font-size:1.3rem">Cine<span style="color:var(--amber)">Match</span></h4><p>Movies picked for you by viewers like you. No sign-up, no tracking.</p></div>' +
    '<div><h4>Explore</h4><button type="button" data-go="quiz">Take the quiz</button><button type="button" data-go="searchSection">Search movies</button><button type="button" data-go="topSection">Top rated</button><button type="button" data-cx="watchlist">My watchlist</button></div>' +
    '<div><h4>Help</h4><button type="button" data-go="cxFaq">FAQ</button><button type="button" data-cx="contact">Contact us</button><button type="button" data-cx="chat">Support chat</button><button type="button" data-cx="privacy">Privacy &amp; my data</button></div></div>' +
    '<div class="cx-copy">© ' + new Date().getFullYear() + " CineMatch. Movie data and posters by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</div>";

  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]");
    if (g && !g.closest("#cxM")) { e.preventDefault(); if (g.dataset.go === "top") window.scrollTo({top: 0, behavior: "smooth"}); else go(g.dataset.go); return; }
    var c = e.target.closest("[data-cx]"); if (!c) return;
    var a = c.dataset.cx;
    if (a === "contact") openContact(); else if (a === "watchlist") openWatchlist(); else if (a === "privacy") openData();
    else if (a === "chat") { if (chatPanel.classList.contains("hidden")) chatBtn.click(); }
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, {threshold: .1});
    document.querySelectorAll(".cx-rv").forEach(function (n) { io.observe(n); });
  } else document.querySelectorAll(".cx-rv").forEach(function (n) { n.classList.add("in"); });
})();
