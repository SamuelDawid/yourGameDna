package com.game.playerService.repository;

import com.game.playerService.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRepository extends JpaRepository<Player,Long > {
    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);
}
