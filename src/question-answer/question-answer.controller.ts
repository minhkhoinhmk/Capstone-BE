import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { User } from 'src/user/entity/user.entity';
import { Request } from 'express';
import { QuestionAnswerService } from './question-answer.service';
import { QuestionAnswerResponse } from './dto/reponse/question-answer.response.dto';
import { SearchQuestionAnswerRequest } from './dto/request/search-question-answer.request.dto';
import { CreateQuestionAnswerRequest } from './dto/request/create-question-answer.request.dto';

@Controller('question-answer')
@ApiTags('question-answer')
export class QuestionAnswerController {
  constructor(private questionAnswerService: QuestionAnswerService) {}

  @Post('/search')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner, NameRole.Instructor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOkResponse({
    description: 'Get Question answers Successfully',
  })
  @ApiPaginatedResponse(QuestionAnswerResponse)
  async searchQuestionAnswers(
    @Body() body: SearchQuestionAnswerRequest,
  ): Promise<PageDto<QuestionAnswerResponse[]>> {
    return await this.questionAnswerService.searchAndFilter(body);
  }

  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner, NameRole.Instructor)
  @ApiCreatedResponse({
    description: 'Created question answer Successfully',
  })
  async createQuestionAnswer(
    @Body() body: CreateQuestionAnswerRequest,
    @Req() request: Request,
  ): Promise<void> {
    return await this.questionAnswerService.createQuestionAnswer(
      body,
      request['user'] as User,
    );
  }

  @Get(':questionAnswerId')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner, NameRole.Instructor)
  @ApiCreatedResponse({
    description: 'Get question answer detail Successfully',
  })
  async getQuestionAnswer(
    @Param('questionAnswerId') questionAnswerId: string,
  ): Promise<QuestionAnswerResponse> {
    return await this.questionAnswerService.getQuestionAnswerDetail(
      questionAnswerId,
    );
  }
}
