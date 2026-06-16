# Teams + Assessments — Gate 3 coverage
# Prereq: project_id captured from projects.hurl

# Create team
POST {{api_host}}/api/projects/{{project_id}}/teams
Authorization: Bearer {{jwt}}
Content-Type: application/json
{
  "name": "Engineering Team"
}
HTTP 201
[Captures]
team_id: jsonpath "$.id"
[Asserts]
jsonpath "$.projectId" == {{project_id}}

---

# Create assessment
POST {{api_host}}/api/teams/{{team_id}}/assessments
Authorization: Bearer {{jwt}}
Content-Type: application/json
{}
HTTP 201
[Captures]
assessment_id: jsonpath "$.id"
[Asserts]
jsonpath "$.status" == "survey_pending"
jsonpath "$.teamId" == {{team_id}}

---

# Get assessment status
GET {{api_host}}/api/assessments/{{assessment_id}}/status
Authorization: Bearer {{jwt}}
HTTP 200
[Asserts]
jsonpath "$.status" == "survey_pending"

---

# 404 for unknown assessment
GET {{api_host}}/api/assessments/nonexistent-id
Authorization: Bearer {{jwt}}
HTTP 404
[Asserts]
jsonpath "$.code" == "ASSESSMENT_NOT_FOUND"
