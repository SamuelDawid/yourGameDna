package com.game.playerService.mapper;

import com.game.playerService.dto.CreatePlayerCommand;
import com.game.playerService.dto.PlayerDto;
import com.game.playerService.dto.UpdatePlayerCommand;
import com.game.playerService.model.Player;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PlayerMapper {
    PlayerDto toDto(Player player);

    @Mapping(target = "id", ignore = true)
    Player toEntity(CreatePlayerCommand command);
    @BeanMapping(nullValuePropertyMappingStrategy  =  NullValuePropertyMappingStrategy.IGNORE)
    void update(@MappingTarget Player player, UpdatePlayerCommand command);
}
