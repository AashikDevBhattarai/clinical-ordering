package com.example.clinicalordering;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ClinicalWorkflowIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void patientOrderAndReportLifecycleStaysSynchronized() throws Exception {
        JsonNode patient = postJson("/api/patients", """
                {
                  "firstName": "Amelia",
                  "lastName": "Shepherd",
                  "medicalRecordNumber": "MRN-2001",
                  "dateOfBirth": "1987-07-12",
                  "sex": "F",
                  "phoneNumber": "555-2001",
                  "email": "amelia.shepherd@example.test"
                }
                """, 201);

        long patientId = patient.get("id").asLong();

        JsonNode order = postJson("/api/orders", """
                {
                  "patientId": %d,
                  "studyType": "ECHOCARDIOGRAM",
                  "priority": "URGENT",
                  "orderReason": "New chest pain with concern for structural disease",
                  "orderedBy": "Dr. Derek Shepherd"
                }
                """.formatted(patientId), 201);

        long orderId = order.get("id").asLong();
        long reportId = order.get("reportId").asLong();

        assertThat(order.get("status").asText()).isEqualTo("ORDERED");
        assertThat(order.get("reportStatus").asText()).isEqualTo("DRAFT");

        JsonNode draftReport = readJson("/api/reports/" + reportId);
        assertThat(draftReport.get("status").asText()).isEqualTo("DRAFT");
        assertThat(draftReport.get("orderStatus").asText()).isEqualTo("ORDERED");

        JsonNode finalizedReport = postJson("/api/reports/" + reportId + "/finalize", """
                {
                  "findings": "Normal left ventricular size and preserved systolic function."
                }
                """, 200);
        assertThat(finalizedReport.get("status").asText()).isEqualTo("FINALIZED");
        assertThat(finalizedReport.get("orderStatus").asText()).isEqualTo("FINALIZED");

        JsonNode amendedReport = postJson("/api/reports/" + reportId + "/amend", """
                {
                  "findings": "Normal left ventricular size. Mild concentric hypertrophy noted.",
                  "amendmentReason": "Added missing ventricular wall detail"
                }
                """, 200);
        assertThat(amendedReport.get("status").asText()).isEqualTo("AMENDED");
        assertThat(amendedReport.get("orderStatus").asText()).isEqualTo("AMENDED");
        assertThat(amendedReport.get("amendmentReason").asText())
                .isEqualTo("Added missing ventricular wall detail");

        JsonNode canceledReport = postJson("/api/reports/" + reportId + "/cancel", """
                {
                  "cancelReason": "Duplicate study entered in error"
                }
                """, 200);
        assertThat(canceledReport.get("status").asText()).isEqualTo("CANCELED");
        assertThat(canceledReport.get("orderStatus").asText()).isEqualTo("CANCELED");
        assertThat(canceledReport.get("cancelReason").asText()).isEqualTo("Duplicate study entered in error");

        JsonNode reloadedOrder = readJson("/api/orders/" + orderId);
        assertThat(reloadedOrder.get("status").asText()).isEqualTo("CANCELED");
        assertThat(reloadedOrder.get("reportStatus").asText()).isEqualTo("CANCELED");
    }

    @Test
    void duplicateMrnIsRejectedAsBusinessRule() throws Exception {
        postJson("/api/patients", """
                {
                  "firstName": "Cristina",
                  "lastName": "Yang",
                  "medicalRecordNumber": "MRN-2002"
                }
                """, 201);

        MvcResult duplicateAttempt = mockMvc.perform(post("/api/patients")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Cristina",
                                  "lastName": "Yang",
                                  "medicalRecordNumber": "MRN-2002"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andReturn();

        JsonNode error = objectMapper.readTree(duplicateAttempt.getResponse().getContentAsByteArray());
        assertThat(error.get("message").asText()).contains("already exists");
    }

    @Test
    void futurePatientBirthDateIsRejected() throws Exception {
        MvcResult invalidPatient = mockMvc.perform(post("/api/patients")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Ellis",
                                  "lastName": "Grey",
                                  "medicalRecordNumber": "MRN-2099",
                                  "dateOfBirth": "2999-01-01"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andReturn();

        JsonNode error = objectMapper.readTree(invalidPatient.getResponse().getContentAsByteArray());
        assertThat(error.get("message").asText()).isEqualTo("Date of birth cannot be in the future.");
    }

    @Test
    void cancelRequiresReason() throws Exception {
        JsonNode patient = postJson("/api/patients", """
                {
                  "firstName": "Preston",
                  "lastName": "Burke",
                  "medicalRecordNumber": "MRN-2003"
                }
                """, 201);

        JsonNode order = postJson("/api/orders", """
                {
                  "patientId": %d,
                  "studyType": "ECHOCARDIOGRAM",
                  "priority": "ROUTINE",
                  "orderReason": "Heart failure follow-up",
                  "orderedBy": "Dr. Bailey"
                }
                """.formatted(patient.get("id").asLong()), 201);

        MvcResult invalidCancel = mockMvc.perform(post("/api/reports/" + order.get("reportId").asLong() + "/cancel")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "cancelReason": " "
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andReturn();

        JsonNode error = objectMapper.readTree(invalidCancel.getResponse().getContentAsByteArray());
        assertThat(error.get("message").asText()).isEqualTo("Cancel reason is required.");
    }

    @Test
    void reportAssistantSuggestsDraftTextWithoutChangingLifecycle() throws Exception {
        JsonNode patient = postJson("/api/patients", """
                {
                  "firstName": "Miranda",
                  "lastName": "Bailey",
                  "medicalRecordNumber": "MRN-2004"
                }
                """, 201);

        JsonNode order = postJson("/api/orders", """
                {
                  "patientId": %d,
                  "studyType": "ECHOCARDIOGRAM",
                  "priority": "ROUTINE",
                  "orderReason": "Systolic murmur evaluation",
                  "orderedBy": "Dr. Webber"
                }
                """.formatted(patient.get("id").asLong()), 201);

        long reportId = order.get("reportId").asLong();
        JsonNode suggestion = postJson("/api/reports/" + reportId + "/assist", """
                {
                  "currentFindings": "",
                  "instruction": "Keep wording concise"
                }
                """, 200);

        assertThat(suggestion.get("provider").asText()).isEqualTo("TEMPLATE_ASSISTANT");
        assertThat(suggestion.get("suggestedFindings").asText()).contains("Systolic murmur evaluation");
        assertThat(suggestion.get("safetyNote").asText()).contains("clinician");

        JsonNode reloadedReport = readJson("/api/reports/" + reportId);
        assertThat(reloadedReport.get("status").asText()).isEqualTo("DRAFT");
        assertThat(reloadedReport.get("orderStatus").asText()).isEqualTo("ORDERED");
    }

    private JsonNode readJson(String path) throws Exception {
        MvcResult result = mockMvc.perform(get(path))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsByteArray());
    }

    private JsonNode postJson(String path, String content, int expectedStatus) throws Exception {
        MvcResult result = mockMvc.perform(post(path)
                        .contentType(APPLICATION_JSON)
                        .content(content))
                .andExpect(status().is(expectedStatus))
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsByteArray());
    }
}
