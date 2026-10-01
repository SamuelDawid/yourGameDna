package com.game.playerService.exceptions;

import org.springframework.http.HttpStatus;

public class EmailAlreadyTakenException extends PlayerServiceException {
    public EmailAlreadyTakenException(String email) {
        super("player with email"+email+" already exists", HttpStatus.CONFLICT);
    }
}
