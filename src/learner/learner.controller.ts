import { Body, Controller, Post } from '@nestjs/common';
import { LearnerService } from './learner.service';
import { ApiConflictResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { CreateLearnerRequest } from './dto/request/create-learner.dto';

@Controller('learner')
export class LearnerController {
  constructor(private learnerService: LearnerService) {}

  @ApiCreatedResponse({
    description: 'Created Learner Successfully',
  })
  @ApiConflictResponse({
    description: 'User name was already exists',
  })
  @Post('/create')
  sigup(@Body() createLearnerRequest: CreateLearnerRequest): Promise<void> {
    return this.learnerService.createLearner(createLearnerRequest);
  }
}
