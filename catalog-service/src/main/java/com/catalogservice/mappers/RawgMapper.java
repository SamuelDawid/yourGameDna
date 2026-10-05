package com.catalogservice.mappers;

import com.catalogservice.dto.GameDto;
import com.catalogservice.dto.GamePageResponse;
import com.catalogservice.dto.RawgGameDto;
import com.catalogservice.dto.RawgPageResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RawgMapper {
    @Mapping(target = "rawgId", source = "id")
    @Mapping(target = "imageUrl",source = "background_image")
    GameDto toGameDto(RawgGameDto dto);

    GamePageResponse toGamePage(RawgPageResponse pageResponse);
}
