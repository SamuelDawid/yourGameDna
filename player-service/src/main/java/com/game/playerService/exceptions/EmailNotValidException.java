package com.game.playerService.exceptions;

import org.springframework.http.HttpStatus;

public class EmailNotValidException extends PlayerServiceException{
    public EmailNotValidException(String email) {
        super(email +" Not a valid email", HttpStatus.BAD_REQUEST);
    }
}
