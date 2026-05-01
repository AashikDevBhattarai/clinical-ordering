package com.example.clinicalordering.config;

import com.example.clinicalordering.domain.OrderPriority;
import com.example.clinicalordering.domain.Patient;
import com.example.clinicalordering.domain.StudyOrder;
import com.example.clinicalordering.domain.StudyType;
import com.example.clinicalordering.dto.OrderRequest;
import com.example.clinicalordering.factory.StudyOrderFactory;
import com.example.clinicalordering.repository.PatientRepository;
import com.example.clinicalordering.repository.StudyOrderRepository;
import com.example.clinicalordering.workflow.ReportWorkflowService;
import java.time.LocalDate;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("demo")
public class DemoDataSeeder implements ApplicationRunner {

    private final PatientRepository patientRepository;
    private final StudyOrderRepository studyOrderRepository;
    private final StudyOrderFactory studyOrderFactory;
    private final ReportWorkflowService reportWorkflowService;

    public DemoDataSeeder(
            PatientRepository patientRepository,
            StudyOrderRepository studyOrderRepository,
            StudyOrderFactory studyOrderFactory,
            ReportWorkflowService reportWorkflowService
    ) {
        this.patientRepository = patientRepository;
        this.studyOrderRepository = studyOrderRepository;
        this.studyOrderFactory = studyOrderFactory;
        this.reportWorkflowService = reportWorkflowService;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (patientRepository.count() > 0) {
            return;
        }

        Patient ada = new Patient();
        ada.setFirstName("Ada");
        ada.setLastName("Lovelace");
        ada.setMedicalRecordNumber("MRN-1001");
        ada.setDateOfBirth(LocalDate.of(1985, 12, 10));
        ada.setSex("F");
        ada.setPhoneNumber("555-0101");
        ada.setEmail("ada.lovelace@example.test");
        patientRepository.save(ada);

        Patient grace = new Patient();
        grace.setFirstName("Grace");
        grace.setLastName("Hopper");
        grace.setMedicalRecordNumber("MRN-1002");
        grace.setDateOfBirth(LocalDate.of(1982, 3, 14));
        grace.setSex("F");
        grace.setPhoneNumber("555-0102");
        grace.setEmail("grace.hopper@example.test");
        patientRepository.save(grace);

        OrderRequest orderRequest = new OrderRequest(
                ada.getId(),
                StudyType.ECHOCARDIOGRAM,
                OrderPriority.ROUTINE,
                "New systolic murmur and dyspnea on exertion",
                "Dr. Meredith Grey"
        );
        StudyOrder seededOrder = studyOrderFactory.create(orderRequest, ada);
        reportWorkflowService.updateDraft(
                seededOrder.getReport(),
                "Draft findings: normal chamber sizes, awaiting final interpretation."
        );
        studyOrderRepository.save(seededOrder);
    }
}
