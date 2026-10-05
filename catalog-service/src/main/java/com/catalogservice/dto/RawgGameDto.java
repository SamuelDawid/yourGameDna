package com.catalogservice.dto;

import java.time.LocalDate;

public record RawgGameDto(
        Long id,
        String name,
        LocalDate released,
        String background_image,
        String rating
) {
}
