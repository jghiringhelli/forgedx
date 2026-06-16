# Projects CRUD — Gate 3 coverage for routes/projects.ts
# Run with valid Clerk JWT: hurl --variable api_host=... --variable jwt=...

# Create project
POST {{api_host}}/api/projects
Authorization: Bearer {{jwt}}
Content-Type: application/json
{
  "name": "E2E Test Project",
  "clientName": "Test Corp"
}
HTTP 201
[Captures]
project_id: jsonpath "$.id"
[Asserts]
jsonpath "$.name" == "E2E Test Project"
jsonpath "$.clientName" == "Test Corp"
jsonpath "$.ownerId" isString

---

# Get project
GET {{api_host}}/api/projects/{{project_id}}
Authorization: Bearer {{jwt}}
HTTP 200
[Asserts]
jsonpath "$.id" == {{project_id}}

---

# List projects
GET {{api_host}}/api/projects
Authorization: Bearer {{jwt}}
HTTP 200
[Asserts]
jsonpath "$.items" isCollection
jsonpath "$.total" isInteger

---

# Delete project
DELETE {{api_host}}/api/projects/{{project_id}}
Authorization: Bearer {{jwt}}
HTTP 204
