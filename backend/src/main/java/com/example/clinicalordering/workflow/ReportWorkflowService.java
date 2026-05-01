package com.example.clinicalordering.workflow;

import com.example.clinicalordering.domain.OrderStatus;
import com.example.clinicalordering.domain.Report;
import com.example.clinicalordering.domain.ReportStatus;
import com.example.clinicalordering.service.BusinessRuleException;
import java.time.Clock;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

@Service
public class ReportWorkflowService {

    private final Clock clock;

    public ReportWorkflowService(Clock clock) {
        this.clock = clock;
    }

    public void updateDraft(Report report, String findings) {
        assertStatus(report, ReportStatus.DRAFT, "Only draft reports can be edited directly.");
        report.setFindings(normalizeText(findings));
    }

    public void finalizeReport(Report report, String findings) {
        assertStatus(report, ReportStatus.DRAFT, "Only draft reports can be finalized.");
        report.setFindings(normalizeText(findings));
        report.setStatus(ReportStatus.FINALIZED);
        report.setFinalizedAt(now());
        report.getStudyOrder().setStatus(OrderStatus.FINALIZED);
    }

    public void amendReport(Report report, String findings, String amendmentReason) {
        assertStatus(report, ReportStatus.FINALIZED, "Only finalized reports can be amended.");

        String normalizedReason = normalizeText(amendmentReason).trim();
        if (normalizedReason.isEmpty()) {
            throw new BusinessRuleException("Amendment reason is required.");
        }

        report.setFindings(normalizeText(findings));
        report.setAmendmentReason(normalizedReason);
        report.setStatus(ReportStatus.AMENDED);
        report.setAmendedAt(now());
        report.getStudyOrder().setStatus(OrderStatus.AMENDED);
    }

    public void cancelReport(Report report, String cancelReason) {
        if (report.getStatus() == ReportStatus.CANCELED) {
            throw new BusinessRuleException("Report is already canceled.");
        }

        String normalizedReason = normalizeText(cancelReason).trim();
        if (normalizedReason.isEmpty()) {
            throw new BusinessRuleException("Cancel reason is required.");
        }

        report.setCancelReason(normalizedReason);
        report.setStatus(ReportStatus.CANCELED);
        report.setCanceledAt(now());
        report.getStudyOrder().setStatus(OrderStatus.CANCELED);
    }

    private void assertStatus(Report report, ReportStatus expectedStatus, String message) {
        if (report.getStatus() != expectedStatus) {
            throw new BusinessRuleException(message);
        }
    }

    private LocalDateTime now() {
        return LocalDateTime.now(clock);
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }
}

