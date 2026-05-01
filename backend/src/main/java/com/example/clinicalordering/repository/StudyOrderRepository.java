package com.example.clinicalordering.repository;

import com.example.clinicalordering.domain.StudyOrder;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyOrderRepository extends JpaRepository<StudyOrder, Long> {

    List<StudyOrder> findAllByOrderByCreatedAtDesc();

    List<StudyOrder> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}

