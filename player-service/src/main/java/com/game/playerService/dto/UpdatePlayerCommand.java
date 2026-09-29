package com.game.playerService.dto;

import jakarta.validation.constraints.NotNull;

public record UpdatePlayerCommand(
        @NotNull(message = "Id field is mandatory")
        Long id,
        String userName,
        String email,
        String bio
) {
}
