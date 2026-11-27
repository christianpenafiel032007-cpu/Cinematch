/* CineMatch "Watch movie": adds a button to a movie's details that plays the film in the page.
   Load LAST in index.html (after cinematch-cf.js).

   HOW TO MAKE ANOTHER MOVIE PLAYABLE
   Add its id (from MOVIES in index.html) below. Only use films you have the rights to
   (your own videos, public domain, Creative Commons).
     {mp4: ["videos/my-film.mp4"]}                your own file (a list: later items are backups) (mp4/webm), put it in the project folder
     {youtube: "VIDEO_ID"}                        YouTube video that allows embedding
     {embed: "https://archive.org/embed/ID"}      Internet Archive (public domain) or any other embeddable player
   Note: YouTube/embeds need the site opened through a web server (http://localhost), not file://. */
(function () {
  "use strict";
  var A = "https://archive.org/download/";
  var G = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/";
  var PLAYABLE = {
    104: {mp4: [G + "BigBuckBunny.mp4", "https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4"], youtube: "aqz-KE-bpKQ"},
    105: {mp4: [G + "Sintel.mp4"], youtube: "eRsGyueVLvQ"},
    106: {mp4: [G + "TearsOfSteel.mp4", "https://download.blender.org/demo/movies/ToS/tears_of_steel_720p.mov"], youtube: "R6MlUcmOul8"},
    107: {mp4: [A + "Night.Of.The.Living.Dead_1080p/NightOfTheLivingDead_720p.mp4", A + "Night.Of.The.Living.Dead_1080p/NightOfTheLivingDead.mp4"], embed: "https://archive.org/embed/Night.Of.The.Living.Dead_1080p"},
    108: {mp4: [A + "HisGirlFriday-1940/CaryGrant-1940-HisGirlFriday.mp4"], embed: "https://archive.org/embed/HisGirlFriday-1940"},
    109: {embed: "https://archive.org/embed/Charade19631280x696"},
    110: {mp4: [A + "plan-9-from-outer-space/plan-9-from-outer-space.mp4"], embed: "https://archive.org/embed/plan-9-from-outer-space"},
    111: {mp4: ["https://upload.wikimedia.org/wikipedia/commons/e/ea/The_Kid_(1921).webm"]},
    112: {mp4: [A + "The_General_Buster_Keaton/The_General_512kb.mp4", A + "The_General_Buster_Keaton/The_General.mp4"], embed: "https://archive.org/embed/The_General_Buster_Keaton"},
    113: {mp4: [A + "CarnivalofSouls/CarnivalOfSouls_512kb.mp4", A + "CarnivalofSouls/CarnivalOfSouls.mp4"], embed: "https://archive.org/embed/CarnivalofSouls"},
    114: {mp4: [A + "Detour_66/DetourPresentedByMoviePowder_512kb.mp4", A + "Detour_66/DetourPresentedByMoviePowder.mp4"], embed: "https://archive.org/embed/Detour_66"},
    115: {mp4: [A + "TheLittleShopOfHorrors1960/The-Little-Shop-of-Horrors_512kb.mp4", A + "TheLittleShopOfHorrors1960/The-Little-Shop-of-Horrors.mp4"], embed: "https://archive.org/embed/TheLittleShopOfHorrors1960"},
    116: {mp4: [A + "The_House_On_Haunted_Hill/The_House_On_Haunted_Hill_512kb.mp4", A + "The_House_On_Haunted_Hill/The_House_On_Haunted_Hill.mp4"], embed: "https://archive.org/embed/The_House_On_Haunted_Hill"},
    117: {mp4: [A + "lastmanonearth-1964/lastmanonearth-1964.mp4"], embed: "https://archive.org/embed/lastmanonearth-1964"},
    118: {mp4: [A + "ThePhantomOfTheOpera_364/ThePhantomOfTheOperaPresentedByMoviePowder_512kb.mp4"], embed: "https://archive.org/embed/ThePhantomOfTheOpera_364"},
    119: {mp4: [A + "TeenagersFromOuterSpace/TeenagersFromOuterSpace_512kb.mp4", A + "TeenagersFromOuterSpace/TeenagersFromOuterSpace.mp4"], embed: "https://archive.org/embed/TeenagersFromOuterSpace"}
  };
  window.CINEMATCH_PLAYABLE = PLAYABLE;
  var $ = function (i) { return document.getElementById(i); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; }); };

  var css = document.createElement("style");
  css.textContent = ".cw-box video,.cw-box iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:12px;background:#000;display:block}" +
    ".cw-note{color:var(--muted);font-size:.82rem;margin:6px 0 0}";
  document.head.appendChild(css);

  function fail(box, m, src) {
    var yt = src.youtube ? "https://www.youtube.com/watch?v=" + encodeURIComponent(src.youtube) : "https://www.youtube.com/results?search_query=" + encodeURIComponent(m.t + " " + m.y + " full movie");
    box.innerHTML = '<p class="vmsg">Could not play the video here (no internet, or the file is blocked). <a href="' + esc(yt) + '" target="_blank" rel="noopener">Watch it on YouTube</a></p>';
  }
  function embedPlayer(box, m, src) {
    var url = src.embed || "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(src.youtube) + "?autoplay=1&rel=0";
    box.innerHTML = '<div class="cw-box"><iframe src="' + esc(url) + '" title="' + esc(m.t) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
  }
  function play(id) {
    var m = byId(id), src = PLAYABLE[id], box = $("m-video"); if (!m || !src || !box) return;
    box.classList.remove("hidden");
    var files = [].concat(src.mp4 || []), i = 0;
    if (files.length) {
      box.innerHTML = '<div class="cw-box"><video controls autoplay playsinline preload="auto"></video></div>';
      var v = box.querySelector("video");
      v.addEventListener("error", function () { i++; if (i < files.length) { v.src = files[i]; v.play().catch(function () {}); } else if (src.embed || (src.youtube && location.protocol !== "file:")) embedPlayer(box, m, src); else fail(box, m, src); });
      v.src = files[0];
      v.play().catch(function () {});
    } else if (src.youtube && location.protocol === "file:") {
      window.open("https://www.youtube.com/watch?v=" + encodeURIComponent(src.youtube), "_blank", "noopener"); fail(box, m, src);
    } else {
      var url = src.youtube ? "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(src.youtube) + "?autoplay=1&rel=0" : src.embed;
      box.innerHTML = '<div class="cw-box"><iframe src="' + esc(url) + '" title="' + esc(m.t) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
    }
    box.scrollIntoView({behavior: "smooth", block: "center"});
  }

  var prev = window.openModal;
  window.openModal = function (id) {
    prev.apply(this, arguments);
    var acts = document.querySelector("#modal .m-actions"); if (!acts) return;
    var old = acts.querySelector(".cw-watch"); if (old) old.remove();
    if (!PLAYABLE[id]) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "btn cw-watch"; b.textContent = "🎬 Watch full movie";
    b.addEventListener("click", function () { play(id); });
    acts.insertBefore(b, acts.firstChild);
  };
})();
