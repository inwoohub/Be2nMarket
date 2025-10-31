package com.example.entity.embeddable;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
@Embeddable
public class UserLocationId implements Serializable {
    private Long user_id;
    private Long location_id;
}