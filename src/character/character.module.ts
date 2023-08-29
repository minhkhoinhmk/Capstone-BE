import { Module } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterController } from './character.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entity/character.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [CharacterService],
  controllers: [CharacterController],
  imports: [TypeOrmModule.forFeature([Character]), AuthModule],
})
export class CharacterModule {}
