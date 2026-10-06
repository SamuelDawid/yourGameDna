package com.catalogservice.exceptions.handler;

import com.catalogservice.exceptions.CatalogServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class ErrorHandler {
    @ExceptionHandler(CatalogServiceException.class)
    public ProblemDetail handleCatalogServiceException(CatalogServiceException exception) {
        log.error("Received {} -> {}", exception.getStatus(), exception.getMessage());
        return ProblemDetail.forStatusAndDetail(exception.getStatus(), exception.getMessage());
    }
}
