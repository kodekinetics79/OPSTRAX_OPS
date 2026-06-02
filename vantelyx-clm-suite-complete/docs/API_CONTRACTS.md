# API Contracts

Base URL for local Docker API:

```text
http://localhost:8087
```

## Contract create

```http
POST /api/contracts
Content-Type: application/json

{
  "title": "New Vendor Agreement",
  "counterparty": "Vendor LLC",
  "type": "Vendor Agreement",
  "value": 125000,
  "owner": "Business Owner",
  "department": "Procurement",
  "legalEntity": "Kode Kinetics LLC",
  "jurisdiction": "Virginia",
  "paymentTerms": "Net 30",
  "riskScore": 55
}
```

## Status update

```http
PATCH /api/contracts/VCLM-2026-0001/status
Content-Type: application/json

{
  "status": "Ready for Signature",
  "actor": "Legal Reviewer"
}
```

## AI intake preview

```http
POST /api/ai/intake/preview
Content-Type: application/json

{
  "fileName": "sample-agreement.pdf",
  "counterpartyHint": "Northstar Analytics LLC",
  "text": "Agreement includes auto-renewal, privacy, data processing, and uncapped liability."
}
```
