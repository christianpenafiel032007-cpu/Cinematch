/* CineMatch custom scrollbar for "Top rated by viewers".
   Add right before </body>, AFTER your main script:
   <script src="cinematch-scrollbar.js"></script> */
(function () {
  var list = document.getElementById("toprated");
  if (!list) return;

  var s = document.createElement("style");
  s.textContent =
    "#toprated{scrollbar-width:none!important;-ms-overflow-style:none}" +
    "#toprated::-webkit-scrollbar{display:none!important}" +
    ".tr-bar{display:flex;align-items:center;gap:12px;margin:-4px 0 22px}" +
    ".tr-btn{flex:0 0 34px;height:34px;border-radius:50%;border:1px solid transparent;color:#f4efe6;font:700 1.2rem/1 'DM Sans',sans-serif;cursor:pointer;background:linear-gradient(#1f1a3a,#1f1a3a) padding-box,linear-gradient(135deg,#ffb627,#ff5d73) border-box;transition:transform .2s,box-shadow .2s}" +
    ".tr-btn:hover{transform:translateY(-2px);box-shadow:0 8px 18px -6px rgba(255,93,115,.6)}" +
    ".tr-btn:active{transform:scale(.92)}" +
    ".tr-track{position:relative;flex:1;height:8px;border-radius:999px;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);cursor:pointer}" +
    ".tr-thumb{position:absolute;top:0;left:0;height:100%;border-radius:999px;background:linear-gradient(90deg,#ffb627,#ff5d73);box-shadow:0 0 12px rgba(255,182,39,.6);cursor:grab;touch-action:none}" +
    ".tr-thumb:active{cursor:grabbing}";
  document.head.appendChild(s);

  var bar = document.createElement("div");
  bar.className = "tr-bar";
  bar.innerHTML =
    '<button type="button" class="tr-btn" aria-label="Scroll left">\u2039</button>' +
    '<div class="tr-track"><div class="tr-thumb"></div></div>' +
    '<button type="button" class="tr-btn" aria-label="Scroll right">\u203A</button>';
  list.after(bar);

  var track = bar.querySelector(".tr-track"),
      thumb = bar.querySelector(".tr-thumb"),
      btns = bar.querySelectorAll(".tr-btn");

  function sync() {
    var max = list.scrollWidth - list.clientWidth, w = track.clientWidth;
    var tw = Math.max(40, w * list.clientWidth / list.scrollWidth);
    thumb.style.width = tw + "px";
    thumb.style.left = (max > 0 ? list.scrollLeft / max * (w - tw) : 0) + "px";
  }
  list.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);
  btns[0].onclick = function () { list.scrollBy({ left: -320, behavior: "smooth" }); };
  btns[1].onclick = function () { list.scrollBy({ left: 320, behavior: "smooth" }); };

  thumb.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    thumb.setPointerCapture(e.pointerId);
    var x0 = e.clientX, l0 = list.scrollLeft;
    function move(ev) {
      var max = list.scrollWidth - list.clientWidth, w = track.clientWidth - thumb.offsetWidth;
      list.scrollLeft = l0 + (ev.clientX - x0) / w * max;
    }
    function up() {
      thumb.removeEventListener("pointermove", move);
      thumb.removeEventListener("pointerup", up);
    }
    thumb.addEventListener("pointermove", move);
    thumb.addEventListener("pointerup", up);
  });
  track.addEventListener("pointerdown", function (e) {
    if (e.target === thumb) return;
    var r = track.getBoundingClientRect();
    list.scrollTo({ left: (e.clientX - r.left) / r.width * (list.scrollWidth - list.clientWidth), behavior: "smooth" });
  });

  sync();
  setTimeout(sync, 300);
})();
