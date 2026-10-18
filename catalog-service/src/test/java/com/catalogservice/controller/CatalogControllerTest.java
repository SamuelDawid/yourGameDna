package com.catalogservice.controller;

import com.game.dto.GameDetailsDto;
import com.game.dto.GameDto;
import com.catalogservice.exceptions.CatalogServiceException;
import com.catalogservice.service.CatalogService;
import com.game.dto.PageDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
class CatalogControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private CatalogService service;
    List<GameDto> gamesDto = List.of(
            new GameDto(1L, "GameOne", LocalDate.of(2020, 12, 15), "https://gameOneUrl", "4.3"),
            new GameDto(2L, "GameTwo", LocalDate.of(2020, 12, 15), "https://gameOneUrl", "4.7"),
            new GameDto(3L, "GameThree", LocalDate.of(2020, 12, 15), "https://gameOneUrl", "3.2")
    );

    @Test
    void getGames_ShouldReturnPageWithThreeGames() throws Exception {
        //given
        Pageable pageable = PageRequest.of(1, 20);
        PageDto<GameDto> expected = new PageDto<>(gamesDto, pageable.getPageNumber(), pageable.getPageSize(), 3, 1);
        when(service.findGameByName("Game", pageable)).thenReturn(expected);
        //When + Then
        mockMvc.perform(get("/games").param("search", "Game").param("page", "1").param("pageSize", "20"))
                .andExpectAll(
                        status().isOk(),
                        jsonPath("$.pageSize").value(20),
                        jsonPath("$.totalPages").value(1),
                        jsonPath("$.totalElements").value(3),
                        jsonPath("$.pageNumber").value(1),
                        jsonPath("$.content[0].rawgId").value(1L),
                        jsonPath("$.content[1].name").value("GameTwo")
                );
        verify(service).findGameByName("Game", pageable);
    }

    @Test
    void getGameDetails_shouldReturn200() throws Exception {
        Long id = 1L;
        GameDetailsDto expected = new GameDetailsDto(1L, "Title", LocalDate.of(2020, 10, 10), "someUrl", "3.4", "someDescritons", List.of("Adventure", "Fantasy"), List.of("xBox", "PC"));
        when(service.findGameById(id)).thenReturn(expected);
        //When + Then
        mockMvc.perform(get("/games/{id}", id))
                .andExpectAll(
                        status().isOk(),
                        jsonPath("$.rawgId").value(1L),
                        jsonPath("$.name").value("Title"),
                        jsonPath("$.imageUrl").value("someUrl"),
                        jsonPath("$.rating").value("3.4")
                );
        verify(service).findGameById(id);
    }

    @Test
    void getGameDetails_ShouldReturn404() throws Exception {
        Long id = 1L;
        when(service.findGameById(id)).thenThrow(new CatalogServiceException("Resource not found", HttpStatus.NOT_FOUND));
        mockMvc.perform(get("/games/{id}", id))
                .andExpectAll(
                        status().isNotFound(),
                        jsonPath("$.detail").value("Resource not found")
                );
    }
}