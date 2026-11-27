package com.cinematch.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
public class RecommendationService {
    private final List<Movie> movies;
    private final List<Viewer> viewers;
    private final Random random = new Random();
    // Community rating count and average per movie id, used only to break ties between equal scores.
    private final Map<String, Integer> communityCount = new HashMap<>();
    private final Map<String, Double> communityAverage = new HashMap<>();

    // Significance weighting: taste similarity reaches its full 65% weight only after this many shared ratings.
    // With fewer shared movies, the rest of the weight falls back to profile (age/gender) similarity.
    private static final int FULL_TRUST_SHARED_RATINGS = 5;
    // Shrinkage: a predicted rating starts from a neutral 3.0 worth this much "similarity weight".
    // One similar viewer's 5 stars gives ~4.0, three give ~4.5, so thin evidence no longer reads as certain.
    private static final double PRIOR_WEIGHT = 1.0;
    private static final double NEUTRAL_RATING = 3.0;

    public RecommendationService(ObjectMapper mapper) throws IOException {
        Map<String, Object> data = mapper.readValue(
            new ClassPathResource("data.json").getInputStream(),
            new TypeReference<>() {}
        );
        this.movies = mapper.convertValue(data.get("movies"), new TypeReference<List<Movie>>() {});
        this.viewers = mapper.convertValue(data.get("viewers"), new TypeReference<List<Viewer>>() {});

        Map<String, Integer> sums = new HashMap<>();
        for (Viewer viewer : viewers) {
            viewer.r().forEach((id, rating) -> {
                if (rating == null) return;
                communityCount.merge(id, 1, (a, b) -> a + b);
                sums.merge(id, rating, (a, b) -> a + b);
            });
        }
        sums.forEach((id, sum) -> communityAverage.put(id, (double) sum / communityCount.get(id)));
    }

    // Same formula as the original CineMatch JavaScript implementation: 1 - (average rating difference) / 4.
    // Returns null when the two people have no rated movie in common.
    private Taste tasteSimilarity(Map<String, Integer> mine, Map<String, Integer> theirs) {
        List<String> shared = mine.keySet().stream()
            .filter(id -> theirs.get(id) != null).toList();
        if (shared.isEmpty()) return null;
        double averageDifference = shared.stream()
            .mapToDouble(id -> Math.abs(mine.get(id) - theirs.get(id)))
            .average().orElse(0);
        return new Taste(1.0 - averageDifference / 4.0, shared.size());
    }

    private double profileSimilarity(RecommendationRequest user, Viewer viewer) {
        double ageSimilarity = Math.max(0.0, 1.0 - Math.abs(user.age() - viewer.a()) / 30.0);
        double genderSimilarity = "none".equals(user.gender())
            ? 0.6
            : (Objects.equals(user.gender(), viewer.g()) ? 1.0 : 0.4);
        return 0.65 * ageSimilarity + 0.35 * genderSimilarity;
    }

    public List<Recommendation> recommend(RecommendationRequest user) {
        Map<String, Integer> ratings = user.ratings() == null ? Map.of() : user.ratings();
        List<String> genres = user.genres() == null ? List.of() : user.genres();

        List<Neighbor> neighbors = viewers.stream()
            .map(viewer -> {
                double profile = profileSimilarity(user, viewer);
                Taste taste = tasteSimilarity(ratings, viewer.r());
                // 0 shared ratings -> profile only (as before); 5+ shared -> 65% taste / 35% profile (as before);
                // in between, taste counts proportionally to how many movies we can actually compare.
                double tasteWeight = taste == null ? 0.0
                    : 0.65 * Math.min(taste.shared(), FULL_TRUST_SHARED_RATINGS) / FULL_TRUST_SHARED_RATINGS;
                double similarity = taste == null ? profile
                    : tasteWeight * taste.similarity() + (1.0 - tasteWeight) * profile;
                return new Neighbor(viewer, similarity);
            })
            .sorted((a, b) -> Double.compare(b.similarity(), a.similarity()))
            .limit(8)
            .toList();

        List<Candidate> results = new ArrayList<>();
        for (Movie movie : movies) {
            String movieId = String.valueOf(movie.id());
            if (ratings.containsKey(movieId) || user.age() < movie.minAge()) continue;

            double numerator = 0.0, denominator = 0.0;
            int fans = 0;
            for (Neighbor neighbor : neighbors) {
                Integer rating = neighbor.viewer().r().get(movieId);
                if (rating != null) {
                    numerator += neighbor.similarity() * rating;
                    denominator += neighbor.similarity();
                    if (rating >= 4) fans++;
                }
            }
            // Shrinkage toward a neutral 3.0: with no neighbor ratings this is exactly 3.0 (as before),
            // and the more similar viewers who rated the movie, the closer it gets to their weighted average.
            double predicted = (numerator + PRIOR_WEIGHT * NEUTRAL_RATING) / (denominator + PRIOR_WEIGHT);
            int moodHit = movie.m().contains(user.mood()) ? 1 : 0;
            int genreHit = movie.g().stream().anyMatch(genres::contains) ? 1 : 0;
            double score = (predicted / 5.0) * 0.60 + moodHit * 0.25 + genreHit * 0.15;
            if (user.shuffle()) score += random.nextDouble() * 0.12;
            results.add(new Candidate(new Recommendation(movie, score, fans, moodHit, genreHit, predicted),
                denominator, communityCount.getOrDefault(movieId, 0), communityAverage.getOrDefault(movieId, 0.0)));
        }

        // Highest score first. Equal scores: more neighbor evidence, then more community ratings,
        // then higher community average (instead of falling back to catalogue/ID order).
        return results.stream()
            .sorted((a, b) -> {
                int c = Double.compare(b.rec().score(), a.rec().score());
                if (c == 0) c = Double.compare(b.support(), a.support());
                if (c == 0) c = Integer.compare(b.ratingCount(), a.ratingCount());
                if (c == 0) c = Double.compare(b.ratingAverage(), a.ratingAverage());
                return c;
            })
            .limit(6)
            .map(c -> c.rec())
            .toList();
    }

    private record Taste(double similarity, int shared) {}
    private record Neighbor(Viewer viewer, double similarity) {}
    private record Candidate(Recommendation rec, double support, int ratingCount, double ratingAverage) {}
}
