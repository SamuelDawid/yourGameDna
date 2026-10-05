package mappers;

import dto.GameDto;
import dto.RawgGameResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RawgResponseMapper {
    @Mapping(target = "rawgId",source = "id")
    @Mapping(target = "imageUrl",source = "background_image")
    GameDto toGameDto(RawgGameResponseDto dto);

}
