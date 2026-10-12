package com.catalogservice.dto;

import java.util.List;

public record RawgPageResponse<T>(
        long count,
        String next,
        String previous,
        List<T> results
) {
}
