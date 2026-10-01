package com.game.playerService.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdatePlayerCommand(
        @Size(min = 3,max = 30)
        String userName,
        @Email
        String email,
        @Size(max = 2000)
        String bio
) {
}
