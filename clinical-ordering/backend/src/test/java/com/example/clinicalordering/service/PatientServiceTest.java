package com.example.clinicalordering.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.clinicalordering.mapper.PatientMapper;
import com.example.clinicalordering.dto.PatientRequest;
import com.example.clinicalordering.repository.PatientRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ClinicalLookupService clinicalLookupService;

    @Spy
    private PatientMapper patientMapper;

    @InjectMocks
    private PatientService patientService;

    @Test
    void createPatientRejectsDuplicateMrnBeforeSave() {
        PatientRequest request = new PatientRequest(
                "Cristina",
                "Yang",
                "MRN-5001",
                LocalDate.of(1985, 1, 1),
                null,
                null,
                null
        );

        when(patientRepository.existsByMedicalRecordNumberIgnoreCase("MRN-5001")).thenReturn(true);

        assertThatThrownBy(() -> patientService.createPatient(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already exists");

        verify(patientRepository, never()).saveAndFlush(org.mockito.ArgumentMatchers.any());
    }
}

