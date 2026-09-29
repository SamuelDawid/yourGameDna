package com.game.playerService.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
@ToString
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.PROTECTED)
    private Long id;
    @Column(nullable = false, unique = true)
    private String userName;
    @Column(nullable = false, unique = true)
    private String email;
    private String bio;
    @Setter(AccessLevel.NONE)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Player other)) return false;
        return id != null && id.equals(other.getId());
    }

    public Player(String userName, String email, String bio, LocalDateTime createdAt) {
        this.userName = userName;
        this.email = email;
        this.bio = bio;
        this.createdAt = createdAt;
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
