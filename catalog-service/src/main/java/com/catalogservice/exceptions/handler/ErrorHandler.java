package com.catalogservice.exceptions.handler;

import com.catalogservice.exceptions.CatalogServiceException;
import feign.RetryableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MissingServletRequestParameterException;
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

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ProblemDetail handleMissingQueryParamException(MissingServletRequestParameterException exception) {
        log.error("Missing Query Parameter -> {}", exception.getMessage());
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(RetryableException.class)
    public ProblemDetail handleRetryableException() {
        log.error("Request exceeded max rety attempts, service RAWG unavailable");
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, "Game catalog is temporarily unavailable");
    }
}
