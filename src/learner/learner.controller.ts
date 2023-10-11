import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LearnerService } from './learner.service';
import { ApiConflictResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { CreateLearnerRequest } from './dto/request/create-learner.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';

@Controller('learner')
export class LearnerController {
  constructor(private learnerService: LearnerService) {}

  @ApiCreatedResponse({
    description: 'Created Learner Successfully',
  })
  @ApiConflictResponse({
    description: 'User name was already exists',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Post('/create')
  sigup(
    @Body() createLearnerRequest: CreateLearnerRequest,
    @Req() request: Request,
  ): Promise<void> {
    return this.learnerService.createLearner(
      createLearnerRequest,
      request['user']['id'],
    );
  }
}
