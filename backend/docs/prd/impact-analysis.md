# Impact Analysis

### Files Requiring Modification

**Core Modules (Major Changes)**:
- `src/app.module.ts` - Replace TypeORM with Mongoose configuration
- `src/entities/contact.entity.ts` → `src/contacts/schemas/contact.schema.ts` - Convert to Mongoose schema
- `src/contact/contact.service.ts` - Refactor to use Mongoose repository
- `src/contacts/contacts.controller.ts` - Add new endpoints, refactor existing

**New Modules to Create**:
- `src/categories/` - Complete new module
- `src/tags/` - Complete new module
- `src/import-export/` - Complete new module
- `src/common/` - Shared utilities (filters, interceptors)
- `src/config/` - Configuration management

**Configuration Files**:
- `package.json` - Update dependencies (remove typeorm/mysql, add mongoose)
- `.env` / Environment variables - Add MongoDB connection string
- `src/main.ts` - Add global pipes, filters, interceptors

**Documentation**:
- `README.md` - Update setup instructions for MongoDB
- `docs/api/` - API documentation (Swagger/OpenAPI)

**Tests**:
- All test files need updates due to database change
- New test files for categories, tags, import/export

### Breaking Changes

**Database Breaking Changes** (Internal Only):
- Database technology changes from MySQL to MongoDB
- Entity definitions change from TypeORM to Mongoose
- Database connection configuration changes

**API Breaking Changes** (If Phase 5 Applied):
- Endpoint paths change from `/contacts/create` to `/contacts`
- Response format standardized (may require frontend updates)

**Mitigation**:
- Maintain backward compatibility during transition
- Provide migration guide for frontend team
- Version API if necessary (e.g., `/v1/contacts`, `/v2/contacts`)

---
