package com.example.clinicalordering.repository;

import com.example.clinicalordering.domain.Patient;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByMedicalRecordNumberIgnoreCase(String medicalRecordNumber);

    boolean existsByMedicalRecordNumberIgnoreCase(String medicalRecordNumber);

    @Query("""
            select p from Patient p
            where lower(p.firstName) like lower(concat('%', :query, '%'))
               or lower(p.lastName) like lower(concat('%', :query, '%'))
               or lower(p.medicalRecordNumber) like lower(concat('%', :query, '%'))
            order by p.lastName asc, p.firstName asc
            """)
    List<Patient> search(@Param("query") String query);
}
