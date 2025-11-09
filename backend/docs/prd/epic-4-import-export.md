# Epic 4: Contact Import/Export

**Priority**: MEDIUM
**Duration**: 1-2 weeks
**Phase**: 4

## Description

Implement comprehensive import and export capabilities to enable users to backup, migrate, and bulk-manage contact data. Support industry-standard formats (CSV, JSON, vCard) with validation, error handling, and large file processing.

## Business Value

- Users can backup contact data for safety and compliance
- Easy migration from other contact management systems
- Bulk contact management reduces manual data entry
- Integration with external tools via standard formats
- Supports business continuity and data portability

## Technical Overview

This epic involves:
1. Creating ImportExport module with parsers and generators
2. Implementing export endpoints for CSV, JSON, vCard formats
3. Implementing import with preview and validation
4. Handling file uploads with validation and size limits
5. Streaming large files to prevent memory issues
6. Comprehensive error handling and user feedback

## User Stories

### Story 4.1: Implement CSV Export

**As a** user
**I want to** export my contacts to CSV format
**So that** I can open contact data in Excel or other spreadsheet applications

**Acceptance Criteria**:
- Export endpoint: `GET /contacts/export?format=csv`
- CSV includes all contact fields: id, name, title, email, phone, address, city, category, tags, createdAt, updatedAt
- Category column shows category name (not ID)
- Tags column shows comma-separated tag names
- CSV includes header row with column names
- File downloads with Content-Type: text/csv
- Filename format: `contacts-export-YYYY-MM-DD.csv`
- Handles special characters (commas, quotes) correctly
- Export respects current filters if provided
- Empty contact list exports header-only CSV

**Technical Notes**:
- Use library like `csv-writer` or `json2csv`
- Populate category and tags before export
- Escape commas and quotes in fields
- CSV format example:
  ```csv
  id,name,title,email,phone,address,city,category,tags,createdAt,updatedAt
  1,"John Doe","CEO","john@example.com","555-0100","123 Main St","New York","Client","VIP,Hot Lead","2025-01-15T10:00:00Z","2025-01-15T10:00:00Z"
  ```
