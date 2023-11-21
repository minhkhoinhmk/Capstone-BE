import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Post } from './entity/post.entity';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { PostDynamodbRepository } from './post.dynamodb.repository';
import { PostMapper } from './mapper/post.mapper';
import { PostController } from './post.controller';
import { S3Module } from 'src/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    ConfigModule,
    S3Module,
    AuthModule,
  ],
  providers: [PostService, PostRepository, PostDynamodbRepository, PostMapper],
  controllers: [PostController],
  exports: [PostService, PostRepository, PostDynamodbRepository, PostMapper],
})
export class PostModule {}
