import { ApiProperty } from '@nestjs/swagger';
import { Learner } from 'src/learner/entity/learner.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

@Entity()
export class Device {
  @ApiProperty({ type: UUID, description: 'UUID of the device' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: String, description: 'Device token id' })
  @Column()
  deviceTokenId: string;

  @ManyToOne(() => User, (user) => user.devices)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Learner, (learner) => learner.devices)
  @JoinColumn({ name: 'learnerId' })
  learner: Learner;
}
