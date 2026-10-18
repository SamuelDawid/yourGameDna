package com.game.playerService.dto;

import com.game.playerService.enums.GameStatus;

import java.time.LocalDateTime;

public record GameRatingDto(
        Long id,
        String gameName,
        Long rawgId,
        GameStatus status,
        Integer rating,
        Integer gamePlayRating,
        Integer graphicsRating,
        Integer storyRating,
        Integer monetizationRating,
        String review,
        LocalDateTime createdAt,
        Long playerId
) {
}
