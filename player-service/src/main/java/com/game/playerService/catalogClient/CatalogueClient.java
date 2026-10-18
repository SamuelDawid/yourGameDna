package com.game.playerService.catalogClient;

import com.game.dto.GameDetailsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(value = "catalogue-service",url = "${catalogue-service.url}")
public interface CatalogueClient {

    @GetMapping("/games/{id}")
    GameDetailsDto getGameById(@PathVariable Long id);
}
