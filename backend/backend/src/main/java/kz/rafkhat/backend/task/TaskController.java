package kz.rafkhat.backend.task;

import jakarta.validation.Valid;
import kz.rafkhat.backend.user.User;
import kz.rafkhat.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository tasks;
    private final UserRepository users;

    @GetMapping
    public List<Task> list(Authentication auth) {
        return tasks.findByOwnerEmailOrderByCreatedAtDesc(auth.getName());
    }

    @PostMapping
    public ResponseEntity<Task> create(@Valid @RequestBody TaskRequest req, Authentication auth) {
        User owner = users.findByEmail(auth.getName()).orElseThrow();
        Task task = new Task();
        task.setTitle(req.title());
        task.setDescription(req.description());
        task.setOwner(owner);
        return ResponseEntity.status(HttpStatus.CREATED).body(tasks.save(task));
    }

    @PatchMapping("/{id}")
    public Task updateStatus(@PathVariable Long id, @Valid @RequestBody TaskStatusRequest req,
                             Authentication auth) {
        Task task = tasks.findByIdAndOwnerEmail(id, auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        task.setStatus(req.status());
        return tasks.save(task);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        Task task = tasks.findByIdAndOwnerEmail(id, auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        tasks.delete(task);
    }
}