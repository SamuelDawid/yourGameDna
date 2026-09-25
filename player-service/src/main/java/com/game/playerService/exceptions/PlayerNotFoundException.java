package com.game.playerService.exceptions;

import org.springframework.http.HttpStatus;

public class PlayerNotFoundException extends PlayerServiceException {
    public PlayerNotFoundException(Long id) {
        super("Player with "+id+" not found -> ", HttpStatus.NOT_FOUND);
    }
}
