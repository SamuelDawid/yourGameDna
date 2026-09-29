package com.game.playerService.controllers;

import com.game.playerService.dto.CreatePlayerCommand;
import com.game.playerService.dto.PlayerDto;
import com.game.playerService.dto.UpdatePlayerCommand;
import com.game.playerService.services.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/players")
public class PlayerController {
    private final PlayerService service;

    @GetMapping
    public Page<PlayerDto> findAll(Pageable pageable) {
        return service.findAll(pageable);
    }

    @GetMapping
    @RequestMapping("/{id}")
    public PlayerDto findById(@PathVariable("id") Long id) {
        return service.findById(id);
    }

    @PostMapping
    public PlayerDto create(@RequestBody CreatePlayerCommand command) {
        return service.create(command);
    }

    @PatchMapping
    @RequestMapping("/update")
    public PlayerDto update(@RequestBody UpdatePlayerCommand command) {
        return service.update(command);
    }

    @DeleteMapping
    @RequestMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
