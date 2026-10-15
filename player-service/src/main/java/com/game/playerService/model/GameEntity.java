package com.game.playerService.model;

import com.game.playerService.enums.GameStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "game_entity")
public class GameEntity {
    @Setter(AccessLevel.NONE)
    @Id
    @GeneratedValue
    private Long id;
    @Column(nullable = false)
    private String gameName;
    @Setter(AccessLevel.NONE)
    @Column(nullable = false)
    private Long rawgId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameStatus status = GameStatus.NONE;
    @Size(min = 1, max = 10)
    private Integer rating;
    @Size(min = 1, max = 10)
    private Integer gamePlayRating;
    @Size(min = 1, max = 10)
    private Integer graphicsRating;
    @Size(min = 1, max = 10)
    private Integer storyRating;
    @Size(min = 1, max = 10)
    private Integer monetizationRating;
    @Size(max = 2000)
    private String review;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false, foreignKey = @ForeignKey(name = "fk_game_player"))
    private Player player;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GameEntity entity)) return false;
        return id != null && id.equals(entity.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
