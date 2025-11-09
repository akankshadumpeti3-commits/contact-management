# Contact Management System - Brownfield Architecture Document

## Introduction

This document captures the **CURRENT STATE** of the Contact Management System (NestJS backend) and provides architectural guidance for implementing the enhancements outlined in `docs/prd.md`. This is a brownfield architecture document that reflects reality, including technical debt, workarounds, and constraints that must be respected during enhancement.

### Document Scope

**Focus Area**: Architecture documentation for implementing:
- Database migration from MySQL to MongoDB
- Contact categorization and tagging features
- Search and filtering capabilities
- Import/export functionality

This document serves as the primary reference for AI development agents working on the enhancement project.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-09 | 1.0 | Initial brownfield architecture analysis | Winston (Architect) |

---

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

**Current Entry Points**:
- **Main Entry**: `src/main.ts` - Application bootstrap
- **Root Module**: `src/app.module.ts` - Application configuration and module registration
- **Configuration**: Database connection hardcoded in `app.module.ts` (⚠️ Technical Debt)

**Core Business Logic**:
- **Contact Controller**: `src/contacts/contacts.controller.ts` - HTTP request handlers
- **Contact Service**: `src/contact/contact.service.ts` - Business logic (note different folder structure)
- **Contact Entity**: `src/entities/contact.entity.ts` - TypeORM entity definition

**Database Configuration**:
- `package.json` - Dependencies (TypeORM v0.2.29, MySQL v2.18.1)
- `src/app.module.ts:11-18` - TypeORM connection config (⚠️ credentials exposed, synchronize enabled)

### Enhancement Impact Areas

Based on the PRD requirements, the following files will be **modified or created**:

**Files Requiring Major Modification**:
- `src/app.module.ts` - Replace TypeORM with Mongoose configuration
- `src/entities/contact.entity.ts` → Migrate to `src/contacts/schemas/contact.schema.ts`
- `src/contact/contact.service.ts` - Refactor to use Mongoose
- `src/contacts/contacts.controller.ts` - Add new endpoints (search, filter, import/export)
- `package.json` - Update dependencies (remove TypeORM/MySQL, add Mongoose)

**New Modules to Create**:
- `src/categories/` - Category management module
- `src/tags/` - Tag management module
- `src/import-export/` - Import/export functionality
- `src/common/` - Shared utilities (DTOs, filters, interceptors)
- `src/config/` - Configuration management (externalize database config)

---

## High Level Architecture

### Current System Overview

The Contact Management System is a **greenfield-to-brownfield** NestJS application with basic CRUD functionality for contact management. The system follows a traditional three-tier architecture:

1. **Presentation Layer**: RESTful API (NestJS Controllers)
2. **Business Logic Layer**: Services (NestJS Services)
3. **Data Access Layer**: TypeORM + MySQL

**Current Architecture Pattern**:
```
┌─────────────────────────────────────────┐
│         HTTP Requests (REST API)        │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────▼─────────┐
         │   Controllers     │  (Routing, Request Handling)
         │  - AppController  │
         │  - ContactsController
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │     Services      │  (Business Logic)
         │  - AppService     │
         │  - ContactService │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │  TypeORM Repositories │ (Data Access)
         │  - Repository<Contact> │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │   MySQL Database  │  (Data Storage)
         │  Database: nestng │
         └───────────────────┘
```

### Target Architecture (Post-Enhancement)

After implementing the PRD requirements, the architecture will evolve to:

```
┌──────────────────────────────────────────────────────────────┐
│               HTTP Requests (REST API)                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
          ┌──────────────▼───────────────┐
          │      Global Middleware       │
          │  - Exception Filters         │
          │  - Validation Pipes          │
          │  - Logging Interceptors      │
          └──────────────┬───────────────┘
                         │
    ┌────────────────────┼──────────────────────────┐
    │                    │                          │
┌───▼────────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  Contacts  │  │  Categories  │  │     Tags     │
│ Controller │  │  Controller  │  │  Controller  │
└─────┬──────┘  └──────┬───────┘  └──────┬───────┘
      │                │                  │
┌─────▼──────┐  ┌──────▼───────┐  ┌──────▼───────┐
│  Contacts  │  │  Categories  │  │     Tags     │
│  Service   │  │   Service    │  │   Service    │
└─────┬──────┘  └──────┬───────┘  └──────┬───────┘
      │                │                  │
┌─────▼─────────────────▼──────────────────▼──────┐
│        Mongoose ODM (Data Access Layer)         │
│  - Contact Model     - Category Model           │
│  - Tag Model         - Indexes & Validation     │
└──────────────────────┬───────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │      MongoDB Database       │
        │  Collections: contacts,     │
        │  categories, tags           │
        └─────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         Import/Export Module                    │
│  - CSV Parser/Generator                         │
│  - JSON Parser/Generator                        │
│  - vCard Parser/Generator                       │
│  - File Upload Handling                         │
└─────────────────────────────────────────────────┘
```

