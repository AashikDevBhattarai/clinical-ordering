package com.example.clinicalordering.controller;

import com.example.clinicalordering.dto.PatientRequest;
import com.example.clinicalordering.dto.PatientResponse;
import com.example.clinicalordering.service.PatientService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public List<PatientResponse> findPatients(@RequestParam(required = false) String query) {
        return patientService.findPatients(query);
    }

    @GetMapping("/{id}")
    public PatientResponse getPatient(@PathVariable Long id) {
        return patientService.getPatient(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientResponse createPatient(@Valid @RequestBody PatientRequest request) {
        return patientService.createPatient(request);
    }
}

