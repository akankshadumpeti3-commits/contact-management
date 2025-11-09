# Security Considerations

### Current Security Issues

- ❌ No authentication/authorization
- ❌ Database credentials in code
- ❌ No input validation
- ❌ CORS not configured
- ❌ No rate limiting
- ❌ No request size limits

### Target Security Measures

**Input Validation**:
- ✅ DTOs with `class-validator` for all endpoints
- ✅ Sanitize inputs to prevent NoSQL injection
- ✅ File upload validation (size, type)

**Database Security**:
- ✅ Connection string in environment variables
- ✅ Parameterized queries (Mongoose prevents injection)
- ✅ Database user with minimal privileges

**API Security**:
- ✅ CORS configured for allowed origins
- ✅ Rate limiting on import/export endpoints
- ✅ Request size limits (JSON body, file uploads)
- ✅ Helmet middleware for security headers

**Note**: Authentication/authorization is **out of scope** for this PRD but should be added in future.

---
