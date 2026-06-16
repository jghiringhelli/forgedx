# Auth probes — Gate 3 coverage for protected routes
# Run with: hurl --variable api_host=http://localhost:3001 --variable clerk_jwt=<token>

# auth-missing: No JWT → rejected
GET {{api_host}}/api/projects
HTTP 401
[Asserts]
jsonpath "$.code" == "UNAUTHORIZED"

---

# auth-invalid: Bad JWT → rejected
GET {{api_host}}/api/projects
Authorization: Bearer invalid.jwt.token
HTTP 401
[Asserts]
jsonpath "$.code" == "UNAUTHORIZED"
