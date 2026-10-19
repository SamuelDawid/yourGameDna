package com.game.playerService.exceptions;

import org.springframework.http.HttpStatus;

public class GameRatingNotFoundException extends PlayerServiceException {
    public GameRatingNotFoundException(Long playerId, Long rawgId) {
        super("Game review for player :" + playerId + "with rawId" + rawgId + " not found", HttpStatus.NOT_FOUND);
    }
}
