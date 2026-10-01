package com.game.playerService.services;

import com.game.playerService.dto.CreatePlayerCommand;
import com.game.playerService.dto.PlayerDto;
import com.game.playerService.dto.UpdatePlayerCommand;
import com.game.playerService.exceptions.PlayerNotFoundException;
import com.game.playerService.exceptions.UserNameAlreadyExistsException;
import com.game.playerService.mapper.PlayerMapper;
import com.game.playerService.model.Player;
import com.game.playerService.repository.PlayerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlayerServiceTest {
    PlayerService service;
    PlayerMapper playerMapper;
    PlayerRepository repository;
    List<Player> threePlayers;

    @BeforeEach
    void setUp() {
        playerMapper = Mappers.getMapper(PlayerMapper.class);
        repository = Mockito.mock(PlayerRepository.class);
        service = new PlayerService(playerMapper, repository);
        threePlayers = List.of(
                new Player("testUserOne", "test1@example.com", "some nice bio"),
                new Player("testUserTwo", "test2@example.com", "some nice bio for second player"),
                new Player("testUserThree", "test3@example.com", "some nice bio for third player")

        );
    }

    @Test
    void findAll_WhenPageWithThreePlayerExists_ShouldReturnPageWithMatchingDto() {
        //Given
        Pageable pageable = PageRequest.of(0, 20);
        Page<Player> page = new PageImpl<>(threePlayers, pageable, 3);
        doReturn(page).when(repository).findAll(pageable);
        //When
        Page<PlayerDto> result = service.findAll(pageable);
        //Then
        assertAll(
                () -> assertEquals(3, result.getContent().size()),
                () -> assertEquals("testUserOne", result.getContent().getFirst().userName()),
                () -> assertEquals("test2@example.com", result.getContent().get(1).email()),
                () -> assertEquals("some nice bio for third player", result.getContent().getLast().bio())
        );
    }

    @Test
    void findAll_WhenPageIsEmpty_ShouldReturnEmptyPage() {
        //Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Player> page = new PageImpl<>(List.of(), pageable, 0);
        doReturn(page).when(repository).findAll(pageable);
        //When
        Page<PlayerDto> result = service.findAll(pageable);
        //Then
        assertAll(
                () -> assertEquals(0, result.getTotalPages()),
                () -> assertEquals(0, result.getTotalElements()),
                () -> assertEquals(10, result.getSize())
        );
    }

    @Test
    void findById_WhenPlayerIsPresent_ShouldReturnMatchPlayerDto() {
        //Given
        Long id = 1L;
        doReturn(Optional.of(threePlayers.getFirst())).when(repository).findById(id);
        //When
        PlayerDto result = service.findById(id);
        //Then
        assertAll(
                () -> assertEquals("testUserOne", result.userName()),
                () -> assertEquals("test1@example.com", result.email()),
                () -> assertEquals("some nice bio", result.bio())
        );
    }

    @Test
    void findById_WhenPlayerDoesNotExists_ShouldThrowPlayerNotFoundException() {
        //Given
        Long id = 999L;
        doReturn(Optional.empty()).when(repository).findById(id);
        //When + Then
        PlayerNotFoundException exception = assertThrows(PlayerNotFoundException.class,
                () -> service.findById(id));
        assertEquals("Player with " + id + " not found", exception.getMessage());
    }

    @Test
    void create_WhenValidCommandProvided_ShouldCreateAndReturnMatchingDto() {
        //Given
        CreatePlayerCommand command = new CreatePlayerCommand("userTest", "userTest@Example.com", "some bio");
        Player player = new Player("userTest", "userTest@Example.com", "some bio");
        doReturn(player).when(repository).save(any());
        //When
        PlayerDto result = service.create(command);
        //Then
        PlayerDto expected = new PlayerDto(
                null, "userTest", "userTest@Example.com", "some bio"
        );
        assertAll(
                () -> assertEquals(expected.email(), result.email()),
                () -> assertEquals(expected.bio(), result.bio()),
                () -> assertEquals(expected.email(), result.email())
        );
        verify(repository).save(any(Player.class));
    }

    @Test
    void create_whenPlayerNameTaken_Should_ShouldThrowInvalidUserNameException() {
        //Given
        CreatePlayerCommand command = new CreatePlayerCommand("userTest", "userTest@Example.com", "some bio");
        doReturn(true).when(repository).existsByUserName(command.userName());
        //When + Then
        UserNameAlreadyExistsException exception = assertThrows(UserNameAlreadyExistsException.class,
                () -> service.create(command));
        assertEquals("Player with username: " + command.userName() + " already exists", exception.getMessage());
        verify(repository, never()).save(any(Player.class));
    }

    @Test
    void delete_WhenPlayerExists_ShouldDeletePlayer() {
        //Given
        Long id = 1L;
        Player player = new Player("userTest", "userTest@Example.com", "some bio");
        doReturn(Optional.of(player)).when(repository).findById(id);
        //When
        service.delete(id);
        //Then
        verify(repository).delete(any(Player.class));
    }

    @Test
    void delete_WhenPlayer_ShouldThrowPlayerNotFoundException() {
        //Given
        Long id = 999L;
        doReturn(Optional.empty()).when(repository).findById(id);
        //When + Then
        assertThrows(PlayerNotFoundException.class,
                () -> service.delete(id));
        verify(repository, never()).delete(any(Player.class));
    }

    @Test
    void update_WhenPlayerExists_ShouldUpdateDetailsAndReturnMatchingDto() {
        //Given
        Long id = 1L;
        Player player = new Player("userTest", "userTest@Example.com", "some bio");
        doReturn(Optional.of(player)).when(repository).findById(id);
        UpdatePlayerCommand command = new UpdatePlayerCommand("newUsername", "newEmail@Example.com", "new bio");
        PlayerDto expected = new PlayerDto(1L, "newUsername", "newEmail@Example.com", "new bio");
        //When
        PlayerDto result = service.update(id, command);
        //Then
        assertAll(
                () -> assertEquals(expected.userName(), result.userName()),
                () -> assertEquals(expected.bio(), result.bio()),
                () -> assertEquals(expected.email(), result.email())
        );
    }

    @Test
    void update_WhenPlayerDoesNotExists_ShouldThrowPlayerNotFoundException() {
        //Given
        Long id = 1L;
        doReturn(Optional.empty()).when(repository).findById(id);
        UpdatePlayerCommand command = new UpdatePlayerCommand("newUsername", "newEmail@Example.com", "new bio");
        //When + then
        assertThrows(PlayerNotFoundException.class,
                () -> service.update(id, command));
    }
}