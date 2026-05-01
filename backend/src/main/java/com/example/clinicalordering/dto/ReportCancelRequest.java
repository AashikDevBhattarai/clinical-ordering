package com.example.clinicalordering.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReportCancelRequest(
        @NotBlank(message = "Cancel reason is required.")
        @Size(max = 256, message = "Cancel reason must be 256 characters or fewer.")
        String cancelReason
) {
}
