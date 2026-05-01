package com.example.clinicalordering.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.clinicalordering.domain.OrderPriority;
import com.example.clinicalordering.domain.OrderStatus;
import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.domain.Report;
import com.example.clinicalordering.domain.ReportStatus;
import com.example.clinicalordering.domain.StudyOrder;
import com.example.clinicalordering.domain.StudyType;
import org.junit.jupiter.api.Test;

class OrderMapperTest {

    private final OrderMapper orderMapper = new OrderMapper(new PatientMapper());

    @Test
    void toResponseIncludesReportState() {
        Patient patient = new Patient();
        patient.setId(11L);
        patient.setFirstName("Meredith");
        patient.setLastName("Grey");
        patient.setMedicalRecordNumber("MRN-4001");

        StudyOrder order = new StudyOrder();
        order.setId(55L);
        order.setPatient(patient);
        order.setStudyType(StudyType.ECHOCARDIOGRAM);
        order.setPriority(OrderPriority.URGENT);
        order.setOrderReason("Concern for valvular disease");
        order.setOrderedBy("Dr. Shepherd");
        order.setStatus(OrderStatus.ORDERED);

        Report report = new Report();
        report.setId(77L);
        report.setStatus(ReportStatus.DRAFT);
        order.attachReport(report);

        var response = orderMapper.toResponse(order);

        assertThat(response.id()).isEqualTo(55L);
        assertThat(response.patientDisplayName()).isEqualTo("Grey, Meredith (MRN-4001)");
        assertThat(response.reportId()).isEqualTo(77L);
        assertThat(response.reportStatus()).isEqualTo(ReportStatus.DRAFT);
        assertThat(response.status()).isEqualTo(OrderStatus.ORDERED);
    }
}

