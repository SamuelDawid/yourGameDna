package com.game.playerService.exceptions;

import org.springframework.http.HttpStatus;

public class UserNameAlreadyExistsException extends PlayerServiceException {
    public UserNameAlreadyExistsException(String userName) {
        super("Player with username: " + userName + " already exists", HttpStatus.CONFLICT);
    }
}
