package com.game.dto;

import java.time.LocalDate;
import java.util.List;

public record GameDetailsDto(
        Long rawgId,
        String name,
        LocalDate released,
        String imageUrl,
        String rating,
        String description,
        List<String> genres,
        List<String> platforms
) {
}
