import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { QuestionAnswerRepository } from './question-answer.repository';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { SearchQuestionAnswerRequest } from './dto/request/search-question-answer.request.dto';
import { User } from 'src/user/entity/user.entity';
import { CreateQuestionAnswerRequest } from './dto/request/create-question-answer.request.dto';
import { QuestionAnswerMapper } from './mapper/question-answer.mapper';
import { ChapterLectureRepository } from 'src/chapter-lecture/chapter-lecture.repository';
import { Learner } from 'src/learner/entity/learner.entity';
import { QuestionAnswerDynamodbRepository } from './question-answer.dynamodb.repository';
import { QuestionTopicRepository } from 'src/question-topic/question-topic.repository';
import { QuestionAnswerResponse } from './dto/reponse/question-answer.response.dto';

@Injectable()
export class QuestionAnswerService {
  private logger = new Logger('QuestionAnswerService', { timestamp: true });

  constructor(
    private questionAnswerRepository: QuestionAnswerRepository,
    private questionAnswerDynamodbRepository: QuestionAnswerDynamodbRepository,
    private questionAnswerMapper: QuestionAnswerMapper,
    private questionTopicRepository: QuestionTopicRepository,
  ) {}

  async createQuestionAnswer(
    body: CreateQuestionAnswerRequest,
    user: User | Learner,
  ) {
    const questionTopic =
      await this.questionTopicRepository.getQuestionTopicById(
        body.questionTopicId,
      );

    if (!questionTopic) {
      this.logger.error(
        `method=createQuestionAnswer, questionTopic with id=${body.questionTopicId} is not found`,
      );
      throw new BadRequestException(
        `questionTopicId=${body.questionTopicId} is not found`,
      );
    }

    const questionAnswer =
      user.role === 'Learner'
        ? this.questionAnswerRepository.createQuestionAnswer(
            questionTopic,
            null,
            user as Learner,
            body,
          )
        : this.questionAnswerRepository.createQuestionAnswer(
            questionTopic,
            user as User,
            null,
            body,
          );

    const saveQuestionAnswer =
      await this.questionAnswerRepository.saveQuestionAnswer(questionAnswer);

    body.description &&
      (await this.questionAnswerDynamodbRepository.createQuestionAnswer({
        questionAnswerId: saveQuestionAnswer.id,
        body: body.description,
      }));
  }

  async searchAndFilter(
    searchQuestionAnswerRequest: SearchQuestionAnswerRequest,
  ): Promise<PageDto<QuestionAnswerResponse[]>> {
    const { entities, count } = await this.questionAnswerRepository.filter(
      searchQuestionAnswerRequest,
    );

    const responses = [];
    const listPromises = [];

    for (const questionAnswer of entities) {
      if (questionAnswer.description === 'yes')
        listPromises.push(
          this.questionAnswerDynamodbRepository.findByQuestionAnswerId(
            questionAnswer.id,
          ),
        );

      responses.push(
        this.questionAnswerMapper.filterQuestionAnswerResponse(questionAnswer),
      );
    }

    if (listPromises.length > 0) {
      try {
        const listQuestionAnswerDynamodb = await Promise.all(listPromises);

        listQuestionAnswerDynamodb.forEach((questionAnswerDynamodb) => {
          return responses.forEach((questionAnswer) => {
            if (questionAnswer.id === questionAnswerDynamodb.questionAnswerId)
              questionAnswer.description = questionAnswerDynamodb.body;
          });
        });
      } catch (error) {
        this.logger.error(`method=searchAndFilter, error=${error.message}`);
      }
    }

    const pageMetaDto = new PageMetaDto({
      itemCount: count,
      pageOptionsDto: searchQuestionAnswerRequest.pageOptions,
    });

    this.logger.log(
      `method=searchAndFilter, totalItem=${pageMetaDto.itemCount}`,
    );

    return new PageDto(responses, pageMetaDto);
  }

  async getQuestionAnswerDetail(
    questionAnswerId: string,
  ): Promise<QuestionAnswerResponse> {
    const questionAnswer =
      await this.questionAnswerRepository.getQuestionAnswerById(
        questionAnswerId,
      );

    if (!questionAnswer) {
      this.logger.error(
        `method=getQuestionAnswerDetail, questionAnswerId=${questionAnswerId} is not found`,
      );
      throw new BadRequestException(
        `questionAnswerId=${questionAnswerId} is not found`,
      );
    }

    if (questionAnswer.description === 'yes') {
      try {
        const questionAnswerFromDynamodb =
          await this.questionAnswerDynamodbRepository.findByQuestionAnswerId(
            questionAnswer.id,
          );

        questionAnswer.description = questionAnswerFromDynamodb.body;
      } catch (error) {
        this.logger.error(
          `method=getQuestionAnswerDetail, error=${error.message}`,
        );
      }
    }

    return this.questionAnswerMapper.filterQuestionAnswerResponse(
      questionAnswer,
    );
  }
}
