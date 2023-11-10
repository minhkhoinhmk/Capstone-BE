import { Module } from '@nestjs/common';
import { DynamodbService } from './dynamodb.service';
import { DynamodbController } from './dynamodb.controller';
import { DynamodbRepository } from './dynamodb.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [DynamodbService, DynamodbRepository, ConfigService],
  controllers: [DynamodbController],
  imports: [ConfigModule, AuthModule],
  exports: [DynamodbService],
})
export class DynamodbModule {}
