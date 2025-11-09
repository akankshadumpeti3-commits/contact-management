# Epic 1: Database Migration Foundation

**Priority**: HIGH
**Duration**: 1-2 weeks
**Phase**: 1

## Description

Migrate the contact management system from MySQL/TypeORM to MongoDB/Mongoose to support flexible schema design, better scalability for document-based contact data, and prepare the foundation for advanced features like tagging, categorization, and full-text search.

## Business Value

- Enables flexible schema evolution for contact data
- Supports advanced querying capabilities (text search, aggregations)
- Improves scalability for growing contact databases
- Reduces complexity for nested/embedded data structures

## Technical Overview

This epic involves:
1. Installing and configuring MongoDB
2. Installing Mongoose and @nestjs/mongoose packages
3. Creating Mongoose schemas matching current Contact fields
4. Replacing TypeORM with Mongoose throughout the Contact module
5. Migrating existing contact data from MySQL to MongoDB
6. Validating data integrity and updating tests

## User Stories

### Story 1.1: MongoDB Setup and Configuration

**As a** developer
**I want to** install and configure MongoDB with Mongoose in the NestJS application
**So that** the application can connect to MongoDB and prepare for data migration

**Acceptance Criteria**:
- MongoDB is installed and running locally or via Docker
- Mongoose and @nestjs/mongoose packages are installed
- MongoDB connection is configured in `app.module.ts`
- Connection string uses environment variables
- Application starts successfully with MongoDB connection
- Connection error handling is implemented

**Technical Notes**:
- Install: `mongodb`, `mongoose`, `@nestjs/mongoose`
- Configure connection in `app.module.ts` using `MongooseModule.forRoot()`
- Environment variables: `MONGODB_URI`, `MONGODB_DATABASE`

---

### Story 1.2: Create Contact Mongoose Schema

**As a** developer
**I want to** create a Mongoose schema for Contact matching current TypeORM entity fields
**So that** contact data can be stored in MongoDB with proper validation

**Acceptance Criteria**:
- Contact schema created with all existing fields: name, title, email, phone, address, city
- Field validations match current requirements (required fields, unique email, etc.)
- Timestamps (createdAt, updatedAt) are automatically managed
- Schema file follows NestJS/Mongoose conventions
- DTOs remain unchanged (API contract preserved)

**Technical Notes**:
- Create `src/contacts/schemas/contact.schema.ts`
- Use `@Schema()` decorator with `timestamps: true`
- Email field must be unique and required
- Name field must be required

---

### Story 1.3: Replace TypeORM with Mongoose in Contact Module

**As a** developer
**I want to** refactor the Contact module to use Mongoose instead of TypeORM
**So that** all contact operations use MongoDB

**Acceptance Criteria**:
- Contact service uses Mongoose Model instead of TypeORM Repository
- All CRUD operations (create, findAll, findOne, update, delete) work correctly
- Existing API endpoints function without changes
- DTOs and validation remain unchanged
- Error handling is maintained
- No TypeORM dependencies remain in Contact module

**Technical Notes**:
- Update `contacts.module.ts` to import `MongooseModule.forFeature([Contact])`
- Inject `Model<Contact>` in `contacts.service.ts` instead of TypeORM Repository
- Replace TypeORM query methods with Mongoose equivalents:
  - `repository.find()` → `model.find().exec()`
  - `repository.findOne()` → `model.findById()` or `model.findOne()`
  - `repository.save()` → `model.create()` or `document.save()`
  - `repository.update()` → `model.findByIdAndUpdate()`
  - `repository.remove()` → `model.findByIdAndDelete()`

---

### Story 1.4: Data Migration Script

**As a** developer
**I want to** create a migration script to transfer existing contacts from MySQL to MongoDB
**So that** no contact data is lost during the database transition

**Acceptance Criteria**:
- Migration script successfully connects to both MySQL and MongoDB
- All contact records are transferred from MySQL to MongoDB
- Data integrity validated (record counts match, all fields populated)
- Migration is idempotent (can be run multiple times safely)
- Migration logs progress and any errors
- Rollback capability documented

**Technical Notes**:
- Create script in `src/scripts/migrate-contacts.ts`
- Use TypeORM to read from MySQL
- Use Mongoose to write to MongoDB
- Validate email uniqueness during migration
- Log any data inconsistencies

---

### Story 1.5: Update Tests for MongoDB

**As a** developer
**I want to** update all contact-related tests to use MongoDB test database
**So that** the test suite validates MongoDB implementation

**Acceptance Criteria**:
- All existing unit tests pass with Mongoose implementation
- All existing integration tests pass with MongoDB
- Test database setup uses in-memory MongoDB or test container
- Tests are isolated (no cross-test data contamination)
- Test performance is acceptable (< 30s for full suite)

**Technical Notes**:
- Use `mongodb-memory-server` for unit/integration tests
- Update test setup to create MongoDB test connection
- Update test teardown to clean test database
- Mock Mongoose models in unit tests where appropriate

---

## Success Criteria

- ✅ MongoDB operational with migrated data
- ✅ Existing API endpoints work identically with MongoDB
- ✅ All tests passing (unit and integration)
- ✅ No data loss from migration
- ✅ Application performance maintained or improved
- ✅ TypeORM dependencies removed from Contact module

## Dependencies

- MongoDB installation/Docker container
- Mongoose packages
- MongoDB memory server for testing

## Risks & Mitigation

**Risk**: Data loss during migration
**Mitigation**: Backup MySQL data before migration, validate record counts, test migration on copy first

**Risk**: API behavior changes unexpectedly
**Mitigation**: Comprehensive integration tests, manual API testing

**Risk**: Performance degradation
**Mitigation**: Benchmark queries before/after migration, add indexes as needed
