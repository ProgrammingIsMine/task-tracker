package kz.rafkhat.backend.task;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    java.util.List<Task> findByOwnerEmailOrderByCreatedAtDesc(String email);
    java.util.Optional<Task> findByIdAndOwnerEmail(Long id, String email);
}
