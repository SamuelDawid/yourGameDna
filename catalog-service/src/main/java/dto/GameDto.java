package dto;

import java.time.LocalDate;

public record GameDto(
        Long rawgId,
        String name,
        LocalDate released,
        String imageUrl,
        String rating
) {
}
