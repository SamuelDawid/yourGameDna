package com.catalogservice.dto;

import java.util.List;

public record RawgPageResponse(
        int count,
        String next,
        List<RawgGameDto> results
) {
}