---

## Technical Summary

### Current Tech Stack (As-Is)

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| **Runtime** | Node.js | v14.x+ | Inferred from NestJS v7 compatibility |
| **Framework** | NestJS | v7.0.0 | Core framework |
| **Language** | TypeScript | v3.7.4 | Static typing |
| **ORM** | TypeORM | v0.2.29 | Database abstraction layer |
| **Database** | MySQL | v2.18.1 | Relational database |
| **Platform** | Express | v4.x | HTTP server (via @nestjs/platform-express) |
| **Testing** | Jest | v26.4.2 | Unit and integration testing |
| **Validation** | ❌ None | - | ⚠️ Missing input validation |
| **API Docs** | ❌ None | - | ⚠️ No Swagger/OpenAPI |

### Target Tech Stack (To-Be)

| Category | Technology | Version | Change Type | Reason |
|----------|------------|---------|-------------|--------|
| **Runtime** | Node.js | v14.x+ | KEEP | Stable, compatible |
| **Framework** | NestJS | v7.0.0 | KEEP | Core framework preserved |
| **Language** | TypeScript | v3.7.4 | KEEP | Static typing |
| **ODM** | **Mongoose** | **Latest (v6.x)** | **ADD** | MongoDB object modeling |
| **ORM** | ~~TypeORM~~ | ~~v0.2.29~~ | **REMOVE** | Replaced by Mongoose |
| **Database** | ~~MySQL~~ → **MongoDB** | **v4.4+** | **REPLACE** | Flexible schema, better scalability |
| **Platform** | Express | v4.x | KEEP | HTTP server |
| **Testing** | Jest | v26.4.2 | KEEP | Testing framework |
| **Validation** | **class-validator** | **Latest** | **ADD** | Input validation |
| **Transformation** | **class-transformer** | **Latest** | **ADD** | DTO transformation |
| **API Docs** | **@nestjs/swagger** | **v4.x** | **ADD** | OpenAPI documentation |
| **CSV Parsing** | **csv-parser** | **Latest** | **ADD** | CSV import |
| **CSV Generation** | **json2csv** | **Latest** | **ADD** | CSV export |
| **vCard** | **vcard-parser** | **Latest** | **ADD** | vCard import/export |

### Repository Structure

**Type**: Monorepo structure (backend + frontend in parent directory)

**Current Structure**:
```
D:\bmad\greenfield\nestjs-api\
├── backend/                    # NestJS API (THIS PROJECT)
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   ├── main.ts
│   │   ├── contact/            # ⚠️ Inconsistent naming (singular)
│   │   │   └── contact.service.ts
│   │   ├── contacts/           # ⚠️ Inconsistent naming (plural)
│   │   │   └── contacts.controller.ts
│   │   └── entities/
│   │       └── contact.entity.ts
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
└── frontend/                   # Angular frontend (separate repo)
```

