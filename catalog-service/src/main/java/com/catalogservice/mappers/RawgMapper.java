package com.catalogservice.mappers;

import com.catalogservice.dto.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RawgMapper {
    @Mapping(target = "rawgId", source = "id")
    @Mapping(target = "imageUrl", source = "background_image")
    GameDetailsDto toGameDetailsDto(RawgGameDto dto);

    @Mapping(target = "rawgId", source = "id")
    @Mapping(target = "imageUrl", source = "background_image")
    GameDto toGameDto(RawgGameDto dto);

    GamePageResponse toGamePage(RawgPageResponse pageResponse);
}
