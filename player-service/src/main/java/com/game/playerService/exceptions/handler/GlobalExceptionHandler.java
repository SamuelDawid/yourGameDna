package com.game.playerService.exceptions.handler;

import com.game.playerService.exceptions.PlayerServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(PlayerServiceException.class)
    public ProblemDetail handlePlayerServiceException(PlayerServiceException exception) {
        log.error("Rejected -> ", exception);
        return ProblemDetail.forStatusAndDetail(exception.getStatus(), exception.getMessage());
    }
}
