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

    public RecommendationService(ObjectMapper mapper) throws IOException {
        Map<String, Object> data = mapper.readValue(
            new ClassPathResource("data.json").getInputStream(),
            new TypeReference<>() {}
        );
        this.movies = mapper.convertValue(data.get("movies"), new TypeReference<List<Movie>>() {});
        this.viewers = mapper.convertValue(data.get("viewers"), new TypeReference<List<Viewer>>() {});
    }

    // Same formula as the original CineMatch JavaScript implementation.
    private Double tasteSimilarity(Map<String, Integer> mine, Map<String, Integer> theirs) {
        List<String> shared = mine.keySet().stream()
            .filter(id -> theirs.get(id) != null).toList();
        if (shared.isEmpty()) return null;
        double averageDifference = shared.stream()
            .mapToDouble(id -> Math.abs(mine.get(id) - theirs.get(id)))
            .average().orElse(0);
        return 1.0 - averageDifference / 4.0;
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
                Double taste = tasteSimilarity(ratings, viewer.r());
                double similarity = taste == null ? profile : 0.65 * taste + 0.35 * profile;
                return new Neighbor(viewer, similarity);
            })
            .sorted((a, b) -> Double.compare(b.similarity(), a.similarity()))
            .limit(8)
            .toList();

        List<Recommendation> results = new ArrayList<>();
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
            double predicted = denominator != 0.0 ? numerator / denominator : 3.0;
            int moodHit = movie.m().contains(user.mood()) ? 1 : 0;
            int genreHit = movie.g().stream().anyMatch(genres::contains) ? 1 : 0;
            double score = (predicted / 5.0) * 0.60 + moodHit * 0.25 + genreHit * 0.15;
            if (user.shuffle()) score += random.nextDouble() * 0.12;
            results.add(new Recommendation(movie, score, fans, moodHit, genreHit, predicted));
        }

        return results.stream()
            .sorted((a, b) -> Double.compare(b.score(), a.score()))
            .limit(6)
            .toList();
    }

    private record Neighbor(Viewer viewer, double similarity) {}
}
