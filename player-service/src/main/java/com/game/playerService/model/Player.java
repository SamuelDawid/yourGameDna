package com.game.playerService.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false,unique = true)
    @Length(min = 3,max = 30)
    private String userName;
    @Column(nullable = false,unique = true)
    private String email;
    @Length(max = 2000)
    private String bio;
    @Setter(AccessLevel.NONE)
    private LocalDateTime createdAt;
}
