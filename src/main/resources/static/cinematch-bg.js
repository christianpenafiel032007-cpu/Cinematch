/* CineMatch "Cinema Night" background.
   Projector beam + dust in the light, soft aurora glow, film grain, vignette and
   slow-moving film strips on wide screens. Replaces the old background.
   Load LAST in index.html:  <script src="cinematch-bg.js"></script> */
(function () {
  "use strict";

  /* ---------- remove the old background ---------- */
  document.querySelectorAll("body > canvas").forEach(function (c) { c.remove(); });

  var grain = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

  var css = document.createElement("style");
  css.textContent = [
    "body{background:#0e0a20!important}",
    ".bg,.fox{display:none!important}",
    "#cxBg{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:linear-gradient(180deg,#120d2b 0%,#0e0a20 55%,#0a0717 100%)}",

    /* soft colored glows */
    ".cxb-glow{position:absolute;border-radius:50%;will-change:transform}",
    ".cxb-g1{width:70vmax;height:70vmax;left:-25vmax;top:-20vmax;background:radial-gradient(circle,rgba(106,76,147,.55),transparent 65%);animation:cxbA 26s ease-in-out infinite alternate}",
    ".cxb-g2{width:60vmax;height:60vmax;right:-22vmax;top:8vh;background:radial-gradient(circle,rgba(255,93,115,.26),transparent 65%);animation:cxbB 32s ease-in-out infinite alternate}",
    ".cxb-g3{width:55vmax;height:55vmax;left:15vw;bottom:-30vmax;background:radial-gradient(circle,rgba(43,179,192,.2),transparent 65%);animation:cxbC 30s ease-in-out infinite alternate}",
    ".cxb-g4{width:45vmax;height:45vmax;left:35vw;top:-18vmax;background:radial-gradient(circle,rgba(255,182,39,.28),transparent 65%);animation:cxbB 22s ease-in-out infinite alternate-reverse}",
    "@keyframes cxbA{to{transform:translate(12vmax,10vmax) scale(1.15)}}",
    "@keyframes cxbB{to{transform:translate(-10vmax,8vmax) scale(1.2)}}",
    "@keyframes cxbC{to{transform:translate(-8vmax,-10vmax) scale(1.1)}}",

    /* projector beam */
    ".cxb-beam{position:absolute;left:0;right:0;top:-2vh;height:92vh;transform-origin:50% 0;clip-path:polygon(46% 0,54% 0,112% 100%,-12% 100%);background:linear-gradient(180deg,rgba(255,214,140,.26) 0%,rgba(255,182,39,.1) 40%,transparent 82%);animation:cxbSway 16s ease-in-out infinite alternate,cxbFlick 5s steps(1) infinite}",
    "@keyframes cxbSway{from{transform:rotate(-2.2deg)}to{transform:rotate(2.2deg)}}",
    "@keyframes cxbFlick{0%{opacity:.9}8%{opacity:.75}12%{opacity:.95}40%{opacity:.85}44%{opacity:1}70%{opacity:.8}74%{opacity:.95}100%{opacity:.9}}",
    ".cxb-lamp{position:absolute;left:50%;top:-60px;width:220px;height:120px;margin-left:-110px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,225,160,.55),transparent 70%)}",

    /* dust canvas */
    "#cxDust{position:absolute;inset:0;width:100%;height:100%}",

    /* film strips (wide screens only) */
    ".cxb-strip{display:none;position:absolute;top:0;bottom:0;width:38px;background-color:rgba(8,5,20,.55);background-image:repeating-linear-gradient(180deg,rgba(244,239,230,.2) 0 16px,transparent 16px 34px);background-size:12px 100%;background-repeat:no-repeat;background-position:13px 0;border-left:1px solid rgba(255,255,255,.07);border-right:1px solid rgba(255,255,255,.07);opacity:.7;animation:cxbStrip 16s linear infinite}",
    ".cxb-sl{left:16px}.cxb-sr{right:16px;animation-direction:reverse}",
    "@keyframes cxbStrip{to{background-position:13px 340px}}",
    "@media(min-width:1320px){.cxb-strip{display:block}}",

    /* grain + vignette */
    ".cxb-grain{position:absolute;inset:-10%;opacity:.07;background-image:" + grain + ";animation:cxbGrain .9s steps(1) infinite}",
    "@keyframes cxbGrain{0%{transform:translate(0,0)}20%{transform:translate(-3%,2%)}40%{transform:translate(2%,-3%)}60%{transform:translate(-2%,-1%)}80%{transform:translate(3%,3%)}100%{transform:translate(0,0)}}",
    ".cxb-vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,transparent 45%,rgba(4,2,12,.6) 100%)}",
    "@media(max-width:700px){.cxb-lamp{width:150px;margin-left:-75px}.cxb-g3{display:none}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- layers ---------- */
  var bg = document.createElement("div");
  bg.id = "cxBg"; bg.setAttribute("aria-hidden", "true");
  bg.innerHTML =
    '<div class="cxb-glow cxb-g1"></div><div class="cxb-glow cxb-g2"></div><div class="cxb-glow cxb-g3"></div><div class="cxb-glow cxb-g4"></div>' +
    '<div class="cxb-beam"></div><div class="cxb-lamp"></div>' +
    '<canvas id="cxDust"></canvas>' +
    '<div class="cxb-strip cxb-sl"></div><div class="cxb-strip cxb-sr"></div>' +
    '<div class="cxb-grain"></div><div class="cxb-vig"></div>';
  document.body.insertBefore(bg, document.body.firstChild);

  /* ---------- dust floating in the light ---------- */
  var c = document.getElementById("cxDust"), x = c.getContext("2d");
  var W, H, dpr = Math.min(window.devicePixelRatio || 1, 1.5), P = [], raf = 0;
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function size() {
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(70, W * H / 15000));
    P = [];
    for (var i = 0; i < n; i++) P.push({
      x: Math.random() * W, y: Math.random() * H, r: .5 + Math.random() * 1.7,
      vx: (Math.random() - .5) * .14, vy: .04 + Math.random() * .2,
      tw: Math.random() * 6.28, ts: .0008 + Math.random() * .0022
    });
  }

  function frame(t) {
    x.clearRect(0, 0, W, H);
    var cx = W / 2;
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      p.x += p.vx; p.y += p.vy;
      if (p.y > H + 5) { p.y = -5; p.x = Math.random() * W; }
      if (p.x < -5) p.x = W + 5; else if (p.x > W + 5) p.x = -5;
      var half = W * .05 + (p.y / (H * .92)) * W * .5;      // beam widens downward
      var lit = p.y < H * .92 && Math.abs(p.x - cx) < half;
      var a = (.22 + Math.sin(t * p.ts + p.tw) * .16) * (lit ? 2 : .55);
      x.fillStyle = lit ? "rgba(255,226,170," + a + ")" : "rgba(255,255,255," + a + ")";
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
    }
    if (!still) raf = requestAnimationFrame(frame);
  }

  size();
  addEventListener("resize", function () { size(); if (still) frame(0); });
  document.addEventListener("visibilitychange", function () {
    cancelAnimationFrame(raf);
    if (!document.hidden && !still) raf = requestAnimationFrame(frame);
  });
  if (still) frame(0); else raf = requestAnimationFrame(frame);
})();
