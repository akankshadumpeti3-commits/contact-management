# Enhancement Implementation Guide

### Phase 1: Database Migration Foundation

**Goal**: Replace MySQL with MongoDB, maintain existing functionality

**Key Files to Modify**:
1. `package.json`:
   - Remove: `typeorm`, `mysql`, `@nestjs/typeorm`
   - Add: `mongoose`, `@nestjs/mongoose`, `@nestjs/config`

2. `src/app.module.ts`:
   - Replace `TypeOrmModule.forRoot()` with `MongooseModule.forRootAsync()`
   - Add `ConfigModule.forRoot()` for environment variables

3. `src/entities/contact.entity.ts` → `src/contacts/schemas/contact.schema.ts`:
   - Convert TypeORM entity to Mongoose schema
   - Add timestamps
   - Add email unique constraint

4. `src/contact/contact.service.ts` → `src/contacts/contacts.service.ts`:
   - Refactor to use Mongoose Model instead of TypeORM Repository
   - Update method signatures (Mongoose returns Documents)

5. Create `.env` and `.env.example`:
   - Define `MONGODB_URI`, `NODE_ENV`, `PORT`

6. Create `scripts/migrate-mysql-to-mongodb.ts`:
   - Export MySQL data
   - Import to MongoDB
   - Validation script

**Validation**:
- All existing API endpoints work unchanged
- All contacts migrated successfully
- Response times equivalent or better

---

### Phase 2: Categories & Tags Implementation

**Goal**: Add category and tag functionality

**New Files to Create**:
1. `src/categories/` (complete module)
   - `categories.module.ts` - Feature module
   - `categories.controller.ts` - CRUD endpoints
   - `categories.service.ts` - Business logic
   - `schemas/category.schema.ts` - Mongoose schema
   - `dto/create-category.dto.ts` - Validation
   - `dto/update-category.dto.ts` - Validation

2. `src/tags/` (complete module)
   - `tags.module.ts` - Feature module
   - `tags.controller.ts` - CRUD endpoints
   - `tags.service.ts` - Business logic (include usageCount)
   - `schemas/tag.schema.ts` - Mongoose schema
   - `dto/create-tag.dto.ts` - Validation
   - `dto/update-tag.dto.ts` - Validation

**Files to Modify**:
1. `src/contacts/schemas/contact.schema.ts`:
   - Add `categoryId: ObjectId` field
   - Add `tagIds: [ObjectId]` field
   - Add references to Category and Tag schemas

2. `src/contacts/contacts.controller.ts`:
   - Add endpoints: `POST /contacts/:id/tags`, `DELETE /contacts/:id/tags/:tagId`

3. `src/contacts/contacts.service.ts`:
   - Add methods: `addTagsToContact()`, `removeTagFromContact()`
   - Populate category and tags in `findAll()` and `findOne()`

4. `src/app.module.ts`:
   - Import `CategoriesModule` and `TagsModule`

**Database Changes**:
- Create `categories` collection with indexes
- Create `tags` collection with indexes
- Update existing contacts with `categoryId` and `tagIds` fields (default: null/empty)

---

### Phase 3: Search & Filtering

**Goal**: Enable advanced search and filtering capabilities

**Files to Modify**:
1. `src/contacts/contacts.controller.ts`:
   - Add endpoint: `GET /contacts/search?q={query}`
   - Enhance endpoint: `GET /contacts?category=&tags=&city=&sortBy=&order=`

2. `src/contacts/contacts.service.ts`:
   - Add method: `search(query: string, options)`
   - Enhance method: `findAll(filters: FilterContactDto)`
   - Implement MongoDB text search
   - Implement aggregation pipeline for complex filters

3. Create `src/contacts/dto/filter-contact.dto.ts`:
   - Define filter parameters (category, tags, city, sortBy, order)
   - Validation logic

4. Create `src/contacts/dto/search-contact.dto.ts`:
   - Define search parameters (q, limit, offset)

**Database Changes**:
- Create text index on Contact schema (already defined in Phase 1)
- Ensure indexes on `categoryId`, `tagIds`, `city`

**Performance Optimization**:
- Use MongoDB aggregation pipeline for complex filters
- Limit results with pagination
- Add query performance logging

---

### Phase 4: Import/Export Functionality

**Goal**: Enable bulk import/export in CSV, JSON, vCard formats

**New Files to Create**:
1. `src/import-export/` (complete module)
   - `import-export.module.ts` - Feature module
   - `import-export.controller.ts` - Upload/download endpoints
   - `import-export.service.ts` - Orchestrates parsing/generation
   - `parsers/csv.parser.ts` - CSV parsing/generation
   - `parsers/json.parser.ts` - JSON parsing/generation
   - `parsers/vcard.parser.ts` - vCard parsing/generation
   - `dto/import-options.dto.ts` - Validation
   - `dto/export-options.dto.ts` - Validation

**Dependencies to Add**:
- `csv-parser` - Parse CSV files
- `json2csv` - Generate CSV from JSON
- `vcard-parser` - Parse vCard files
- `multer` - File upload handling (already included with Express)

**API Endpoints**:
- `GET /contacts/export?format={csv|json|vcard}` - Export all
- `POST /contacts/export` - Export with filters
- `POST /contacts/import/preview` - Preview import
- `POST /contacts/import` - Execute import

**Implementation Notes**:
- Use streams for large file handling
- Validate data before import (dry-run mode)
- Return detailed error reports
- Support category/tag resolution (create if not exists)

---

### Phase 5: API Refinement & Best Practices

**Goal**: Apply REST standards, validation, error handling

**Files to Modify**:
1. `src/contacts/contacts.controller.ts`:
   - Refactor endpoints to RESTful paths
   - Add validation decorators
   - Use standard response format

2. Create `src/common/filters/http-exception.filter.ts`:
   - Global exception handling
   - Standardized error responses

3. Create `src/common/interceptors/transform.interceptor.ts`:
   - Standardize success responses
   - Add timestamps

4. Create `src/common/pipes/validation.pipe.ts`:
   - Global validation pipe configuration

5. `src/main.ts`:
   - Register global pipes, filters, interceptors
   - Configure CORS
   - Add Swagger setup

**API Documentation**:
- Add `@nestjs/swagger` decorators to controllers
- Generate OpenAPI spec
- Serve Swagger UI at `/api/docs`

---
