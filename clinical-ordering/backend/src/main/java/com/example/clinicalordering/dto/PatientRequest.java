package com.example.clinicalordering.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PatientRequest(
        @NotBlank(message = "First name is required.")
        @Size(max = 64, message = "First name must be 64 characters or fewer.")
        @Pattern(regexp = "^[A-Za-z .'-]{1,64}$", message = "First name contains unsupported characters.")
        String firstName,
        @NotBlank(message = "Last name is required.")
        @Size(max = 64, message = "Last name must be 64 characters or fewer.")
        @Pattern(regexp = "^[A-Za-z .'-]{1,64}$", message = "Last name contains unsupported characters.")
        String lastName,
        @NotBlank(message = "MRN is required.")
        @Size(min = 3, max = 32, message = "MRN must be between 3 and 32 characters.")
        @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "MRN may contain only letters, numbers, and dashes.")
        String medicalRecordNumber,
        @PastOrPresent(message = "Date of birth cannot be in the future.")
        LocalDate dateOfBirth,
        @Size(max = 16, message = "Sex must be 16 characters or fewer.") String sex,
        @Size(max = 32, message = "Phone number must be 32 characters or fewer.") String phoneNumber,
        @Email(message = "Email must be a valid email address.")
        @Size(max = 128, message = "Email must be 128 characters or fewer.")
        String email
) {
}
