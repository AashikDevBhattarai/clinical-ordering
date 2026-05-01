import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: Number(__ENV.K6_VUS ?? 5),
  duration: __ENV.K6_DURATION ?? "30s",
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<750"],
  },
};

const baseUrl = __ENV.API_BASE_URL ?? "http://localhost:8080/api";

export default function () {
  const correlationId = `${__VU}-${__ITER}`;

  const patientPayload = JSON.stringify({
    firstName: "Perf",
    lastName: `User-${correlationId}`,
    medicalRecordNumber: `MRN-PERF-${correlationId}`,
    dateOfBirth: "1990-01-01",
    sex: "X",
  });

  const patientResponse = http.post(`${baseUrl}/patients`, patientPayload, {
    headers: { "Content-Type": "application/json" },
  });
  check(patientResponse, { "patient created": (response) => response.status === 201 });

  const patientId = patientResponse.json("id");

  const orderPayload = JSON.stringify({
    patientId,
    studyType: "ECHOCARDIOGRAM",
    priority: "ROUTINE",
    orderReason: "k6 performance workflow",
    orderedBy: "Load Runner",
  });

  const orderResponse = http.post(`${baseUrl}/orders`, orderPayload, {
    headers: { "Content-Type": "application/json" },
  });
  check(orderResponse, { "order created": (response) => response.status === 201 });

  const reportId = orderResponse.json("reportId");

  const finalizeResponse = http.post(
    `${baseUrl}/reports/${reportId}/finalize`,
    JSON.stringify({
      findings: "Performance workflow finalized findings",
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  check(finalizeResponse, { "report finalized": (response) => response.status === 200 });

  sleep(1);
}
