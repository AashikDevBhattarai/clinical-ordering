param(
    [string]$RealmUrl = "http://localhost:8081/realms/clinical-ordering",
    [string]$ClientId = "clinical-ordering-api",
    [string]$Username = "demo-clinician",
    [string]$Password = "demo123"
)

$body = @{
    grant_type = "password"
    client_id = $ClientId
    username = $Username
    password = $Password
}

$response = Invoke-RestMethod `
    -Method Post `
    -Uri "$RealmUrl/protocol/openid-connect/token" `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $body

$response.access_token
