package com.game.playerService.model;

import com.game.playerService.dto.UpdatePlayerCommand;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
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
    @CreationTimestamp
    private LocalDateTime createdAt;


    public Player update(UpdatePlayerCommand command){
        if(command.email() != null){
            this.email = command.email();
        }
        if(command.userName() != null){
            this.userName = command.userName();
        }
        if(command.bio() != null){
            this.bio = command.bio();
        }
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Player other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
