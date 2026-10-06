package com.catalogservice.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;
@Getter
public class CatalogServiceException extends RuntimeException {
    private final HttpStatus status;
    public CatalogServiceException(String message,HttpStatus status) {
        super(message);
        this.status = status;
    }
}
