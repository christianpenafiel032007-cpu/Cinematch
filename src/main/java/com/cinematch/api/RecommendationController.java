package com.cinematch.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class RecommendationController {
    private final RecommendationService recommendationService;
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/recommendations")
    public List<Recommendation> recommendations(@RequestBody RecommendationRequest request) {
        if (request.mood() == null || request.mood().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select a mood.");
        if (request.age() < 5 || request.age() > 99)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Age must be between 5 and 99.");
        return recommendationService.recommend(request);
    }
}
