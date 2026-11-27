/* CineMatch Pagination: one reusable, responsive, accessible pager.
   Load in <head> (before any script that uses it):  <script src="cinematch-paginate.js"></script>

   Usage:
     var pager = CMPager(navElement, {
       perPage: 12,                 // number, or function () { return n; } (re-checked on resize)
       page: 1,                     // starting page (optional)
       label: "Search results",     // accessible name (optional)
       scrollTo: someElement,       // scrolled into view when the page changes (optional)
       swipe: gridElement,          // swipe left/right on touch screens to change page (optional)
       onPage: function (page) {}   // called when the user changes page; re-render here
     });
     var visible = pager.slice(allItems);   // items for the current page; also redraws the controls
     pager.reset();                         // back to page 1 (e.g. when a filter changes)
*/
(function () {
  "use strict";
  if (window.CMPager) return;

  var css =
    ".pg{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 14px;margin:20px 0 4px;width:100%}" +
    ".pg[hidden]{display:none!important}" +
    ".pg-list{display:flex;flex-wrap:nowrap;align-items:center;gap:6px;list-style:none;margin:0;padding:0}" +
    ".pg-btn{min-width:42px;height:42px;padding:0 12px;border-radius:12px;border:1px solid var(--line,#3a3260);background:var(--panel,#1f1a3a);color:var(--text,#f4efe6);" +
      "font:700 .92rem 'DM Sans',system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px;" +
      "transition:background .15s,border-color .15s,transform .15s,color .15s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;user-select:none}" +
    ".pg-btn:hover:not(:disabled):not([aria-current]){border-color:var(--amber,#ffb627);transform:translateY(-1px)}" +
    ".pg-btn:focus-visible{outline:3px solid var(--amber,#ffb627);outline-offset:2px}" +
    ".pg-btn[aria-current=page]{background:linear-gradient(135deg,#ffd978,#ffb627 45%,#ff7a59);border-color:transparent;color:#1b1430;cursor:default}" +
    ".pg-btn:disabled{opacity:.38;cursor:not-allowed}" +
    ".pg-gap{min-width:22px;text-align:center;color:var(--muted,#b5aed0);user-select:none}" +
    ".pg-info{color:var(--muted,#b5aed0);font-size:.86rem;white-space:nowrap}" +
    ".pg-info b{color:var(--text,#f4efe6)}" +
    ".pg-mini{display:none;font-weight:700;color:var(--text,#f4efe6);min-width:64px;text-align:center}" +
    "@media(max-width:560px){.pg{gap:10px}.pg-btn{min-width:44px;height:44px;padding:0 10px}.pg-txt{display:none}.pg-info{width:100%;text-align:center;order:2}}" +
    ".pg-compact .pg-list .pg-num,.pg-compact .pg-list .pg-gap{display:none}.pg-compact .pg-mini{display:inline-block}" +
    "@media(prefers-reduced-motion:reduce){.pg-btn{transition:none}.pg-btn:hover:not(:disabled):not([aria-current]){transform:none}}";
  var st = document.createElement("style"); st.id = "cmPagerCss"; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  var reduced = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };

  /* Page list with ellipses, e.g. 1 … 4 5 6 … 12. "sib" = neighbours shown each side. */
  function pages(cur, total, sib) {
    var out = [], lo = Math.max(2, cur - sib), hi = Math.min(total - 1, cur + sib);
    if (cur - sib <= 3) { lo = 2; hi = Math.min(total - 1, Math.max(hi, 2 + sib * 2)); }
    if (cur + sib >= total - 2) { hi = total - 1; lo = Math.max(2, Math.min(lo, total - 1 - sib * 2)); }
    out.push(1);
    if (lo > 2) out.push("…");
    for (var i = lo; i <= hi; i++) out.push(i);
    if (hi < total - 1) out.push("…");
    if (total > 1) out.push(total);
    return out;
  }

  window.CMPager = function (nav, o) {
    o = o || {};
    var page = Math.max(1, o.page | 0 || 1), total = 1, count = 0, per = 1, firstIdx = 0;
    var getPer = function () { var n = typeof o.perPage === "function" ? o.perPage() : o.perPage; return Math.max(1, (n | 0) || 10); };
    per = getPer();

    nav.classList.add("pg");
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-label", (o.label || "Results") + " pages");
    nav.hidden = true;

    function go(p, fromUser) {
      p = Math.min(Math.max(1, p), total);
      if (p === page) return;
      page = p;
      if (o.onPage) o.onPage(page);
      if (fromUser && o.scrollTo) {
        var r = o.scrollTo.getBoundingClientRect();
        if (r.top < 0 || r.top > window.innerHeight * 0.6) o.scrollTo.scrollIntoView({behavior: reduced() ? "auto" : "smooth", block: "start"});
      }
    }

    /* Draw with 1 neighbour each side; if that doesn't fit on one line in this container,
       try 0 neighbours, then fall back to the compact "‹ 3 / 12 ›" layout. Works in any width. */
    function draw() {
      if (total <= 1) { nav.hidden = true; nav.innerHTML = ""; return; }
      nav.hidden = false;
      var focused = nav.contains(document.activeElement) ? document.activeElement.getAttribute("data-pg") : null;
      nav.classList.remove("pg-compact");
      render(1, focused);
      if (!fits()) { render(0, focused); if (!fits()) nav.classList.add("pg-compact"); }
    }
    function fits() {
      var p = nav.querySelector('[data-pg="prev"]'), n = nav.querySelector('[data-pg="next"]');
      return !p || !n || (p.offsetTop === n.offsetTop && nav.scrollWidth <= nav.clientWidth + 1);
    }
    function render(sib, focused) {
      var from = (page - 1) * per + 1, to = Math.min(count, page * per);
      var h = '<button type="button" class="pg-btn" data-pg="prev" aria-label="Previous page"' + (page === 1 ? " disabled" : "") + '>‹<span class="pg-txt"> Prev</span></button><ul class="pg-list">';
      pages(page, total, sib).forEach(function (p) {
        if (p === "…") h += '<li class="pg-gap" aria-hidden="true">…</li>';
        else h += '<li><button type="button" class="pg-btn pg-num" data-pg="' + p + '" aria-label="Page ' + p + '"' + (p === page ? ' aria-current="page"' : "") + ">" + p + "</button></li>";
      });
      h += '<li class="pg-mini" aria-hidden="true">' + page + " / " + total + "</li></ul>" +
        '<button type="button" class="pg-btn" data-pg="next" aria-label="Next page"' + (page === total ? " disabled" : "") + '><span class="pg-txt">Next </span>›</button>' +
        '<span class="pg-info" aria-live="polite">Showing <b>' + from + "–" + to + "</b> of <b>" + count + "</b></span>";
      nav.innerHTML = h;
      if (focused) {
        var b = nav.querySelector('[data-pg="' + focused + '"]');
        if (!b || b.disabled) b = nav.querySelector('[aria-current="page"]');
        if (b) b.focus();
      }
    }

    nav.addEventListener("click", function (e) {
      var b = e.target.closest("[data-pg]"); if (!b || b.disabled) return;
      var v = b.getAttribute("data-pg");
      go(v === "prev" ? page - 1 : v === "next" ? page + 1 : +v, true);
    });
    nav.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(page - 1, true); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(page + 1, true); }
      else if (e.key === "Home") { e.preventDefault(); go(1, true); }
      else if (e.key === "End") { e.preventDefault(); go(total, true); }
    });

    /* Swipe to change page on touch screens (horizontal swipes only; vertical scrolling still works). */
    if (o.swipe) {
      var sx = 0, sy = 0, t0 = 0;
      o.swipe.addEventListener("touchstart", function (e) { if (e.touches.length !== 1) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; t0 = Date.now(); }, {passive: true});
      o.swipe.addEventListener("touchend", function (e) {
        if (!t0 || total <= 1) return;
        var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy, dt = Date.now() - t0; t0 = 0;
        if (dt < 600 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8) go(dx < 0 ? page + 1 : page - 1, true);
      }, {passive: true});
    }

    /* Re-fit on resize / rotation: keep the same first item visible when page size changes. */
    var rt;
    window.addEventListener("resize", function onResize() {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (!nav.isConnected) { window.removeEventListener("resize", onResize); return; }
        var n = getPer();
        if (n !== per) {
          per = n; total = Math.max(1, Math.ceil(count / per));
          var np = Math.min(total, Math.floor(firstIdx / per) + 1);
          page = np; if (o.onPage) o.onPage(page); else draw();
        } else draw();
      }, 150);
    });

    return {
      slice: function (items) {
        count = items.length; per = getPer();
        total = Math.max(1, Math.ceil(count / per));
        if (page > total) page = total;
        firstIdx = (page - 1) * per;
        draw();
        return items.slice(firstIdx, firstIdx + per);
      },
      reset: function () { page = 1; },
      go: function (p) { go(p, false); },
      get page() { return page; },
      get pages() { return total; }
    };
  };
})();
