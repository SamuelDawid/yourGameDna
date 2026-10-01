package com.game.playerService.repository;

import com.game.playerService.model.Player;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class PlayerRepositoryTest {
    @Autowired
    PlayerRepository repository;
    private Player player;

    @BeforeEach
    public void setUp() {
        player = new Player("testUser", "testemail@example.com", "some bio");
        repository.save(player);
    }


    @Test
    void existsByUserName_WhenPlayerExists_ShouldReturnTrue() {
        //Given
        String userName = "testUser";
        //When + Then
        assertTrue(repository.existsByUserName(userName));
    }

    @Test
    void existsByUserName_WhenPlayerDoesNotExists_ShouldReturnFalse() {
        //Given
        String userName = "testUsers";
        //When + Then
        assertFalse(repository.existsByUserName(userName));
    }

    @Test
    void existsByEmail_WhenPlayerDoesExists_ShouldReturnTrue() {
        //Given
        String email = "testemail@example.com";
        //When + Then
        assertTrue(repository.existsByEmail(email));
    }
    
    @Test
    void existsByEmail_WhenPlayerDoesNotExists_ShouldReturnFalse() {
        //Given
        String email = "testUsers@example.com";
        //When + Then
        assertFalse(repository.existsByEmail(email));
    }
}