package com.example.clinicalordering.service;

import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.domain.Report;
import com.example.clinicalordering.domain.StudyOrder;
import com.example.clinicalordering.dto.ReportAssistRequest;
import com.example.clinicalordering.dto.ReportAssistResponse;
import org.springframework.stereotype.Component;

@Component
public class TemplateReportTextAssistant implements ReportTextAssistant {

    private static final String SAFETY_NOTE =
            "Assistant output is a drafting aid only. A clinician must review and edit before finalizing.";

    @Override
    public ReportAssistResponse suggestFindings(Report report, ReportAssistRequest request) {
        StudyOrder order = report.getStudyOrder();
        Patient patient = order.getPatient();
        String currentFindings = normalize(request.currentFindings());
        String instruction = normalize(request.instruction());

        String suggestion = currentFindings.isBlank()
                ? starterDraft(patient, order, instruction)
                : polishDraft(patient, order, currentFindings, instruction);

        return new ReportAssistResponse(report.getId(), suggestion, SAFETY_NOTE, "TEMPLATE_ASSISTANT");
    }

    private String starterDraft(Patient patient, StudyOrder order, String instruction) {
        StringBuilder suggestion = new StringBuilder();
        suggestion.append("Patient: ").append(displayName(patient)).append("\n");
        suggestion.append("Study: ").append(order.getStudyType()).append("\n");
        suggestion.append("Clinical indication: ").append(order.getOrderReason()).append("\n");
        suggestion.append("Priority: ").append(order.getPriority()).append("\n\n");
        suggestion.append("Findings:\n");
        suggestion.append("- Left ventricular size and systolic function: [review and complete].\n");
        suggestion.append("- Right ventricular size and systolic function: [review and complete].\n");
        suggestion.append("- Valvular assessment: [review and complete].\n");
        suggestion.append("- Pericardium: [review and complete].\n\n");
        suggestion.append("Impression:\n");
        suggestion.append("- [Clinician to complete based on reviewed echo findings].");

        if (!instruction.isBlank()) {
            suggestion.append("\n\nReviewer instruction: ").append(instruction);
        }

        return suggestion.toString();
    }

    private String polishDraft(Patient patient, StudyOrder order, String currentFindings, String instruction) {
        StringBuilder suggestion = new StringBuilder();
        suggestion.append("Clinical indication: ").append(order.getOrderReason()).append("\n\n");
        suggestion.append("Findings:\n");
        suggestion.append(currentFindings.trim()).append("\n\n");
        suggestion.append("Impression:\n");
        suggestion.append("- Review the findings above and document the final clinical impression.");

        if (!instruction.isBlank()) {
            suggestion.append("\n\nReviewer instruction: ").append(instruction);
        }

        suggestion.append("\n\nPatient context: ").append(displayName(patient));
        return suggestion.toString();
    }

    private String displayName(Patient patient) {
        return "%s, %s (%s)".formatted(
                patient.getLastName(),
                patient.getFirstName(),
                patient.getMedicalRecordNumber()
        );
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
