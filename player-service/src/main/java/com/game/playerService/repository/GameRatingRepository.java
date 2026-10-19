package com.game.playerService.repository;

import com.game.playerService.model.GameRating;
import com.game.playerService.model.Player;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameRatingRepository extends JpaRepository<GameRating,Long> {
    boolean existsByPlayerIdAndRawgId(Long playerId, Long rawgId);
    Page<GameRating> findAllByPlayer(Player player, Pageable pageable);
    Optional<GameRating> findByPlayerIdAndRawgId(Long playerId, Long rawgId);
}
