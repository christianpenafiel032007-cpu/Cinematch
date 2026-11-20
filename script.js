/* ---------- DATA ---------- */
// min = suggested minimum age, m = moods the movie fits
const MOVIES = [
  {id:1, t:"The Shawshank Redemption", y:1994, g:["Drama"], m:["sad","inspired","calm"], min:13},
  {id:2, t:"The Dark Knight", y:2008, g:["Action","Crime"], m:["excited"], min:13},
  {id:3, t:"Inception", y:2010, g:["Sci-Fi","Thriller"], m:["excited","curious"], min:13},
  {id:4, t:"Forrest Gump", y:1994, g:["Drama","Romance"], m:["happy","sad","inspired"], min:10},
  {id:5, t:"The Notebook", y:2004, g:["Romance","Drama"], m:["romantic","sad"], min:13},
  {id:6, t:"Superbad", y:2007, g:["Comedy"], m:["happy"], min:16},
  {id:7, t:"Get Out", y:2017, g:["Horror","Thriller"], m:["scared","excited"], min:16},
  {id:8, t:"Spirited Away", y:2001, g:["Animation","Fantasy"], m:["calm","curious"], min:5},
  {id:9, t:"Mad Max: Fury Road", y:2015, g:["Action"], m:["excited"], min:15},
  {id:10, t:"La La Land", y:2016, g:["Romance","Musical"], m:["romantic","happy","sad"], min:10},
  {id:11, t:"Interstellar", y:2014, g:["Sci-Fi","Drama"], m:["curious","inspired"], min:10},
  {id:12, t:"The Grand Budapest Hotel", y:2014, g:["Comedy"], m:["happy","calm"], min:13},
  {id:13, t:"Parasite", y:2019, g:["Thriller","Drama"], m:["curious","excited"], min:16},
  {id:14, t:"Coco", y:2017, g:["Animation","Family"], m:["happy","sad"], min:5},
  {id:15, t:"Whiplash", y:2014, g:["Drama","Music"], m:["inspired","excited"], min:15},
  {id:16, t:"Crazy Rich Asians", y:2018, g:["Romance","Comedy"], m:["happy","romantic"], min:12},
  {id:17, t:"Train to Busan", y:2016, g:["Horror","Action"], m:["scared","excited"], min:15},
  {id:18, t:"Your Name", y:2016, g:["Animation","Romance"], m:["romantic","sad"], min:10},
  {id:19, t:"The Conjuring", y:2013, g:["Horror"], m:["scared"], min:16},
  {id:20, t:"Knives Out", y:2019, g:["Mystery","Comedy"], m:["curious","happy"], min:13},
  {id:21, t:"Spider-Man: Into the Spider-Verse", y:2018, g:["Animation","Action"], m:["excited","happy"], min:5},
  {id:22, t:"Little Women", y:2019, g:["Drama","Romance"], m:["calm","sad"], min:10},
  {id:23, t:"Toy Story", y:1995, g:["Animation","Family","Comedy"], m:["happy"], min:3},
  {id:24, t:"Joker", y:2019, g:["Crime","Drama"], m:["sad"], min:18},
  {id:25, t:"Hello, Love, Goodbye", y:2019, g:["Romance","Drama"], m:["romantic","sad"], min:13}
];

// Existing "viewers" with their ratings (1–5). This is the community CineMatch learns from.
// Add more of these (or load from a file/database later) to make it smarter.
const VIEWERS = [
  {a:16,g:"male",r:{2:5,3:4,9:5,21:5,6:5,23:4,17:4}},
  {a:19,g:"female",r:{5:5,10:5,16:5,18:5,25:5,4:4,22:4,14:4}},
  {a:24,g:"male",r:{3:5,11:5,13:5,1:5,15:5,2:4,20:4}},
  {a:21,g:"female",r:{8:5,14:5,18:5,21:4,12:5,23:4,10:4}},
  {a:28,g:"female",r:{20:5,13:5,12:4,1:4,22:5,4:4,7:4}},
  {a:35,g:"male",r:{1:5,2:5,24:4,4:4,11:5,13:4,9:3}},
  {a:15,g:"female",r:{14:5,23:5,21:5,8:4,16:4,6:3,10:4}},
  {a:22,g:"male",r:{7:5,19:5,17:5,13:4,24:4,3:4,9:4}},
  {a:40,g:"female",r:{4:5,22:5,5:4,1:4,25:4,14:4,12:3}},
  {a:26,g:"male",r:{15:5,11:5,3:5,1:4,2:5,10:4,20:3}},
  {a:18,g:"female",r:{25:5,16:5,5:4,18:5,10:5,6:4,12:4}},
  {a:31,g:"other",r:{8:5,12:5,13:5,20:4,3:4,18:4,22:4}},
  {a:45,g:"male",r:{1:5,4:5,2:4,24:3,11:4,15:4,20:4}},
  {a:20,g:"female",r:{19:5,7:5,17:4,13:4,20:4,21:3,6:4}}
];

