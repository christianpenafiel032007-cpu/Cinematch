/* CineMatch design polish: one consistent spacing scale, cleaner sizes and better positioning
   for the header, hero, search, cards, quiz, results, popup, footer and floating buttons.
   Load LAST in index.html (after cinematch-boost.js):  <script src="cinematch-polish.js"></script> */
(function () {
  "use strict";
  var css = document.createElement("style");
  css.id = "cxPolish";
  css.textContent = [
    /* ===== foundations ===== */
    ":root{--sec:clamp(44px,6vw,80px);--r:18px;--bd:rgba(255,255,255,.09);--shadow:0 18px 40px -22px rgba(0,0,0,.8)}",
    "html{-webkit-text-size-adjust:100%;scroll-padding-top:84px}",
    "body{line-height:1.6;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}",
    "h1,h2,h3{text-wrap:balance}p{text-wrap:pretty}",
    "::selection{background:var(--amber);color:#2a1d00}",
    "section[id],form[id]{scroll-margin-top:84px}",
    ".scrollhint{display:none!important}",
    "main{padding-top:8px;padding-bottom:24px}",

    /* ===== buttons: one size scale ===== */
    ".btn{min-height:46px;padding:0 26px;font-size:.98rem;line-height:1;border-color:rgba(255,255,255,.28);box-shadow:0 8px 20px -10px rgba(255,182,39,.6),inset 0 1px 0 rgba(255,255,255,.4)}",
    ".btn:hover{transform:translateY(-2px);box-shadow:0 12px 26px -10px rgba(255,182,39,.7),inset 0 1px 0 rgba(255,255,255,.4)}",
    ".btn.lg{min-height:52px;padding:0 32px;font-size:1.02rem}",
    ".btn.sm{min-height:36px;padding:0 16px;font-size:.85rem}",
    ".btn.ghost{border-color:rgba(255,255,255,.16);box-shadow:none}",
    ".btn.coral{box-shadow:0 8px 20px -10px rgba(255,93,115,.7),inset 0 1px 0 rgba(255,255,255,.35)}",
    ".m-close.btn{min-height:0;width:38px;height:38px;padding:0;top:14px;right:14px;font-size:.95rem}",

    /* ===== header ===== */
    ".top{min-height:64px;padding-top:calc(10px + env(safe-area-inset-top,0px));padding-bottom:10px;gap:6px 18px}",
    ".logo{font-size:1.55rem;line-height:1}",
    ".cx-nav{gap:2px}",
    ".cx-nav a,.cx-nav button{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;font-size:.9rem}",
    ".cx-nav .cx-pill{margin-left:8px;padding:0 20px}",

    /* ===== hero ===== */
    ".hero{align-items:center}",
    ".cx-ht h1{line-height:1.04;margin:0 0 18px}",
    ".hero p{font-size:1.12rem;line-height:1.65;max-width:31em}",
    ".hero-cta{margin-top:28px;gap:12px}",
    ".cx-badges{margin-top:24px;gap:8px}.cx-badges span{font-size:.82rem;padding:6px 14px}",
    ".cx-fan{align-self:center}",
    "@media(min-width:1024px){.hero{min-height:min(600px,76vh);padding:40px 0 48px;gap:56px}.cx-ht h1{font-size:clamp(2.8rem,4.6vw,4.2rem)}}",
    "@media(max-width:1023px){.hero{padding:28px 0 20px;gap:10px}}",

    /* ===== section titles, search, top rated ===== */
    ".section-title{margin:0 0 20px;padding-bottom:14px;align-items:flex-end}",
    ".section-title h2,.search h2{font-size:clamp(1.5rem,2.6vw,2rem)}",
    ".section-title p{font-size:.88rem}",
    ".search{margin:0 0 var(--sec)}.search h2{margin:0 0 16px}",
    ".search-box input{height:54px;padding-top:0;padding-bottom:0;font-size:1rem}",
    ".sr-grid{gap:18px}",
    "#topSection{margin-bottom:var(--sec)}",
    ".toprated{gap:16px;padding-top:6px;padding-bottom:14px}",
    ".tcard{flex:0 0 164px;border-radius:var(--r);border-color:var(--bd)}",
    ".sr-grid .tcard{flex:none}",
    ".tcard .poster{height:auto;aspect-ratio:2/3}",
    ".tcard .tinfo{padding:12px 14px 14px}",
    ".tcard h3{font-size:.95rem;line-height:1.25;min-height:2.5em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
    ".tr-bar{margin:0 0 4px}",

    /* ===== quiz form ===== */
    ".panel{padding:clamp(20px,4vw,40px);border-radius:22px}",
    "fieldset{margin-bottom:0;padding-bottom:32px}",
    "legend{font-size:1.05rem;margin-bottom:16px}legend i{width:26px;height:26px;font-size:.9rem}",
    ".chips{gap:10px}",
    ".chip span{padding:10px 16px;font-size:.92rem;line-height:1.2}",
    ".tiles{gap:12px}.tiles .chip span{min-height:96px;justify-content:center;border-radius:16px}",
    "@media(min-width:1024px){.tiles{grid-template-columns:repeat(4,1fr)}}",
    "input[type=number],select{min-height:48px;border-radius:12px}",
    ".cx-seg button{min-height:46px}",
    "#rate{gap:12px}",
    ".rate{grid-template-columns:52px 1fr!important;padding:12px;border-radius:14px;border-color:var(--bd)}",
    ".rate strong{font-size:.95rem;line-height:1.25}",
    ".cx-th{width:52px;height:78px}",
    ".rate button{min-height:36px}",
    ".rate-count{margin-top:14px}",
    ".form-actions{gap:12px}",
    ".error{margin-bottom:12px}",

    /* ===== results ===== */
    ".res-head{margin:8px 0 24px}",
    ".list{gap:20px}",
    ".ticket{border-radius:var(--r);border-color:var(--bd);box-shadow:var(--shadow);min-height:176px}",
    ".ticket .info{padding:20px 22px}",
    ".ticket h3{font-size:1.3rem}",
    ".meta{margin-bottom:12px}",
    ".desc{line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}",
    ".card-actions{margin-top:14px}",
    "@media(min-width:1024px){.ticket{grid-template-columns:110px 1fr 92px}}",

    /* ===== movie popup ===== */
    ".modal{padding:20px}",
    ".m-card{width:min(820px,100%);padding:28px;border-radius:22px}",
    ".m-body{grid-template-columns:220px 1fr;gap:28px}",
    ".m-info h3{font-size:1.9rem}",
    ".m-actions{gap:10px;margin-top:20px}",

    /* ===== how it works, FAQ, footer ===== */
    ".cx-info{margin-top:var(--sec)}",
    ".cx-steps,.cx-stats{gap:16px;margin-bottom:32px}",
    ".cx-step{padding:24px}",
    ".cx-cta{padding:28px;margin-top:40px;border-radius:var(--r)}",
    "footer{padding:56px 20px 40px}",
    ".cx-foot{gap:32px;padding-bottom:28px}.cx-foot h4{margin-bottom:12px}.cx-foot button,.cx-foot a{padding:5px 0;font-size:.92rem}",
    ".cx-copy{font-size:.8rem;line-height:1.6;padding-top:20px}",

    /* ===== floating buttons ===== */
    ".totop{width:44px;height:44px;right:20px;bottom:20px;font-size:1.1rem}",
    ".cx-chat-btn{right:20px;bottom:78px;min-height:46px;padding:0 18px}",
    ".cx-wiz .cx-wbar{bottom:calc(12px + env(safe-area-inset-bottom,0px))}",

    /* ===== quiz panel fixes: full-width tiles, stacked About fields, even rating grid, tidy action row ===== */
    ".tiles .chip{display:flex}.tiles .chip span{flex:1;width:100%;min-height:88px}",
    "#quiz .row{grid-template-columns:1fr;gap:20px}",
    ".cx-age{max-width:280px}.cx-seg{max-width:440px}",
    "#quiz fieldset{padding-bottom:36px}#quiz fieldset::after{display:none!important}",
    ".cx-meter{margin-bottom:28px}",
    "#quiz #rate{grid-template-columns:repeat(2,1fr)!important;gap:14px}",
    "#quiz .rate{grid-template-columns:56px 1fr!important;gap:8px 14px;padding:14px}",
    "#quiz .cx-th{width:56px;height:84px}",
    "#quiz .rate button{min-height:38px;font-size:.85rem!important}",
    "@media(min-width:701px){#quiz:not(.cx-wiz)>.form-actions{display:grid;grid-template-columns:2fr 1fr auto;gap:12px;margin-top:8px}#quiz:not(.cx-wiz)>.form-actions .btn{width:100%}}",
    "@media(max-width:700px){#quiz #rate{grid-template-columns:1fr!important}.cx-age,.cx-seg{max-width:none}}",

    /* ===== phone ===== */
    "@media(max-width:700px){",
    ".hero{padding:20px 0 12px}.hero h1{font-size:clamp(2.1rem,9.5vw,2.7rem)}.hero p{font-size:1.02rem}.hero-cta{margin-top:22px}.hero-cta .btn{flex:1 1 100%}",
    ".btn.sm{min-height:40px}",
    ".section-title{flex-direction:column;align-items:flex-start;gap:2px}",
    ".tcard{flex-basis:140px}",
    ".tiles .chip span{min-height:84px}",
    ".ticket .info{padding:16px}.ticket h3{font-size:1.15rem}.desc{-webkit-line-clamp:2}",
    ".modal{place-items:end center;padding:0}",
    ".m-card{border-radius:22px 22px 0 0;max-height:92vh;padding:22px 18px calc(22px + env(safe-area-inset-bottom,0px))}",
    ".m-body{grid-template-columns:110px 1fr;gap:16px}.m-poster{width:110px}.m-info h3{font-size:1.4rem;padding-right:34px}",
    ".m-actions .btn{flex:1 1 140px}",
    "footer{padding:44px 16px 32px}",
    ".totop{right:auto;left:14px;bottom:86px}",
    ".cx-chat-btn{right:14px;bottom:92px!important;width:50px;height:50px;min-height:0;padding:0;justify-content:center}",
    "}"
  ].join("\n");
  document.head.appendChild(css);
})();