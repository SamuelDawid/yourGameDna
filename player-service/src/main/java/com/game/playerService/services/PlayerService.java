package com.game.playerService.services;

import com.game.playerService.dto.CreatePlayerCommand;
import com.game.playerService.dto.PlayerDto;
import com.game.playerService.dto.UpdatePlayerCommand;
import com.game.playerService.exceptions.*;
import com.game.playerService.mapper.PlayerMapper;
import com.game.playerService.model.Player;
import com.game.playerService.repository.PlayerRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.validator.routines.EmailValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class PlayerService {
    private final PlayerMapper mapper;
    private final PlayerRepository repository;

    @Transactional(readOnly = true)
    public Page<PlayerDto> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public PlayerDto findById(@NonNull Long id) {
        return mapper.toDto(findByIdOrThrow(id));
    }

    @Transactional
    public PlayerDto create(@NonNull CreatePlayerCommand command) {
        validateEmail(command.email());
        validateUsername(command.userName());
        Player player = mapper.toEntity(command);
        Player saved = repository.save(player);
        log.info("create a player -> {}", saved);
        return mapper.toDto(saved);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        log.info("Deleting player with id {}", id);
        repository.delete(findByIdOrThrow(id));
        log.info("Successfully deleted player with id {}", id);
    }

    @Transactional
    public PlayerDto update(@NonNull UpdatePlayerCommand command) {
        Player player = findByIdOrThrow(command.id());
        validateUsername(command.userName());
        validateEmail(command.email());
        Player updated = player.update(command);
        log.info("Updated player with id {} -> {}", command.id(), updated);
        return mapper.toDto(updated);
    }

    private Player findByIdOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> {
            log.error("Player with id {} not found", id);
            return new PlayerNotFoundException(id);
        });
    }

    private void validateUsername(String userName) {
        if (userName.isBlank()) {
            log.error("Invalid username: {}", userName);
            throw new InvalidUserNameException("Username can't be blank");
        }
        if (userName.length() < 4 || userName.length() > 30) {
            log.error("Invalid username, must bet at least 4 character and maximum 30 characters -> {}", userName);
            throw new InvalidUserNameException("Username must bet at least 4 character and maximum 30 characters");
        }
        if (repository.existsByUserName(userName)) {
            log.error("username already taken -> {}", userName);
            throw new UserNameAlreadyExistsException(userName);
        }
    }

    private void validateEmail(String email) {
        if (!EmailValidator.getInstance().isValid(email)) {
            log.error("Invalid email {} ", email);
            throw new EmailNotValidException(email);
        }
        if (repository.existsByEmail(email)) {
            log.error("Email already exists: {}", email);
            throw new EmailAlreadyTakenException(email);
        }
    }
}
