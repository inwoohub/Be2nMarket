package com.example.entity.embeddable;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
@Embeddable
public class ChatParticipantId implements Serializable {
    private Long chatroom_id;
    private Long user_id;
}