package com.cinematch.api;

public record Recommendation(
    Movie m,
    double score,
    int fans,
    int moodHit,
    int genreHit,
    double predicted
) {}
