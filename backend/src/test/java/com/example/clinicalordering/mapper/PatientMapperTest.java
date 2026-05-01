package com.example.clinicalordering.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.dto.PatientRequest;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class PatientMapperTest {

    private final PatientMapper patientMapper = new PatientMapper();

    @Test
    void toNewEntityTrimsAndNormalizesOptionalFields() {
        PatientRequest request = new PatientRequest(
                "Ada",
                "Lovelace",
                "MRN-3001",
                LocalDate.of(1984, 12, 10),
                " F ",
                " ",
                "ada@example.test"
        );

        Patient patient = patientMapper.toNewEntity(request);

        assertThat(patient.getFirstName()).isEqualTo("Ada");
        assertThat(patient.getLastName()).isEqualTo("Lovelace");
        assertThat(patient.getMedicalRecordNumber()).isEqualTo("MRN-3001");
        assertThat(patient.getSex()).isEqualTo("F");
        assertThat(patient.getPhoneNumber()).isNull();
        assertThat(patient.getEmail()).isEqualTo("ada@example.test");
    }

    @Test
    void toDisplayNameFormatsPatientForUiUse() {
        Patient patient = new Patient();
        patient.setFirstName("Grace");
        patient.setLastName("Hopper");
        patient.setMedicalRecordNumber("MRN-3002");

        assertThat(patientMapper.toDisplayName(patient))
                .isEqualTo("Hopper, Grace (MRN-3002)");
    }
}

