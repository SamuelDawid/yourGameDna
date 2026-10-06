package com.catalogservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.util.List;

public record GameDetailsDto(
        @JsonProperty("id")
        Long rawgId,
        String name,
        LocalDate released,
        @JsonProperty("background_image")
        String imageUrl,
        String rating,
        @JsonProperty("description_raw")
        String description,
        List<Object> genres,
        List<Object> platforms
) {
}
