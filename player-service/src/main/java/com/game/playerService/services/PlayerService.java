package com.game.playerService.services;

import com.game.playerService.dto.CreatePlayerCommand;
import com.game.playerService.dto.PageDto;
import com.game.playerService.dto.PlayerDto;
import com.game.playerService.dto.UpdatePlayerCommand;
import com.game.playerService.exceptions.EmailAlreadyTakenException;
import com.game.playerService.exceptions.PlayerNotFoundException;
import com.game.playerService.exceptions.UserNameAlreadyExistsException;
import com.game.playerService.mapper.PlayerMapper;
import com.game.playerService.model.Player;
import com.game.playerService.repository.PlayerRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    public PageDto<PlayerDto> findAll(Pageable pageable) {
        return PageDto.from(repository.findAll(pageable).map(mapper::toDto));
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
    public PlayerDto update(@NonNull Long id, @NonNull UpdatePlayerCommand command) {
        Player player = findByIdOrThrow(id);

        if (command.userName() != null) {
            if (!command.userName().equals(player.getUserName())) {
                validateUsername(command.userName());
            }
        }

        if (command.email() != null) {
            if (!command.email().equals(player.getEmail())) {
                validateEmail(command.email());
            }
        }

        mapper.update(player, command);

        log.info("Updated player with id {} -> {}", id, player);
        return mapper.toDto(player);
    }

    private Player findByIdOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> {
            log.error("Player with id {} not found", id);
            return new PlayerNotFoundException(id);
        });
    }

    private void validateUsername(String userName) {
        if (repository.existsByUserName(userName)) {
            log.error("username already taken -> {}", userName);
            throw new UserNameAlreadyExistsException(userName);
        }
    }

    private void validateEmail(String email) {
        if (repository.existsByEmail(email)) {
            log.error("Email already exists: {}", email);
            throw new EmailAlreadyTakenException(email);
        }
    }
}
