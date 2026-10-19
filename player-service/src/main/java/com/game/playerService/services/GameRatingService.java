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
import com.game.playerService.repository.GameRatingRepository;
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
    private final GameRatingRepository repository;
    private final PlayerRepository playerRepository;
    private final CatalogueClient catalogueClient;
    private final GameRatingMapper mapper;

    @Transactional
    public PageDto<GameRatingDto> findAllByPlayerId(Long id, Pageable pageable) {
        Player player = findPlayerOrThrow(id);
        return PageDto.from(repository.findAllByPlayer(player, pageable).map(mapper::toDto));
    }

    @Transactional
    public GameRatingDto create(Long id, CreateGameRatingCommand command) {
        log.info("Creating game rating -> {}", command);
        Player player = findPlayerOrThrow(id);
        if (repository.existsByPlayerIdAndRawgId(id, command.rawgId())) {
            log.error("Game with id {}, already exists for player {}", command.rawgId(), id);
            throw new GameRatingAlreadyExistsException(id, command.rawgId());
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
            throw new GameRatingAlreadyExistsException(id, command.rawgId());
        }

    }

    @Transactional
    public GameRatingDto update(Long playerId ,Long rawgId, UpdateGameRatingCommand command) {
        log.info("Updating game rating {} for player {}", rawgId,playerId);
        findPlayerOrThrow(playerId);
        GameRating gameRating = findOrThrow(rawgId,playerId);
        mapper.updateFromCommand(command, gameRating);
        log.info("Updated game rating {} for player {}", gameRating.getId(),playerId);
        return mapper.toDto(gameRating);
    }

    @Transactional
    public void delete(Long playerId, Long rawgId) {
        GameRating gameRating = findOrThrow(rawgId,playerId);
        repository.delete(gameRating);
    }

    private GameRating findOrThrow(Long rawgId, Long playerId) {
        return repository.findByPlayerIdAndRawgId(playerId,rawgId).orElseThrow(
                () -> {
                    log.error("Game rating for player {} with rawid {} not found ",playerId,rawgId);
                    return new GameRatingNotFoundException(playerId,rawgId);
                });
    }

    private Player findPlayerOrThrow(Long id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new PlayerNotFoundException(id));
    }
}
