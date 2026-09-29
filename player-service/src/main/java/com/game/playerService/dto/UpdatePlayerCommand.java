package com.game.playerService.dto;

public record UpdatePlayerCommand(
        String userName,
        String email,
        String bio
) {
}
