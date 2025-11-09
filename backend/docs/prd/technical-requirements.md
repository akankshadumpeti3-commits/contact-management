# Technical Requirements

### TR-1: Database Migration (MySQL → MongoDB)

**Objective**: Migrate from relational MySQL database to document-based MongoDB while preserving all existing data and improving schema flexibility.

#### TR-1.1: Migration Strategy

**Approach**: Phased migration with zero data loss

**Phase 1: Parallel Database Setup**
- Install MongoDB alongside existing MySQL
- Configure NestJS to support both databases temporarily
- Create MongoDB schemas matching current MySQL structure

**Phase 2: Data Migration**
- Export all existing contacts from MySQL
- Transform and import into MongoDB
- Validate data integrity (record counts, field values)
- Create backup of MySQL data

**Phase 3: Code Migration**
- Replace TypeORM with Mongoose ODM
- Update entities to Mongoose schemas
- Refactor repositories to use Mongoose
- Update module configurations
- Maintain existing API contracts (no breaking changes)

**Phase 4: Cutover**
- Switch application to use MongoDB
- Decommission MySQL (keep backup for rollback)
- Monitor for issues in production

#### TR-1.2: Technology Changes

**Remove**:
- `typeorm` (v0.2.29)
- `mysql` (v2.18.1)
- `@nestjs/typeorm` (v7.1.4)

**Add**:
- `mongoose` (latest stable)
- `@nestjs/mongoose` (compatible with NestJS v7.x)
- MongoDB connection driver

**Configuration Changes**:
- Replace TypeORM configuration with Mongoose configuration
- Update `app.module.ts` to use `MongooseModule`
- Environment variables for MongoDB connection string
- Connection pooling and retry logic

#### TR-1.3: Schema Design

**Contact Schema (MongoDB)**:
```typescript
{
  _id: ObjectId,
  name: String (required),
  title: String,
  email: String (required, unique, lowercase),
  phone: String,
  address: String,
  city: String,
  categoryId: ObjectId (ref: 'Category'),
  tagIds: [ObjectId] (ref: 'Tag'),
  createdAt: Date,
  updatedAt: Date
}
```

**Category Schema (MongoDB)**:
```typescript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String,
  color: String (hex color, default: '#3B82F6'),
  createdAt: Date,
  updatedAt: Date
}
```

