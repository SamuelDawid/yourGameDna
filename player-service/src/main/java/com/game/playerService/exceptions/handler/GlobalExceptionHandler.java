package com.game.playerService.exceptions.handler;

import com.game.playerService.exceptions.PlayerServiceException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(PlayerServiceException.class)
    public ProblemDetail handlePlayerServiceException(PlayerServiceException exception) {
        log.error("Rejected -> ", exception);
        return ProblemDetail.forStatusAndDetail(exception.getStatus(), exception.getMessage());
    }
    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolation(ConstraintViolationException exception){
        log.error("Constraint validation -> {}",exception.getConstraintViolations());
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,exception.getMessage());
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleMethodArgumentNotValid(MethodArgumentNotValidException exception){
        log.error("Constraint validation -> ",exception);
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,exception.getMessage());
    }
}
