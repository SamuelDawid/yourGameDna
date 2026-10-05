package dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RawgGameResponseDto(
        Long id,
        String name,
        LocalDate released,
        String background_image,
        String rating
) {
}
