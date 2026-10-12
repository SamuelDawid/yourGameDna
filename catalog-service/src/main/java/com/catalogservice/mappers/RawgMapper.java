package com.catalogservice.mappers;

import com.catalogservice.dto.*;
import com.game.dto.PageDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RawgMapper {
    @Mapping(target = "rawgId", source = "id")
    GameDetailsDto toGameDetailsDto(RawgGameDto dto);

    @Mapping(target = "rawgId", source = "id")
    GameDto toGameDto(RawgGameDto dto);

    @Mapping(target = "content", source = "pageResponse.results")
    @Mapping(target = "totalElements", source = "pageResponse.count")
    @Mapping(target = "totalPages",
            expression = "java((int) Math.ceil((double) pageResponse.count() / pageable.getPageSize()))")
    PageDto<GameDto> toGamePage(RawgPageResponse<RawgGameDto> pageResponse, Pageable pageable);

    default List<String> platforms(List<RawgPlatformDto> dto) {
        if (dto == null) {
            return List.of();
        }
        return dto.stream().map(d -> d.platform().name()).toList();
    }

    default List<String> genres(List<RawgGenresDto> dto) {
        if (dto == null) {
            return List.of();
        }
        return dto.stream().map(RawgGenresDto::name).toList();
    }
}
