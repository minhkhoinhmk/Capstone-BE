import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Learner } from 'src/learner/entity/learner.entity';
import { QuestionTopic } from 'src/question-topic/entity/question-topic.entity';
import { User } from 'src/user/entity/user.entity';

export class QuestionAnswerResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  insertedDate: Date;

  @ApiProperty()
  @Expose()
  updatedDate: Date;

  @ApiProperty()
  @Expose()
  active: boolean;

  @ApiProperty()
  @Expose()
  questionTopic: QuestionTopic;

  @ApiProperty()
  @Expose()
  user: User | null;

  @ApiProperty()
  @Expose()
  learner: Learner | null;
}
