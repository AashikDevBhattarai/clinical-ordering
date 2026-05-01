package com.example.clinicalordering.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReportDraftUpdateRequest(
        @NotNull(message = "Findings are required.")
        @Size(max = 10000, message = "Findings must be 10000 characters or fewer.")
        String findings
) {
}
