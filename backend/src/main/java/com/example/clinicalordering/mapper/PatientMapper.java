package com.example.clinicalordering.mapper;

import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.dto.PatientRequest;
import com.example.clinicalordering.dto.PatientResponse;
import org.springframework.stereotype.Component;

@Component
public class PatientMapper {

    public Patient toNewEntity(PatientRequest request) {
        Patient patient = new Patient();
        patient.setFirstName(request.firstName().trim());
        patient.setLastName(request.lastName().trim());
        patient.setMedicalRecordNumber(request.medicalRecordNumber().trim());
        patient.setDateOfBirth(request.dateOfBirth());
        patient.setSex(trimToNull(request.sex()));
        patient.setPhoneNumber(trimToNull(request.phoneNumber()));
        patient.setEmail(trimToNull(request.email()));
        return patient;
    }

    public PatientResponse toResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getMedicalRecordNumber(),
                patient.getDateOfBirth(),
                patient.getSex(),
                patient.getPhoneNumber(),
                patient.getEmail(),
                patient.getCreatedAt(),
                patient.getUpdatedAt()
        );
    }

    public String toDisplayName(Patient patient) {
        return patient.getLastName() + ", " + patient.getFirstName() + " (" + patient.getMedicalRecordNumber() + ")";
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

