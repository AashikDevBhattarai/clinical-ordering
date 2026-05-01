# Postman Collection

Import these files into Postman:

- `clinical-ordering.postman_collection.json`
- `clinical-ordering.local.postman_environment.json`

## How To Run

1. Start the backend:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

2. In Postman, import the collection and environment.
3. Select the `Clinical Ordering Local` environment.
4. Run the collection from top to bottom.

## Key Variables

- `baseUrl`: defaults to `http://localhost:8080/api`
- `patientId`: set by selecting or creating a patient
- `orderId`: set after placing an order
- `reportId`: set after placing an order
- `token`: optional Keycloak bearer token

If Keycloak mode is enabled, set `token` with the output from:

```powershell
$token = (& .\scripts\keycloak-token.ps1)
```
