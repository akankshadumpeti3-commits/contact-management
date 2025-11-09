# Performance Considerations

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
