import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NameRole } from '../enum/name-role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { User } from 'src/user/entity/user.entity';

@Entity()
export class Role {
  @ApiProperty({ type: UUID, description: 'UUIDe of the role' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: NameRole, description: 'Name of the role' })
  @Column({ unique: true })
  name: NameRole;

  @ManyToMany(() => User, (users) => users.roles)
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId' },
  })
  users: User[];
}
