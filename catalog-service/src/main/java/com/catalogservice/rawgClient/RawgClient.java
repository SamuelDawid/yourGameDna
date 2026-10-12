package com.catalogservice.rawgClient;

import com.catalogservice.dto.RawgGameDto;
import com.catalogservice.dto.RawgPageResponse;
import com.catalogservice.rawgClientConfiguration.RawgClientConfiguration;
import com.game.dto.PageDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "RawG-Client", url = "${rawg.base-url}", configuration = RawgClientConfiguration.class)
public interface RawgClient {
    @GetMapping("/games")
    RawgPageResponse<RawgGameDto> getGames(
            @RequestParam("search") String gameName,
            @RequestParam("page") int page,
            @RequestParam("page_size") int pageSize
    );

    @GetMapping("/games/{id}")
    RawgGameDto getGameById(@PathVariable Long id);
}
