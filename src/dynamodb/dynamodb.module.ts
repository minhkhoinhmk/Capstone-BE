import { Module } from '@nestjs/common';
import { DynamodbService } from './dynamodb.service';
import { DynamodbController } from './dynamodb.controller';
import { DynamodbRepository } from './dynamodb.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [DynamodbService, DynamodbRepository, ConfigService],
  controllers: [DynamodbController],
  exports: [DynamodbService],
})
export class DynamodbModule {}
