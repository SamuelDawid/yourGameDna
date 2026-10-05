package com.catalogservice.controller;

import com.catalogservice.dto.GameDto;
import com.catalogservice.dto.GamePageResponse;
import com.catalogservice.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CatalogController {
    private final CatalogService service;

    @GetMapping("/games")
    GamePageResponse getGames(
            @RequestParam("search") String gameName,
            @RequestParam(defaultValue = "20") int pageSize) {
        return service.findGameByName(gameName, pageSize);
    }

    @GetMapping("/games/{id}")
    GameDto getGameById(@PathVariable Long id){
        return service.findGameById(id);
    }
}
