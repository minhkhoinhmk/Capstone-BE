import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { FilterCourseByLearnerResponse } from 'src/course/dto/reponse/filter-by-learner.dto';
import { UpdateLearnerRequest } from './dto/request/update-learner.dto';
import { ChangePasswordLearnerRequest } from './dto/request/change-password-learner.request.dto';

@Controller('learner')
@ApiTags('Learner')
export class LearnerController {
  constructor(private learnerService: LearnerService) {}

  @Post('/create')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @ApiCreatedResponse({
    description: 'Created Learner Successfully',
  })
  @ApiConflictResponse({
    description: 'User name was already exists',
  })
  signup(
    @Body() createLearnerRequest: CreateLearnerRequest,
    @Req() request: Request,
  ): Promise<void> {
    return this.learnerService.createLearner(
      createLearnerRequest,
      request['user']['id'],
    );
  }

  @Put()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @ApiCreatedResponse({
    description: 'Updated Learner Successfully',
  })
  updateLearner(
    @Body() body: UpdateLearnerRequest,
    @Req() request: Request,
  ): Promise<void> {
    return this.learnerService.updateLearner(body, request['user']['id']);
  }

  @Put('/passowrd/change')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @ApiCreatedResponse({
    description: 'Updated Learner Successfully',
  })
  changePassword(@Body() body: ChangePasswordLearnerRequest): Promise<void> {
    return this.learnerService.changePasswordLearner(body);
  }

  @Get('/user')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @ApiOkResponse({
    description: 'Get Learner Successfully',
    type: FilterLearnerByUserResponse,
    isArray: true,
  })
  getLearnersByUserId(
    @Req() request: Request,
  ): Promise<FilterLearnerByUserResponse[]> {
    return this.learnerService.getLearnerByUserId(request['user']['id']);
  }

  @Post('/course/user')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Learner)
  @ApiPaginatedResponse(FilterCourseByLearnerResponse)
  getCourseForLearnersByUserId(
    @Query('search') search: string,
    @Req() request: Request,
    @Body() pageOption: PageOptionsDto,
  ): Promise<PageDto<FilterCourseByLearnerResponse>> {
    return this.learnerService.getCoursesForLearner(
      search,
      request['user']['id'],
      pageOption,
    );
  }

  @Post('/course/user/:learnerId')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @ApiPaginatedResponse(FilterCourseByLearnerResponse)
  getCourseForLearnersByLearnerId(
    @Query('search') search: string,
    @Param('learnerId') learnerId: string,
    @Body() pageOption: PageOptionsDto,
  ): Promise<PageDto<FilterCourseByLearnerResponse>> {
    return this.learnerService.getCoursesForLearner(
      search,
      learnerId,
      pageOption,
    );
  }
}
