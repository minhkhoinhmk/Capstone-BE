import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseFeedback } from './entity/course-feedbacl.entity';

@Module({ imports: [TypeOrmModule.forFeature([CourseFeedback])] })
export class CourseFeedbackModule {}