**Target Structure** (Post-Enhancement):
```
backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module (MongoDB config)
│   ├── app.controller.ts       # Root controller (health check)
│   ├── app.service.ts          # Root service
│   │
│   ├── contacts/               # ✅ Consolidated contact module
│   │   ├── contacts.module.ts
│   │   ├── contacts.controller.ts  # Enhanced with search, filter
│   │   ├── contacts.service.ts     # Refactored for Mongoose
│   │   ├── schemas/
│   │   │   └── contact.schema.ts   # Mongoose schema
│   │   ├── dto/
│   │   │   ├── create-contact.dto.ts
│   │   │   ├── update-contact.dto.ts
│   │   │   ├── filter-contact.dto.ts
│   │   │   └── search-contact.dto.ts
│   │   └── interfaces/
│   │       └── contact.interface.ts
│   │
│   ├── categories/             # ✅ NEW MODULE
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── schemas/
│   │   │   └── category.schema.ts
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       └── update-category.dto.ts
│   │
│   ├── tags/                   # ✅ NEW MODULE
│   │   ├── tags.module.ts
│   │   ├── tags.controller.ts
│   │   ├── tags.service.ts
│   │   ├── schemas/
│   │   │   └── tag.schema.ts
│   │   └── dto/
│   │       ├── create-tag.dto.ts
│   │       └── update-tag.dto.ts
│   │
│   ├── import-export/          # ✅ NEW MODULE
│   │   ├── import-export.module.ts
│   │   ├── import-export.controller.ts
│   │   ├── import-export.service.ts
│   │   ├── parsers/
│   │   │   ├── csv.parser.ts
│   │   │   ├── json.parser.ts
│   │   │   └── vcard.parser.ts
│   │   └── dto/
│   │       ├── import-options.dto.ts
│   │       └── export-options.dto.ts
│   │
│   ├── common/                 # ✅ NEW - Shared utilities
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── decorators/
│   │       └── api-response.decorator.ts
│   │
│   └── config/                 # ✅ NEW - Configuration management
│       ├── database.config.ts  # MongoDB connection config
│       └── app.config.ts       # Application settings
│
├── test/                       # E2E tests
├── docs/                       # ✅ Documentation
│   ├── prd.md                  # Product requirements
│   ├── architecture.md         # This document
│   └── api/                    # API documentation
├── .env.example                # ✅ Environment variables template
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## Source Tree and Module Organization

### Current Modules (As-Is)

#### 1. App Module (`src/app.module.ts`)

**Purpose**: Root module that bootstraps the application

**Current Implementation**:
```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      database: 'nestng',
      username: 'root',
      password: '',  // ⚠️ Empty password (development only)
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,  // ⚠️ DANGEROUS in production
    }),
    TypeOrmModule.forFeature([Contact]),
  ],
  controllers: [AppController, ContactsController],
  providers: [AppService, ContactService],
})
```

**Technical Debt**:
- ❌ **Hardcoded database credentials** - Security risk, not environment-aware
- ❌ **synchronize: true** - Auto-creates schema, dangerous in production (data loss risk)
- ❌ **No host/port configuration** - Assumes localhost
- ❌ **Flat provider registration** - All services registered in root module (doesn't scale)

**Required Changes for PRD**:
```typescript
// Target implementation with Mongoose
@Module({
  imports: [
    ConfigModule.forRoot({  // ✅ Environment config
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({  // ✅ Async configuration
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/contact-management',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    ContactsModule,      // ✅ Feature module
    CategoriesModule,    // ✅ New module
    TagsModule,          // ✅ New module
    ImportExportModule,  // ✅ New module
  ],
  controllers: [AppController],  // ✅ Only root controller
  providers: [AppService],       // ✅ Only root service
})
```

#### 2. Contacts Module (Current State)

**Current Structure**:
- `src/contacts/contacts.controller.ts` - Controller (plural folder)
- `src/contact/contact.service.ts` - Service (singular folder) ⚠️
- `src/entities/contact.entity.ts` - Entity (separate folder)

**Inconsistency Issue**:
The controller and service are in **different folders** with **inconsistent naming** (contacts vs contact). This is technical debt that should be resolved.

**Current Contact Entity** (`src/entities/contact.entity.ts`):
```typescript
@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    title: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    address: string;

    @Column()
    city: string;
}
```

**Current Contact Controller** (`src/contacts/contacts.controller.ts`):
```typescript
@Controller('contacts')
export class ContactsController {
    constructor(private contactService: ContactService) {}

    @Get()  // GET /contacts
    read(): Promise<Contact[]> {
        return this.contactService.readAll();
    }

    @Post('create')  // ❌ POST /contacts/create (not RESTful)
    async create(@Body() contact: Contact): Promise<any> {
        return this.contactService.create(contact);
    }

    @Put(':id/update')  // ❌ PUT /contacts/:id/update (not RESTful)
    async update(@Param('id') id, @Body() contact: Contact): Promise<any> {
        contact.id = Number(id);
        return this.contactService.update(contact);
    }

    @Delete(':id/delete')  // ❌ DELETE /contacts/:id/delete (not RESTful)
    async delete(@Param('id') id): Promise<any> {
        return this.contactService.delete(id);
    }
}
```

**API Pattern Issues**:
- ❌ Endpoint paths include verbs (`/create`, `/update`, `/delete`)
- ❌ Not following RESTful conventions
- ❌ No input validation (accepts raw Contact entity)
- ❌ No error handling
- ❌ Type `any` used instead of specific types

**Current Contact Service** (`src/contact/contact.service.ts`):
```typescript
@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>
    ) {}

    async create(contact: Contact): Promise<Contact> {
        return await this.contactRepository.save(contact);
    }

    async readAll(): Promise<Contact[]> {
        return await this.contactRepository.find();
    }

    async update(contact: Contact): Promise<UpdateResult> {
        return await this.contactRepository.update(contact.id, contact);
    }

    async delete(id): Promise<DeleteResult> {
        return await this.contactRepository.delete(id);
    }
}
```

**Service Issues**:
- ✅ Clean implementation for basic CRUD
- ❌ No error handling (e.g., contact not found)
- ❌ No validation logic
- ❌ Missing search/filter capabilities
- ❌ Returns UpdateResult/DeleteResult instead of Contact

**Target Implementation**:
```typescript
// contacts.schema.ts - Mongoose Schema
@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ maxlength: 100 })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ maxlength: 20 })
  phone: string;

  @Prop({ maxlength: 200 })
  address: string;

  @Prop({ maxlength: 100, index: true })
  city: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  categoryId: mongoose.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  tagIds: mongoose.Types.ObjectId[];

  // Timestamps automatically added: createdAt, updatedAt
}

