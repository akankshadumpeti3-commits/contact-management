# Technical Debt and Known Issues

### Critical Technical Debt

1. **Database Configuration in Code** (`src/app.module.ts:11-18`)
   - **Issue**: Database credentials hardcoded in `app.module.ts`
   - **Risk**: Security vulnerability, not environment-aware
   - **Impact**: Cannot configure different databases for dev/staging/prod
   - **Fix**: Move to environment variables with `@nestjs/config`

2. **TypeORM Synchronize Enabled** (`src/app.module.ts:17`)
   - **Issue**: `synchronize: true` auto-creates/modifies database schema
   - **Risk**: **DATA LOSS RISK** in production (can drop tables/columns)
   - **Impact**: Not safe for production deployment
   - **Fix**: Disable synchronize, use proper migrations (will be replaced by Mongoose)

3. **No Input Validation**
   - **Issue**: Controllers accept raw entities without validation
   - **Risk**: Invalid data can be stored, SQL injection potential
   - **Impact**: Data integrity issues, security vulnerabilities
   - **Fix**: Implement DTOs with `class-validator`

4. **Inconsistent Module Structure**
   - **Issue**: `src/contact/` (service) vs `src/contacts/` (controller)
   - **Risk**: Developer confusion, scaling issues
   - **Impact**: Difficult to maintain and extend
   - **Fix**: Consolidate into single `src/contacts/` module

5. **Non-RESTful API Patterns**
   - **Issue**: Endpoints like `/contacts/create`, `/contacts/:id/update`
   - **Risk**: API inconsistency, violates REST principles
   - **Impact**: Poor developer experience, harder to document
   - **Fix**: Refactor to proper RESTful endpoints (see Target API)

6. **No Error Handling**
   - **Issue**: Services don't handle errors (e.g., contact not found)
   - **Risk**: Unhandled exceptions, poor error messages
   - **Impact**: Poor user experience, difficult debugging
   - **Fix**: Implement global exception filter, service-level error handling

7. **Email Not Unique**
   - **Issue**: Contact email field has no uniqueness constraint
   - **Risk**: Duplicate contacts, data quality issues
   - **Impact**: Cannot use email as natural key for import/update
   - **Fix**: Add unique constraint in MongoDB schema

8. **No Timestamps**
   - **Issue**: No `createdAt` or `updatedAt` fields
   - **Risk**: Cannot track when contacts were created/modified
   - **Impact**: Audit trail missing, hard to debug
   - **Fix**: Enable Mongoose timestamps

### Workarounds and Gotchas

#### Database Connection
- **Current**: Database connection assumes MySQL running on `localhost:3306`
- **Workaround**: Must have MySQL installed locally for development
- **Target**: MongoDB connection via environment variable (flexible deployment)

#### Entity Auto-Loading
- **Current**: `entities: [__dirname + '/**/*.entity{.ts,.js}']`
- **Issue**: Loads all `*.entity.ts` files automatically
- **Gotcha**: Adding non-entity files with `.entity.ts` extension will cause errors
- **Target**: Explicit schema registration in feature modules

#### Frontend Integration
- **Current**: Angular frontend expects specific response formats
- **Gotcha**: Changing response structure may break frontend
- **Mitigation**: Maintain backward compatibility or update frontend simultaneously

---
