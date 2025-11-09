# Feature Requirements

### Feature 1: Contact Categorization & Tagging

#### F1.1 - Contact Categories

**Description**: Enable users to assign contacts to predefined or custom categories for organizational purposes.

**Requirements**:
- Each contact can belong to **one category** (e.g., Client, Vendor, Personal, Lead)
- System provides default categories: `Client`, `Vendor`, `Personal`, `Lead`, `Other`
- Users can create custom categories
- Categories have properties:
  - `id`: Unique identifier
  - `name`: Category name (required, unique)
  - `description`: Optional description
  - `color`: Hex color code for UI display
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

**API Endpoints (New)**:
- `GET /categories` - List all categories
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category (only if no contacts assigned)

**Database Schema Changes**:
- New `Category` collection/entity
- Contact entity updated with `categoryId` reference

**Acceptance Criteria**:
- ✅ Users can view list of all categories
- ✅ Users can create custom categories with name, description, color
- ✅ Users can assign a category to a contact
- ✅ Users can change contact's category
- ✅ Cannot delete category if contacts are assigned to it
- ✅ Deleting a contact does not delete the category

#### F1.2 - Contact Tags

**Description**: Enable users to assign multiple tags to contacts for flexible labeling and organization.

**Requirements**:
- Each contact can have **multiple tags** (many-to-many relationship)
- Tags are simple labels (e.g., "VIP", "Follow-up", "Hot Lead", "Newsletter")
- Users can create tags on-the-fly when adding to a contact
- Tags are reusable across contacts
- Tags have properties:
  - `id`: Unique identifier
  - `name`: Tag name (required, unique, case-insensitive)
  - `color`: Optional hex color code
  - `usageCount`: Number of contacts with this tag
  - `createdAt`: Timestamp

**API Endpoints (New)**:
- `GET /tags` - List all tags (with usage counts)
- `POST /tags` - Create new tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag (removes from all contacts)
- `POST /contacts/:id/tags` - Add tags to contact
- `DELETE /contacts/:id/tags/:tagId` - Remove tag from contact

**Database Schema Changes**:
- New `Tag` collection/entity
- Many-to-many relationship between Contact and Tag

**Acceptance Criteria**:
- ✅ Users can create tags with name and optional color
- ✅ Users can assign multiple tags to a contact
- ✅ Users can remove tags from a contact
- ✅ Tags show usage count (how many contacts use this tag)
- ✅ Deleting a tag removes it from all contacts
- ✅ Tag names are case-insensitive and unique

---

### Feature 2: Search & Filtering

#### F2.1 - Advanced Contact Search

**Description**: Enable users to search contacts using full-text search across multiple fields.

**Requirements**:
- Search across fields: `name`, `title`, `email`, `phone`, `address`, `city`
- Case-insensitive search
- Partial match support (e.g., "john" matches "John Doe", "Johnny Smith")
- Return results ranked by relevance
- Search returns matching contacts with highlighted matches (backend provides match info)

**API Endpoints (Enhanced)**:
- `GET /contacts/search?q={query}` - Search contacts by keyword
  - Query params:
    - `q`: Search query string (required)
    - `limit`: Max results (default: 50)
    - `offset`: Pagination offset (default: 0)

**Technical Implementation**:
- Leverage MongoDB's text search capabilities
- Create text indexes on searchable fields
- Return total count for pagination

**Acceptance Criteria**:
- ✅ Search returns contacts matching the query across all text fields
- ✅ Search is case-insensitive
- ✅ Partial matches are supported
- ✅ Results include total count for pagination
- ✅ Empty query returns validation error
- ✅ Search performance < 500ms for 10,000 contacts

#### F2.2 - Contact Filtering

**Description**: Enable users to filter contacts by category, tags, and other criteria.

**Requirements**:
- Filter contacts by:
  - **Category**: Single category filter
  - **Tags**: Multiple tags (AND/OR logic)
  - **City**: Exact match or list of cities
  - **Custom filters**: Extensible for future additions
- Combine multiple filters (AND logic)
- Support sorting: by name, email, createdAt, updatedAt

**API Endpoints (Enhanced)**:
- `GET /contacts?category={categoryId}` - Filter by category
- `GET /contacts?tags={tagId1,tagId2}&tagMatch={any|all}` - Filter by tags
  - `tagMatch=any`: Contacts with ANY of the specified tags (OR)
  - `tagMatch=all`: Contacts with ALL of the specified tags (AND)
- `GET /contacts?city={city}` - Filter by city
- `GET /contacts?sortBy={field}&order={asc|desc}` - Sort results
- Combine filters: `GET /contacts?category={id}&tags={id1,id2}&city={city}&sortBy=name&order=asc`

**Pagination Support**:
- `limit`: Number of results per page (default: 50, max: 100)
- `offset`: Starting position (default: 0)
- Response includes: `total`, `limit`, `offset`, `data[]`

**Acceptance Criteria**:
- ✅ Users can filter contacts by category
- ✅ Users can filter contacts by one or more tags (any/all logic)
- ✅ Users can filter contacts by city
- ✅ Multiple filters can be combined
- ✅ Results can be sorted by name, email, createdAt, updatedAt
- ✅ Pagination works correctly with filters
- ✅ Filter performance < 500ms for 10,000 contacts

