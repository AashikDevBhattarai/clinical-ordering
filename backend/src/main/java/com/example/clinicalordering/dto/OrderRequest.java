package com.example.clinicalordering.dto;

import com.example.clinicalordering.domain.OrderPriority;
import com.example.clinicalordering.domain.StudyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderRequest(
        @NotNull(message = "Patient is required.") Long patientId,
        @NotNull(message = "Study type is required.") StudyType studyType,
        @NotNull(message = "Priority is required.") OrderPriority priority,
        @NotBlank(message = "Clinical reason is required.")
        @Size(min = 5, max = 256, message = "Clinical reason must be between 5 and 256 characters.")
        String orderReason,
        @NotBlank(message = "Ordering provider is required.")
        @Size(min = 3, max = 128, message = "Ordering provider must be between 3 and 128 characters.")
        String orderedBy
) {
}
