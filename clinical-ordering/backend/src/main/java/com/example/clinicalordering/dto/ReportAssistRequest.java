package com.example.clinicalordering.dto;

import jakarta.validation.constraints.Size;

public record ReportAssistRequest(
        @Size(max = 10000, message = "Current findings must be 10000 characters or fewer.")
        String currentFindings,
        @Size(max = 512, message = "Assistant instruction must be 512 characters or fewer.")
        String instruction
) {
}
