package kz.rafkhat.backend.task;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;



import java.time.Instant;

@Entity
@Table(name = "tasks")
@Getter
@Setter

public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private kz.rafkhat.backend.user.User owner;

    @Column(nullable = false, length = 200)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status = TaskStatus.TODO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
