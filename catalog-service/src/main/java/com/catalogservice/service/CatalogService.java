package com.catalogservice.service;

import com.catalogservice.dto.GameDetailsDto;
import com.catalogservice.dto.GamePageResponse;
import com.catalogservice.mappers.RawgMapper;
import com.catalogservice.rawgClient.RawgClient;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CatalogService {
    private final RawgClient client;
    private final RawgMapper mapper;
    public GamePageResponse findGameByName(String name, Integer pageSize) {
        return mapper.toGamePage(client.getGames(name, pageSize));
    }
    public GameDetailsDto findGameById(@NonNull Long id ){
        return mapper.toGameDetailsDto(client.getGameById(id));
    }
}
