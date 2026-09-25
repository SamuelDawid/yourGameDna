package com.game.playerService.exceptions;

import org.springframework.http.HttpStatus;

public class EmailNotValidException extends PlayerServiceException{
    public EmailNotValidException(String email,String message) {
        super(email +" "+ message, HttpStatus.BAD_REQUEST);
    }
}
