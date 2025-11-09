# Epic 2: Contact Categories & Tags

**Priority**: HIGH
**Duration**: 1 week
**Phase**: 2

## Description

Implement contact categorization and tagging features to enable users to organize contacts through predefined categories (one per contact) and flexible tags (multiple per contact). This provides both structured classification and flexible labeling capabilities.

## Business Value

- Users can organize contacts by business relationship type (Client, Vendor, Lead, etc.)
- Flexible tagging enables custom organization schemes (VIP, Follow-up, Hot Lead, etc.)
- Improves contact discoverability and segmentation
- Foundation for advanced filtering and reporting features

## Technical Overview

This epic involves:
1. Creating Category and Tag entities/schemas in MongoDB
2. Adding categoryId and tagIds to Contact schema
3. Implementing CRUD operations for categories and tags
4. Implementing tag assignment/removal for contacts
5. Enforcing business rules (category deletion restrictions, tag uniqueness)
6. Creating comprehensive tests

## User Stories

### Story 2.1: Create Category Schema and Module

**As a** developer
**I want to** create the Category schema and module with CRUD operations
**So that** users can create and manage contact categories

**Acceptance Criteria**:
- Category schema created with fields: id, name, description, color, createdAt, updatedAt
- Category name is required and unique
- Color field stores hex color codes (optional)
- Category module created with controller, service, schema
- API endpoints implemented:
  - `GET /categories` - List all categories
  - `GET /categories/:id` - Get single category
  - `POST /categories` - Create category
  - `PUT /categories/:id` - Update category
  - `DELETE /categories/:id` - Delete category (with validation)
- DTOs created for create/update operations
- Validation prevents duplicate category names (case-insensitive)
- Delete fails if contacts are assigned to category

**Technical Notes**:
- Create `src/categories/schemas/category.schema.ts`
- Category name must be unique (add unique index)
- Use `@nestjs/mongoose` decorators
- Create DTOs: `CreateCategoryDto`, `UpdateCategoryDto`
- Implement soft validation for hex color codes

---

### Story 2.2: Create Tag Schema and Module

**As a** developer
**I want to** create the Tag schema and module with CRUD operations
**So that** users can create and manage reusable tags

**Acceptance Criteria**:
- Tag schema created with fields: id, name, color, usageCount, createdAt
- Tag name is required and unique (case-insensitive)
- Color field stores hex color codes (optional)
- usageCount tracks number of contacts with this tag
- Tag module created with controller, service, schema
- API endpoints implemented:
  - `GET /tags` - List all tags with usage counts
  - `GET /tags/:id` - Get single tag
  - `POST /tags` - Create tag
  - `PUT /tags/:id` - Update tag
  - `DELETE /tags/:id` - Delete tag
- DTOs created for create/update operations
- Tag names are case-insensitive and unique
- Deleting a tag removes it from all contacts and updates usageCount

**Technical Notes**:
- Create `src/tags/schemas/tag.schema.ts`
- Tag name must be unique with case-insensitive index
- Use compound index on name (lowercase) for uniqueness
- Update usageCount when tags are assigned/removed
- Create DTOs: `CreateTagDto`, `UpdateTagDto`

---

### Story 2.3: Add Category Reference to Contact

**As a** developer
**I want to** add categoryId reference to Contact schema
**So that** contacts can be assigned to categories

**Acceptance Criteria**:
- Contact schema updated with categoryId field (ObjectId reference)
- Category field is optional (nullable)
- Contact API responses include populated category information (id, name, color)
- Create/Update contact DTOs accept categoryId
- API endpoints updated:
  - `POST /contacts` - Accept categoryId in request body
  - `PUT /contacts/:id` - Accept categoryId in request body
  - `GET /contacts/:id` - Return populated category data
  - `GET /contacts` - Return populated category data for all contacts
- Invalid categoryId returns 400 error
- Deleting a category that has contacts fails with clear error message

**Technical Notes**:
- Add `categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: false }` to Contact schema
- Use `.populate('category')` to include category details in responses
- Validate categoryId exists before assignment
- Add method to check category usage before deletion

---

### Story 2.4: Implement Tag Assignment for Contacts

**As a** developer
**I want to** implement many-to-many relationship between contacts and tags
**So that** contacts can have multiple tags assigned

**Acceptance Criteria**:
- Contact schema updated with tagIds array (ObjectId references)
- API endpoints implemented:
  - `POST /contacts/:id/tags` - Add tags to contact (accepts array of tag IDs)
  - `DELETE /contacts/:id/tags/:tagId` - Remove single tag from contact
  - `GET /contacts/:id` - Return populated tag data
- Contact responses include populated tag information (id, name, color)
- Adding duplicate tags is idempotent (no error, no duplicate)
- Invalid tagId returns 400 error
- Tag usageCount automatically increments/decrements on assignment/removal
- Deleting a tag removes it from all contacts

**Technical Notes**:
- Add `tagIds: [{ type: Schema.Types.ObjectId, ref: 'Tag' }]` to Contact schema
- Use `.populate('tags')` to include tag details in responses
- Validate all tagIds exist before assignment
- Use `$addToSet` to prevent duplicate tag assignments
- Implement cascade logic when deleting tags (remove from all contacts)
- Update tag.usageCount using aggregation or manual counter

---

### Story 2.5: Seed Default Categories

**As a** developer
**I want to** create a seed script for default categories
**So that** users have predefined categories available on first use

**Acceptance Criteria**:
- Seed script creates default categories: Client, Vendor, Personal, Lead, Other
- Each default category has appropriate color codes
- Seed script is idempotent (doesn't create duplicates)
- Seed runs automatically on application startup if categories don't exist
- Seed can be run manually via CLI command

**Technical Notes**:
- Create `src/scripts/seed-categories.ts`
- Default categories:
  - Client (color: #4CAF50)
  - Vendor (color: #2196F3)
  - Personal (color: #FF9800)
  - Lead (color: #9C27B0)
  - Other (color: #607D8B)
- Check for existence before creating
- Add seed to application bootstrap or migration

---

## Success Criteria

- ✅ Users can create/read/update/delete categories
- ✅ Users can create/read/update/delete tags
- ✅ Users can assign one category to contacts
- ✅ Users can assign multiple tags to contacts
- ✅ Cannot delete category if contacts are assigned
- ✅ Deleting tag removes it from all contacts
- ✅ Tag usage counts are accurate
- ✅ All tests passing (unit and integration)
- ✅ API documentation updated

## Technical Requirements

- MongoDB indexes for category.name and tag.name (unique, case-insensitive)
- Proper error handling for constraint violations
- DTOs with validation for all endpoints
- Population of references in GET responses

## Dependencies

- Epic 1 (Database Migration) must be completed
- MongoDB with Mongoose

## Risks & Mitigation

**Risk**: Tag usageCount becomes inaccurate
**Mitigation**: Use transactions for tag operations, implement periodic reconciliation job

**Risk**: Performance issues with populated queries
**Mitigation**: Add proper indexes, consider caching for frequently accessed categories/tags
