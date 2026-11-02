package kz.rafkhat.backend.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskRequest(
        @NotBlank @Size(max = 200) String title,
        String description
) {
}
