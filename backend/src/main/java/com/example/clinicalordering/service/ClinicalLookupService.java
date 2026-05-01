package com.example.clinicalordering.service;

import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.domain.Report;
import com.example.clinicalordering.domain.StudyOrder;
import com.example.clinicalordering.repository.PatientRepository;
import com.example.clinicalordering.repository.ReportRepository;
import com.example.clinicalordering.repository.StudyOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ClinicalLookupService {

    private final PatientRepository patientRepository;
    private final StudyOrderRepository studyOrderRepository;
    private final ReportRepository reportRepository;

    public ClinicalLookupService(
            PatientRepository patientRepository,
            StudyOrderRepository studyOrderRepository,
            ReportRepository reportRepository
    ) {
        this.patientRepository = patientRepository;
        this.studyOrderRepository = studyOrderRepository;
        this.reportRepository = reportRepository;
    }

    public Patient getPatient(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient " + id + " was not found."));
    }

    public StudyOrder getOrder(Long id) {
        return studyOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order " + id + " was not found."));
    }

    public Report getReport(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report " + id + " was not found."));
    }
}

