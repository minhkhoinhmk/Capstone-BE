import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LearnerService } from './learner.service';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateLearnerRequest } from './dto/request/create-learner.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { Request } from 'express';
import { FilterLearnerByUserResponse } from './dto/response/filter-by-user.dto';
import { FilterCourseByUserResponse } from 'src/course/dto/reponse/filter-by-user.dto';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';

@Controller('learner')
@ApiTags('Learner')
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

  @ApiOkResponse({
    description: 'Get Learner Successfully',
    type: FilterLearnerByUserResponse,
    isArray: true,
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Get('/user')
  getLearnersByUserId(
    @Req() request: Request,
  ): Promise<FilterLearnerByUserResponse[]> {
    return this.learnerService.getLearnerByUserId(request['user']['id']);
  }

  @ApiPaginatedResponse(FilterCourseByUserResponse)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Learner)
  @Post('/course/user')
  getCourseForLearnersByUserId(
    @Query('search') search: string,
    @Req() request: Request,
    @Body() pageOption: PageOptionsDto,
  ): Promise<PageDto<FilterCourseByUserResponse>> {
    return this.learnerService.getCoursesForLearner(
      search,
      request['user']['id'],
      pageOption,
    );
  }
}
