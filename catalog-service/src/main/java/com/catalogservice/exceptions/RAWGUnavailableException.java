package com.catalogservice.exceptions;

import org.springframework.http.HttpStatus;

public class RAWGUnavailableException extends CatalogServiceException {
    public RAWGUnavailableException(String message, HttpStatus status) {
        super(message,status);
    }
}
