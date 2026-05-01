package com.example.clinicalordering.service;

import com.example.clinicalordering.domain.Report;
import com.example.clinicalordering.domain.ReportStatus;
import com.example.clinicalordering.dto.ReportAmendRequest;
import com.example.clinicalordering.dto.ReportAssistRequest;
import com.example.clinicalordering.dto.ReportAssistResponse;
import com.example.clinicalordering.dto.ReportCancelRequest;
import com.example.clinicalordering.dto.ReportDraftUpdateRequest;
import com.example.clinicalordering.dto.ReportFinalizeRequest;
import com.example.clinicalordering.dto.ReportResponse;
import com.example.clinicalordering.mapper.ReportMapper;
import com.example.clinicalordering.repository.ReportRepository;
import com.example.clinicalordering.workflow.ReportWorkflowService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final ClinicalLookupService clinicalLookupService;
    private final ReportMapper reportMapper;
    private final ReportWorkflowService reportWorkflowService;
    private final ReportTextAssistant reportTextAssistant;

    public ReportService(
            ReportRepository reportRepository,
            ClinicalLookupService clinicalLookupService,
            ReportMapper reportMapper,
            ReportWorkflowService reportWorkflowService,
            ReportTextAssistant reportTextAssistant
    ) {
        this.reportRepository = reportRepository;
        this.clinicalLookupService = clinicalLookupService;
        this.reportMapper = reportMapper;
        this.reportWorkflowService = reportWorkflowService;
        this.reportTextAssistant = reportTextAssistant;
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> findReports() {
        return reportRepository.findAll().stream()
                .map(reportMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReportResponse getReport(Long id) {
        return reportMapper.toResponse(clinicalLookupService.getReport(id));
    }

    public ReportResponse updateDraft(Long id, ReportDraftUpdateRequest request) {
        Report report = clinicalLookupService.getReport(id);
        reportWorkflowService.updateDraft(report, request.findings());
        return reportMapper.toResponse(reportRepository.save(report));
    }

    public ReportResponse finalizeReport(Long id, ReportFinalizeRequest request) {
        Report report = clinicalLookupService.getReport(id);
        reportWorkflowService.finalizeReport(report, request.findings());
        return reportMapper.toResponse(reportRepository.save(report));
    }

    public ReportResponse amendReport(Long id, ReportAmendRequest request) {
        Report report = clinicalLookupService.getReport(id);
        reportWorkflowService.amendReport(report, request.findings(), request.amendmentReason());
        return reportMapper.toResponse(reportRepository.save(report));
    }

    public ReportResponse cancelReport(Long id, ReportCancelRequest request) {
        Report report = clinicalLookupService.getReport(id);
        reportWorkflowService.cancelReport(report, request.cancelReason());
        return reportMapper.toResponse(reportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public ReportAssistResponse assistReport(Long id, ReportAssistRequest request) {
        Report report = clinicalLookupService.getReport(id);
        if (report.getStatus() == ReportStatus.CANCELED || report.getStatus() == ReportStatus.AMENDED) {
            throw new BusinessRuleException("Assistant is unavailable for read-only reports.");
        }
        return reportTextAssistant.suggestFindings(report, request);
    }
}
