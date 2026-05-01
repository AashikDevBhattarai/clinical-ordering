package com.example.clinicalordering.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReportAmendRequest(
        @NotBlank(message = "Findings are required to amend a report.")
        @Size(max = 10000, message = "Findings must be 10000 characters or fewer.")
        String findings,
        @NotBlank(message = "Amendment reason is required.")
        @Size(max = 256, message = "Amendment reason must be 256 characters or fewer.")
        String amendmentReason
) {
}
