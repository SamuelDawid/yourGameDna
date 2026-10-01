package com.game.playerService.controllers;

import com.game.playerService.dto.CreatePlayerCommand;
import com.game.playerService.dto.PageDto;
import com.game.playerService.dto.PlayerDto;
import com.game.playerService.dto.UpdatePlayerCommand;
import com.game.playerService.services.PlayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/players")
public class PlayerController {
    private final PlayerService service;

    @GetMapping
    public PageDto<PlayerDto> findAll(Pageable pageable) {
        return service.findAll(pageable);
    }

    @GetMapping("/{id}")
    public PlayerDto findById(@PathVariable("id") Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlayerDto create(@Valid @RequestBody CreatePlayerCommand command) {
        return service.create(command);
    }

    @PatchMapping("/{id}")
    public PlayerDto update(@PathVariable("id") Long id,@Valid @RequestBody UpdatePlayerCommand command) {
        return service.update(id, command);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
