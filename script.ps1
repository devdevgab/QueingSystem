# PowerShell script to test login endpoint

# Define the endpoint URL
$uri = "http://192.168.10.245:8080/login"

# Set the headers
$headers = @{
    "Content-Type" = "application/json"
}

# Define the payload
$body = @{
    Username = "gaby"
    Password = "123"
} | ConvertTo-Json

# Send the POST request
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Output "Login response:"
    Write-Output $response
} catch {
    Write-Error "Request failed: $_"
}