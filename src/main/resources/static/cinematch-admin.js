/* CineMatch Admin Panel: manage movies, community viewers, messages, chats, site settings, data.
   Open with:  Alt+Shift+A  |  the "🔒 Admin" link in the footer  |  yourpage.html#admin
   Load LAST in index.html:  <script src="cinematch-admin.js"></script>
   NOTE: the password only protects the panel inside this browser. It is not server security. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var clean = function (s) { return String(s == null ? "" : s).replace(/[<>]/g, "").trim(); };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var CFG = LS.get("cm_admin_cfg", {}), dirty = false, tab = "dash", mq = "", msgCache = [];
  var PG = {movies: 1, viewers: 1, msgs: 1};
  var perRows = function () { return window.innerWidth < 600 ? 10 : 20; };
  function pager(key, nav, per, redraw) {
    if (!window.CMPager) return {slice: function (a) { return a; }, reset: function () {}};
    return CMPager(nav, {perPage: per, page: PG[key], label: key, scrollTo: $("adMain") && $("adMain").firstElementChild, onPage: function (p) { PG[key] = p; redraw(); }});
  }
  var isAdmin = function () { try { return sessionStorage.getItem("cm_admin_ok") === "1"; } catch (e) { return false; } };
  var STORES = ["watchlist", "sessions", "messages", "chats"];

  /* ---------- settings definition ---------- */
  var FIELDS = [
    ["title", "Browser tab title", "text"], ["brand1", "Logo text (white part)", "text", "Cine"], ["brand2", "Logo text (colored part)", "text", "Match"],
    ["tagline", "Header tagline", "text"], ["heroTitle", "Hero title", "text"], ["heroSub", "Hero subtitle", "area"],
    ["email", "Contact email (needs refresh)", "email"], ["tmdb", "TMDB API key (posters and trailers, needs refresh)", "text"],
    ["amber", "Main accent color", "color", "#ffb627"], ["coral", "Second accent color", "color", "#ff5d73"],
    ["announce", "Announcement bar text", "text"], ["maintMsg", "Maintenance screen message", "text"]
  ];
  var TOGGLES = [
    ["announceOn", "Show announcement bar"], ["hideChat", "Hide support chat"], ["hideBg", "Hide animated background"], ["hideFan", "Hide hero poster fan"],
    ["hideSearch", "Hide search section"], ["hideTop", "Hide “Top rated” section"], ["hideInfo", "Hide “How it works” + FAQ"],
    ["maint", "Maintenance mode (visitors see a “back soon” screen)"]
  ];

  /* ---------- CSS ---------- */
  var css = document.createElement("style");
  css.id = "adStyle";
  css.textContent = [
    ".ad{position:fixed;inset:0;z-index:100;display:none;flex-direction:column;background:#0e0a20;color:var(--text);font:15px/1.5 'DM Sans',system-ui,sans-serif}.ad.open{display:flex}",
    ".ad *{box-sizing:border-box}",
    ".ad-top{display:flex;align-items:center;gap:10px;padding:12px 18px;padding-top:calc(12px + env(safe-area-inset-top,0px));background:#17123a;border-bottom:1px solid var(--line)}",
    ".ad-top h2{margin:0;font-size:1.15rem;flex:1}.ad-dirty{display:none;font-size:.8rem;color:var(--amber)}.ad-dirty.on{display:inline}",
    ".ad-body{flex:1;display:flex;min-height:0}",
    ".ad-nav{width:210px;padding:14px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:4px;overflow:auto;background:#120e2a}",
    ".ad-nav button{text-align:left;font:600 .95rem 'DM Sans',sans-serif;color:var(--muted);background:none;border:0;padding:11px 14px;border-radius:12px;cursor:pointer}",
    ".ad-nav button:hover{background:rgba(255,182,39,.1);color:var(--text)}.ad-nav button.on{background:linear-gradient(135deg,#ffd978,#ffb627 55%,#ff9a1f);color:#2a1d00}",
    ".ad-main{flex:1;overflow:auto;padding:24px;max-width:100%}",
    ".ad h3{font-family:'Fraunces',Georgia,serif;font-size:1.5rem;margin:0}.ad h4{margin:22px 0 8px;font-size:1.05rem}",
    ".ad-h{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}.ad-h input{width:240px}",
    ".ad-mut{color:var(--muted);margin:6px 0 14px}.ad-small{font-size:.8rem}.ad-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}",
    ".ad-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin:14px 0}",
    ".ad-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;text-align:center}.ad-card b{display:block;font:800 1.9rem 'Fraunces',Georgia,serif;color:var(--amber)}.ad-card span{color:var(--muted);font-size:.85rem}",
    ".ad-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.ad-split{display:grid;grid-template-columns:1fr 1fr;gap:22px}",
    ".ad-bar{display:grid;grid-template-columns:130px 1fr 32px;gap:10px;align-items:center;margin:6px 0;font-size:.9rem}.ad-bar div{height:10px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}.ad-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#ffb627,#ff5d73)}",
    ".ad-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:14px}.ad-tbl{width:100%;border-collapse:collapse;min-width:560px}",
    ".ad-tbl th{text-align:left;font-size:.8rem;color:var(--muted);padding:10px 12px;background:#17123a}.ad-tbl td{padding:10px 12px;border-top:1px solid rgba(255,255,255,.07);vertical-align:middle}.ad-tbl small{color:var(--muted)}",
    ".ad-act{white-space:nowrap;text-align:right}.ad-act .ad-btn{margin-left:6px}",
    ".ad-btn{display:inline-block;font:700 .92rem 'DM Sans',sans-serif;border:0;border-radius:999px;padding:10px 20px;cursor:pointer;color:#2a1d00;background:linear-gradient(135deg,#ffd978,#ffb627 55%,#ff9a1f);text-decoration:none;transition:filter .2s,transform .2s}",
    ".ad-btn:hover{filter:brightness(1.08);transform:translateY(-1px)}.ad-btn.sm{padding:6px 14px;font-size:.82rem}.ad-btn.ghost{color:var(--text);background:rgba(255,255,255,.06);border:1px solid var(--line)}.ad-btn.red{color:#fff;background:linear-gradient(135deg,#ff7d8f,#e11d48)}",
    ".ad input:not([type=checkbox]):not([type=color]):not([type=file]),.ad select,.ad textarea{width:100%;font:inherit;color:var(--text);background:#120e25;border:1px solid var(--line);border-radius:10px;padding:10px 12px;resize:vertical}",
    ".ad input[type=color]{width:60px;height:40px;padding:2px;border:1px solid var(--line);border-radius:10px;background:#120e25}",
    ".ad input:focus,.ad select:focus,.ad textarea:focus{outline:0;border-color:var(--amber);box-shadow:0 0 0 3px rgba(255,182,39,.18)}",
    ".ad label{display:flex;flex-direction:column;gap:6px;font-weight:700;margin-bottom:12px;font-size:.9rem}.ad label.chk{flex-direction:row;align-items:center;gap:8px;font-weight:500;margin:0}",
    ".ad-fs{border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.ad-fs>b{grid-column:1/-1;font-size:.9rem}",
    ".ad-err{color:var(--coral);min-height:1.3em;margin:0 0 8px;font-size:.9rem}",
    ".ad-msg{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:10px}.ad-msg.new{border-color:rgba(255,182,39,.6)}",
    ".ad-msg header{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:6px}.ad-msg p{margin:6px 0 10px;white-space:pre-wrap;word-break:break-word}",
    ".ad-tag{font-size:.75rem;border:1px solid rgba(255,182,39,.45);border-radius:99px;padding:2px 10px;color:var(--amber)}",
    ".ad-chat{display:flex;flex-direction:column;gap:6px;max-width:640px}.ad-chat div{padding:8px 12px;border-radius:14px;max-width:85%}.ad-chat .me{align-self:flex-end;background:#3a2468}.ad-chat .bot{align-self:flex-start;background:#2b2350}.ad-chat small{display:block;color:var(--muted);font-size:.7rem}",
    ".ad-login{flex:1;display:grid;place-items:center;padding:18px}.ad-lcard{width:min(420px,100%);background:var(--panel);border:1px solid rgba(255,182,39,.45);border-radius:18px;padding:28px}.ad-lcard h2{margin:0 0 6px}",
    ".ad-modal{position:fixed;inset:0;z-index:5;display:grid;place-items:center;padding:14px;background:rgba(6,4,16,.8)}.ad-mc{position:relative;width:min(560px,100%);max-height:92vh;overflow:auto;background:var(--panel);border:1px solid rgba(255,182,39,.45);border-radius:16px;padding:24px}",
    ".ad-mc h3{margin-bottom:14px;padding-right:36px}.ad-x{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:var(--text);cursor:pointer}",
    ".ad-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);background:#0c0919;border:1px solid var(--amber);border-radius:99px;padding:10px 20px;opacity:0;pointer-events:none;transition:.3s;font-weight:600;z-index:9}.ad-toast.show{opacity:1;transform:translate(-50%,0)}",
    ".ad-ann{background:linear-gradient(90deg,#ffb627,#ff5d73);color:#2a1d00;text-align:center;padding:9px 14px;font-weight:700}",
    ".ad-maint{position:fixed;inset:0;z-index:98;display:grid;place-content:center;gap:12px;text-align:center;padding:24px;background:#0e0a20}.ad-maint h2{font-size:2rem;margin:0}.ad-maint p{color:var(--muted);margin:0}",
    ".ad-lock{background:none;border:0;color:var(--muted);font:inherit;font-size:.8rem;cursor:pointer;opacity:.7;margin-left:10px}.ad-lock:hover{opacity:1;color:var(--amber)}",
    "@media(max-width:800px){.ad-body{flex-direction:column}.ad-nav{width:auto;flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--line);padding:8px}.ad-nav button{white-space:nowrap}.ad-main{padding:14px;width:100%;min-width:0;box-sizing:border-box}.ad-wrap{max-width:100%}.ad-two,.ad-split{grid-template-columns:1fr}.ad-h input{width:100%}input,select,textarea{font-size:16px!important}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- apply site settings (runs on every page load) ---------- */
  var cfgStyle = document.createElement("style"); cfgStyle.id = "adCfg"; document.head.appendChild(cfgStyle);
  function applyCfg() {
    var c = CFG, r = document.documentElement.style, q = function (s) { return document.querySelector(s); };
    if (c.amber) r.setProperty("--amber", c.amber); else r.removeProperty("--amber");
    if (c.coral) r.setProperty("--coral", c.coral); else r.removeProperty("--coral");
    if (c.title) document.title = c.title;
    var logo = q(".logo"); if (logo && (c.brand1 || c.brand2)) logo.innerHTML = esc(c.brand1 || "Cine") + "<span>" + esc(c.brand2 || "Match") + "</span>";
    var tg = q(".top p"); if (tg && c.tagline) tg.textContent = c.tagline;
    var h1 = q(".hero h1"); if (h1 && c.heroTitle) h1.textContent = c.heroTitle;
    var hp = q(".hero p"); if (hp && c.heroSub) hp.textContent = c.heroSub;
    var rules = [];
    if (c.hideChat) rules.push(".cx-chat-btn,.cx-chat{display:none!important}");
    if (c.hideBg) rules.push("#cxBg,.bg{display:none!important}");
    if (c.hideFan) rules.push(".cx-fan{display:none!important}.hero{grid-template-columns:1fr!important}");
    if (c.hideSearch) rules.push("#searchSection{display:none!important}");
    if (c.hideTop) rules.push("#topSection,.tr-bar{display:none!important}");
    if (c.hideInfo) rules.push("#cxInfo{display:none!important}");
    cfgStyle.textContent = rules.join("\n");
    var a = $("adAnn");
    if (c.announceOn && c.announce) { if (!a) { a = document.createElement("div"); a.id = "adAnn"; a.className = "ad-ann"; document.body.insertBefore(a, document.body.firstChild); } a.textContent = c.announce; }
    else if (a) a.remove();
    var m = $("adMaint");
    if (c.maint && !isAdmin()) {
      if (!m) { m = document.createElement("div"); m.id = "adMaint"; m.className = "ad-maint"; document.body.appendChild(m); }
      m.innerHTML = "<h2>🎬 We’ll be right back</h2><p>" + esc(c.maintMsg || "CineMatch is being updated. Please check back soon.") + '</p><p><button class="ad-lock" type="button" data-adopen>🔒 Admin</button></p>';
    } else if (m) m.remove();
  }

  /* ---------- tiny IndexedDB helper (same database as the site) ---------- */
  var idb = null;
  function openDB() {
    return new Promise(function (res) {
      if (!window.indexedDB) return res(null);
      var r = indexedDB.open("cinematch");
      r.onupgradeneeded = function () { STORES.forEach(function (n) { if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n, n === "watchlist" ? {keyPath: "id"} : {keyPath: "id", autoIncrement: true}); }); };
      r.onsuccess = function () { idb = r.result; res(idb); };
      r.onerror = function () { res(null); };
    });
  }
  var dbReady = openDB();
  function tx(s, mode, fn) {
    return dbReady.then(function () {
      return new Promise(function (res) {
        if (!idb || !idb.objectStoreNames.contains(s)) return res([]);
        try { var t = idb.transaction(s, mode), rq = fn(t.objectStore(s)); t.oncomplete = function () { res(rq && rq.result !== undefined ? rq.result : true); }; t.onerror = t.onabort = function () { res(null); }; }
        catch (e) { res(null); }
      });
    });
  }
  var all = function (s) { return tx(s, "readonly", function (o) { return o.getAll(); }).then(function (r) { return r || []; }); };
  var put = function (s, v) { return tx(s, "readwrite", function (o) { return o.put(v); }); };
  var del = function (s, id) { return tx(s, "readwrite", function (o) { return o.delete(id); }); };
  var clr = function (s) { return tx(s, "readwrite", function (o) { return o.clear(); }); };

  /* ---------- helpers ---------- */
  function persist() { LS.set("cm_admin_data", {movies: MOVIES, viewers: VIEWERS, rateIds: RATE_IDS}); markDirty(); }
  function markDirty() { dirty = true; var d = $("adDirty"); if (d) d.classList.add("on"); }
  function toast(m) { var t = $("adToast"); if (!t) return; t.textContent = m; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove("show"); }, 2200); }
  function dl(name, text, type) { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type: type || "application/json"})); a.download = name; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); }
  function csv(rows) { return rows.map(function (r) { return r.map(function (c) { var s = String(c == null ? "" : c); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }).join(","); }).join("\n"); }
  function when(t) { return new Date(t).toLocaleString(); }
  function movieById(id) { return MOVIES.filter(function (m) { return m.id == id; })[0]; }
  function modal(title, html) {
    closeModal();
    var o = document.createElement("div"); o.className = "ad-modal"; o.id = "adM";
    o.innerHTML = '<div class="ad-mc" role="dialog" aria-modal="true"><button class="ad-x" type="button" aria-label="Close" data-close>✕</button><h3>' + title + "</h3>" + html + "</div>";
    o.addEventListener("click", function (e) { if (e.target === o || e.target.closest("[data-close]")) closeModal(); });
    root.appendChild(o); var f = o.querySelector("input,textarea"); if (f) f.focus(); return o;
  }
  function closeModal() { var o = $("adM"); if (o) o.remove(); }

  /* ---------- auth ---------- */
  function hash(s) {
    if (window.crypto && crypto.subtle && window.TextEncoder)
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); });
    return Promise.resolve("p" + btoa(unescape(encodeURIComponent(s))));
  }
  function rnd() { var a = new Uint8Array(12); (window.crypto || {getRandomValues: function (x) { for (var i = 0; i < x.length; i++) x[i] = Math.random() * 256; }}).getRandomValues(a); return Array.prototype.map.call(a, function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); }
  function showLogin() {
    var AUTH = LS.get("cm_admin_auth", null), setup = !AUTH;
    root.innerHTML = '<div class="ad-login"><form id="adLF" class="ad-lcard"><h2>🎬 CineMatch Admin</h2><p class="ad-mut">' + (setup ? "First time here. Create an admin password (at least 8 characters)." : "Enter your admin password.") + "</p>" +
      '<label>Password<input type="password" id="adPw" autocomplete="' + (setup ? "new-password" : "current-password") + '" required></label>' +
      (setup ? '<label>Repeat password<input type="password" id="adPw2" autocomplete="new-password" required></label>' : "") +
      '<p class="ad-err" id="adE" role="alert"></p><div class="ad-row"><button class="ad-btn" type="submit">' + (setup ? "Create password" : "Log in") + '</button><button class="ad-btn ghost" type="button" data-adclose>Close</button></div>' +
      '<p class="ad-mut ad-small">This password protects the panel in this browser only. It is not server security. Forgot it? Clear this site’s saved data (or delete the “cm_admin_auth” key in your browser’s storage).</p></form></div>';
    $("adPw").focus();
    $("adLF").onsubmit = function (e) {
      e.preventDefault();
      var err = function (m) { $("adE").textContent = m; }, lock = LS.get("cm_admin_lock", {n: 0, until: 0}), now = Date.now(), pw = $("adPw").value;
      if (lock.until > now) return err("Too many tries. Wait " + Math.ceil((lock.until - now) / 1000) + "s.");
      if (setup) {
        if (pw.length < 8) return err("Use at least 8 characters.");
        if (pw !== $("adPw2").value) return err("Passwords do not match.");
        var salt = rnd(); hash(salt + pw).then(function (h) { LS.set("cm_admin_auth", {salt: salt, hash: h}); login(); });
      } else hash(AUTH.salt + pw).then(function (h) {
        if (h === AUTH.hash) { LS.del("cm_admin_lock"); login(); }
        else { lock.n++; if (lock.n >= 5) { lock.until = now + 60000; lock.n = 0; } LS.set("cm_admin_lock", lock); err("Wrong password."); }
      });
    };
  }
  function login() { try { sessionStorage.setItem("cm_admin_ok", "1"); } catch (e) {} applyCfg(); showApp(); }

  /* ---------- shell ---------- */
  var root = document.createElement("div"); root.id = "adRoot"; root.className = "ad"; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "Admin panel");
  document.body.appendChild(root);
  var TABS = [["dash", "📊 Dashboard"], ["movies", "🎞️ Movies"], ["viewers", "👥 Viewers"], ["msgs", "✉️ Messages"], ["chats", "💬 Chats"], ["set", "⚙️ Settings"], ["data", "🗄️ Data"]];
  function showApp() {
    root.innerHTML = '<div class="ad-top"><h2>🎬 CineMatch Admin</h2><span class="ad-dirty' + (dirty ? " on" : "") + '" id="adDirty">Changes show on the site when you close this panel</span><button class="ad-btn ghost sm" type="button" data-adclose>View site</button><button class="ad-btn ghost sm" type="button" data-adout>Log out</button></div>' +
      '<div class="ad-body"><nav class="ad-nav" aria-label="Admin sections">' + TABS.map(function (t) { return '<button type="button" data-tab="' + t[0] + '">' + t[1] + "</button>"; }).join("") + '</nav><main class="ad-main" id="adMain"></main></div><div class="ad-toast" id="adToast" role="status"></div>';
    render(); badge();
  }
  function badge() {
    all("messages").then(function (r) {
      var n = r.filter(function (x) { return !x.read; }).length, b = root.querySelector('[data-tab="msgs"]');
      if (b) b.textContent = "✉️ Messages" + (n ? " (" + n + ")" : "");
    });
  }
  function render() {
    root.querySelectorAll("[data-tab]").forEach(function (b) { b.classList.toggle("on", b.dataset.tab === tab); });
    var el = $("adMain"); if (!el) return;
    ({dash: tDash, movies: tMovies, viewers: tViewers, msgs: tMsgs, chats: tChats, set: tSet, data: tData}[tab])(el);
  }

  /* ---------- Dashboard ---------- */
  function tDash(el) {
    el.innerHTML = '<div class="ad-h"><h3>Dashboard</h3></div><p class="ad-mut">Loading…</p>';
    Promise.all(STORES.map(all)).then(function (r) {
      var wl = r[0], ss = r[1], ms = r[2], ch = r[3], unread = ms.filter(function (x) { return !x.read; }).length, mc = {};
      ss.forEach(function (s) { if (s.mood) mc[s.mood] = (mc[s.mood] || 0) + 1; });
      var mx = Math.max.apply(null, Object.keys(mc).map(function (k) { return mc[k]; }).concat(1));
      var top = MOVIES.map(function (m) { var rs = VIEWERS.map(function (v) { return v.r[m.id]; }).filter(function (x) { return x != null; }); return {m: m, n: rs.length, a: rs.length ? rs.reduce(function (a, b) { return a + b; }, 0) / rs.length : 0}; })
        .filter(function (x) { return x.n >= 2; }).sort(function (a, b) { return b.a - a.a || b.n - a.n; }).slice(0, 5);
      var cards = [["Movies", MOVIES.length], ["Community viewers", VIEWERS.length], ["Quizzes taken", ss.length], ["Messages", ms.length + (unread ? " · " + unread + " new" : "")], ["Chat lines", ch.length], ["Watchlist saves", wl.length]];
      el.innerHTML = '<div class="ad-h"><h3>Dashboard</h3></div><div class="ad-cards">' + cards.map(function (c) { return '<div class="ad-card"><b>' + c[0 + 1] + "</b><span>" + c[0] + "</span></div>"; }).join("") + "</div>" +
        '<div class="ad-split"><div><h4>Moods people pick</h4>' + (Object.keys(mc).length ? Object.keys(mc).sort(function (a, b) { return mc[b] - mc[a]; }).map(function (k) { return '<div class="ad-bar"><span>' + esc(MOODS[k] || k) + '</span><div><i style="width:' + mc[k] / mx * 100 + '%"></i></div><b>' + mc[k] + "</b></div>"; }).join("") : '<p class="ad-mut">No quizzes yet.</p>') + "</div>" +
        "<div><h4>Top rated movies</h4>" + (top.length ? top.map(function (x, i) { return '<div class="ad-bar" style="grid-template-columns:1fr 60px"><span>' + (i + 1) + ". " + esc(x.m.t) + "</span><b>★ " + x.a.toFixed(1) + "</b></div>"; }).join("") : '<p class="ad-mut">Not enough ratings.</p>') + "</div></div>" +
        '<p class="ad-mut ad-small">Visitor numbers (quizzes, messages, chats) come from this browser’s database. Without a server, you only see what was saved on this device.</p>';
    });
  }

  /* ---------- Movies ---------- */
  function tMovies(el) {
    el.innerHTML = '<div class="ad-h"><h3>Movies <small class="ad-mut">(' + MOVIES.length + ')</small></h3><div class="ad-row"><input id="adQ" placeholder="Search title, genre, year…" value="' + esc(mq) + '"><button class="ad-btn" type="button" data-a="mAdd">+ Add movie</button></div></div>' +
      '<p class="ad-mut">Tick “Quiz” to show a movie in the rating list of the quiz (max 12).</p><div class="ad-wrap"><table class="ad-tbl"><thead><tr><th>ID</th><th>Title</th><th>Genres</th><th>Age</th><th>Quiz</th><th></th></tr></thead><tbody id="adTb"></tbody></table></div><nav id="adPgM"></nav>';
    var pm = pager("movies", $("adPgM"), perRows, fill);
    function fill() {
      var rows = MOVIES.filter(function (m) { return (m.t + " " + m.g.join(" ") + " " + m.y).toLowerCase().indexOf(mq) > -1; });
      $("adTb").innerHTML = pm.slice(rows).map(function (m) {
        return "<tr><td>" + m.id + "</td><td><b>" + esc(m.t) + "</b> <small>" + m.y + "</small></td><td>" + esc(m.g.join(", ")) + "</td><td>" + (m.min || 0) + '+</td><td><input type="checkbox" data-a="mRate" data-id="' + m.id + '"' + (RATE_IDS.indexOf(m.id) > -1 ? " checked" : "") + ' aria-label="In quiz"></td>' +
          '<td class="ad-act"><button class="ad-btn ghost sm" type="button" data-a="mEdit" data-id="' + m.id + '">Edit</button><button class="ad-btn red sm" type="button" data-a="mDel" data-id="' + m.id + '">Delete</button></td></tr>';
      }).join("") || '<tr><td colspan="6">No movies found.</td></tr>';
    }
    $("adQ").oninput = function () { mq = this.value.toLowerCase(); pm.reset(); PG.movies = 1; fill(); };
    fill();
  }
  function mForm(m) {
    var isNew = !m; m = m || {id: 0, t: "", y: new Date().getFullYear(), g: [], m: [], min: 0, d: ""};
    var gs = {}; MOVIES.forEach(function (x) { x.g.forEach(function (g) { gs[g] = 1; }); });
    var o = modal((isNew ? "Add" : "Edit") + " movie",
      '<form id="adMF"><label>Title<input name="t" required maxlength="120" value="' + esc(m.t) + '"></label><div class="ad-two"><label>Year<input name="y" type="number" min="1888" max="2100" required value="' + m.y + '"></label><label>Minimum age<input name="min" type="number" min="0" max="21" value="' + (m.min || 0) + '"></label></div>' +
      '<label>Genres (comma separated)<input name="g" required list="adGl" value="' + esc(m.g.join(", ")) + '"></label><datalist id="adGl">' + Object.keys(gs).sort().map(function (g) { return '<option value="' + esc(g) + '">'; }).join("") + "</datalist>" +
      '<div class="ad-fs"><b>Moods it fits</b>' + Object.keys(MOODS).map(function (k) { return '<label class="chk"><input type="checkbox" name="m" value="' + k + '"' + (m.m.indexOf(k) > -1 ? " checked" : "") + "> " + esc(MOODS[k]) + "</label>"; }).join("") + "</div>" +
      '<label>Description<textarea name="d" rows="3" maxlength="400">' + esc(m.d || "") + '</textarea></label><p class="ad-err" id="adFE" role="alert"></p><div class="ad-row"><button class="ad-btn" type="submit">Save</button><button class="ad-btn ghost" type="button" data-close>Cancel</button></div></form>');
    var f = o.querySelector("form");
    f.onsubmit = function (e) {
      e.preventDefault();
      var t = clean(f.t.value), y = +f.y.value, g = f.g.value.split(",").map(clean).filter(Boolean).map(cap), err = !t ? "Title is required." : (y < 1888 || y > 2100) ? "Enter a valid year." : !g.length ? "Add at least one genre." : "";
      if (err) { $("adFE").textContent = err; return; }
      if (isNew) m.id = MOVIES.reduce(function (a, b) { return Math.max(a, b.id); }, 0) + 1;
      m.t = t; m.y = y; m.min = +f.min.value || 0; m.g = g; m.d = clean(f.d.value);
      m.m = [].map.call(f.querySelectorAll("input[name=m]:checked"), function (x) { return x.value; });
      if (isNew) MOVIES.push(m);
      persist(); closeModal(); render(); toast("Movie saved");
    };
  }
  function mDel(id) {
    var m = movieById(id); if (!m || !confirm("Delete “" + m.t + "”?")) return;
    MOVIES.splice(MOVIES.indexOf(m), 1);
    for (var i = RATE_IDS.length - 1; i >= 0; i--) if (RATE_IDS[i] == m.id) RATE_IDS.splice(i, 1);
    persist(); render(); toast("Movie deleted");
  }

  /* ---------- Viewers ---------- */
  function ratingsText(r) { return Object.keys(r).map(function (k) { return k + ":" + r[k]; }).join(", "); }
  function parseRatings(s) {
    var out = {}, parts = s.split(/[,\n;]+/).map(function (x) { return x.trim(); }).filter(Boolean);
    for (var i = 0; i < parts.length; i++) {
      var m = /^(\d+)\s*[:=]\s*([1-5])$/.exec(parts[i]);
      if (!m) return {err: "“" + parts[i] + "” is not valid. Use movieId:rating (1 to 5), like 2:5, 3:4."};
      if (!movieById(m[1])) return {err: "Movie id " + m[1] + " does not exist."};
      out[m[1]] = +m[2];
    }
    return {r: out};
  }
  function tViewers(el) {
    el.innerHTML = '<div class="ad-h"><h3>Community viewers <small class="ad-mut">(' + VIEWERS.length + ')</small></h3><button class="ad-btn" type="button" data-a="vAdd">+ Add viewer</button></div><p class="ad-mut">These viewers are what CineMatch learns from. More viewers means smarter matches.</p>' +
      '<div class="ad-wrap"><table class="ad-tbl"><thead><tr><th>#</th><th>Age</th><th>Gender</th><th>Ratings</th><th>Average</th><th></th></tr></thead><tbody id="adTbV"></tbody></table></div><nav id="adPgV"></nav>';
    var pv = pager("viewers", $("adPgV"), perRows, fill);
    function fill() {
      var idx = VIEWERS.map(function (v, i) { return i; });
      $("adTbV").innerHTML = pv.slice(idx).map(function (i) { var v = VIEWERS[i];
        var ks = Object.keys(v.r), avg = ks.length ? ks.reduce(function (a, k) { return a + v.r[k]; }, 0) / ks.length : 0;
        return "<tr><td>" + (i + 1) + "</td><td>" + v.a + "</td><td>" + esc(v.g) + "</td><td>" + ks.length + "</td><td>" + (ks.length ? "★ " + avg.toFixed(1) : "-") + '</td><td class="ad-act"><button class="ad-btn ghost sm" type="button" data-a="vEdit" data-id="' + i + '">Edit</button><button class="ad-btn red sm" type="button" data-a="vDel" data-id="' + i + '">Delete</button></td></tr>';
      }).join("") || '<tr><td colspan="6">No viewers yet.</td></tr>';
    }
    fill();
  }
  function vForm(v, idx) {
    var isNew = !v; v = v || {a: 20, g: "female", r: {}};
    var o = modal((isNew ? "Add" : "Edit") + " viewer", '<form id="adVF"><div class="ad-two"><label>Age<input name="a" type="number" min="5" max="99" required value="' + v.a + '"></label><label>Gender<select name="g">' +
      [["female", "Female"], ["male", "Male"], ["other", "Non-binary"]].map(function (g) { return '<option value="' + g[0] + '"' + (v.g === g[0] ? " selected" : "") + ">" + g[1] + "</option>"; }).join("") + "</select></label></div>" +
      '<label>Ratings (movieId:rating, comma separated)<textarea name="r" rows="4" placeholder="2:5, 3:4, 9:5">' + esc(ratingsText(v.r)) + '</textarea></label><p class="ad-mut ad-small">Find movie ids in the Movies tab. Ratings are 1 to 5.</p><p class="ad-err" id="adFE" role="alert"></p><div class="ad-row"><button class="ad-btn" type="submit">Save</button><button class="ad-btn ghost" type="button" data-close>Cancel</button></div></form>');
    var f = o.querySelector("form");
    f.onsubmit = function (e) {
      e.preventDefault();
      var a = +f.a.value, p = parseRatings(f.r.value);
      if (!(a >= 5 && a <= 99)) { $("adFE").textContent = "Enter an age between 5 and 99."; return; }
      if (p.err) { $("adFE").textContent = p.err; return; }
      v.a = a; v.g = f.g.value; v.r = p.r; if (isNew) VIEWERS.push(v);
      persist(); closeModal(); render(); toast("Viewer saved");
    };
  }

  /* ---------- Messages ---------- */
  function tMsgs(el) {
    all("messages").then(function (rows) {
      rows.sort(function (a, b) { return b.at - a.at; }); msgCache = rows;
      el.innerHTML = '<div class="ad-h"><h3>Messages <small class="ad-mut">(' + rows.length + ')</small></h3><div class="ad-row"><button class="ad-btn ghost" type="button" data-a="msgCsv">Export CSV</button><button class="ad-btn red" type="button" data-a="msgAll">Delete all</button></div></div>' +
        (rows.length ? '<div id="adMsgL"></div><nav id="adPgMsg"></nav>' : '<p class="ad-mut">No messages saved in this browser yet.</p>');
      if (!rows.length) return;
      var pmsg = pager("msgs", $("adPgMsg"), function () { return window.innerWidth < 600 ? 5 : 10; }, fill);
      function fill() {
        $("adMsgL").innerHTML = pmsg.slice(rows).map(function (m) {
          var mail = "mailto:" + encodeURIComponent(m.email || "").replace("%40", "@") + "?subject=" + encodeURIComponent("Re: [CineMatch] " + (m.topic || "")) + "&body=" + encodeURIComponent("\n\n> " + (m.message || ""));
          return '<div class="ad-msg' + (m.read ? "" : " new") + '"><header><span><b>' + esc(m.name) + '</b> · <small>' + esc(m.email) + '</small></span><span><span class="ad-tag">' + esc(m.topic) + "</span> <small>" + when(m.at) + "</small></span></header><p>" + esc(m.message) + "</p>" +
            '<div class="ad-row"><a class="ad-btn sm" href="' + esc(mail) + '">Reply by email</a><button class="ad-btn ghost sm" type="button" data-a="msgRead" data-id="' + m.id + '">' + (m.read ? "Mark unread" : "Mark read") + '</button><button class="ad-btn red sm" type="button" data-a="msgDel" data-id="' + m.id + '">Delete</button></div></div>';
        }).join("");
      }
      fill();
    });
  }

  /* ---------- Chats ---------- */
  function tChats(el) {
    all("chats").then(function (rows) {
      rows = rows.slice(-200);
      el.innerHTML = '<div class="ad-h"><h3>Support chats <small class="ad-mut">(last ' + rows.length + " lines)</small></h3>" + '<button class="ad-btn red" type="button" data-a="chatClr">Clear chats</button></div>' +
        (rows.length ? '<div class="ad-chat">' + rows.map(function (r) { return '<div class="' + (r.role === "me" ? "me" : "bot") + '">' + esc(r.text) + "<small>" + when(r.at) + "</small></div>"; }).join("") + "</div>" : '<p class="ad-mut">No chat history yet.</p>');
    });
  }

  /* ---------- Settings ---------- */
  function tSet(el) {
    el.innerHTML = '<div class="ad-h"><h3>Settings</h3></div><form id="adSF"><div class="ad-split"><div>' +
      FIELDS.map(function (f) {
        var v = esc(CFG[f[0]] || ""), ph = f[3] ? ' placeholder="' + esc(f[3]) + '"' : "";
        return "<label>" + f[1] + (f[2] === "area" ? '<textarea name="' + f[0] + '" rows="3">' + v + "</textarea>" : '<input name="' + f[0] + '" type="' + (f[2] === "color" ? "color" : f[2]) + '" value="' + (f[2] === "color" ? esc(CFG[f[0]] || f[3]) : v) + '"' + ph + (f[0] === "tmdb" ? ' autocomplete="off"' : "") + ">") + "</label>";
      }).join("") + '</div><div><h4 style="margin-top:0">Features</h4>' + TOGGLES.map(function (t) { return '<label class="chk" style="margin-bottom:12px"><input type="checkbox" name="' + t[0] + '"' + (CFG[t[0]] ? " checked" : "") + "> " + t[1] + "</label>"; }).join("") +
      '<p class="ad-mut ad-small">Leave a text field empty to use the original value from your code. Colors only change parts of the site that use the theme colors.</p></div></div><div class="ad-row"><button class="ad-btn" type="submit">Save settings</button></div></form>' +
      '<h4>Change admin password</h4><form id="adPF" style="max-width:380px"><label>Current password<input type="password" name="c" autocomplete="current-password" required></label><label>New password (8+ characters)<input type="password" name="n" autocomplete="new-password" required></label><p class="ad-err" id="adPE" role="alert"></p><button class="ad-btn" type="submit">Change password</button></form>';
    $("adSF").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, n = {};
      FIELDS.forEach(function (x) { var v = clean(f[x[0]].value); if (x[2] === "color" && v.toLowerCase() === (x[3] || "").toLowerCase()) v = ""; if (v) n[x[0]] = v; });
      TOGGLES.forEach(function (t) { if (f[t[0]].checked) n[t[0]] = true; });
      CFG = n; LS.set("cm_admin_cfg", CFG); applyCfg(); markDirty(); toast("Settings saved");
    };
    $("adPF").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, A = LS.get("cm_admin_auth", null), er = $("adPE");
      if (f.n.value.length < 8) { er.textContent = "Use at least 8 characters."; return; }
      hash(A.salt + f.c.value).then(function (h) {
        if (h !== A.hash) { er.textContent = "Current password is wrong."; return; }
        var s = rnd(); hash(s + f.n.value).then(function (h2) { LS.set("cm_admin_auth", {salt: s, hash: h2}); f.reset(); er.textContent = ""; toast("Password changed"); });
      });
    };
  }

  /* ---------- Data ---------- */
  function exportAll() {
    Promise.all(STORES.map(all)).then(function (r) {
      var stores = {}; STORES.forEach(function (s, i) { stores[s] = r[i]; });
      dl("cinematch-backup-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify({app: "cinematch", config: CFG, movies: MOVIES, viewers: VIEWERS, rateIds: RATE_IDS, stores: stores}, null, 2));
    });
  }
  function importAll(file) {
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var o = JSON.parse(rd.result); if (!o || o.app !== "cinematch") throw 0;
        var okM = function (m) { return m && m.id && typeof m.t === "string" && Array.isArray(m.g) && Array.isArray(m.m); };
        if (Array.isArray(o.movies) && o.movies.every(okM)) {
          o.movies.forEach(function (m) { m.t = clean(m.t); m.d = clean(m.d); m.g = m.g.map(clean); });
          LS.set("cm_admin_data", {movies: o.movies, viewers: Array.isArray(o.viewers) ? o.viewers : VIEWERS, rateIds: Array.isArray(o.rateIds) ? o.rateIds : RATE_IDS});
        }
        if (o.config && typeof o.config === "object") { var c = {}; Object.keys(o.config).forEach(function (k) { c[k] = typeof o.config[k] === "string" ? clean(o.config[k]) : o.config[k]; }); LS.set("cm_admin_cfg", c); }
        var jobs = [];
        if (o.stores) STORES.forEach(function (s) { if (Array.isArray(o.stores[s])) jobs.push(clr(s).then(function () { return Promise.all(o.stores[s].map(function (x) { return put(s, x); })); })); });
        Promise.all(jobs).then(function () { dirty = true; alert("Backup imported. The page will reload."); closeAdmin(); });
      } catch (e) { alert("That file is not a valid CineMatch backup."); }
    };
    rd.readAsText(file);
  }
  function tData(el) {
    el.innerHTML = '<div class="ad-h"><h3>Data</h3></div><h4 style="margin-top:0">Backup</h4><p class="ad-mut">Export everything (movies, viewers, settings, messages, chats, quiz history) to one JSON file, or restore it later.</p>' +
      '<div class="ad-row"><button class="ad-btn" type="button" data-a="exp">⬇ Export backup</button><label class="ad-btn ghost" style="margin:0">⬆ Import backup<input type="file" id="adImp" accept="application/json,.json" hidden></label></div>' +
      '<h4>Reset</h4><div class="ad-row"><button class="ad-btn ghost" type="button" data-a="rDat">Restore original movies &amp; viewers</button><button class="ad-btn ghost" type="button" data-a="rCfg">Reset settings</button><button class="ad-btn red" type="button" data-a="wipeV">Delete visitor data</button></div>' +
      '<p class="ad-mut ad-small">“Delete visitor data” clears quiz history, messages, chats and watchlist saved in this browser. Restoring original movies uses the data written in your index.html.</p>';
    $("adImp").onchange = function () { if (this.files[0]) importAll(this.files[0]); };
  }

  /* ---------- actions ---------- */
  var ACT = {
    mAdd: function () { mForm(); },
    mEdit: function (id) { mForm(movieById(id)); },
    mDel: mDel,
    vAdd: function () { vForm(); },
    vEdit: function (id) { vForm(VIEWERS[+id], +id); },
    vDel: function (id) { if (confirm("Delete this viewer?")) { VIEWERS.splice(+id, 1); persist(); render(); toast("Viewer deleted"); } },
    msgRead: function (id) { var m = msgCache.filter(function (x) { return x.id == id; })[0]; if (m) { m.read = !m.read; put("messages", m).then(function () { render(); badge(); }); } },
    msgDel: function (id) { if (confirm("Delete this message?")) del("messages", +id).then(function () { render(); badge(); toast("Deleted"); }); },
    msgAll: function () { if (confirm("Delete ALL messages?")) clr("messages").then(function () { render(); badge(); }); },
    msgCsv: function () { dl("cinematch-messages.csv", csv([["Date", "Name", "Email", "Topic", "Message"]].concat(msgCache.map(function (m) { return [when(m.at), m.name, m.email, m.topic, m.message]; }))), "text/csv"); },
    chatClr: function () { if (confirm("Clear all chat history?")) clr("chats").then(function () { render(); toast("Chats cleared"); }); },
    exp: exportAll,
    rDat: function () { if (confirm("Remove your movie and viewer edits and go back to the original data?")) { LS.del("cm_admin_data"); dirty = true; toast("Restored. Close the panel to reload."); markDirty(); } },
    rCfg: function () { if (confirm("Reset all settings?")) { CFG = {}; LS.del("cm_admin_cfg"); applyCfg(); markDirty(); toast("Settings reset"); } },
    wipeV: function () { if (confirm("Delete quiz history, messages, chats and watchlist saved in this browser?")) Promise.all(STORES.map(clr)).then(function () { LS.del("cm_watchlist"); markDirty(); badge(); toast("Visitor data deleted"); }); }
  };
  root.addEventListener("click", function (e) {
    var t = e.target.closest("[data-tab]"); if (t) { tab = t.dataset.tab; render(); return; }
    if (e.target.closest("[data-adclose]")) { closeAdmin(); return; }
    if (e.target.closest("[data-adout]")) { try { sessionStorage.removeItem("cm_admin_ok"); } catch (x) {} closeAdmin(); applyCfg(); return; }
    var b = e.target.closest("[data-a]"); if (b && ACT[b.dataset.a]) ACT[b.dataset.a](b.dataset.id);
  });
  root.addEventListener("change", function (e) {
    var c = e.target; if (c.dataset.a !== "mRate") return;
    var id = +c.dataset.id, i = RATE_IDS.indexOf(id);
    if (c.checked && i < 0) { if (RATE_IDS.length >= 12) { c.checked = false; toast("Max 12 movies in the quiz"); return; } RATE_IDS.push(id); }
    else if (!c.checked && i > -1) RATE_IDS.splice(i, 1);
    persist();
  });

  /* ---------- open / close ---------- */
  function openAdmin() { root.classList.add("open"); document.body.style.overflow = "hidden"; if (isAdmin()) showApp(); else showLogin(); }
  function closeAdmin() {
    closeModal(); root.classList.remove("open"); document.body.style.overflow = "";
    if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search);
    if (dirty) location.reload();
  }
  document.addEventListener("keydown", function (e) {
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === "a") { e.preventDefault(); openAdmin(); }
    else if (e.key === "Escape" && root.classList.contains("open")) closeModal();
  });
  document.addEventListener("click", function (e) { if (e.target.closest("[data-adopen]")) openAdmin(); });
  addEventListener("hashchange", function () { if (location.hash === "#admin") openAdmin(); });

  var cp = document.querySelector(".cx-copy") || document.querySelector("footer");
  if (cp) { var lk = document.createElement("button"); lk.type = "button"; lk.className = "ad-lock"; lk.dataset.adopen = ""; lk.textContent = "🔒 Admin"; cp.appendChild(lk); }
  applyCfg();
  if (location.hash === "#admin") openAdmin();
})();
