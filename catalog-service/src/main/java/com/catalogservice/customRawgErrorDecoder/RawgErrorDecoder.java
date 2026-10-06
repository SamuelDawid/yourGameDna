package com.catalogservice.customRawgErrorDecoder;

import com.catalogservice.exceptions.CatalogServiceException;
import com.catalogservice.exceptions.RAWGUnavailableException;
import feign.FeignException;
import feign.Response;
import feign.RetryableException;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;

@Slf4j
public class RawgErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String methodKey, Response response) {
        FeignException feignException = feign.FeignException.errorStatus(methodKey, response);
        HttpStatus status = HttpStatus.valueOf(response.status());
        String responsebody = feignException.contentUTF8();
        log.error("Feign client error. Method: {}, Status: {}, Body: {}", methodKey, status, responsebody);
        switch (status) {
            case NOT_FOUND -> {
                log.error("Resource not found {} -> {}", status, responsebody);
                return new CatalogServiceException("Resource not found", status);
            }
            case FORBIDDEN, UNAUTHORIZED -> {
                log.error("Access denied check api key");
                return new CatalogServiceException("Access denied", HttpStatus.BAD_GATEWAY);
            }

            case BAD_REQUEST -> {
                log.error("Bad request -> {}", responsebody);
                return new CatalogServiceException("Bad request", status);
            }
            case SERVICE_UNAVAILABLE -> {
                log.error("Service unavailable ");
                return new RetryableException(response.status(), feignException.getMessage(), response.request().httpMethod(), (Long) null, response.request());
            }
            default -> {
                if (status.is5xxServerError()) {
                    return new RAWGUnavailableException(responsebody, status);
                } else {
                    return new CatalogServiceException(responsebody, status);
                }
            }
        }

    }
}
