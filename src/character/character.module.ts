import { Module } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterController } from './character.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entity/character.entity';

@Module({
  providers: [CharacterService],
  controllers: [CharacterController],
  imports: [TypeOrmModule.forFeature([Character])],
})
export class CharacterModule {}
