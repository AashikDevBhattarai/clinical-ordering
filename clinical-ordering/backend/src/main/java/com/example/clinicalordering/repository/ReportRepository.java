package com.example.clinicalordering.repository;

import com.example.clinicalordering.domain.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
}
