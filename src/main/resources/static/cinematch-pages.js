/* CineMatch quiz panel: the quiz (and its results) open in a full-screen panel
   on the same page. Load LAST in index.html, after cinematch-ui.js:
   <script src="cinematch-pages.js"></script>   (no quiz.html needed) */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var quiz = $("quiz"), results = $("results");
  if (!quiz || !results) return;

  /* ---------- CSS ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".qp{position:fixed;inset:0;z-index:44;display:none;overflow-y:auto;overscroll-behavior:contain;padding:16px;padding-top:calc(16px + env(safe-area-inset-top,0px));background:rgba(10,7,22,.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}",
    ".qp.open{display:block;animation:fade .2s}",
    ".qp-card{position:relative;width:min(var(--cxw,880px),100%);margin:0 auto 40px}",
    ".qp-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 2px 16px}",
    ".qp-head h2{margin:0;font-size:clamp(1.5rem,5vw,2.2rem)}",
    ".qp-x{flex:0 0 auto;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(15,11,32,.85);color:var(--text);font-size:1rem;cursor:pointer;transition:transform .3s,border-color .2s}",
    ".qp-x:hover{transform:rotate(90deg);border-color:var(--amber)}",
    ".qp #results{margin-top:0}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- Build the panel and move the quiz + results into it ---------- */
  var panel = document.createElement("div");
  panel.className = "qp"; panel.id = "quizPanel";
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-label", "Movie quiz");
  panel.innerHTML = '<div class="qp-card"><div class="qp-head"><h2>🎬 Find your next movie</h2><button type="button" class="qp-x" aria-label="Close quiz">✕</button></div></div>';
  var card = panel.firstChild;
  card.appendChild(quiz);
  card.appendChild(results);
  document.body.appendChild(panel);

  function openPanel() {
    if (!results.classList.contains("hidden") && $("again")) $("again").click(); // show the form again
    panel.classList.add("open");
    document.body.style.overflow = "hidden";
    panel.scrollTop = 0;
  }
  function closePanel() {
    panel.classList.remove("open");
    if ($("modal").classList.contains("hidden") && !$("cxM")) document.body.style.overflow = "";
  }

  panel.querySelector(".qp-x").addEventListener("click", closePanel);
  panel.addEventListener("click", function (e) { if (e.target === panel) closePanel(); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !panel.classList.contains("open")) return;
    if (!$("modal").classList.contains("hidden") || $("cxM")) return; // let those close first
    closePanel();
  });

  /* ---------- When results appear: scroll panel to top, keep Top rated on the page ---------- */
  new MutationObserver(function () {
    if (results.classList.contains("hidden")) return;
    var ts = $("topSection"); if (ts) ts.classList.remove("hidden");
    panel.scrollTo({top: 0, behavior: "smooth"});
  }).observe(results, {attributes: true, attributeFilter: ["class"]});

  /* ---------- Everything that used to scroll to the quiz now opens the panel ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t.closest) return;
    var surprise_ = t.closest("#surprise");
    if (surprise_) { e.preventDefault(); e.stopPropagation(); openPanel(); if (typeof surprise === "function") surprise(); return; }
    if (t.closest('[data-go="quiz"], a[href="#quiz"], [data-act="quiz"]')) {
      e.preventDefault(); e.stopPropagation();
      var m = t.closest("#cxM"); if (m) m.remove();
      var cp = $("cxM"); if (!cp) document.body.style.overflow = "";
      var chat = document.querySelector(".cx-chat"); if (chat) chat.classList.add("hidden");
      openPanel();
    }
  }, true);

  /* ---------- Watchlist: "Details" closes the watchlist, then the movie details open ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t.closest) return;
    var d = t.closest("#cxM [data-open]");
    if (d) { var m = $("cxM"); if (m) m.remove(); } // the normal handler then opens the movie details
  }, true);
})();