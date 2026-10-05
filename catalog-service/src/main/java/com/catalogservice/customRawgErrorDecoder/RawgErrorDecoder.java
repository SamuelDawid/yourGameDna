package com.catalogservice.customRawgErrorDecoder;

import feign.FeignException;
import feign.Response;

import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
public class RawgErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String methodKey, Response response) {
        FeignException feignException = feign.FeignException.errorStatus(methodKey,response);
        HttpStatus status = HttpStatus.valueOf(response.status());
        String responsebody = feignException.contentUTF8();
        log.error("Feign client error. Method: {}, Status: {}, Body: {}",methodKey,status,responsebody);
        return new ResponseStatusException(status,methodKey);
    }
}
