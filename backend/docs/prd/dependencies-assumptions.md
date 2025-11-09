# Dependencies & Assumptions

### External Dependencies

**Required**:
- MongoDB server (v4.4 or higher)
- Node.js (v14.x or higher, current: compatible with NestJS v7)

**Optional**:
- MongoDB Atlas (cloud hosting alternative)
- Redis (for future caching)

### Technical Assumptions

1. **Database Access**: MongoDB can be installed and configured in target environments
2. **Data Volume**: Current contact database < 10,000 records (manageable migration)
3. **Downtime**: Brief downtime acceptable for production cutover (if needed)
4. **Frontend Compatibility**: Angular frontend can adapt to API changes
5. **Browser Support**: Modern browsers (ES6+ support)

### Business Assumptions

1. **User Training**: End users comfortable with category/tag concepts
2. **Data Quality**: Existing contact data is reasonably clean (valid emails)
3. **File Formats**: CSV, JSON, vCard are sufficient for import/export needs
4. **Single Tenant**: System serves single organization (no multi-tenancy yet)

---