---

### Feature 3: Import/Export Capabilities

#### F3.1 - Contact Export

**Description**: Enable users to export contacts in common formats for backup, migration, or external use.

**Requirements**:
- Support export formats:
  - **CSV**: Comma-separated values (Excel-compatible)
  - **JSON**: Full data structure including relationships
  - **vCard**: Industry-standard contact format (.vcf)
- Export options:
  - **All contacts**: Export entire contact database
  - **Filtered export**: Export based on current filters/search
  - **Selected contacts**: Export specific contact IDs
- Include related data:
  - Category information (name, not just ID)
  - Tags (list of tag names)
  - All contact fields

**API Endpoints (New)**:
- `GET /contacts/export?format={csv|json|vcard}` - Export all contacts
- `POST /contacts/export` - Export filtered/selected contacts
  - Request body:
    ```json
    {
      "format": "csv|json|vcard",
      "filters": {
        "category": "categoryId",
        "tags": ["tagId1", "tagId2"],
        "city": "New York"
      },
      "contactIds": [1, 2, 3] // Optional: specific IDs
    }
    ```
  - Response: File download with appropriate Content-Type header

**CSV Format**:
```csv
id,name,title,email,phone,address,city,category,tags,createdAt,updatedAt
1,"John Doe","CEO","john@example.com","555-0100","123 Main St","New York","Client","VIP,Hot Lead","2025-01-15T10:00:00Z","2025-01-15T10:00:00Z"
```

**JSON Format**:
```json
{
  "exportDate": "2025-11-09T12:00:00Z",
  "totalContacts": 150,
  "contacts": [
    {
      "id": 1,
      "name": "John Doe",
      "title": "CEO",
      "email": "john@example.com",
      "phone": "555-0100",
      "address": "123 Main St",
      "city": "New York",
      "category": {
        "id": 1,
        "name": "Client"
      },
      "tags": [
        {"id": 1, "name": "VIP"},
        {"id": 2, "name": "Hot Lead"}
      ],
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**vCard Format** (RFC 6350 compliant):
```vcard
BEGIN:VCARD
VERSION:4.0
FN:John Doe
TITLE:CEO
EMAIL:john@example.com
TEL:555-0100
ADR:;;123 Main St;New York;;;
CATEGORIES:Client
NOTE:Tags: VIP, Hot Lead
END:VCARD
```

**Acceptance Criteria**:
- ✅ Users can export all contacts in CSV, JSON, vCard formats
- ✅ Export includes category and tags information
- ✅ Filtered exports respect active filters
- ✅ Selected exports only include specified contact IDs
- ✅ File downloads with correct Content-Type and filename
- ✅ Large exports (1000+ contacts) complete without timeout
- ✅ CSV format is Excel-compatible

#### F3.2 - Contact Import

**Description**: Enable users to import contacts in bulk from external sources.

**Requirements**:
- Support import formats:
  - **CSV**: Map columns to contact fields
  - **JSON**: Structured data with validation
  - **vCard**: Industry-standard contact format
- Import behavior:
  - **Create new**: Contacts not matching existing records
  - **Update existing**: Match by email (unique identifier)
  - **Skip duplicates**: Option to ignore existing contacts
- Validation:
  - Required fields: name, email
  - Email format validation
  - Phone number format validation (optional)
  - Tag/category resolution (create if not exists)
- Import preview:
  - Show sample of data to be imported
  - Display validation errors before importing
  - Allow user to confirm or cancel

**API Endpoints (New)**:
- `POST /contacts/import/preview` - Preview import data
  - Request: Multipart form data with file upload
  - Response: Preview of parsed data with validation status
- `POST /contacts/import` - Execute import
  - Request: Multipart form data with file upload + options
  - Request body (form data):
    - `file`: File upload (CSV/JSON/vCard)
    - `format`: csv|json|vcard
    - `updateExisting`: true|false (default: false)
    - `createCategories`: true|false (create missing categories, default: true)
    - `createTags`: true|false (create missing tags, default: true)
  - Response: Import results summary

**Import Response Format**:
```json
{
  "success": true,
  "summary": {
    "totalRecords": 150,
    "created": 120,
    "updated": 25,
    "skipped": 5,
    "errors": 0
  },
  "errors": [
    {
      "row": 10,
      "email": "invalid-email",
      "error": "Invalid email format"
    }
  ],
  "warnings": [
    {
      "row": 5,
      "message": "Category 'Partner' created automatically"
    }
  ]
}
```

**CSV Import Mapping**:
- Expected columns: `name`, `title`, `email`, `phone`, `address`, `city`, `category`, `tags`
- `tags` column: Comma-separated tag names (e.g., "VIP, Hot Lead")
- Header row required

**Acceptance Criteria**:
- ✅ Users can import contacts from CSV, JSON, vCard files
- ✅ Import preview shows parsed data and validation errors
- ✅ Required field validation prevents invalid imports
- ✅ Email uniqueness enforced (duplicate emails rejected or updated)
- ✅ Missing categories/tags created automatically if enabled
- ✅ Import summary shows created/updated/skipped/error counts
- ✅ Import handles large files (1000+ contacts) without timeout
- ✅ Malformed files return clear error messages
- ✅ Users can choose to update existing contacts or skip duplicates

---
