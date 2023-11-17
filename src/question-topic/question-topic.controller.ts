import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { QuestionTopicResponse } from './dto/reponse/question-topic.response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { SearchQuestionTopicRequest } from './dto/request/search-question-topic.request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { User } from 'src/user/entity/user.entity';
import { Request } from 'express';
import { CreateQuestionTopicRequest } from './dto/request/create-question-topic.request.dto';
import { QuestionTopicService } from './question-topic.service';

@Controller('question-topic')
@ApiTags('question-topic')
export class QuestionTopicController {
  constructor(private questionTopicService: QuestionTopicService) {}

  @Post('/search')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner, NameRole.Instructor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOkResponse({
    description: 'Get Question topics Successfully',
  })
  @ApiPaginatedResponse(QuestionTopicResponse)
  async searchQuestionTopics(
    @Body() body: SearchQuestionTopicRequest,
  ): Promise<PageDto<QuestionTopicResponse[]>> {
    return await this.questionTopicService.searchAndFilter(body);
  }

  @Patch('/rating/:questionTopicId')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  @ApiCreatedResponse({
    description: 'Rating question topic Successfully',
  })
  async ratingQuestionTopic(
    @Param('questionTopicId') questionTopicId: string,
  ): Promise<void> {
    return await this.questionTopicService.ratingQuestionTopic(questionTopicId);
  }

  @Post(':chapterLectureId')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  @ApiCreatedResponse({
    description: 'Created question topic Successfully',
  })
  async createQuestionTopic(
    @Body() body: CreateQuestionTopicRequest,
    @Param('chapterLectureId') chapterLectureId: string,
    @Req() request: Request,
  ): Promise<void> {
    return await this.questionTopicService.createQuestionTopic(
      body,
      chapterLectureId,
      request['user'] as User,
    );
  }

  @Get(':questionTopicId')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner, NameRole.Instructor)
  @ApiCreatedResponse({
    description: 'Get question topic detail Successfully',
  })
  async getQuestionTopic(
    @Param('questionTopicId') questionTopicId: string,
  ): Promise<QuestionTopicResponse> {
    return await this.questionTopicService.getQuestionTopicDetail(
      questionTopicId,
    );
  }

  // @Get('/order/user')
  // @UseGuards(AuthGuard(), RolesGuard)
  // @HasRoles(NameRole.Customer)
  // async getCoursesByUserId(
  //   @Req() request: Request,
  // ): Promise<FilterCourseByCustomerResponse[]> {
  //   return await this.courseService.getCoursesByUserId(request['user']['id']);
  // }

  // @Get('/order/check-owned/:id')
  // @UseGuards(AuthGuard(), RolesGuard)
  // @HasRoles(NameRole.Customer)
  // async checkCourseIsOwnedByCourseId(
  //   @Param('id') courseId: string,
  //   @Req() request: Request,
  // ): Promise<{ status: boolean }> {
  //   return await this.courseService.checkCourseIsOwnedByCourseId(
  //     courseId,
  //     request['user'] as User,
  //   );
  // }

  // @Patch(':id')
  // @ApiOkResponse({
  //   description: 'course successfully updated',
  // })
  // async updateCourse(
  //   @Body() searchCourseRequest: SearchCourseRequest,
  // ): Promise<PageDto<SearchCourseReponse>> {
  //   return await this.courseService.searchAndFilter(searchCourseRequest);
  // }
}
