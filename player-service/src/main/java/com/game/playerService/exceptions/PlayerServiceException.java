package com.game.playerService.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class PlayerServiceException extends RuntimeException {
    private final HttpStatus status;
    public PlayerServiceException(String message,HttpStatus status) {
        super(message);
        this.status = status;
    }
}
