package com.example.clinicalordering.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PatientResponse(
        Long id,
        String firstName,
        String lastName,
        String medicalRecordNumber,
        LocalDate dateOfBirth,
        String sex,
        String phoneNumber,
        String email,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

