package com.game.playerService.exceptions;

import org.springframework.http.HttpStatus;

public class GameRatingAlreadyExistsException extends PlayerServiceException {
    public GameRatingAlreadyExistsException(Long playerId, Long rawgId) {
        super("Review of game with id:" + rawgId + " already exists by player with id: " + playerId, HttpStatus.CONFLICT);
    }
}
