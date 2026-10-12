package com.catalogservice.service;

import com.catalogservice.dto.GameDetailsDto;
import com.catalogservice.dto.GameDto;
import com.catalogservice.dto.RawgGameDto;
import com.catalogservice.dto.RawgPageResponse;
import com.catalogservice.mappers.RawgMapper;
import com.catalogservice.rawgClient.RawgClient;
import com.game.dto.PageDto;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CatalogService {
    private final RawgClient client;
    private final RawgMapper mapper;

    public PageDto<GameDto> findGameByName(String name, Pageable pageable) {
        int pageSize = pageable.getPageSize();
        RawgPageResponse<RawgGameDto> response = client.getGames(name, pageable.getPageNumber() + 1, pageSize);
        return mapper.toGamePage(response, pageable);
    }

    public GameDetailsDto findGameById(@NonNull Long id) {
        return mapper.toGameDetailsDto(client.getGameById(id));
    }
}
