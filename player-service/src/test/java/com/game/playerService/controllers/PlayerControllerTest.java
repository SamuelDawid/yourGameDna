package com.game.playerService.controllers;

import com.game.playerService.dto.CreatePlayerCommand;
import com.game.playerService.dto.PlayerDto;
import com.game.playerService.dto.UpdatePlayerCommand;
import com.game.playerService.exceptions.*;
import com.game.playerService.services.PlayerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.mockito.Mockito.*;
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
    void setUp() {
        playerList = List.of(
                new PlayerDto(1L, "testPlayerOne", "testPlayerOne@Email.com", "bio for test player one"),
                new PlayerDto(2L, "testPlayerTwo", "testPlayerTwo@Email.com", "bio for test player two"),
                new PlayerDto(3L, "testPlayerThree", "testPlayerThree@Email.com", "bio for test player Three")
        );
    }

    @Test
    void findAll_WhenThreePlayersGiven_ShouldReturnPageWithThreePlayerDto() throws Exception {
        //Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<PlayerDto> page = new PageImpl<>(playerList, pageable, 3);
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

    @Test
    void findAll_WhenNoPlayersExists_ShouldReturnEmptyPage() throws Exception {
        Pageable pageable = PageRequest.of(0, 20);
        Page<PlayerDto> page = new PageImpl<>(List.of(), pageable, 0);
        when(service.findAll(pageable)).thenReturn(page);
        //When + Then
        mockMvc.perform(get("/players").param("page", "0").param("size", "20"))
                .andExpectAll(
                        status().isOk(),
                        jsonPath("$.totalElements").value(0),
                        jsonPath("$.number").value(0),
                        jsonPath("$.size").value(20),
                        jsonPath("$.numberOfElements").value(0),
                        jsonPath("$.totalPages").value(0)
                );
    }

    @Test
    void findById_WhenPlayerExists_ShouldReturnPlayerDto() throws Exception {
        //Given
        Long id = 1L;
        PlayerDto playerDto = playerList.getFirst();
        when(service.findById(id)).thenReturn(playerDto);
        //When + Then
        mockMvc.perform(get("/players/{id}", id))
                .andExpectAll(
                        status().isOk(),
                        jsonPath("$.userName").value("testPlayerOne"),
                        jsonPath("$.email").value("testPlayerOne@Email.com"),
                        jsonPath("$.bio").value("bio for test player one")
                );
    }

    @Test
    void findById_WhenPlayerDoesNotExists_ShouldReturn404() throws Exception {
        //Given
        Long id = 666L;
        when(service.findById(id)).thenThrow(new PlayerNotFoundException(id));
        //When + then
        mockMvc.perform(get("/players/{id}", id))
                .andExpectAll(
                        status().isNotFound(),
                        jsonPath("$.status").value(404),
                        jsonPath("$.detail").value("Player with " + id + " not found")
                );
    }

    @Test
    void create_WhenValidDetailsProvided_ShouldReturn201() throws Exception {
        //Given
        CreatePlayerCommand command = new CreatePlayerCommand("testPlayerOne", "testPlayerOne@Email.com", "bio for test player one");
        PlayerDto playerDto = playerList.getFirst();
        when(service.create(command)).thenReturn(playerDto);
        //When + Then
        mockMvc.perform(post("/players")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(command)))
                .andExpectAll(
                        status().isCreated(),
                        jsonPath("$.userName").value("testPlayerOne"),
                        jsonPath("$.email").value("testPlayerOne@Email.com"),
                        jsonPath("$.bio").value("bio for test player one")
                );
    }

    @Test
    void create_WhenEmailIsTaken_ShouldReturn409() throws Exception {
        //Given
        CreatePlayerCommand command = new CreatePlayerCommand("testPlayerOne", "testPlayerOne@Email.com", "bio for test player one");
        when(service.create(command)).thenThrow(new EmailAlreadyTakenException(command.email()));
        //When + Then
        mockMvc.perform(post("/players")
                        .content(objectMapper.writeValueAsString(command))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpectAll(
                        status().isConflict(),
                        jsonPath("$.status").value(409),
                        jsonPath("$.detail").value("player with email" + command.email() + " already exists")
                );
    }

    @Test
    void create_WhenUserNameTaken_ShouldReturn409() throws Exception {
        //Given
        CreatePlayerCommand command = new CreatePlayerCommand("testPlayerOne", "testPlayerOne@Email.com", "bio for test player one");
        when(service.create(command)).thenThrow(new UserNameAlreadyExistsException(command.userName()));
        //When + Then
        mockMvc.perform(post("/players")
                        .content(objectMapper.writeValueAsString(command))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpectAll(
                        status().isConflict(),
                        jsonPath("$.status").value(409),
                        jsonPath("$.detail").value("Player with username: " + command.userName() + " already exists")
                );
    }

    @Test
    void create_WhenUserNameIsInvalid_ShouldReturn400() throws Exception {
        //Given
        CreatePlayerCommand command = new CreatePlayerCommand("tes", "testPlayerOne@Email.com", "bio for test player one");
        when(service.create(command)).thenThrow(new InvalidUserNameException("Username must bet at least 4 character and maximum 30 characters"));
        //When + Then
        mockMvc.perform(post("/players")
                        .content(objectMapper.writeValueAsString(command))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpectAll(
                        status().isBadRequest(),
                        jsonPath("$.status").value(400),
                        jsonPath("$.detail").value("Username must bet at least 4 character and maximum 30 characters")
                );
    }

    @Test
    void create_WhenEmailIsInvalid_ShouldReturn400() throws Exception {
        //Given
        CreatePlayerCommand command = new CreatePlayerCommand("tes", "testPlayerOne@@Email.com", "bio for test player one");
        when(service.create(command)).thenThrow(new EmailNotValidException(command.email()));
        //When + Then
        mockMvc.perform(post("/players")
                        .content(objectMapper.writeValueAsString(command))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpectAll(
                        status().isBadRequest(),
                        jsonPath("$.status").value(400)
                );
    }

    @Test
    void update_WhenPlayerExists_ShouldReturnUpdatedDto() throws Exception {
        //Given
        Long id = 1L;
        UpdatePlayerCommand command = new UpdatePlayerCommand("newUserName", "newEmail@gamil.com", "new bio");
        PlayerDto expected = new PlayerDto(1L, "newUserName", "newEmail@gamil.com", "new bio");
        when(service.update(id,command)).thenReturn(expected);
        //When + Then
        mockMvc.perform(patch("/players/{id}",id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(command)))
                .andExpectAll(
                        status().isOk(),
                        jsonPath("$.email").value("newEmail@gamil.com"),
                        jsonPath("$.userName").value("newUserName"),
                        jsonPath("$.bio").value("new bio")
                );
        verify(service).update(id,command);
    }

    @Test
    void update_WhenPlayerDoesNotExists_ShouldReturn404() throws Exception {
        //given
        Long id = 1L;
        UpdatePlayerCommand command = new UpdatePlayerCommand("newUserName", "newEmail@gamil.com", "new bio");
        when(service.update(id,command)).thenThrow(new PlayerNotFoundException(id));
        //When + Then
        mockMvc.perform(patch("/players/{id}",id)
                        .content(objectMapper.writeValueAsString(command))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpectAll(
                        status().isNotFound(),
                        jsonPath("$.status").value(404),
                        jsonPath("$.detail").value("Player with " + id + " not found")
                );
    }

    @Test
    void delete_WhenPlayerExistsShouldReturn204() throws Exception {
        //Given
        Long id = 1L;
        mockMvc.perform(delete("/players/{id}", id))
                .andExpect(status().isNoContent());
        verify(service).delete(id);
    }

    @Test
    void delete_WhenPlayerWasNotFoundShouldReturn404() throws Exception {
        //Given
        Long id = 1L;
        doThrow(new PlayerNotFoundException(id)).when(service).delete(id);
        mockMvc.perform(delete("/players/delete/{id}", id))
                .andExpect(status().isNotFound());
        verify(service, never()).delete(id);
    }

}