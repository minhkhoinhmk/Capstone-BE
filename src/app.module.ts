import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './character/entity/character.entity';
import { CharacterModule } from './character/character.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5435,
      username: 'capstone',
      password: 'capstone',
      database: 'Capstone-DB',
      autoLoadEntities: true,
      synchronize: true,
      entities: [Character],
    }),
    CharacterModule,
  ],
})
export class AppModule {}
