import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // MongoDB connection event listeners
  mongoose.connection.on('connected', () => {
    logger.log('MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    logger.warn('MONGODB_URI environment variable is not set. Using default: mongodb://localhost:27017/contact-management');
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