**Tag Schema (MongoDB)**:
```typescript
{
  _id: ObjectId,
  name: String (required, unique, lowercase),
  color: String (hex color),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- Contact: `email` (unique), `categoryId`, `tagIds`, `city`
- Contact: Text index on `name`, `title`, `email`, `phone`, `address`, `city`
- Category: `name` (unique)
- Tag: `name` (unique)

#### TR-1.4: Data Integrity

**Migration Validation**:
- ✅ Record count matches (MySQL → MongoDB)
- ✅ All field values preserved
- ✅ No data truncation or loss
- ✅ Date/time values converted correctly
- ✅ Character encoding handled properly (UTF-8)

**Rollback Plan**:
- Maintain MySQL backup for 30 days post-migration
- Document rollback procedure
- Test rollback in staging environment

**Acceptance Criteria**:
- ✅ MongoDB installed and running
- ✅ Mongoose ODM integrated with NestJS
- ✅ All existing contacts migrated to MongoDB
- ✅ Zero data loss during migration
- ✅ API endpoints continue to work (no breaking changes)
- ✅ Response times equal to or better than MySQL
- ✅ Database connection configuration externalized (environment variables)

---

### TR-2: Architecture Preservation

**Objective**: Maintain existing NestJS architectural patterns while enhancing the codebase.

#### TR-2.1: Preserve Patterns

**Maintain**:
- ✅ Module-based organization (feature modules)
- ✅ Controller-Service-Repository pattern (adapted for Mongoose)
- ✅ Dependency injection
- ✅ Decorators for routing and metadata

**Enhance**:
- Add DTO (Data Transfer Objects) for validation
- Implement proper exception handling with filters
- Add logging interceptors
- Implement request/response transformations

#### TR-2.2: Code Organization

**Recommended Structure**:
```
src/
├── contacts/
│   ├── contacts.module.ts
│   ├── contacts.controller.ts
│   ├── contacts.service.ts
│   ├── schemas/
│   │   └── contact.schema.ts
│   ├── dto/
│   │   ├── create-contact.dto.ts
│   │   ├── update-contact.dto.ts
│   │   └── filter-contact.dto.ts
│   └── interfaces/
│       └── contact.interface.ts
├── categories/
│   ├── categories.module.ts
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   ├── schemas/
│   │   └── category.schema.ts
│   └── dto/
│       ├── create-category.dto.ts
│       └── update-category.dto.ts
├── tags/
│   ├── tags.module.ts
│   ├── tags.controller.ts
│   ├── tags.service.ts
│   ├── schemas/
│   │   └── tag.schema.ts
│   └── dto/
│       ├── create-tag.dto.ts
│       └── update-tag.dto.ts
├── import-export/
│   ├── import-export.module.ts
│   ├── import-export.controller.ts
│   ├── import-export.service.ts
│   └── parsers/
│       ├── csv.parser.ts
│       ├── json.parser.ts
│       └── vcard.parser.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   └── pipes/
│       └── validation.pipe.ts
├── config/
│   ├── database.config.ts
│   └── app.config.ts
└── main.ts
```

#### TR-2.3: API Standards

**RESTful Conventions**:
- Use proper HTTP methods: GET, POST, PUT, PATCH, DELETE
- Use resource-based URLs (avoid verbs in paths)
- Standard status codes: 200, 201, 204, 400, 404, 500
- Consistent response format

**Before** (Current):
```
POST /contacts/create      ❌ Verb in path
PUT /contacts/:id/update   ❌ Verb in path
DELETE /contacts/:id/delete ❌ Verb in path
```

**After** (Enhanced):
```
POST /contacts             ✅ RESTful
PUT /contacts/:id          ✅ RESTful
DELETE /contacts/:id       ✅ RESTful
```

**Response Format Standard**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Contact created successfully",
  "timestamp": "2025-11-09T12:00:00Z"
}
```

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Email must be a valid email address"
      }
    ]
  },
  "timestamp": "2025-11-09T12:00:00Z"
}
```

**Acceptance Criteria**:
- ✅ All endpoints follow RESTful conventions
- ✅ DTOs used for request validation
- ✅ Consistent response/error format across all endpoints
- ✅ Proper HTTP status codes used
- ✅ Global exception filter handles errors consistently

---

### TR-3: Performance Requirements

**Objective**: Ensure system performs efficiently with growing data volume.

**Requirements**:
- API response time < 500ms for 95th percentile
- Search/filter operations < 500ms for 10,000 contacts
- Import/export handle 1,000+ contacts without timeout
- Database queries optimized with proper indexes
- Connection pooling configured for MongoDB

**Load Testing Targets**:
- Support 100 concurrent users
- Handle 1,000 requests per minute
- Database: 10,000+ contacts

**Acceptance Criteria**:
- ✅ Response times meet SLA under load
- ✅ Database indexes improve query performance
- ✅ No memory leaks during long-running operations
- ✅ Import/export streaming for large files

---

### TR-4: Security & Validation

**Objective**: Ensure data integrity and security.

**Requirements**:
- Input validation using class-validator DTOs
- Email format validation (RFC 5322 compliant)
- Phone number sanitization (remove special characters)
- SQL/NoSQL injection prevention (parameterized queries)
- File upload validation (size limits, allowed types)
- Rate limiting for import/export endpoints
- Sanitize user input to prevent XSS

**Validation Rules**:
- **Contact**:
  - `name`: Required, max 100 characters
  - `email`: Required, valid email format, unique
  - `phone`: Optional, max 20 characters
  - `title`: Optional, max 100 characters
  - `address`: Optional, max 200 characters
  - `city`: Optional, max 100 characters
- **Category**:
  - `name`: Required, unique, max 50 characters
  - `color`: Optional, valid hex color format (#RRGGBB)
- **Tag**:
  - `name`: Required, unique, max 30 characters
  - `color`: Optional, valid hex color format

**Acceptance Criteria**:
- ✅ All inputs validated before processing
- ✅ Invalid requests return 400 with clear error messages
- ✅ File uploads limited to 10MB
- ✅ Rate limiting prevents abuse of import/export

---
