# Development and Deployment

### Local Development Setup (Current)

**Prerequisites**:
- Node.js v14.x or higher
- MySQL server running on localhost
- MySQL database `nestng` created

**Steps**:
1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure MySQL is running and database `nestng` exists

3. Start development server:
   ```bash
   npm run start:dev
   ```

**Known Issues**:
- README has typo: `pm run start:dev` should be `npm run start:dev`
- No `.env` file support (configuration hardcoded)
- Database must be manually created before first run

### Local Development Setup (Target)

**Prerequisites**:
- Node.js v14.x or higher
- MongoDB server running (local or MongoDB Atlas)

**Steps**:
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Configure MongoDB connection in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/contact-management
   NODE_ENV=development
   PORT=3000
   ```

4. Start development server:
   ```bash
   npm run start:dev
   ```

**Database Auto-Setup**:
- MongoDB collections created automatically
- Indexes created on application startup
- No manual database creation required

### Build and Deployment Process

**Build Command**:
```bash
npm run build  # Compiles TypeScript to dist/
```

**Production Start**:
```bash
npm run start:prod  # Runs from dist/main.js
```

**Environment Variables (Required for Production)**:
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/contact-management
NODE_ENV=production
PORT=3000
```

**Deployment Checklist**:
- [ ] MongoDB instance provisioned (Atlas or self-hosted)
- [ ] Environment variables configured
- [ ] Application built (`npm run build`)
- [ ] Migration script executed (MySQL → MongoDB)
- [ ] Data integrity validated
- [ ] Health check endpoint verified
- [ ] API documentation deployed

---
