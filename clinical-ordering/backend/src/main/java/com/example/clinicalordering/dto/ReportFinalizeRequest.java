package com.example.clinicalordering.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReportFinalizeRequest(
        @NotBlank(message = "Findings are required to finalize a report.")
        @Size(max = 10000, message = "Findings must be 10000 characters or fewer.")
        String findings
) {
}
