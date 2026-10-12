package com.catalogservice.controller;

import com.catalogservice.dto.GameDetailsDto;
import com.catalogservice.dto.GameDto;
import com.catalogservice.service.CatalogService;
import com.game.dto.PageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CatalogController {
    private final CatalogService service;

    @GetMapping("/games")
    PageDto<GameDto> getGames(
            @RequestParam("search") String gameName,
            @PageableDefault(value = 20) Pageable pageable) {
        return service.findGameByName(gameName, pageable);
    }

    @GetMapping("/games/{id}")
    GameDetailsDto getGameById(@PathVariable Long id){
        return service.findGameById(id);
    }
}
