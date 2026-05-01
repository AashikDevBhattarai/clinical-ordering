package com.example.clinicalordering.mapper;

import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.domain.Report;
import com.example.clinicalordering.domain.StudyOrder;
import com.example.clinicalordering.dto.ReportResponse;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    private final PatientMapper patientMapper;

    public ReportMapper(PatientMapper patientMapper) {
        this.patientMapper = patientMapper;
    }

    public ReportResponse toResponse(Report report) {
        StudyOrder order = report.getStudyOrder();
        Patient patient = order.getPatient();
        return new ReportResponse(
                report.getId(),
                order.getId(),
                patient.getId(),
                patientMapper.toDisplayName(patient),
                report.getStatus(),
                order.getStatus(),
                report.getFindings(),
                report.getAmendmentReason(),
                report.getCancelReason(),
                report.getFinalizedAt(),
                report.getAmendedAt(),
                report.getCanceledAt(),
                report.getCreatedAt(),
                report.getUpdatedAt()
        );
    }
}

