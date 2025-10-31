package com.example.entity;
import com.example.entity.embeddable.UserLocationId;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "userLocation")
public class UserLocation {

    @EmbeddedId
    private UserLocationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("user_id")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY) @MapsId("location_id")
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Builder.Default private boolean is_primary = false;
    private LocalDateTime verified_at;

    @CreationTimestamp
    private LocalDateTime created_at;
}