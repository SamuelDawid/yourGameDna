package com.game.playerService.dto;

public record PlayerDto(
        Long id,
        String userName,
        String email,
        String bio
) {
}
