# API Reference

## Base URL

- Development: `http://localhost:3000/api`
- Production: `{PRODUCTION_URL}/api`

## Endpoints

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

---

## Authentication

(Add authentication endpoints as needed)

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "statusCode": 400
}
```

### Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

Add more endpoint documentation as you develop the API.
