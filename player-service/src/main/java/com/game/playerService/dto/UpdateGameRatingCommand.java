package com.game.playerService.dto;

import com.game.playerService.enums.GameStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateGameRatingCommand(
        GameStatus status,
        @Min(1) @Max(10) Integer rating,
        @Min(1) @Max(10) Integer gamePlayRating,
        @Min(1) @Max(10) Integer graphicsRating,
        @Min(1) @Max(10) Integer storyRating,
        @Min(1) @Max(10) Integer monetizationRating,
        @Size(max = 2000)
        String review
) {
}
