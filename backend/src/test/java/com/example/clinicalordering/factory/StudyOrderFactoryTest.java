package com.example.clinicalordering.factory;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.clinicalordering.domain.OrderPriority;
import com.example.clinicalordering.domain.OrderStatus;
import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.domain.ReportStatus;
import com.example.clinicalordering.domain.StudyType;
import com.example.clinicalordering.dto.OrderRequest;
import org.junit.jupiter.api.Test;

class StudyOrderFactoryTest {

    private final StudyOrderFactory studyOrderFactory = new StudyOrderFactory();

    @Test
    void createInitializesOrderAndDraftReport() {
        Patient patient = new Patient();
        patient.setId(7L);
        patient.setFirstName("Ada");
        patient.setLastName("Lovelace");
        patient.setMedicalRecordNumber("MRN-777");

        OrderRequest request = new OrderRequest(
                7L,
                StudyType.ECHOCARDIOGRAM,
                OrderPriority.STAT,
                " Acute dyspnea and concern for tamponade ",
                " Dr. Hunt "
        );

        var order = studyOrderFactory.create(request, patient);

        assertThat(order.getPatient()).isSameAs(patient);
        assertThat(order.getStudyType()).isEqualTo(StudyType.ECHOCARDIOGRAM);
        assertThat(order.getPriority()).isEqualTo(OrderPriority.STAT);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.ORDERED);
        assertThat(order.getOrderReason()).isEqualTo("Acute dyspnea and concern for tamponade");
        assertThat(order.getOrderedBy()).isEqualTo("Dr. Hunt");
        assertThat(order.getReport()).isNotNull();
        assertThat(order.getReport().getStatus()).isEqualTo(ReportStatus.DRAFT);
        assertThat(order.getReport().getFindings()).isEmpty();
        assertThat(order.getReport().getStudyOrder()).isSameAs(order);
    }
}

