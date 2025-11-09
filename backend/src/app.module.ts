import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// TypeORM imports temporarily commented out (no MySQL installed on system)
// Will be removed in Story 1.3 - MongoDB migration
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Contact } from './entities/contact.entity';
// import { ContactService } from './contact/contact.service';
// import { ContactsController } from './contacts/contacts.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/contact-management',
        // Removed deprecated options: useNewUrlParser and useUnifiedTopology
        // These have no effect since MongoDB Node.js Driver version 4.0.0
      }),
    }),
    // TypeORM configuration temporarily commented out (no MySQL installed)
    // Will be removed in Story 1.3 - MongoDB migration
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   database: 'nestng',
    //   username: 'root',
    //   password: '',
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    //   retryAttempts: 0,
    //   autoLoadEntities: false,
    // }),
    // TypeOrmModule.forFeature([Contact]),
  ],
  controllers: [
    AppController,
    // ContactsController temporarily commented out (depends on TypeORM)
    // Will be migrated to MongoDB in Story 1.3
  ],
  providers: [
    AppService,
    // ContactService temporarily commented out (depends on TypeORM)
    // Will be migrated to MongoDB in Story 1.3
  ],
})
export class AppModule {}
