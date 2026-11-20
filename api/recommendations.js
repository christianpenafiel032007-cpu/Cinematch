// Vercel serverless version of the CineMatch recommendation API (POST /api/recommendations).
// Port of src/main/java/com/cinematch/api/RecommendationService.java + RecommendationController.java,
// so the same frontend works on Vercel (Node.js) and locally with Spring Boot (Java).
// Keep both in sync if the algorithm changes.
const data = require("../src/main/resources/data.json");

const movies = data.movies;
const viewers = data.viewers;

// Significance weighting: taste similarity reaches its full 65% weight only after this many shared ratings.
const FULL_TRUST_SHARED_RATINGS = 5;
// Shrinkage: predictions start from a neutral 3.0 worth this much "similarity weight".
const PRIOR_WEIGHT = 1.0;
const NEUTRAL_RATING = 3.0;

// Community rating count and average per movie id (used only to break ties).
const communityCount = {}, communityAverage = {};
(() => {
  const sums = {};
  for (const v of viewers) for (const [id, rating] of Object.entries(v.r)) {
    if (rating == null) continue;
    communityCount[id] = (communityCount[id] || 0) + 1;
    sums[id] = (sums[id] || 0) + rating;
  }
  for (const id of Object.keys(sums)) communityAverage[id] = sums[id] / communityCount[id];
})();

// 1 - (average rating difference on shared movies) / 4; null when no movies are shared.
function tasteSimilarity(mine, theirs) {
  const shared = Object.keys(mine).filter((id) => theirs[id] != null);
  if (!shared.length) return null;
  const avgDiff = shared.reduce((sum, id) => sum + Math.abs(mine[id] - theirs[id]), 0) / shared.length;
  return { similarity: 1 - avgDiff / 4, shared: shared.length };
}

function profileSimilarity(user, viewer) {
  const ageSimilarity = Math.max(0, 1 - Math.abs(user.age - viewer.a) / 30);
  const genderSimilarity = user.gender === "none" ? 0.6 : user.gender === viewer.g ? 1 : 0.4;
  return 0.65 * ageSimilarity + 0.35 * genderSimilarity;
}

function recommend(user) {
  const ratings = user.ratings || {};
  const genres = user.genres || [];

  const neighbors = viewers
    .map((viewer) => {
      const profile = profileSimilarity(user, viewer);
      const taste = tasteSimilarity(ratings, viewer.r);
      if (taste == null) return { viewer, similarity: profile };
      const tasteWeight = 0.65 * Math.min(taste.shared, FULL_TRUST_SHARED_RATINGS) / FULL_TRUST_SHARED_RATINGS;
      return { viewer, similarity: tasteWeight * taste.similarity + (1 - tasteWeight) * profile };
    })
    .sort((a, b) => b.similarity - a.similarity) // stable, like Java's sorted()
    .slice(0, 8);

  const results = [];
  for (const movie of movies) {
    const movieId = String(movie.id);
    if (Object.prototype.hasOwnProperty.call(ratings, movieId) || user.age < (movie.min || 0)) continue;

    let numerator = 0, denominator = 0, fans = 0;
    for (const n of neighbors) {
      const rating = n.viewer.r[movieId];
      if (rating != null) {
        numerator += n.similarity * rating;
        denominator += n.similarity;
        if (rating >= 4) fans++;
      }
    }
    const predicted = (numerator + PRIOR_WEIGHT * NEUTRAL_RATING) / (denominator + PRIOR_WEIGHT);
    const moodHit = movie.m.includes(user.mood) ? 1 : 0;
    const genreHit = movie.g.some((g) => genres.includes(g)) ? 1 : 0;
    let score = (predicted / 5) * 0.6 + moodHit * 0.25 + genreHit * 0.15;
    if (user.shuffle) score += Math.random() * 0.12;
    results.push({ rec: { m: movie, score, fans, moodHit, genreHit, predicted },
      support: denominator, ratingCount: communityCount[movieId] || 0, ratingAverage: communityAverage[movieId] || 0 });
  }

  // Highest score first; ties: more neighbor evidence, more community ratings, higher community average.
  const cmp = (x, y) => (x > y ? -1 : x < y ? 1 : 0);
  return results
    .sort((a, b) => cmp(a.rec.score, b.rec.score) || cmp(a.support, b.support) ||
      cmp(a.ratingCount, b.ratingCount) || cmp(a.ratingAverage, b.ratingAverage))
    .slice(0, 6)
    .map((x) => x.rec);
}

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON body." }); }
  }
  body = body || {};

  const user = {
    mood: typeof body.mood === "string" ? body.mood : "",
    age: Number.parseInt(body.age, 10) || 0,
    gender: typeof body.gender === "string" ? body.gender : null,
    genres: Array.isArray(body.genres) ? body.genres.filter((g) => typeof g === "string") : [],
    ratings: body.ratings && typeof body.ratings === "object" && !Array.isArray(body.ratings) ? body.ratings : {},
    shuffle: body.shuffle === true
  };
  if (!user.mood.trim()) return res.status(400).json({ error: "Please select a mood." });
  if (user.age < 5 || user.age > 99) return res.status(400).json({ error: "Age must be between 5 and 99." });

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(recommend(user));
};

module.exports.recommend = recommend;
