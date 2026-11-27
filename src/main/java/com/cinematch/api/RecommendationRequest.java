package com.cinematch.api;

import java.util.List;
import java.util.Map;

public record RecommendationRequest(
    String mood,
    int age,
    String gender,
    List<String> genres,
    Map<String, Integer> ratings,
    boolean shuffle
) {}
