package com.game.playerService.exceptions.handler;

import com.game.playerService.exceptions.PlayerServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeSet;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(PlayerServiceException.class)
    public ProblemDetail handlePlayerServiceException(PlayerServiceException exception) {
        log.error("Rejected -> ", exception);
        return ProblemDetail.forStatusAndDetail(exception.getStatus(), exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleMethodArgumentNotValid(MethodArgumentNotValidException exception) {
        log.error("Constraint validation -> {}", exception.getFieldErrors());
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        Map<String, TreeSet<String>> properties = new HashMap<>();
        for (FieldError error : exception.getBindingResult().getFieldErrors()) {
            properties.computeIfAbsent(error.getField(), key -> new TreeSet<>()).add(error.getDefaultMessage());
        }
        problemDetail.setProperty("errors", properties);
        return problemDetail;
    }
}
