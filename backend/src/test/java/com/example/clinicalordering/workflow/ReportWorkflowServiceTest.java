package com.example.clinicalordering.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.clinicalordering.domain.OrderStatus;
import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.domain.Report;
import com.example.clinicalordering.domain.ReportStatus;
import com.example.clinicalordering.domain.StudyOrder;
import com.example.clinicalordering.service.BusinessRuleException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class ReportWorkflowServiceTest {

    private final ReportWorkflowService reportWorkflowService = new ReportWorkflowService(
            Clock.fixed(Instant.parse("2026-04-28T12:00:00Z"), ZoneOffset.UTC)
    );

    @Test
    void finalizeDraftSynchronizesOrderStatus() {
        Report report = draftReport();

        reportWorkflowService.finalizeReport(report, "Normal LV function.");

        assertThat(report.getStatus()).isEqualTo(ReportStatus.FINALIZED);
        assertThat(report.getStudyOrder().getStatus()).isEqualTo(OrderStatus.FINALIZED);
        assertThat(report.getFindings()).isEqualTo("Normal LV function.");
        assertThat(report.getFinalizedAt()).isNotNull();
    }

    @Test
    void amendRequiresFinalizedReport() {
        Report report = draftReport();

        assertThatThrownBy(() -> reportWorkflowService.amendReport(
                report,
                "Updated findings",
                "Correction"
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Only finalized reports can be amended");
    }

    private Report draftReport() {
        Patient patient = new Patient();
        patient.setId(10L);
        patient.setFirstName("Ada");
        patient.setLastName("Lovelace");
        patient.setMedicalRecordNumber("MRN-1001");

        StudyOrder order = new StudyOrder();
        order.setId(20L);
        order.setPatient(patient);
        order.setStatus(OrderStatus.ORDERED);

        Report report = new Report();
        report.setId(30L);
        report.setStatus(ReportStatus.DRAFT);
        report.setStudyOrder(order);
        report.setFindings("");
        order.attachReport(report);
        return report;
    }
}
