package com.example.clinicalordering.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.clinicalordering.domain.Patient;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class PatientRepositoryIT {

    @Autowired
    private PatientRepository patientRepository;

    @BeforeEach
    void setUp() {
        Patient ada = new Patient();
        ada.setFirstName("Ada");
        ada.setLastName("Lovelace");
        ada.setMedicalRecordNumber("MRN-6001");
        ada.setDateOfBirth(LocalDate.of(1980, 12, 10));
        patientRepository.save(ada);

        Patient grace = new Patient();
        grace.setFirstName("Grace");
        grace.setLastName("Hopper");
        grace.setMedicalRecordNumber("MRN-6002");
        grace.setDateOfBirth(LocalDate.of(1978, 3, 4));
        patientRepository.save(grace);
    }

    @Test
    void searchFindsByNameAndMrn() {
        List<Patient> byName = patientRepository.search("Ada");
        List<Patient> byMrn = patientRepository.search("6002");

        assertThat(byName).extracting(Patient::getMedicalRecordNumber).containsExactly("MRN-6001");
        assertThat(byMrn).extracting(Patient::getLastName).containsExactly("Hopper");
    }

    @Test
    void existsByMedicalRecordNumberIgnoreCaseHonorsCaseInsensitivity() {
        assertThat(patientRepository.existsByMedicalRecordNumberIgnoreCase("mrn-6001")).isTrue();
        assertThat(patientRepository.existsByMedicalRecordNumberIgnoreCase("MRN-6999")).isFalse();
    }
}
