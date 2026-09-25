package com.game.playerService.dto;

public record UpdatePlayerCommand(
        Long id,
        String userName,
        String email,
        String bio
) {
}
