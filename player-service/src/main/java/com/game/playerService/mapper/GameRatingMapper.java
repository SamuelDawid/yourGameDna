package com.game.playerService.mapper;

import com.game.playerService.dto.CreateGameRatingCommand;
import com.game.playerService.dto.GameRatingDto;
import com.game.playerService.dto.UpdateGameRatingCommand;
import com.game.playerService.model.GameRating;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface GameRatingMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "player", ignore = true)
    @Mapping(target = "gameName", ignore = true)
    GameRating toEntity(CreateGameRatingCommand command);

    @Mapping(target = "playerId",source = "player.id")
    GameRatingDto toDto(GameRating gameRating);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "player", ignore = true)
    @Mapping(target = "rawgId", ignore = true)
    @Mapping(target = "gameName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateFromCommand(UpdateGameRatingCommand command, @MappingTarget GameRating gameRating);
}
