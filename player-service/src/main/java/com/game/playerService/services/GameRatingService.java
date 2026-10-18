package com.game.playerService.services;

import com.game.dto.GameDetailsDto;
import com.game.dto.PageDto;
import com.game.playerService.catalogClient.CatalogueClient;
import com.game.playerService.dto.CreateGameRatingCommand;
import com.game.playerService.dto.GameRatingDto;
import com.game.playerService.dto.UpdateGameRatingCommand;
import com.game.playerService.exceptions.GameRatingAlreadyExistsException;
import com.game.playerService.exceptions.GameRatingNotFoundException;
import com.game.playerService.exceptions.PlayerNotFoundException;
import com.game.playerService.mapper.GameRatingMapper;
import com.game.playerService.model.GameRating;
import com.game.playerService.model.Player;
import com.game.playerService.repository.PlayerRatingRepository;
import com.game.playerService.repository.PlayerRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameRatingService {
    private final PlayerRatingRepository repository;
    private final PlayerRepository playerRepository;
    private final CatalogueClient catalogueClient;
    private final GameRatingMapper mapper;

    @Transactional(readOnly = true)
    PageDto<GameRatingDto> findAll(Pageable pageable) {
        return PageDto.from(repository.findAll(pageable).map(mapper::toDto));
    }

    @Transactional(readOnly = true)
    GameRatingDto findById(@NonNull Long id) {
        return mapper.toDto(findOrThrow(id));
    }

    @Transactional
    GameRatingDto create(CreateGameRatingCommand command) {
        log.info("Creating game rating -> {}", command);
        Player player = findPlayerOrThrow(command.playerId());
        if (repository.existsByPlayerIdAndRawgId(command.playerId(), command.rawgId())) {
            log.error("Game with id {}, already exists for player {}", command.rawgId(), command.playerId());
            throw new GameRatingAlreadyExistsException(command.playerId(), command.rawgId());
        }
        GameDetailsDto gameDetailsDto = catalogueClient.getGameById(command.rawgId());
        GameRating gameRating = mapper.toEntity(command);
        gameRating.setPlayer(player);
        gameRating.setGameName(gameDetailsDto.name());
        try {
            GameRating saved = repository.save(gameRating);
            log.info("Successfully created game rating -> {}", saved);
            return mapper.toDto(saved);
        } catch (DataIntegrityViolationException exception) {
            throw new GameRatingAlreadyExistsException(command.playerId(), command.rawgId());
        }

    }

    @Transactional
    GameRatingDto update(Long id, UpdateGameRatingCommand command) {
        log.info("Updating game rating {} ", id);
        GameRating gameRating = findOrThrow(id);
        mapper.updateFromCommand(command, gameRating);
        log.info("Updated game rating {}", id);
        return mapper.toDto(gameRating);
    }

    @Transactional
    void delete(Long id) {
        GameRating gameRating = findOrThrow(id);
        repository.delete(gameRating);
    }

    private GameRating findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(
                () -> {
                    log.error("Game rating with id {} not found ", id);
                    return new GameRatingNotFoundException(id);
                });
    }

    private Player findPlayerOrThrow(Long id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new PlayerNotFoundException(id));
    }
}
