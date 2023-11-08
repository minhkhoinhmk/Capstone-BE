import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseFeedback } from './entity/course-feedbacl.entity';
import { CourseFeedbackController } from './course-feedback.controller';
import { CourseFeedbackService } from './course-feedback.service';
import { CourseFeedbackRepository } from './course-feedback.repository';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [TypeOrmModule.forFeature([CourseFeedback]), RoleModule],
  controllers: [CourseFeedbackController],
  providers: [CourseFeedbackService, CourseFeedbackRepository],
})
export class CourseFeedbackModule {}
