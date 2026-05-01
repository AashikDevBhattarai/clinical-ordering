package com.example.clinicalordering.factory;

import com.example.clinicalordering.domain.OrderStatus;
import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.domain.Report;
import com.example.clinicalordering.domain.ReportStatus;
import com.example.clinicalordering.domain.StudyOrder;
import com.example.clinicalordering.dto.OrderRequest;
import org.springframework.stereotype.Component;

@Component
public class StudyOrderFactory {

    public StudyOrder create(OrderRequest request, Patient patient) {
        StudyOrder order = new StudyOrder();
        order.setPatient(patient);
        order.setStudyType(request.studyType());
        order.setPriority(request.priority());
        order.setOrderReason(request.orderReason().trim());
        order.setOrderedBy(request.orderedBy().trim());
        order.setStatus(OrderStatus.ORDERED);

        Report report = new Report();
        report.setStatus(ReportStatus.DRAFT);
        report.setFindings("");
        order.attachReport(report);

        return order;
    }
}

