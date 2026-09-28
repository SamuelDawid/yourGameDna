package com.game.playerService.controllers;

import com.game.playerService.dto.PlayerDto;
import com.game.playerService.model.Player;
import com.game.playerService.services.PlayerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@WebMvcTest
class PlayerControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private PlayerService service;

    private List<PlayerDto> playerList;
    @BeforeEach
    void setUp(){
        playerList = List.of(
                new PlayerDto(1L,"testPlayerOne","testPlayerOne@Email.com","bio for test player one"),
                new PlayerDto(2L,"testPlayerTwo","testPlayerTwo@Email.com","bio for test player two"),
                new PlayerDto(3L,"testPlayerThree","testPlayerThree@Email.com","bio for test player Three")
        );
    }
    @Test
    void findAll_WhenThreePlayersGiven_ShouldReturnPageWithThreePlayerDto() throws Exception{
        //Given
        Pageable pageable = PageRequest.of(0,10);
        Page<PlayerDto> page = new PageImpl<>(playerList,pageable,3);
        when(service.findAll(pageable)).thenReturn(page);
        //When + Then
        mockMvc.perform(get("/players").param("page", "0").param("size", "10"))
                .andDo(print())
                .andExpectAll(
                        status().isOk(),
                        jsonPath("$.totalElements").value(3),
                        jsonPath("$.number").value(0),
                        jsonPath("$.size").value(10),
                        jsonPath("$.numberOfElements").value(3),
                        jsonPath("$.totalPages").value(1)
                );
        verify(service).findAll(pageable);
    }
}