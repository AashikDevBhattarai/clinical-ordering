package com.example.clinicalordering.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

class RestExceptionHandlerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new BoomController())
                .setControllerAdvice(new RestExceptionHandler())
                .build();
    }

    @Test
    void unexpectedExceptionsReturnStableServerErrorPayload() throws Exception {
        MvcResult result = mockMvc.perform(get("/boom").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andReturn();

        JsonNode error = objectMapper.readTree(result.getResponse().getContentAsByteArray());
        assertThat(error.get("status").asInt()).isEqualTo(500);
        assertThat(error.get("error").asText()).isEqualTo("Internal Server Error");
        assertThat(error.get("message").asText()).isEqualTo("Unexpected server error.");
    }

    @RestController
    static class BoomController {

        @GetMapping("/boom")
        String boom() {
            throw new IllegalStateException("boom");
        }
    }
}
