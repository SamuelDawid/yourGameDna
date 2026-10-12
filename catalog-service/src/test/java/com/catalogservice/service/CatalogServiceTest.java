package com.catalogservice.service;

import com.catalogservice.dto.*;
import com.catalogservice.exceptions.CatalogServiceException;
import com.catalogservice.mappers.RawgMapper;
import com.catalogservice.rawgClient.RawgClient;
import com.game.dto.PageDto;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CatalogServiceTest {

    RawgClient client;
    RawgMapper mapper;
    CatalogService service;
    List<RawgGameDto> threeRawgGameDto;
    @BeforeEach
    void setUp(){
        this.client = Mockito.mock(RawgClient.class);
        this.mapper = Mappers.getMapper(RawgMapper.class);
        this.service = new CatalogService(client,mapper);
        threeRawgGameDto = List.of(
                new RawgGameDto(1L,"GameOne", LocalDate.of(2020,10,10),"someUrl1","3.0","some Description",List.of(new RawgGenresDto("Action"),new RawgGenresDto("Fantasy")),List.of(new RawgPlatformDto(new PlatformDto("PC")))),
                new RawgGameDto(1L,"GameOne", LocalDate.of(2022,10,10),"someUrl2","4.0","some Description for game two",List.of(new RawgGenresDto("Action"),new RawgGenresDto("Drama")),List.of(new RawgPlatformDto(new PlatformDto("XBOX")))),
                new RawgGameDto(1L,"GameOne", LocalDate.of(2023,10,10),"someUrl3","5.0","some Description for game three",List.of(new RawgGenresDto("Sci-fi"),new RawgGenresDto("Fantasy")),List.of(new RawgPlatformDto(new PlatformDto("PLAYSTATION")))
        ));

    }

    @Test
    void findGameByName_WhenNameMatches_ShouldReturnPageWithThreeGames(){
        //given
        String name = "Game";
        Pageable pageable = PageRequest.of(0,20);
        RawgPageResponse<RawgGameDto> expected = new RawgPageResponse<>(3,null,null,threeRawgGameDto);
        when(client.getGames(name,1,pageable.getPageSize())).thenReturn(expected);

        //When
        PageDto<GameDto> result = service.findGameByName(name,pageable);
        //Then
        assertAll(
                () -> assertEquals(0,result.pageNumber()),
                () -> assertEquals(3,result.totalElements()),
                () -> assertEquals(20,result.pageSize()),
                () -> assertEquals(1,result.totalPages()),
                () -> assertEquals(3, result.content().size()),
                () -> assertEquals(1L,result.content().getFirst().rawgId()),
                () -> assertEquals("GameOne",result.content().getFirst().name()),
                () -> assertEquals("someUrl1",result.content().getFirst().imageUrl()),
                () -> assertEquals("4.0",result.content().get(1).rating()),
                () -> assertEquals(LocalDate.of(2023,10,10),result.content().getLast().released())
        );
        verify(client).getGames(name, 1, pageable.getPageSize());
    }
    @Test
    void findGameById_whenGameExists_ShouldReturnMatchingDto(){
        //given
        Long id = 1L;
        RawgGameDto expected = threeRawgGameDto.getFirst();
        when(client.getGameById(id)).thenReturn(expected);
        //When
        GameDetailsDto result = service.findGameById(id);
        //Then
        assertAll(
                () -> assertEquals(expected.id(),result.rawgId()),
                () -> assertEquals(expected.name(),result.name()),
                () -> assertEquals(LocalDate.of(2020,10,10),result.released()),
                () -> assertEquals(expected.imageUrl(),result.imageUrl()),
                () -> assertEquals(expected.rating(),result.rating()),
                () -> assertEquals(expected.description(),result.description()),
                () -> assertEquals(List.of("Action", "Fantasy"),result.genres()),
                () -> assertEquals(List.of("PC"),result.platforms())
        );
        verify(client).getGameById(id);
    }
    @Test
    void findGameById_WhenGameDoesNotExists_ShouldThrowCatalogServiceException(){
        //given
        Long id = 1L;
        when(client.getGameById(id)).thenThrow(new CatalogServiceException("Resource does not exists",HttpStatus.NOT_FOUND));
        //When + Then
        CatalogServiceException exception = assertThrows(CatalogServiceException.class,
                () -> service.findGameById(id));

        assertEquals(HttpStatus.NOT_FOUND,exception.getStatus());
        assertEquals("Resource does not exists",exception.getMessage());
    }
}