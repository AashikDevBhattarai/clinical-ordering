package com.example.clinicalordering.dto;

public record ReportAssistResponse(
        Long reportId,
        String suggestedFindings,
        String safetyNote,
        String provider
) {
}
