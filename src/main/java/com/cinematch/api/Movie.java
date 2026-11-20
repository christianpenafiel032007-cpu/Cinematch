package com.cinematch.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record Movie(
    int id,
    String d,
    String t,
    int y,
    List<String> g,
    List<String> m,
    @JsonProperty("min") int minAge
) {}
