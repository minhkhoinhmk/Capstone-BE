import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Repository,
  FindOptionsOrder,
} from 'typeorm';
import { QuestionTopic } from './entity/question-topic.entity';
import { ChapterLecture } from 'src/chapter-lecture/entity/chapter-lecture.entity';
import { User } from 'src/user/entity/user.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { CreateQuestionTopicRequest } from './dto/request/create-question-topic.request.dto';
import { SearchQuestionTopicRequest } from './dto/request/search-question-topic.request.dto';

@Injectable()
export class QuestionTopicRepository {
  private logger = new Logger('QuestionTopicRepository', { timestamp: true });

  constructor(
    @InjectRepository(QuestionTopic)
    private questionTopicRepository: Repository<QuestionTopic>,
  ) {}

  async filter(
    searchQuestionTopic: SearchQuestionTopicRequest,
  ): Promise<{ count: number; entities: QuestionTopic[] }> {
    const { pageOptions, ...searchCriterias } = searchQuestionTopic;

    const findOptionsWhere: FindOptionsWhere<QuestionTopic> = {
      active: searchCriterias.active,
    };
    const findOptionsOrders: FindOptionsOrder<QuestionTopic> = {};

    if (searchCriterias.chapterLectureId)
      findOptionsWhere.chapterLecture = {
        id: searchCriterias.chapterLectureId,
      };

    if (searchCriterias.search)
      findOptionsWhere.title = ILike(`%${searchCriterias.search}%`);

    if (searchCriterias.sortField)
      findOptionsOrders[searchCriterias.sortField] = pageOptions.order;
    else findOptionsOrders.updatedDate = 'DESC';

    const findManyOptions: FindManyOptions<QuestionTopic> = {
      where: findOptionsWhere,
      skip: (pageOptions.page - 1) * pageOptions.take,
      take: pageOptions.take,
      order: findOptionsOrders,
      relations: {
        chapterLecture: true,
        user: true,
        learner: true,
      },
    };

    return {
      count: await this.questionTopicRepository.count(findManyOptions),
      entities: await this.questionTopicRepository.find(findManyOptions),
    };
  }

  async saveQuestionTopic(
    questionTopic: QuestionTopic,
  ): Promise<QuestionTopic> {
    return this.questionTopicRepository.save(questionTopic);
  }

  createQuestionTopic(
    chapterLecture: ChapterLecture,
    user: User | null,
    learner: Learner | null,
    request: CreateQuestionTopicRequest,
  ) {
    return this.questionTopicRepository.create({
      chapterLecture,
      user,
      learner,
      title: request.title,
      description: request.description ? 'yes' : null,
    });
  }

  async getQuestionTopicById(questionTopicId: string) {
    return this.questionTopicRepository.findOne({
      where: { id: questionTopicId },
      relations: { chapterLecture: true, user: true, learner: true },
    });
  }
}
