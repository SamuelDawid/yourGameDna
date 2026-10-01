package com.game.playerService.exceptions;

import org.springframework.http.HttpStatus;

public class InvalidUserNameException extends PlayerServiceException {
    public InvalidUserNameException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
