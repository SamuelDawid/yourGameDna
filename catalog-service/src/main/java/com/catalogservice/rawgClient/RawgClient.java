package com.catalogservice.rawgClient;

import com.catalogservice.dto.RawgGameDto;
import com.catalogservice.dto.RawgPageResponse;
import com.catalogservice.rawgClientConfiguration.RawgClientConfiguration;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "RawG-Client", url = "${rawg.base-url}", configuration = RawgClientConfiguration.class)
public interface RawgClient {
    @GetMapping("/games")
    RawgPageResponse getGames(
            @RequestParam("search") String gameName,
            @RequestParam(value = "page_size", required = false) Integer pageSize
    );

    @GetMapping("/games/{id}")
    RawgGameDto getGameById(@PathVariable Long id);
}
