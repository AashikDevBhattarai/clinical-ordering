package com.example.clinicalordering.mapper;

import com.example.clinicalordering.domain.Report;
import com.example.clinicalordering.domain.StudyOrder;
import com.example.clinicalordering.dto.OrderResponse;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    private final PatientMapper patientMapper;

    public OrderMapper(PatientMapper patientMapper) {
        this.patientMapper = patientMapper;
    }

    public OrderResponse toResponse(StudyOrder order) {
        Report report = order.getReport();
        return new OrderResponse(
                order.getId(),
                order.getPatient().getId(),
                patientMapper.toDisplayName(order.getPatient()),
                order.getStudyType(),
                order.getPriority(),
                order.getOrderReason(),
                order.getOrderedBy(),
                order.getStatus(),
                report != null ? report.getId() : null,
                report != null ? report.getStatus() : null,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}