- Set headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="contacts-export-2025-11-09.csv"`

---

### Story 4.2: Implement JSON Export

**As a** user
**I want to** export my contacts to JSON format
**So that** I can backup complete contact data with full structure

**Acceptance Criteria**:
- Export endpoint: `GET /contacts/export?format=json`
- JSON includes complete contact objects with nested category and tags
- Export metadata included: exportDate, totalContacts
- File downloads with Content-Type: application/json
- Filename format: `contacts-export-YYYY-MM-DD.json`
- JSON is properly formatted and valid
- Export respects current filters if provided
- Large exports complete without timeout

**Technical Notes**:
- Populate category and tags before export
- JSON structure:
  ```json
  {
    "exportDate": "2025-11-09T12:00:00Z",
    "totalContacts": 150,
    "contacts": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "title": "CEO",
        "email": "john@example.com",
        "phone": "555-0100",
        "address": "123 Main St",
        "city": "New York",
        "category": { "id": "507f...", "name": "Client", "color": "#4CAF50" },
        "tags": [
          { "id": "507f...", "name": "VIP", "color": "#FF5722" }
        ],
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z"
      }
    ]
  }
  ```
- Set headers: `Content-Type: application/json`, `Content-Disposition: attachment; filename="contacts-export-2025-11-09.json"`

---

### Story 4.3: Implement vCard Export

**As a** user
**I want to** export my contacts to vCard format
**So that** I can import contacts into email clients and mobile devices

**Acceptance Criteria**:
- Export endpoint: `GET /contacts/export?format=vcard`
- vCard format follows RFC 6350 (vCard 4.0) specification
- Each contact exported as separate vCard in single file
- vCard includes: name, title, email, phone, address, categories (from category field)
- Tags included in NOTES field
- File downloads with Content-Type: text/vcard
- Filename format: `contacts-export-YYYY-MM-DD.vcf`
- vCard is valid and importable by standard applications
- Export respects current filters if provided

**Technical Notes**:
- Use library like `vcard-creator` or build manually
- vCard format example:
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
- Multiple vCards in single file separated by blank line
- Set headers: `Content-Type: text/vcard`, `Content-Disposition: attachment; filename="contacts-export-2025-11-09.vcf"`

---

### Story 4.4: Implement Filtered Export

**As a** user
**I want to** export only contacts matching specific criteria
**So that** I can export targeted subsets of my contact database

**Acceptance Criteria**:
- Export endpoint: `POST /contacts/export`
- Accepts filters in request body: category, tags, city, contactIds
- Format specified in request body: csv, json, or vcard
- Filters use same logic as search/filter endpoints
- contactIds parameter exports only specified contacts (ignores other filters)
- Response is file download in specified format
- Export includes only matching contacts
- Empty result set returns empty file with headers (CSV/vCard) or empty array (JSON)

**Technical Notes**:
- Request body structure:
  ```json
  {
    "format": "csv|json|vcard",
    "filters": {
      "category": "507f1f77bcf86cd799439011",
      "tags": ["507f...", "507f..."],
      "tagMatch": "any|all",
      "city": "New York"
    },
    "contactIds": ["507f...", "507f..."]  // Optional
  }
  ```
- Reuse filter logic from search/filter endpoints
- If contactIds provided, ignore other filters
- Validate all filter parameters before processing

---

### Story 4.5: Implement CSV Import with Preview

**As a** user
**I want to** preview imported CSV data before actually importing
**So that** I can verify the data and fix any issues before committing

**Acceptance Criteria**:
- Preview endpoint: `POST /contacts/import/preview`
- Accepts CSV file upload via multipart/form-data
- Parses CSV and returns preview of first 10 rows
- Shows validation status for each row (valid/invalid)
- Lists validation errors for each invalid row
- Returns field mappings detected from header row
- Preview does not save any data
- Max file size: 10MB for preview
- Returns 400 error for malformed CSV files

**Technical Notes**:
- Use library like `csv-parser` or `papaparse`
- Expected CSV columns: name, title, email, phone, address, city, category, tags
- Header row required (first row)
- Validation rules:
  - name: required
  - email: required, valid email format, unique
  - phone: optional, valid format
  - category: must match existing category name (case-insensitive)
  - tags: comma-separated tag names
- Preview response:
  ```json
  {
    "totalRows": 150,
    "preview": [
      {
        "row": 1,
        "data": { "name": "John Doe", "email": "john@example.com", ... },
        "valid": true,
        "errors": []
      },
      {
        "row": 2,
        "data": { "name": "", "email": "invalid-email", ... },
        "valid": false,
        "errors": ["Name is required", "Invalid email format"]
      }
    ]
  }
  ```

---

### Story 4.6: Implement CSV Import Execution

**As a** user
**I want to** import contacts from CSV file with validation and error handling
**So that** I can bulk-add contacts to my database

**Acceptance Criteria**:
- Import endpoint: `POST /contacts/import`
- Accepts CSV file upload and options via multipart/form-data
- Options: `updateExisting` (true/false), `createCategories` (true/false), `createTags` (true/false)
- Default behavior: Create new contacts, skip duplicates (based on email)
- If `updateExisting=true`: Update contacts with matching email
- If `createCategories=true`: Create missing categories automatically
- If `createTags=true`: Create missing tags automatically
- Returns import summary: total, created, updated, skipped, errors
- Invalid rows are skipped with error details in response
- Max file size: 50MB for import
- Import handles large files (1000+ contacts) without timeout
- Import is transactional (all or nothing) or reports partial success

**Technical Notes**:
- Parse CSV same as preview
- Validate each row before import
- Match existing contacts by email (unique identifier)
- For categories: Find by name (case-insensitive), create if enabled and not found
- For tags: Parse comma-separated names, find/create each tag
- Use batch operations for performance: `model.insertMany()` or `bulkWrite()`
- Import response:
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

---

### Story 4.7: Implement JSON Import

**As a** developer
**I want to** support JSON import for structured contact data
**So that** users can import previously exported JSON backups

**Acceptance Criteria**:
- Import endpoint supports JSON format: `POST /contacts/import` with format=json
- Accepts JSON file with structure matching export format
- Validates JSON structure and required fields
- Handles nested category and tag objects
- Category matched by name or ID
- Tags matched by name or ID
- Creates missing categories/tags if options enabled
- Returns same import summary as CSV import
- Handles large JSON files without timeout

**Technical Notes**:
- Parse JSON and validate structure
- Expected structure matches export JSON format
- Map category by name or id: If object provided, use name; if string provided, treat as id
- Map tags by name or id array
- Reuse validation and import logic from CSV import
- Use batch operations for performance

---

### Story 4.8: Implement vCard Import

**As a** developer
**I want to** support vCard import for industry-standard contact files
**So that** users can import contacts from email clients and other applications

**Acceptance Criteria**:
- Import endpoint supports vCard format: `POST /contacts/import` with format=vcard
- Parses vCard 3.0 and 4.0 formats
- Maps vCard fields to Contact fields: FN→name, TITLE→title, EMAIL→email, TEL→phone, ADR→address/city
- Extracts categories from CATEGORIES field
- Extracts tags from NOTE field (if format: "Tags: tag1, tag2")
- Validates required fields (name, email)
- Returns same import summary as CSV import
- Handles multi-vCard files (multiple contacts in one file)

**Technical Notes**:
- Use library like `vcard-parser` or `vcf`
- Parse vCard fields:
  - FN (Formatted Name) → name
  - TITLE → title
  - EMAIL → email (use preferred/first email)
  - TEL → phone (use preferred/first phone)
  - ADR → Extract city from address components
  - CATEGORIES → category name
  - NOTE → Parse tags if format matches "Tags: ..."
- Handle multiple vCards in single file (separated by blank lines)
- Match/create categories and tags same as CSV import

---

## Success Criteria

- ✅ Users can export contacts in CSV, JSON, vCard formats
- ✅ Export includes category and tags information
- ✅ Filtered exports respect active filters
- ✅ Users can import contacts from CSV with preview and validation
- ✅ Import supports JSON and vCard formats
- ✅ Import creates/updates contacts with proper validation
- ✅ Large exports/imports (1000+ contacts) complete without timeout
- ✅ CSV format is Excel-compatible
- ✅ vCard format is compatible with standard applications
- ✅ Import errors are clearly communicated to users
- ✅ All tests passing (unit and integration)

## Technical Requirements

- File upload handling with size limits (10MB preview, 50MB import)
- Streaming for large file processing
- CSV, JSON, vCard parsers and generators
- Validation with detailed error messages
- Batch operations for import performance
- Proper error handling and user feedback

## Dependencies

- Epic 1 (Database Migration) completed
- Epic 2 (Categories & Tags) completed
- File upload library (e.g., `multer`)
- CSV library (e.g., `csv-parser`, `json2csv`)
- vCard library (e.g., `vcard-parser`, `vcard-creator`)

## Risks & Mitigation

**Risk**: Large file imports cause memory issues or timeouts
**Mitigation**: Use streaming parsers, batch processing, implement progress tracking, set reasonable file size limits

**Risk**: Import creates invalid data or duplicates
**Mitigation**: Comprehensive validation, email uniqueness enforcement, transactional imports or detailed error reporting

**Risk**: vCard compatibility issues with different applications
**Mitigation**: Follow RFC specifications, test with popular applications, handle multiple vCard versions
