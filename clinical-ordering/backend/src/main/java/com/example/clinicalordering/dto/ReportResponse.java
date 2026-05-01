package com.example.clinicalordering.dto;

import com.example.clinicalordering.domain.OrderStatus;
import com.example.clinicalordering.domain.ReportStatus;
import java.time.LocalDateTime;

public record ReportResponse(
        Long id,
        Long orderId,
        Long patientId,
        String patientDisplayName,
        ReportStatus status,
        OrderStatus orderStatus,
        String findings,
        String amendmentReason,
        String cancelReason,
        LocalDateTime finalizedAt,
        LocalDateTime amendedAt,
        LocalDateTime canceledAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

