import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Repository,
  FindOptionsOrder,
} from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { CreateQuestionAnswerRequest } from './dto/request/create-question-answer.request.dto';
import { QuestionAnswer } from './entity/question-answer.entity';
import { QuestionTopic } from 'src/question-topic/entity/question-topic.entity';
import { SearchQuestionAnswerRequest } from './dto/request/search-question-answer.request.dto';

@Injectable()
export class QuestionAnswerRepository {
  private logger = new Logger('QuestionAnswerRepository', { timestamp: true });

  constructor(
    @InjectRepository(QuestionAnswer)
    private questionAnswerRepository: Repository<QuestionAnswer>,
  ) {}

  async filter(
    searchQuestionAnswer: SearchQuestionAnswerRequest,
  ): Promise<{ count: number; entities: QuestionAnswer[] }> {
    const { pageOptions, ...searchCriterias } = searchQuestionAnswer;

    const findOptionsWhere: FindOptionsWhere<QuestionAnswer> = {
      active: searchCriterias.active,
    };
    const findOptionsOrders: FindOptionsOrder<QuestionAnswer> = {};

    if (searchCriterias.questionTopicId)
      findOptionsWhere.questionTopic = {
        id: searchCriterias.questionTopicId,
      };

    if (searchCriterias.sortField)
      findOptionsOrders[searchCriterias.sortField] = pageOptions.order;
    else findOptionsOrders.updatedDate = 'DESC';

    const findManyOptions: FindManyOptions<QuestionAnswer> = {
      where: findOptionsWhere,
      skip: (pageOptions.page - 1) * pageOptions.take,
      take: pageOptions.take,
      order: findOptionsOrders,
      relations: {
        questionTopic: true,
        user: { role: true },
        learner: true,
      },
    };

    return {
      count: await this.questionAnswerRepository.count(findManyOptions),
      entities: await this.questionAnswerRepository.find(findManyOptions),
    };
  }

  async saveQuestionAnswer(
    questionAnswer: QuestionAnswer,
  ): Promise<QuestionAnswer> {
    return this.questionAnswerRepository.save(questionAnswer);
  }

  createQuestionAnswer(
    questionTopic: QuestionTopic,
    user: User | null,
    learner: Learner | null,
    request: CreateQuestionAnswerRequest,
  ) {
    return this.questionAnswerRepository.create({
      questionTopic,
      user,
      learner,
      description: request.description ? 'yes' : null,
    });
  }

  async getQuestionAnswerById(questionAnswerId: string) {
    return this.questionAnswerRepository.findOne({
      where: { id: questionAnswerId },
      relations: { questionTopic: true, user: { role: true }, learner: true },
    });
  }
}
