# Epic 3: Contact Search & Filtering

**Priority**: MEDIUM
**Duration**: 1 week
**Phase**: 3

## Description

Implement advanced search and filtering capabilities to enable users to quickly find contacts using full-text search and filter by categories, tags, city, and other criteria. Includes pagination, sorting, and performance optimization for large contact databases.

## Business Value

- Users can quickly find contacts across multiple fields
- Advanced filtering enables targeted contact segmentation
- Improved user experience with fast, relevant search results
- Foundation for analytics and reporting features

## Technical Overview

This epic involves:
1. Creating MongoDB text indexes on contact fields
2. Implementing full-text search endpoint
3. Implementing flexible filtering with multiple criteria
4. Adding pagination and sorting support
5. Optimizing query performance with indexes and aggregation
6. Performance testing with large datasets

## User Stories

### Story 3.1: Implement Full-Text Contact Search

**As a** user
**I want to** search for contacts by entering keywords
**So that** I can quickly find contacts matching names, emails, titles, or other fields

**Acceptance Criteria**:
- Search endpoint implemented: `GET /contacts/search?q={query}`
- Search works across fields: name, title, email, phone, address, city
- Search is case-insensitive
- Partial matches are supported (e.g., "john" matches "John Doe", "Johnny Smith")
- Search returns matching contacts with populated category and tags
- Query parameter validation (empty query returns 400 error)
- Response includes total count for pagination
- Search performance < 500ms for 10,000 contacts
- Pagination supported via `limit` and `offset` parameters

**Technical Notes**:
- Create text index on Contact schema: `@Index({ name: 'text', title: 'text', email: 'text', phone: 'text', address: 'text', city: 'text' })`
- Use MongoDB `$text` operator with `$search`
- Return text score for relevance ranking
- Query: `model.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } })`
- Populate category and tags in results
- Default limit: 50, max limit: 100

---

### Story 3.2: Implement Category Filtering

**As a** user
**I want to** filter contacts by category
**So that** I can view all contacts of a specific type (Clients, Vendors, etc.)

**Acceptance Criteria**:
- Filter endpoint: `GET /contacts?category={categoryId}`
- Returns all contacts assigned to specified category
- Returns contacts with no category when categoryId is null or "none"
- Invalid categoryId returns 400 error
- Results include populated category and tag data
- Pagination supported
- Filter can be combined with sorting

**Technical Notes**:
- Query: `model.find({ categoryId: categoryId })`
- For null category: `model.find({ categoryId: null })`
- Add index on Contact.categoryId for performance
- Validate categoryId exists in Categories collection

---

### Story 3.3: Implement Tag Filtering

**As a** user
**I want to** filter contacts by one or more tags
**So that** I can find contacts with specific labels (VIP, Follow-up, etc.)

**Acceptance Criteria**:
- Filter endpoint: `GET /contacts?tags={tagId1,tagId2}&tagMatch={any|all}`
- `tagMatch=any`: Returns contacts with ANY of the specified tags (OR logic)
- `tagMatch=all`: Returns contacts with ALL of the specified tags (AND logic)
- Default tagMatch is "any" if not specified
- Invalid tagId returns 400 error
- Returns contacts with populated tag data
- Pagination and sorting supported
- Filter can be combined with other filters

**Technical Notes**:
- For `tagMatch=any`: Use `$in` operator: `model.find({ tagIds: { $in: tagIdsArray } })`
- For `tagMatch=all`: Use `$all` operator: `model.find({ tagIds: { $all: tagIdsArray } })`
- Add index on Contact.tagIds for performance
- Validate all tagIds exist in Tags collection
- Parse comma-separated tag IDs from query string

---

### Story 3.4: Implement Multi-Field Filtering with Sorting

**As a** user
**I want to** filter contacts by multiple criteria and sort results
**So that** I can find exactly the contacts I need in my preferred order

