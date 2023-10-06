import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entity/course.entity';

@Module({ imports: [TypeOrmModule.forFeature([Course])] })
export class CourseModule {}
