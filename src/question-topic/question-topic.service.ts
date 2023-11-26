import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { QuestionTopicRepository } from './question-topic.repository';
import { QuestionTopicResponse } from './dto/reponse/question-topic.response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { PageMetaDto } from 'src/common/pagination/dto/pageMetaDto';
import { SearchQuestionTopicRequest } from './dto/request/search-question-topic.request.dto';
import { User } from 'src/user/entity/user.entity';
import { CreateQuestionTopicRequest } from './dto/request/create-question-topic.request.dto';
import { QuestionTopicMapper } from './mapper/question-topic.mapper';
import { ChapterLectureRepository } from 'src/chapter-lecture/chapter-lecture.repository';
import { Learner } from 'src/learner/entity/learner.entity';
import { QuestionTopicDynamodbRepository } from './question-topic.dynamodb.repository';
import { QuestionTopic } from './entity/question-topic.entity';

@Injectable()
export class QuestionTopicService {
  private logger = new Logger('QuestionTopicService', { timestamp: true });

  constructor(
    private questionTopicRepository: QuestionTopicRepository,
    private chapterLectureRepository: ChapterLectureRepository,
    private questionTopicDynamodbRepository: QuestionTopicDynamodbRepository,
    private questionTopicMapper: QuestionTopicMapper,
  ) {}

  async createQuestionTopic(
    body: CreateQuestionTopicRequest,
    chapterLectureId: string,
    user: User | Learner,
  ) {
    const chapterLecture =
      await this.chapterLectureRepository.getChapterLectureById(
        chapterLectureId,
      );

    if (!chapterLecture) {
      this.logger.error(
        `method=createQuestionTopic, chapterLectureId=${chapterLectureId} is not found`,
      );
      throw new BadRequestException(
        `chapterLectureId=${chapterLectureId} is not found`,
      );
    }

    const questionTopic =
      user.role === 'Learner'
        ? this.questionTopicRepository.createQuestionTopic(
            chapterLecture,
            null,
            user as Learner,
            body,
          )
        : this.questionTopicRepository.createQuestionTopic(
            chapterLecture,
            user as User,
            null,
            body,
          );

    const saveQuestionTopic =
      await this.questionTopicRepository.saveQuestionTopic(questionTopic);

    body.description &&
      (await this.questionTopicDynamodbRepository.createQuestionTopic({
        questionTopicId: saveQuestionTopic.id,
        body: body.description,
      }));
  }

  async searchAndFilter(
    searchQuestionTopicRequest: SearchQuestionTopicRequest,
  ): Promise<PageDto<QuestionTopicResponse[]>> {
    const { entities, count } = await this.questionTopicRepository.filter(
      searchQuestionTopicRequest,
    );

    const responses = [];
    const listPromises = [];

    for (const questionTopic of entities) {
      if (questionTopic.description === 'yes')
        listPromises.push(
          this.questionTopicDynamodbRepository.findByQuestionTopicId(
            questionTopic.id,
          ),
        );

      responses.push(
        this.questionTopicMapper.filterQuestionTopicResponse(
          questionTopic,
          questionTopic.questionAnswers.length,
        ),
      );
    }

    if (listPromises.length > 0) {
      try {
        const listQuestionTopicDynamodb = await Promise.all(listPromises);

        listQuestionTopicDynamodb.forEach((questionTopicDynamodb) => {
          return responses.forEach((questionTopic) => {
            if (questionTopic.id === questionTopicDynamodb.questionTopicId)
              questionTopic.description = questionTopicDynamodb.body;
          });
        });
      } catch (error) {
        this.logger.error(`method=searchAndFilter, error=${error.message}`);
      }
    }

    const pageMetaDto = new PageMetaDto({
      itemCount: count,
      pageOptionsDto: searchQuestionTopicRequest.pageOptions,
    });

    this.logger.log(
      `method=searchAndFilter, totalItem=${pageMetaDto.itemCount}`,
    );

    return new PageDto(responses, pageMetaDto);
  }

  async ratingQuestionTopic(questionTopicId: string) {
    const questionTopic =
      await this.questionTopicRepository.getQuestionTopicById(questionTopicId);

    if (!questionTopic) {
      this.logger.error(
        `method=getQuestionTopicDetail, questionTopicId=${questionTopicId} is not found`,
      );
      throw new BadRequestException(
        `questionTopicId=${questionTopicId} is not found`,
      );
    }

    questionTopic.rating = questionTopic.rating + 1;
    await this.questionTopicRepository.saveQuestionTopic(questionTopic);
  }

  async getQuestionTopicDetail(
    questionTopicId: string,
  ): Promise<QuestionTopicResponse> {
    const questionTopic =
      await this.questionTopicRepository.getQuestionTopicById(questionTopicId);

    if (!questionTopic) {
      this.logger.error(
        `method=getQuestionTopicDetail, questionTopicId=${questionTopicId} is not found`,
      );
      throw new BadRequestException(
        `questionTopicId=${questionTopicId} is not found`,
      );
    }

    if (questionTopic.description === 'yes') {
      try {
        const questionTopicFromDynamodb =
          await this.questionTopicDynamodbRepository.findByQuestionTopicId(
            questionTopic.id,
          );

        questionTopic.description = questionTopicFromDynamodb.body;
      } catch (error) {
        this.logger.error(
          `method=getQuestionTopicDetail, error=${error.message}`,
        );
      }
    }

    return this.questionTopicMapper.filterQuestionTopicResponse(
      questionTopic,
      questionTopic.questionAnswers.length,
    );
  }

  // async getDetail(courseId: string): Promise<CourseDetailResponse> {
  //   const course = await this.courseRepository.getCourseDetailById(courseId);

  //   const totalLength = this.sumTotalLength(course)
  //     ? this.sumTotalLength(course)
  //     : 0;
  //   const ratedStar = this.countRatedStar(course)
  //     ? this.countRatedStar(course)
  //     : 0;
  //   const { sumDiscount, promotionCourseByStaffId } =
  //     this.getDiscountOfStaff(course);
  //   const discountPrice = course.price - course.price * (sumDiscount / 100);

  //   const response = {
  //     id: course.id,
  //     title: course.title,
  //     description: course.description,
  //     price: course.price,
  //     discount: sumDiscount,
  //     discountPrice: discountPrice,
  //     promotionCourseByStaffId,
  //     ratedStar: ratedStar,
  //     authorId: course.user.id,
  //     author: `${course.user.firstName} ${course.user.middleName} ${course.user.lastName}`,
  //     categoryId: course.category.id,
  //     category: course.category.name,
  //     totalLength: totalLength,
  //     shortDescription: course.shortDescription,
  //     prepareMaterial: course.prepareMaterial,
  //     status: course.status,
  //     totalChapter: course.totalChapter,
  //     publishedDate: course.publishedDate,
  //     totalBought: course.totalBought,
  //     thumbnailUrl: course.thumbnailUrl,
  //     active: course.active,
  //     level: course.level.name,
  //   };

  //   return response;
  // }
}
