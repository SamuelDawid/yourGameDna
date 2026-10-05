package dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GamePageResponse(
        int count,
        String next,
        List<GameDto> results
) {
}
