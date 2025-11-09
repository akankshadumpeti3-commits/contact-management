# Integration Points and External Dependencies

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
