package com.game.playerService.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreatePlayerCommand(
        @NotBlank(message = "userName is mandatory")
        String userName,
        @Email
        String email,
        String bio
) {
}
