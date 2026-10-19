package com.game.playerService.model;

import com.game.playerService.enums.GameStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "game_rating",uniqueConstraints = @UniqueConstraint(name = "uk_game_rating_player_game",columnNames = {"player_id","rawg_id"}))
public class GameRating {
    @Setter(AccessLevel.NONE)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String gameName;
    @Setter(AccessLevel.NONE)
    @Column(name = "rawg_id",nullable = false)
    private Long rawgId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameStatus status = GameStatus.NONE;
    @Min(1) @Max(10)
    @Column(nullable = true)
    private Integer rating;
    @Min(1) @Max(10)
    private Integer gamePlayRating;
    @Min(1) @Max(10)
    private Integer graphicsRating;
    @Min(1) @Max(10)
    private Integer storyRating;
    @Min(1) @Max(10)
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
        if (!(o instanceof GameRating entity)) return false;
        return id != null && id.equals(entity.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
