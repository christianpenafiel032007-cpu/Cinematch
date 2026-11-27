/* CineMatch icons: replaces emojis anywhere on the page with clean line icons (inline SVG).
   Icons: Lucide v0.460.0 (https://lucide.dev), ISC License, Copyright (c) Lucide Contributors.
   To add or change an icon: add an entry to MAP below (emoji: [icon name, colour tone, "fill"?])
   and its SVG body to ICONS (copy from https://lucide.dev). Colour tones are defined in TONES.
   Load in <head>, before other scripts:  <script src="cinematch-icons.js"></script>

   How it works: a MutationObserver watches the document, so emojis in the HTML and in text added
   later by any script (innerHTML, textContent, chat replies, toasts...) become icons automatically.
   Inside <option>, <title> and similar text-only places the emoji is simply removed.
   Use CMIcon("film") to get an icon's SVG markup directly. */
(function () {
  "use strict";
  if (window.CMIcon) return;
  var ICONS = {
   "clapperboard": "<path d=\"M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z\" /><path d=\"m6.2 5.3 3.1 3.9\" /><path d=\"m12.4 3.4 3.1 4\" /><path d=\"M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z\" />",
   "film": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 3v18\" /><path d=\"M3 7.5h4\" /><path d=\"M3 12h18\" /><path d=\"M3 16.5h4\" /><path d=\"M17 3v18\" /><path d=\"M17 7.5h4\" /><path d=\"M17 16.5h4\" />",
   "dices": "<rect width=\"12\" height=\"12\" x=\"2\" y=\"10\" rx=\"2\" ry=\"2\" /><path d=\"m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6\" /><path d=\"M6 18h.01\" /><path d=\"M10 14h.01\" /><path d=\"M15 6h.01\" /><path d=\"M18 9h.01\" />",
   "search": "<circle cx=\"11\" cy=\"11\" r=\"8\" /><path d=\"m21 21-4.3-4.3\" />",
   "star": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\" />",
   "popcorn": "<path d=\"M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4\" /><path d=\"M10 22 9 8\" /><path d=\"m14 22 1-14\" /><path d=\"M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z\" />",
   "shuffle": "<path d=\"M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22\" /><path d=\"m18 2 4 4-4 4\" /><path d=\"M2 6h1.9c1.5 0 2.9.9 3.6 2.2\" /><path d=\"M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8\" /><path d=\"m18 14 4 4-4 4\" />",
   "clipboard-copy": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v4\" /><path d=\"M21 14H11\" /><path d=\"m15 10-4 4 4 4\" />",
   "play": "<polygon points=\"6 3 20 12 6 21 6 3\" />",
   "tv": "<rect width=\"20\" height=\"15\" x=\"2\" y=\"7\" rx=\"2\" ry=\"2\" /><polyline points=\"17 2 12 7 7 2\" />",
   "heart": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\" />",
   "smile": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M8 14s1.5 2 4 2 4-2 4-2\" /><line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\" /><line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\" />",
   "frown": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M16 16s-1.5-2-4-2-4 2-4 2\" /><line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\" /><line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\" />",
   "flame": "<path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\" />",
   "coffee": "<path d=\"M10 2v2\" /><path d=\"M14 2v2\" /><path d=\"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1\" /><path d=\"M6 2v2\" />",
   "brain": "<path d=\"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z\" /><path d=\"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z\" /><path d=\"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4\" /><path d=\"M17.599 6.5a3 3 0 0 0 .399-1.375\" /><path d=\"M6.003 5.125A3 3 0 0 0 6.401 6.5\" /><path d=\"M3.477 10.896a4 4 0 0 1 .585-.396\" /><path d=\"M19.938 10.5a4 4 0 0 1 .585.396\" /><path d=\"M6 18a4 4 0 0 1-1.967-.516\" /><path d=\"M19.967 17.484A4 4 0 0 1 18 18\" />",
   "skull": "<path d=\"m12.5 17-.5-1-.5 1h1z\" /><path d=\"M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z\" /><circle cx=\"15\" cy=\"12\" r=\"1\" /><circle cx=\"9\" cy=\"12\" r=\"1\" />",
   "trophy": "<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\" /><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\" /><path d=\"M4 22h16\" /><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\" /><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\" /><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\" />",
   "drama": "<path d=\"M10 11h.01\" /><path d=\"M14 6h.01\" /><path d=\"M18 6h.01\" /><path d=\"M6.5 13.1h.01\" /><path d=\"M22 5c0 9-4 12-6 12s-6-3-6-12c0-2 2-3 6-3s6 1 6 3\" /><path d=\"M17.4 9.9c-.8.8-2 .8-2.8 0\" /><path d=\"M10.1 7.1C9 7.2 7.7 7.7 6 8.6c-3.5 2-4.7 3.9-3.7 5.6 4.5 7.8 9.5 8.4 11.2 7.4.9-.5 1.9-2.1 1.9-4.7\" /><path d=\"M9.1 16.5c.3-1.1 1.4-1.7 2.4-1.4\" />",
   "bomb": "<circle cx=\"11\" cy=\"13\" r=\"9\" /><path d=\"M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95\" /><path d=\"m22 2-1.5 1.5\" />",
   "rocket": "<path d=\"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z\" /><path d=\"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z\" /><path d=\"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0\" /><path d=\"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5\" />",
   "laugh": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z\" /><line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\" /><line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\" />",
   "ghost": "<path d=\"M9 10h.01\" /><path d=\"M15 10h.01\" /><path d=\"M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z\" />",
   "sparkles": "<path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\" /><path d=\"M20 3v4\" /><path d=\"M22 5h-4\" /><path d=\"M4 17v2\" /><path d=\"M5 18H3\" />",
   "eye": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />",
   "fingerprint": "<path d=\"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4\" /><path d=\"M14 13.12c0 2.38 0 6.38-1 8.88\" /><path d=\"M17.29 21.02c.12-.6.43-2.3.5-3.02\" /><path d=\"M2 12a10 10 0 0 1 18-6\" /><path d=\"M2 16h.01\" /><path d=\"M21.8 16c.2-2 .131-5.354 0-6\" /><path d=\"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2\" /><path d=\"M8.65 22c.21-.66.45-1.32.57-2\" /><path d=\"M9 6.8a6 6 0 0 1 9 5.2v2\" />",
   "wand-sparkles": "<path d=\"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72\" /><path d=\"m14 7 3 3\" /><path d=\"M5 6v4\" /><path d=\"M19 14v4\" /><path d=\"M10 2v2\" /><path d=\"M7 8H3\" /><path d=\"M21 16h-4\" /><path d=\"M11 3H9\" />",
   "users-round": "<path d=\"M18 21a8 8 0 0 0-16 0\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3\" />",
   "music-4": "<path d=\"M9 18V5l12-2v13\" /><path d=\"m9 9 12-2\" /><circle cx=\"6\" cy=\"18\" r=\"3\" /><circle cx=\"18\" cy=\"16\" r=\"3\" />",
   "music": "<path d=\"M9 18V5l12-2v13\" /><circle cx=\"6\" cy=\"18\" r=\"3\" /><circle cx=\"18\" cy=\"16\" r=\"3\" />",
   "compass": "<path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />",
   "mic-vocal": "<path d=\"m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12\" /><path d=\"M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5\" /><circle cx=\"16\" cy=\"7\" r=\"5\" />",
   "ticket": "<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" /><path d=\"M13 5v2\" /><path d=\"M13 17v2\" /><path d=\"M13 11v2\" />",
   "video": "<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\" /><rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\" />",
   "thumbs-up": "<path d=\"M7 10v12\" /><path d=\"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z\" />",
   "meh": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"8\" x2=\"16\" y1=\"15\" y2=\"15\" /><line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\" /><line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\" />",
   "thumbs-down": "<path d=\"M17 14V2\" /><path d=\"M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z\" />",
   "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /><path d=\"M7 11V7a5 5 0 0 1 10 0v4\" />",
   "chart-column": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M18 17V9\" /><path d=\"M13 17V5\" /><path d=\"M8 17v-3\" />",
   "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /><circle cx=\"9\" cy=\"7\" r=\"4\" /><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /><path d=\"M16 3.13a4 4 0 0 1 0 7.75\" />",
   "mail": "<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" />",
   "message-circle": "<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\" />",
   "settings": "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />",
   "database": "<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" /><path d=\"M3 5V19A9 3 0 0 0 21 19V5\" /><path d=\"M3 12A9 3 0 0 0 21 12\" />",
   "download": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /><polyline points=\"7 10 12 15 17 10\" /><line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\" />",
   "upload": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /><polyline points=\"17 8 12 3 7 8\" /><line x1=\"12\" x2=\"12\" y1=\"3\" y2=\"15\" />",
   "share-2": "<circle cx=\"18\" cy=\"5\" r=\"3\" /><circle cx=\"6\" cy=\"12\" r=\"3\" /><circle cx=\"18\" cy=\"19\" r=\"3\" /><line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\" /><line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\" />",
   "party-popper": "<path d=\"M5.8 11.3 2 22l10.7-3.79\" /><path d=\"M4 3h.01\" /><path d=\"M22 8h.01\" /><path d=\"M15 2h.01\" /><path d=\"M22 20h.01\" /><path d=\"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10\" /><path d=\"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17\" /><path d=\"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7\" /><path d=\"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z\" />",
   "trash-2": "<path d=\"M3 6h18\" /><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\" /><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\" /><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\" /><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\" />",
   "circle-help": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /><path d=\"M12 17h.01\" />",
   "hand": "<path d=\"M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2\" /><path d=\"M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2\" /><path d=\"M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8\" /><path d=\"M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15\" />",
   "zap": "<path d=\"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z\" />"
  };
  var MAP = {"🎬":["clapperboard","brand"],"🎞":["film","brand"],"🎲":["dices","brand"],"🔍":["search","brand"],"⭐":["star","sun","fill"],"🍿":["popcorn","brand"],"🔀":["shuffle","brand"],"📋":["clipboard-copy","brand"],"▶":["play","brand","fill"],"📺":["tv","sky"],"♡":["heart","rose"],"♥":["heart","rose","fill"],"💕":["heart","rose","fill"],"😄":["smile","sun"],"😢":["frown","sky"],"🔥":["flame","flame"],"😌":["coffee","teal"],"🧠":["brain","violet"],"😱":["skull","lime"],"💪":["trophy","sun"],"🎭":["drama","violet"],"💥":["bomb","flame"],"🚀":["rocket","teal"],"😂":["laugh","sun"],"👻":["ghost","lime"],"✨":["sparkles","sun"],"🔪":["eye","violet"],"🕵":["fingerprint","sky"],"🧙":["wand-sparkles","violet"],"👨‍👩‍👧":["users-round","sun"],"🎶":["music-4","rose"],"🎵":["music","sky"],"🧭":["compass","mint"],"🎤":["mic-vocal","rose"],"🎟":["ticket","brand"],"🎥":["video","brand"],"👍":["thumbs-up","mint"],"😐":["meh","sun"],"👎":["thumbs-down","rose"],"🔒":["lock","brand"],"📊":["chart-column","brand"],"👥":["users","brand"],"✉":["mail","brand"],"📧":["mail","brand"],"💬":["message-circle","brand"],"⚙":["settings","brand"],"🗄":["database","brand"],"⬇":["download","mint"],"⬆":["upload","sky"],"🔗":["share-2","brand"],"🎉":["party-popper","sun"],"🗑":["trash-2","flame"],"❓":["circle-help","brand"],"👋":["hand","sun"],"⚡":["zap","sun"]};
  var TONES = {"brand":["#ffe08a","#ffb627","#ff5d73"],"sun":["#fff3b0","#fcd34d","#f59e0b"],"sky":["#c7e3ff","#7cb8ff","#5b7cfa"],"flame":["#ffd6a5","#ff8a4c","#ff4d5e"],"rose":["#ffd1dc","#ff7a9c","#f0437a"],"violet":["#e4d9ff","#b49cff","#8b6cf6"],"lime":["#e3fba8","#a3e635","#34c76f"],"teal":["#b5f5ff","#4fd8eb","#14b8a6"],"mint":["#c6f7dc","#4ade9a","#10b981"]};
  var SOLID = ".btn:not(.ghost),.ad-btn:not(.ghost),.cx-btn:not(.ghost),.ad-nav button.on,.bw-mood.on,.bw-i.on,.chip input:checked+span,.cx-av,.cx-chat-btn,.cx-me,.cx-nav .cx-pill,[aria-pressed=true],.cx-send button,.cx-skip,.pg-btn[aria-current],.totop";

  window.CMIcon = function (name, cls) {
    return '<svg class="cm-i' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>";
  };

  var RE = new RegExp("(👨‍👩‍👧|🎬|🎞|🎲|🔍|🍿|🔀|📋|📺|💕|😄|😢|🔥|😌|🧠|😱|💪|🎭|💥|🚀|😂|👻|🔪|🕵|🧙|🎶|🎵|🧭|🎤|🎟|🎥|👍|😐|👎|🔒|📊|👥|📧|💬|🗄|🔗|🎉|🗑|👋|⭐|▶|♡|♥|✨|✉|⚙|⬇|⬆|❓|⚡)️?( ?)", "g");
  var TEST = new RegExp(RE.source);
  var TEXT_ONLY = {OPTION: 1, TITLE: 1};
  var SKIP = {SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, CODE: 1, PRE: 1};

  /* Look: each icon is painted with a theme gradient (see TONES). On solid buttons/chips it switches
     to the element's text colour so it stays readable. Large icons get a soft tinted tile and glow. */
  var rgb = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }).join(","); };
  var css = ".cm-i{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.2em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none;overflow:visible;transition:transform .18s ease,filter .18s ease}" +
    ".cm-i.fill{fill:currentColor}.cm-i.sp{margin-inline-end:.4em}";
  Object.keys(TONES).forEach(function (k) {
    var c = TONES[k][1];
    css += ".cm-i.t-" + k + "{stroke:url(#cmg-" + k + ") " + c + "}.cm-i.fill.t-" + k + "{fill:url(#cmg-" + k + ") " + c + "}" +
      ".cm-tile:has(.t-" + k + "){--tint:rgba(" + rgb(c) + ",.15);--ring:rgba(" + rgb(c) + ",.32);--glow:rgba(" + rgb(c) + ",.55)}";
  });
  var solid = SOLID.split(",");
  css += solid.map(function (x) { return x + " .cm-i"; }).join(",") + "{stroke:currentColor!important;filter:none!important}" +
    solid.map(function (x) { return x + " .cm-i.fill"; }).join(",") + "{fill:currentColor!important}" +
    /* headings: a little glow */
    "h1 .cm-i,h2 .cm-i{filter:drop-shadow(0 2px 10px rgba(255,140,70,.45))}" +
    /* large icon tiles: mood tiles and How-it-works steps */
    ".cm-tile{display:inline-grid!important;place-items:center;width:3.25rem;height:3.25rem;margin:0 auto 4px;border-radius:16px;font-size:1rem!important;line-height:1!important;" +
      "background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.10),transparent 60%),var(--tint,rgba(255,182,39,.15));" +
      "box-shadow:inset 0 0 0 1px var(--ring,rgba(255,182,39,.3)),0 8px 22px -12px var(--glow,rgba(255,140,70,.6));transition:transform .2s ease,box-shadow .2s ease}" +
    ".cm-tile .cm-i{width:1.7rem;height:1.7rem;vertical-align:0;margin:0!important;filter:drop-shadow(0 2px 6px var(--glow,rgba(255,140,70,.5)))}" +
    ".chip:hover .cm-tile,.cx-step:hover .cm-tile{transform:translateY(-3px) scale(1.06);box-shadow:inset 0 0 0 1px var(--ring,rgba(255,182,39,.3)),0 14px 26px -10px var(--glow,rgba(255,140,70,.6))}" +
    ".chip input:checked+span .cm-tile{background:rgba(27,20,48,.16);box-shadow:inset 0 0 0 1px rgba(27,20,48,.18)}" +
    /* hover lift on interactive icons */
    "a:hover>.cm-i,button:hover>.cm-i,label:hover>span>.cm-i{transform:translateY(-1px) scale(1.12)}" +
    "@media(prefers-reduced-motion:reduce){.cm-i,.cm-tile{transition:none}a:hover>.cm-i,button:hover>.cm-i,label:hover>span>.cm-i,.chip:hover .cm-tile,.cx-step:hover .cm-tile{transform:none}}";

  /* gradient definitions shared by every icon (user-space coordinates so straight lines render too) */
  function addDefs() {
    if (document.getElementById("cmIconDefs") || !document.body) return;
    var h = '<svg id="cmIconDefs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>';
    Object.keys(TONES).forEach(function (k) {
      var t = TONES[k];
      h += '<linearGradient id="cmg-' + k + '" gradientUnits="userSpaceOnUse" x1="3" y1="2" x2="21" y2="22">' +
        '<stop offset="0" stop-color="' + t[0] + '"/><stop offset=".45" stop-color="' + t[1] + '"/><stop offset="1" stop-color="' + t[2] + '"/></linearGradient>';
    });
    document.body.insertAdjacentHTML("afterbegin", h + "</defs></svg>");
  }
  /* put the big icon of mood tiles and How-it-works steps on a tinted tile */
  function tiles(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll(".tiles .chip em, .cx-step > b").forEach(function (el) {
      if (!el.classList.contains("cm-tile") && el.querySelector(".cm-i")) el.classList.add("cm-tile");
    });
  }
  var st = document.createElement("style"); st.id = "cmIconCss"; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  function fix(node) {
    var t = node.nodeValue; if (!t || !TEST.test(t)) return;
    var p = node.parentNode; if (!p || p.nodeType !== 1) return;
    if (SKIP[p.nodeName] || (p.closest && p.closest("svg,[contenteditable=true]"))) return;
    if (TEXT_ONLY[p.nodeName]) { node.nodeValue = t.replace(new RegExp(RE.source + " ?", "g"), ""); return; }
    var frag = document.createDocumentFragment(), last = 0, m;
    RE.lastIndex = 0;
    while ((m = RE.exec(t))) {
      if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
      var d = MAP[m[1]], tpl = document.createElement("template");
      tpl.innerHTML = window.CMIcon(d[0], "t-" + d[1] + (d[2] ? " " + d[2] : "") + " i-" + d[0] + (m[2] && m.index + m[0].length < t.length ? " sp" : ""));
      frag.appendChild(tpl.content.firstChild);
      if (m[2] && m.index + m[0].length >= t.length) frag.appendChild(document.createTextNode(" "));
      last = RE.lastIndex;
    }
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    p.replaceChild(frag, node);
  }
  function scan(root) {
    if (root.nodeType === 3) { fix(root); return; }
    if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, list = [];
    while ((n = w.nextNode())) if (TEST.test(n.nodeValue)) list.push(n);
    list.forEach(fix);
  }

  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var m = muts[i];
      if (m.type === "characterData") fix(m.target);
      else for (var j = 0; j < m.addedNodes.length; j++) { scan(m.addedNodes[j]); tiles(m.addedNodes[j]); }
      if (m.type === "childList" && m.target.closest) { var c = m.target.closest(".tiles, .cx-step"); if (c) tiles(c.parentNode || c); }
    }
  }).observe(document.documentElement, {childList: true, subtree: true, characterData: true});
  scan(document.documentElement); addDefs();
  document.addEventListener("DOMContentLoaded", function () { addDefs(); scan(document.documentElement); tiles(document); });
})();
