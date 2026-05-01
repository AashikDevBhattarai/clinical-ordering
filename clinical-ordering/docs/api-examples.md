# API Examples

Assume the backend is running at `http://localhost:8080`.

If Keycloak mode is enabled, include:

```bash
AUTH_HEADER='Authorization: Bearer <access-token>'
```

On Windows, generate a demo token with:

```powershell
$token = (& .\scripts\keycloak-token.ps1)
```

Otherwise omit the header from the examples.

## Postman Smoke Flow

The supplied Postman checklist maps to this API sequence. Use the actual `patientId`, `orderId`, and `reportId` values returned by your local run.

Suggested Postman environment variables:

- `baseUrl`: `http://localhost:8080/api`
- `patientId`: selected or created patient ID
- `orderId`: order ID returned from order creation
- `reportId`: report ID returned from order creation
- `token`: optional Keycloak access token

Requests:

1. `GET {{baseUrl}}/patients?query=ada`
2. `GET {{baseUrl}}/orders?patientId={{patientId}}`
3. `GET {{baseUrl}}/reports/{{reportId}}`
4. `PUT {{baseUrl}}/reports/{{reportId}}/draft`
5. `POST {{baseUrl}}/reports/{{reportId}}/finalize`
6. `GET {{baseUrl}}/reports/{{reportId}}` to verify `FINALIZED`
7. `POST {{baseUrl}}/reports/{{reportId}}/amend`
8. `POST {{baseUrl}}/reports/{{reportId}}/cancel`
9. `GET {{baseUrl}}/orders/{{orderId}}` and `GET {{baseUrl}}/reports/{{reportId}}` to verify both are `CANCELED`

Contract notes:

- Patient search uses `query`, not `q`.
- Draft save is implemented as `PUT /api/reports/{id}/draft`, not `PATCH`.
- Mutating report actions require JSON bodies and are intentionally not retried by the frontend.

## 1. Create Patient

```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Amelia",
    "lastName": "Shepherd",
    "medicalRecordNumber": "MRN-2001",
    "dateOfBirth": "1987-07-12",
    "sex": "F",
    "phoneNumber": "555-2001",
    "email": "amelia.shepherd@example.test"
  }'
```

## 2. Create Echo Order

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "studyType": "ECHOCARDIOGRAM",
    "priority": "URGENT",
    "orderReason": "New chest pain with concern for structural disease",
    "orderedBy": "Dr. Derek Shepherd"
  }'
```

## 3. Confirm Draft Report Creation

```bash
curl http://localhost:8080/api/reports/1
```

Expected status:

- Report status: `DRAFT`
- Order status: `ORDERED`

## 4. Save Draft Findings

```bash
curl -X PUT http://localhost:8080/api/reports/1/draft \
  -H "Content-Type: application/json" \
  -d '{
    "findings": "Preliminary observations before finalization."
  }'
```

## 5. Finalize Report

```bash
curl -X POST http://localhost:8080/api/reports/1/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "findings": "Normal left ventricular size and preserved systolic function."
  }'
```

## 6. Generate Assistant Draft Text

```bash
curl -X POST http://localhost:8080/api/reports/1/assist \
  -H "Content-Type: application/json" \
  -d '{
    "currentFindings": "",
    "instruction": "Keep wording concise"
  }'
```

The assistant response is a draft aid only. Users still need to review, edit, and save or finalize the report through the normal lifecycle endpoints.

## 7. Amend Finalized Report

```bash
curl -X POST http://localhost:8080/api/reports/1/amend \
  -H "Content-Type: application/json" \
  -d '{
    "findings": "Normal left ventricular size. Mild concentric hypertrophy noted.",
    "amendmentReason": "Added missing ventricular wall detail"
  }'
```

## 8. Cancel Report

```bash
curl -X POST http://localhost:8080/api/reports/1/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "cancelReason": "Duplicate study entered in error"
  }'
```

## 9. Verify Order / Report Synchronization

```bash
curl http://localhost:8080/api/orders/1
curl http://localhost:8080/api/reports/1
```

After cancelation, both resources should report `CANCELED`.
