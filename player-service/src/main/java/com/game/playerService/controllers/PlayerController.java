package com.game.playerService.controllers;

import com.game.playerService.dto.*;
import com.game.dto.PageDto;
import com.game.playerService.services.GameRatingService;
import com.game.playerService.services.PlayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/players")
public class PlayerController {
    private final PlayerService service;
    private final GameRatingService gameRatingService;

    @GetMapping
    public PageDto<PlayerDto> findAll(Pageable pageable) {
        return service.findAll(pageable);
    }

    @GetMapping("/{playerId}/library")
    public PageDto<GameRatingDto> findAllByPlayerId(@PathVariable("playerId") Long id, Pageable pageable){
        return gameRatingService.findAllByPlayerId(id,pageable);
    }

    @GetMapping("/{id}")
    public PlayerDto findById(@PathVariable("id") Long id) {
        return service.findById(id);
    }
    @PostMapping("/{playerId}/library")
    public GameRatingDto create(@PathVariable("playerId") Long id,@Valid CreateGameRatingCommand command){
        return gameRatingService.create(id, command);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlayerDto create(@Valid @RequestBody CreatePlayerCommand command) {
        return service.create(command);
    }

    @PatchMapping("/{id}")
    public PlayerDto update(@PathVariable("id") Long id, @Valid @RequestBody UpdatePlayerCommand command) {
        return service.update(id, command);
    }
    @PatchMapping("/{playerId}/libray/{rawgId}")
    public GameRatingDto updateGameRating(@PathVariable("playerId") Long playerId,@PathVariable("rawgId") Long rawgId, @Valid UpdateGameRatingCommand command){
        return gameRatingService.update(playerId,rawgId,command);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
    @DeleteMapping("/{playerId}/libray/{rawgId}")
    void deleteGameRating(@PathVariable("playerId") Long playerId,@PathVariable("rawgId") Long rawgId){
        gameRatingService.delete(playerId, rawgId);
    }
}
