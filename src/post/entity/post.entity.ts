import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { User } from 'src/user/entity/user.entity';

@Entity()
export class Post {
  @ApiProperty({ type: UUID, description: 'UUIDe of the post' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: String, description: 'Title of the Post' })
  @Column({
    length: 100,
  })
  title: string;

  @ApiProperty({ type: String, description: 'Description of the Post' })
  @Column()
  description: string;

  @ApiProperty({ type: Date, description: 'Inserted date of the Post' })
  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  insertedDate: Date;

  @ApiProperty({ type: Date, description: 'Updated date of the Post' })
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @ApiProperty({ type: String, description: 'Resources of the Post' })
  @Column()
  resources: string;

  @ApiProperty({ type: Boolean, description: 'Is active of the Post' })
  @Column()
  active: boolean;

  @ApiProperty({ type: String, description: 'Thumbnail URL of the Post' })
  @Column()
  thumbnail: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'userId' })
  user: User;
}
