import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ChapterLecture } from 'src/chapter-lecture/entity/chapter-lecture.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { User } from 'src/user/entity/user.entity';

export class QuestionTopicResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

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
  type: string;

  @ApiProperty()
  @Expose()
  rating: number;

  @ApiProperty()
  @Expose()
  active: boolean;

  @ApiProperty()
  @Expose()
  chapterLecture: ChapterLecture;

  @ApiProperty()
  @Expose()
  user: User | null;

  @ApiProperty()
  @Expose()
  learner: Learner | null;
}
