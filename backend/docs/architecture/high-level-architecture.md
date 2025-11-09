# High Level Architecture

### Current System Overview

The Contact Management System is a **greenfield-to-brownfield** NestJS application with basic CRUD functionality for contact management. The system follows a traditional three-tier architecture:

1. **Presentation Layer**: RESTful API (NestJS Controllers)
2. **Business Logic Layer**: Services (NestJS Services)
3. **Data Access Layer**: TypeORM + MySQL

**Current Architecture Pattern**:
```
┌─────────────────────────────────────────┐
│         HTTP Requests (REST API)        │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────▼─────────┐
         │   Controllers     │  (Routing, Request Handling)
         │  - AppController  │
         │  - ContactsController
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │     Services      │  (Business Logic)
         │  - AppService     │
         │  - ContactService │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │  TypeORM Repositories │ (Data Access)
         │  - Repository<Contact> │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │   MySQL Database  │  (Data Storage)
         │  Database: nestng │
         └───────────────────┘
```

### Target Architecture (Post-Enhancement)

After implementing the PRD requirements, the architecture will evolve to:

```
┌──────────────────────────────────────────────────────────────┐
│               HTTP Requests (REST API)                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
          ┌──────────────▼───────────────┐
          │      Global Middleware       │
          │  - Exception Filters         │
          │  - Validation Pipes          │
          │  - Logging Interceptors      │
          └──────────────┬───────────────┘
                         │
    ┌────────────────────┼──────────────────────────┐
    │                    │                          │
┌───▼────────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  Contacts  │  │  Categories  │  │     Tags     │
│ Controller │  │  Controller  │  │  Controller  │
└─────┬──────┘  └──────┬───────┘  └──────┬───────┘
      │                │                  │
┌─────▼──────┐  ┌──────▼───────┐  ┌──────▼───────┐
│  Contacts  │  │  Categories  │  │     Tags     │
│  Service   │  │   Service    │  │   Service    │
└─────┬──────┘  └──────┬───────┘  └──────┬───────┘
      │                │                  │
┌─────▼─────────────────▼──────────────────▼──────┐
│        Mongoose ODM (Data Access Layer)         │
│  - Contact Model     - Category Model           │
│  - Tag Model         - Indexes & Validation     │
└──────────────────────┬───────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │      MongoDB Database       │
        │  Collections: contacts,     │
        │  categories, tags           │
        └─────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         Import/Export Module                    │
│  - CSV Parser/Generator                         │
│  - JSON Parser/Generator                        │
│  - vCard Parser/Generator                       │
│  - File Upload Handling                         │
└─────────────────────────────────────────────────┘
```

---
