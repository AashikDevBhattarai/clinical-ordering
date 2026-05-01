package com.example.clinicalordering.service;

import com.example.clinicalordering.domain.Report;
import com.example.clinicalordering.dto.ReportAssistRequest;
import com.example.clinicalordering.dto.ReportAssistResponse;

public interface ReportTextAssistant {

    ReportAssistResponse suggestFindings(Report report, ReportAssistRequest request);
}
