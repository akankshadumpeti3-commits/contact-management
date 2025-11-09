# Data Models and APIs

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
