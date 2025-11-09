# Quick Reference - Key Files and Entry Points

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