const MOODS = {happy:"😄 Happy", sad:"😢 Sad", excited:"🔥 Excited", calm:"😌 Relaxed",
  romantic:"💕 Romantic", curious:"🧠 Curious", scared:"😱 Want a scare", inspired:"💪 Need motivation"};
const MOOD_TEXT = {happy:"happy",sad:"sad",excited:"excited",calm:"relaxed",romantic:"romantic",curious:"curious",scared:"in the mood for a scare",inspired:"in need of motivation"};
const RATE_IDS = [2,3,4,6,8,10,13,14,20,23]; // movies shown for rating

// Poster colors and emoji by main genre
const ART = {
  Drama:["🎭","#6a4c93","#1d1a3a"], Action:["💥","#ff5d73","#5a1a6e"],
  "Sci-Fi":["🚀","#2bb3c0","#1b1f5e"], Romance:["💕","#ff8fa3","#6b2b5e"],
  Comedy:["😂","#ffb627","#c2410c"], Horror:["👻","#7a1f2b","#0d0b14"],
  Animation:["✨","#6ee7b7","#2563eb"], Thriller:["🔪","#8b8fa8","#1a1a2e"],
  Crime:["🕵️","#9a7b4f","#1c1917"], Mystery:["🔍","#6c5ce7","#1a1a2e"],
  // added so any genre can be a movie's first genre without crashing
  Fantasy:["🧙","#a78bfa","#1e1b4b"], Family:["👨‍👩‍👧","#fbbf24","#b45309"],
  Musical:["🎶","#f472b6","#4c1d95"], Music:["🎵","#60a5fa","#1e3a8a"]
};
const DEFAULT_ART = ["🎬","#555","#222"];
const artFor = genre => ART[genre] || DEFAULT_ART;

/* ---------- BUILD FORM ---------- */
const $ = id => document.getElementById(id);
const myRatings = {};

// "required" on one radio makes the whole group required; kept on all for clarity
$("moods").innerHTML = Object.entries(MOODS).map(([k,v]) =>
  `<label class="chip"><input type="radio" name="mood" value="${k}" required><span>${v}</span></label>`).join("");

const ALL_GENRES = [...new Set(MOVIES.flatMap(m => m.g))].sort();
$("genres").innerHTML = ALL_GENRES.map(g =>
  `<label class="chip"><input type="checkbox" name="genre" value="${g}"><span>${g}</span></label>`).join("");

$("rate").innerHTML = RATE_IDS.map(id => {
  const m = MOVIES.find(x => x.id === id);
  const [emoji] = artFor(m.g[0]);
  return `<div class="rate-row" data-id="${id}">
    <span class="rate-title">${emoji} ${m.t} (${m.y})</span>
    <span class="stars">${[1,2,3,4,5].map(n =>
      `<button type="button" class="star" data-id="${id}" data-r="${n}" aria-label="Rate ${m.t} ${n} out of 5">★</button>`
    ).join("")}</span>
  </div>`;
}).join("");

// One delegated click handler: save rating, highlight stars up to the chosen one.
// Clicking the same rating again clears it.
$("rate").addEventListener("click", e => {
  const btn = e.target.closest(".star");
  if (!btn) return;
  const id = +btn.dataset.id, r = +btn.dataset.r;
  if (myRatings[id] === r) delete myRatings[id]; else myRatings[id] = r;
  const current = myRatings[id] || 0;
  btn.parentElement.querySelectorAll(".star").forEach(s =>
    s.classList.toggle("on", +s.dataset.r <= current));
});