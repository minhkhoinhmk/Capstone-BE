import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Level from './entity/level.entity';
import { LevelRepository } from './level.repository';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Level])],
  providers: [LevelRepository, LevelService],
  controllers: [LevelController],
  exports: [LevelRepository],
})
export class LevelModule {}
