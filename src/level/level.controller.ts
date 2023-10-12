import { Controller, Get, Param } from '@nestjs/common';
import Level from './entity/level.entity';
import { LevelService } from './level.service';

@Controller('level')
export class LevelController {
  constructor(private levelService: LevelService) {}

  @Get()
  findAll(): Promise<Level[]> {
    return this.levelService.getAllLevels();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Level> {
    return this.levelService.getLevelById(id);
  }
}
