package com.game.playerService.dto;

public record CreatePlayerCommand(
        String userName,
        String email,
        String bio
) {
}
