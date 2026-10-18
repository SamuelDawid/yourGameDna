package com.game.playerService.exceptions;

import org.springframework.http.HttpStatus;

public class GameRatingNotFoundException extends PlayerServiceException {
    public GameRatingNotFoundException(Long id) {
        super("Game review with id :"+id+" not found", HttpStatus.NOT_FOUND);
    }
}
