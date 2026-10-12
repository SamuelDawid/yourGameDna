package com.catalogservice.mappers;

import com.catalogservice.dto.*;
import com.game.dto.PageDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Pageable;

@Mapper(componentModel = "spring")
public interface RawgMapper {
    @Mapping(target = "rawgId", source = "id")
    @Mapping(target = "imageUrl", source = "background_image")
    GameDetailsDto toGameDetailsDto(RawgGameDto dto);

    @Mapping(target = "rawgId", source = "id")
    @Mapping(target = "imageUrl", source = "background_image")
    GameDto toGameDto(RawgGameDto dto);
    @Mapping(target = "content", source = "pageResponse.results")
    @Mapping(target = "totalElements", source = "pageResponse.count")
    @Mapping(target = "totalPages",
            expression = "java((int) Math.ceil((double) pageResponse.count() / pageable.getPageSize()))")
    PageDto<GameDto> toGamePage(RawgPageResponse<RawgGameDto> pageResponse, Pageable pageable);
}
