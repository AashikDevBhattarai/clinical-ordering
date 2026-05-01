package com.example.clinicalordering.controller;

import com.example.clinicalordering.dto.ReportAmendRequest;
import com.example.clinicalordering.dto.ReportAssistRequest;
import com.example.clinicalordering.dto.ReportAssistResponse;
import com.example.clinicalordering.dto.ReportCancelRequest;
import com.example.clinicalordering.dto.ReportDraftUpdateRequest;
import com.example.clinicalordering.dto.ReportFinalizeRequest;
import com.example.clinicalordering.dto.ReportResponse;
import com.example.clinicalordering.service.ReportService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public List<ReportResponse> findReports() {
        return reportService.findReports();
    }

    @GetMapping("/{id}")
    public ReportResponse getReport(@PathVariable Long id) {
        return reportService.getReport(id);
    }

    @PutMapping("/{id}/draft")
    public ReportResponse updateDraft(@PathVariable Long id, @Valid @RequestBody ReportDraftUpdateRequest request) {
        return reportService.updateDraft(id, request);
    }

    @PostMapping("/{id}/finalize")
    public ReportResponse finalizeReport(@PathVariable Long id, @Valid @RequestBody ReportFinalizeRequest request) {
        return reportService.finalizeReport(id, request);
    }

    @PostMapping("/{id}/amend")
    public ReportResponse amendReport(@PathVariable Long id, @Valid @RequestBody ReportAmendRequest request) {
        return reportService.amendReport(id, request);
    }

    @PostMapping("/{id}/cancel")
    public ReportResponse cancelReport(@PathVariable Long id, @Valid @RequestBody ReportCancelRequest request) {
        return reportService.cancelReport(id, request);
    }

    @PostMapping("/{id}/assist")
    public ReportAssistResponse assistReport(@PathVariable Long id, @Valid @RequestBody ReportAssistRequest request) {
        return reportService.assistReport(id, request);
    }
}