export type ContactDocument = Contact & Document;
export const ContactSchema = SchemaFactory.createForClass(Contact);

// Create text index for search
ContactSchema.index({
  name: 'text',
  title: 'text',
  email: 'text',
  phone: 'text',
  address: 'text',
  city: 'text',
});
```

---

## Data Models and APIs

### Current Data Model

**Contact Entity** (TypeORM):
- Located: `src/entities/contact.entity.ts`
- Fields:
  - `id` - Auto-increment integer (Primary Key)
  - `name` - String
  - `title` - String
  - `email` - String (not unique, not validated ⚠️)
  - `phone` - String
  - `address` - String
  - `city` - String

**Missing Features**:
- ❌ No timestamps (createdAt, updatedAt)
- ❌ No email uniqueness constraint
- ❌ No relationships (categories, tags)
- ❌ No validation decorators

### Target Data Models (MongoDB)

#### Contact Model

**Schema Definition**: `src/contacts/schemas/contact.schema.ts`

```typescript
{
  _id: ObjectId,                      // MongoDB auto-generated
  name: String (required, max 100),
  title: String (max 100),
  email: String (required, unique, lowercase),
  phone: String (max 20),
  address: String (max 200),
  city: String (max 100, indexed),
  categoryId: ObjectId (ref: 'Category'),  // ✅ NEW
  tagIds: [ObjectId] (ref: 'Tag'),         // ✅ NEW
  createdAt: Date,                         // ✅ Auto-managed
  updatedAt: Date,                         // ✅ Auto-managed
}
```

**Indexes**:
- `email` - Unique index
- `categoryId` - Query optimization
- `tagIds` - Array index for tag filtering
- `city` - Query optimization
- Text index on `name`, `title`, `email`, `phone`, `address`, `city` for full-text search

#### Category Model

**Schema Definition**: `src/categories/schemas/category.schema.ts`

```typescript
{
  _id: ObjectId,
  name: String (required, unique, max 50),
  description: String,
  color: String (hex color, default: '#3B82F6'),
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes**:
- `name` - Unique index

#### Tag Model

**Schema Definition**: `src/tags/schemas/tag.schema.ts`

```typescript
{
  _id: ObjectId,
  name: String (required, unique, lowercase, max 30),
  color: String (hex color),
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes**:
- `name` - Unique index (case-insensitive)

**Virtual Field**:
- `usageCount` - Computed from Contact collection (count of contacts with this tag)

### API Specifications

#### Current API Endpoints (As-Is)

| Method | Endpoint | Description | Issues |
|--------|----------|-------------|--------|
| GET | `/contacts` | List all contacts | ✅ RESTful |
| POST | `/contacts/create` | Create contact | ❌ Verb in path |
| PUT | `/contacts/:id/update` | Update contact | ❌ Verb in path |
| DELETE | `/contacts/:id/delete` | Delete contact | ❌ Verb in path |

**Response Format**: Raw entity/database response (no standardization)

#### Target API Endpoints (To-Be)

**Contacts API**:
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/contacts` | List all contacts (with filters, pagination) | ENHANCED |
| GET | `/contacts/search?q={query}` | Search contacts | NEW |
| GET | `/contacts/:id` | Get contact by ID | NEW |
| POST | `/contacts` | Create contact | ENHANCED (RESTful) |
| PUT | `/contacts/:id` | Update contact | ENHANCED (RESTful) |
| DELETE | `/contacts/:id` | Delete contact | ENHANCED (RESTful) |
| POST | `/contacts/:id/tags` | Add tags to contact | NEW |
| DELETE | `/contacts/:id/tags/:tagId` | Remove tag from contact | NEW |
| GET | `/contacts/export` | Export contacts (CSV/JSON/vCard) | NEW |
| POST | `/contacts/import/preview` | Preview import data | NEW |
| POST | `/contacts/import` | Import contacts | NEW |

**Categories API**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| GET | `/categories/:id` | Get category by ID |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category (if no contacts assigned) |

**Tags API**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tags` | List all tags (with usage counts) |
| GET | `/tags/:id` | Get tag by ID |
| POST | `/tags` | Create tag |
| PUT | `/tags/:id` | Update tag |
| DELETE | `/tags/:id` | Delete tag (removes from all contacts) |

**Standard Response Format**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
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

**Pagination Response**:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  },
  "timestamp": "2025-11-09T12:00:00Z"
}
```

---

## Technical Debt and Known Issues

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

## Integration Points and External Dependencies

### Internal Integration Points

**Frontend Communication**:
- **Type**: REST API over HTTP
- **Format**: JSON
- **CORS**: Not configured (assumes same-origin or needs configuration)
- **Authentication**: None (⚠️ All endpoints public)

**Database Communication**:
- **Current**: TypeORM → MySQL (local connection)
- **Target**: Mongoose → MongoDB
- **Connection Pooling**: Needs configuration for MongoDB

### External Dependencies

**Current External Services**: None

**Target External Services** (Future):
- Email service (for contact notifications) - Out of scope
- Cloud storage (for file attachments) - Out of scope

### Database Migration Strategy

**Migration Tool**: Custom migration script

**Process**:
1. Export all contacts from MySQL to JSON
2. Transform data structure (add new fields)
3. Import into MongoDB collections
4. Validate record counts and data integrity

**Migration Script Location**: `scripts/migrate-mysql-to-mongodb.ts` (to be created)

---

## Development and Deployment

### Local Development Setup (Current)

**Prerequisites**:
- Node.js v14.x or higher
- MySQL server running on localhost
- MySQL database `nestng` created

**Steps**:
1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure MySQL is running and database `nestng` exists

3. Start development server:
   ```bash
   npm run start:dev
   ```

**Known Issues**:
- README has typo: `pm run start:dev` should be `npm run start:dev`
- No `.env` file support (configuration hardcoded)
- Database must be manually created before first run

### Local Development Setup (Target)

**Prerequisites**:
- Node.js v14.x or higher
- MongoDB server running (local or MongoDB Atlas)

**Steps**:
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Configure MongoDB connection in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/contact-management
   NODE_ENV=development
   PORT=3000
   ```

4. Start development server:
   ```bash
   npm run start:dev
   ```

**Database Auto-Setup**:
- MongoDB collections created automatically
- Indexes created on application startup
- No manual database creation required

### Build and Deployment Process

**Build Command**:
```bash
npm run build  # Compiles TypeScript to dist/
```

**Production Start**:
```bash
npm run start:prod  # Runs from dist/main.js
```

**Environment Variables (Required for Production)**:
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/contact-management
NODE_ENV=production
PORT=3000
```

**Deployment Checklist**:
- [ ] MongoDB instance provisioned (Atlas or self-hosted)
- [ ] Environment variables configured
- [ ] Application built (`npm run build`)
- [ ] Migration script executed (MySQL → MongoDB)
- [ ] Data integrity validated
- [ ] Health check endpoint verified
- [ ] API documentation deployed

---

## Testing Reality

### Current Test Coverage

**Unit Tests**:
- Coverage: Unknown (no recent test run documented)
- Location: `src/**/*.spec.ts`
- Framework: Jest v26.4.2

**Integration Tests**:
- Location: `test/` (e2e tests)
- Configuration: `test/jest-e2e.json`
- Status: Likely not comprehensive

**Test Commands**:
```bash
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # End-to-end tests
```

**Known Gaps**:
- ❌ No tests for contact controller/service (likely)
- ❌ No integration tests with real database
- ❌ No API endpoint tests

### Target Test Strategy

**Unit Tests** (Service Layer):
- Test business logic in isolation
- Mock Mongoose repositories
- Cover edge cases (validation, errors)
- Target: 80% code coverage

**Integration Tests** (API Layer):
- Test full request/response cycle
- Use in-memory MongoDB (mongodb-memory-server)
- Validate DTOs, error handling, status codes
- Target: 100% endpoint coverage

**E2E Tests** (Full System):
- Test critical user workflows
- Use test database (separate from dev)
- Cover: Create → Tag → Search → Export flow

**Test Data**:
- Fixtures for sample contacts, categories, tags
- Factory pattern for generating test data

---

## Enhancement Implementation Guide

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

## Security Considerations

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

## Performance Considerations

### Database Optimization

**Indexes** (MongoDB):
- Contact: `email` (unique), `categoryId`, `tagIds`, `city`
- Contact: Text index on searchable fields
- Category: `name` (unique)
- Tag: `name` (unique)

**Connection Pooling**:
- Configure Mongoose connection pool (default: 5 connections)
- Adjust based on load testing

**Query Optimization**:
- Use `.lean()` for read-only queries (faster)
- Use `.select()` to limit returned fields
- Use aggregation pipeline for complex queries

### Application Optimization

**Caching** (Future Enhancement):
- Redis for frequently accessed data (categories, tags)
- Cache invalidation strategy

**Pagination**:
- Default limit: 50 contacts per page
- Max limit: 100 contacts per page

**Streaming**:
- Use Node.js streams for import/export of large files
- Prevent memory overflow

---

## Appendix

### Useful Commands

**Development**:
```bash
npm run start:dev     # Start dev server (watch mode)
npm run build         # Build for production
npm run start:prod    # Run production build
```

**Testing**:
```bash
npm test              # Run unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # End-to-end tests
```

**Database**:
```bash
# Migration script (to be created)
npm run migrate:mysql-to-mongo

# Seed sample data (to be created)
npm run seed
```

**Linting & Formatting**:
```bash
npm run lint          # ESLint check and fix
npm run format        # Prettier format
```

### Debugging and Troubleshooting

**Logs**: Console output (enhance with winston/pino logger in future)

**Common Issues**:

1. **"Cannot connect to database"**
   - Check MongoDB is running: `mongod --version`
   - Verify connection string in `.env`

2. **"Duplicate key error"**
   - Email must be unique
   - Check for duplicate emails in import data

3. **"File too large"**
   - Default upload limit: 10MB
   - Adjust in `main.ts` if needed

4. **"Module not found"**
   - Run `npm install`
   - Check `tsconfig.json` paths configuration

### MongoDB Queries Reference

**Find contacts by category**:
```javascript
db.contacts.find({ categoryId: ObjectId("...") })
```

**Find contacts with specific tag**:
```javascript
db.contacts.find({ tagIds: ObjectId("...") })
```

**Text search**:
```javascript
db.contacts.find({ $text: { $search: "john" } })
```

**Count tag usage**:
```javascript
db.contacts.countDocuments({ tagIds: ObjectId("...") })
```

---

## Conclusion

This brownfield architecture document provides a comprehensive view of the **current state** of the Contact Management System and a clear roadmap for implementing the enhancements outlined in the PRD.

**Key Takeaways**:

1. **Database Migration**: Critical first step - replace MySQL with MongoDB
2. **Preserve Patterns**: Maintain NestJS architecture while enhancing
3. **Technical Debt**: Address critical issues (security, validation, structure)
4. **Phased Approach**: Five clear phases from foundation to refinement
5. **Production Ready**: Target system follows best practices and is scalable

This document should be used as the **primary reference** for all development work on this enhancement project.

---

**END OF ARCHITECTURE DOCUMENT**
