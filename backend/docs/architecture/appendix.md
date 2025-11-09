# Appendix

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
