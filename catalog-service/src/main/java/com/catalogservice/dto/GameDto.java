package com.catalogservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;

public record GameDto(
        @JsonProperty("id")
        Long rawgId,
        String name,
        LocalDate released,
        @JsonProperty("background_image")
        String imageUrl,
        String rating
) {
}
