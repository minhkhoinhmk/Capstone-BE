import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Learner } from './entity/learner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Learner])],
})
export class LearnerModule {}
