# ForgeDX — Hurl Health Probe
# Gate 3 coverage for GET /health

# EX-000: Health check
GET http://localhost:3001/health
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.ts" isString
