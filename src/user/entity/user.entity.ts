import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { Post } from 'src/post/entity/post.entity';
import { Role } from 'src/role/entity/role.entity';
import PublicFile from 'src/files/publicFile.entity';

@Entity()
export class User {
  @ApiProperty({ type: UUID, description: 'UUIDe of the User' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: String, description: 'firstName of the User' })
  @Column({
    length: 100,
  })
  firstName: string;

  @ApiProperty({ type: String, description: 'lastName of the User' })
  @Column({
    length: 100,
  })
  lastName: string;

  @ApiProperty({ type: String, description: 'middleName of the User' })
  @Column({
    length: 100,
  })
  middleName: string;

  @ApiProperty({ type: String, description: 'userName of the User' })
  @Column({
    length: 100,
  })
  userName: string;

  @ApiProperty({ type: String, description: 'password of the User' })
  @Column()
  password: string;

  @ApiProperty({ type: String, description: 'phoneNumber of the User' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ type: String, description: 'email of the User' })
  @Column()
  email: string;

  @ApiProperty({ type: Boolean, description: 'active of the User' })
  @Column()
  active: boolean;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @ManyToMany(() => Role, (roles) => roles.users)
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId' },
  })
  roles: Role[];

  @ApiProperty({ type: String, description: 'avatar URL of the User' })
  @JoinColumn()
  @OneToOne(() => PublicFile, {
    eager: true,
    nullable: true,
  })
  public avatar?: PublicFile;
}
