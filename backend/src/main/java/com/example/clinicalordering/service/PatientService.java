package com.example.clinicalordering.service;

import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.mapper.PatientMapper;
import com.example.clinicalordering.dto.PatientRequest;
import com.example.clinicalordering.dto.PatientResponse;
import com.example.clinicalordering.repository.PatientRepository;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;
    private final ClinicalLookupService clinicalLookupService;

    public PatientService(
            PatientRepository patientRepository,
            PatientMapper patientMapper,
            ClinicalLookupService clinicalLookupService
    ) {
        this.patientRepository = patientRepository;
        this.patientMapper = patientMapper;
        this.clinicalLookupService = clinicalLookupService;
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> findPatients(String query) {
        List<Patient> patients = (query == null || query.isBlank())
                ? patientRepository.findAll().stream()
                .sorted((left, right) -> {
                    int byLastName = left.getLastName().compareToIgnoreCase(right.getLastName());
                    if (byLastName != 0) {
                        return byLastName;
                    }
                    return left.getFirstName().compareToIgnoreCase(right.getFirstName());
                })
                .toList()
                : patientRepository.search(query.trim());

        return patients.stream().map(patientMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatient(Long id) {
        return patientMapper.toResponse(clinicalLookupService.getPatient(id));
    }

    public PatientResponse createPatient(PatientRequest request) {
        Patient patient = patientMapper.toNewEntity(request);
        if (patientRepository.existsByMedicalRecordNumberIgnoreCase(patient.getMedicalRecordNumber())) {
            throw new BusinessRuleException("A patient with that MRN already exists.");
        }

        try {
            return patientMapper.toResponse(patientRepository.saveAndFlush(patient));
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessRuleException("A patient with that MRN already exists.");
        }
    }

}
