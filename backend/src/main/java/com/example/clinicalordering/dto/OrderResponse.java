package com.example.clinicalordering.dto;

import com.example.clinicalordering.domain.OrderPriority;
import com.example.clinicalordering.domain.OrderStatus;
import com.example.clinicalordering.domain.ReportStatus;
import com.example.clinicalordering.domain.StudyType;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        Long patientId,
        String patientDisplayName,
        StudyType studyType,
        OrderPriority priority,
        String orderReason,
        String orderedBy,
        OrderStatus status,
        Long reportId,
        ReportStatus reportStatus,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

