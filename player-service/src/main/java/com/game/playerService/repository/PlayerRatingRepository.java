package com.game.playerService.repository;

import com.game.playerService.model.GameRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRatingRepository extends JpaRepository<GameRating,Long> {
    boolean existsByPlayerIdAndRawgId(Long playerId, Long rawgId);
}