**Acceptance Criteria**:
- City filter supported: `GET /contacts?city={cityName}`
- Multiple filters can be combined: `GET /contacts?category={id}&tags={id1,id2}&city={city}`
- Sorting supported: `GET /contacts?sortBy={field}&order={asc|desc}`
- Sortable fields: name, email, createdAt, updatedAt
- Default sort: createdAt descending
- Invalid sortBy field returns 400 error
- Filters use AND logic (all conditions must match)
- Pagination works correctly with all filters and sorting
- Response includes total count for pagination UI

**Technical Notes**:
- Build dynamic query object based on provided filters
- City filter: Case-insensitive exact match or use regex for flexibility
- Query structure:
  ```typescript
  const query: any = {};
  if (category) query.categoryId = category;
  if (tagIds) query.tagIds = { $in: tagIds }; // or $all for "all" match
  if (city) query.city = new RegExp(`^${city}$`, 'i');
  ```
- Sorting: `model.find(query).sort({ [sortBy]: order === 'asc' ? 1 : -1 })`
- Validate sortBy against whitelist
- Add indexes on frequently sorted fields

---

### Story 3.5: Implement Pagination and Response Standardization

**As a** developer
**I want to** standardize pagination across all list/search endpoints
**So that** the API provides consistent pagination behavior

**Acceptance Criteria**:
- All list endpoints support pagination: `limit` and `offset` parameters
- Default limit: 50, max limit: 100
- Offset defaults to 0
- Response format standardized:
  ```json
  {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "data": [...]
  }
  ```
- Total count reflects filtered results, not all contacts
- Invalid limit/offset values return 400 error
- Pagination works with all filters and sorting

**Technical Notes**:
- Create reusable `PaginatedResponseDto<T>` interface
- Use `.countDocuments(query)` for total count
- Use `.skip(offset).limit(limit)` for pagination
- Validate: limit > 0, limit <= 100, offset >= 0
- Create helper function for building paginated responses

---

### Story 3.6: Performance Optimization and Testing

**As a** developer
**I want to** optimize search and filter queries for large datasets
**So that** the application maintains performance with 10,000+ contacts

**Acceptance Criteria**:
- Text search index created on Contact collection
- Indexes created on: categoryId, tagIds, city, createdAt, updatedAt
- Search query performance < 500ms for 10,000 contacts
- Filter query performance < 500ms for 10,000 contacts
- Combined filters performance < 500ms for 10,000 contacts
- Performance tests created with large dataset (10,000+ contacts)
- Query explain plans reviewed for efficiency
- No unnecessary data loading (pagination limits results)

**Technical Notes**:
- Create indexes:
  ```typescript
  @Index({ name: 'text', title: 'text', email: 'text', phone: 'text', address: 'text', city: 'text' })
  @Index({ categoryId: 1 })
  @Index({ tagIds: 1 })
  @Index({ city: 1 })
  @Index({ createdAt: -1 })
  ```
- Use `.lean()` for read-only queries (performance boost)
- Consider projection to limit returned fields if needed
- Test with `mongodb-memory-server` and seeded data
- Use `model.explain()` to analyze query plans

---

## Success Criteria

- ✅ Full-text search works across all contact fields
- ✅ Filters work individually and combined (category, tags, city)
- ✅ Pagination and sorting functional on all list endpoints
- ✅ Search performance < 500ms for 10,000 contacts
- ✅ Filter performance < 500ms for 10,000 contacts
- ✅ All tests passing (unit, integration, performance)
- ✅ API documentation updated with query parameters

## Technical Requirements

- MongoDB text indexes on searchable fields
- Single-field indexes on filterable/sortable fields
- Pagination support with total count
- Input validation for all query parameters
- Standardized response format

## Dependencies

- Epic 1 (Database Migration) completed
- Epic 2 (Categories & Tags) completed
- MongoDB with proper indexes

## Risks & Mitigation

**Risk**: Text search performance degrades with large datasets
**Mitigation**: Use proper indexes, consider search result limits, monitor query performance

**Risk**: Complex filter combinations cause slow queries
**Mitigation**: Test with large datasets, optimize indexes, use MongoDB aggregation pipeline if needed

**Risk**: Pagination count queries are slow
**Mitigation**: Cache count results, use estimated counts for very large datasets
