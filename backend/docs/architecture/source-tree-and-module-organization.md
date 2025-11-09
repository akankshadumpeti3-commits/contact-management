# Source Tree and Module Organization

### Current Modules (As-Is)

#### 1. App Module (`src/app.module.ts`)

**Purpose**: Root module that bootstraps the application

**Current Implementation**:
```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      database: 'nestng',
      username: 'root',
      password: '',  // ⚠️ Empty password (development only)
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,  // ⚠️ DANGEROUS in production
    }),
    TypeOrmModule.forFeature([Contact]),
  ],
  controllers: [AppController, ContactsController],
  providers: [AppService, ContactService],
})
```

**Technical Debt**:
- ❌ **Hardcoded database credentials** - Security risk, not environment-aware
- ❌ **synchronize: true** - Auto-creates schema, dangerous in production (data loss risk)
- ❌ **No host/port configuration** - Assumes localhost
- ❌ **Flat provider registration** - All services registered in root module (doesn't scale)

**Required Changes for PRD**:
```typescript
// Target implementation with Mongoose
@Module({
  imports: [
    ConfigModule.forRoot({  // ✅ Environment config
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({  // ✅ Async configuration
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/contact-management',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    ContactsModule,      // ✅ Feature module
    CategoriesModule,    // ✅ New module
    TagsModule,          // ✅ New module
    ImportExportModule,  // ✅ New module
  ],
  controllers: [AppController],  // ✅ Only root controller
  providers: [AppService],       // ✅ Only root service
})
```

#### 2. Contacts Module (Current State)

**Current Structure**:
- `src/contacts/contacts.controller.ts` - Controller (plural folder)
- `src/contact/contact.service.ts` - Service (singular folder) ⚠️
- `src/entities/contact.entity.ts` - Entity (separate folder)

**Inconsistency Issue**:
The controller and service are in **different folders** with **inconsistent naming** (contacts vs contact). This is technical debt that should be resolved.

**Current Contact Entity** (`src/entities/contact.entity.ts`):
```typescript
@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    title: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    address: string;

    @Column()
    city: string;
}
```

**Current Contact Controller** (`src/contacts/contacts.controller.ts`):
```typescript
@Controller('contacts')
export class ContactsController {
    constructor(private contactService: ContactService) {}

    @Get()  // GET /contacts
    read(): Promise<Contact[]> {
        return this.contactService.readAll();
    }

    @Post('create')  // ❌ POST /contacts/create (not RESTful)
    async create(@Body() contact: Contact): Promise<any> {
        return this.contactService.create(contact);
    }

    @Put(':id/update')  // ❌ PUT /contacts/:id/update (not RESTful)
    async update(@Param('id') id, @Body() contact: Contact): Promise<any> {
        contact.id = Number(id);
        return this.contactService.update(contact);
    }

    @Delete(':id/delete')  // ❌ DELETE /contacts/:id/delete (not RESTful)
    async delete(@Param('id') id): Promise<any> {
        return this.contactService.delete(id);
    }
}
```

**API Pattern Issues**:
- ❌ Endpoint paths include verbs (`/create`, `/update`, `/delete`)
- ❌ Not following RESTful conventions
- ❌ No input validation (accepts raw Contact entity)
- ❌ No error handling
- ❌ Type `any` used instead of specific types

**Current Contact Service** (`src/contact/contact.service.ts`):
```typescript
@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>
    ) {}

    async create(contact: Contact): Promise<Contact> {
        return await this.contactRepository.save(contact);
    }

    async readAll(): Promise<Contact[]> {
        return await this.contactRepository.find();
    }

    async update(contact: Contact): Promise<UpdateResult> {
        return await this.contactRepository.update(contact.id, contact);
    }

    async delete(id): Promise<DeleteResult> {
        return await this.contactRepository.delete(id);
    }
}
```

**Service Issues**:
- ✅ Clean implementation for basic CRUD
- ❌ No error handling (e.g., contact not found)
- ❌ No validation logic
- ❌ Missing search/filter capabilities
- ❌ Returns UpdateResult/DeleteResult instead of Contact

**Target Implementation**:
```typescript
// contacts.schema.ts - Mongoose Schema
@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ maxlength: 100 })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ maxlength: 20 })
  phone: string;

  @Prop({ maxlength: 200 })
  address: string;

  @Prop({ maxlength: 100, index: true })
  city: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  categoryId: mongoose.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  tagIds: mongoose.Types.ObjectId[];

  // Timestamps automatically added: createdAt, updatedAt
}

export type ContactDocument = Contact & Document;
export const ContactSchema = SchemaFactory.createForClass(Contact);

// Create text index for search
ContactSchema.index({
  name: 'text',
  title: 'text',
  email: 'text',
  phone: 'text',
  address: 'text',
  city: 'text',
});
```

---
