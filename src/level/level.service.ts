import { Injectable, Logger } from '@nestjs/common';
import { LevelRepository } from './level.repository';
import Level from './entity/level.entity';

@Injectable()
export class LevelService {
  private logger = new Logger('LevelService', { timestamp: true });

  constructor(private levelRepository: LevelRepository) {}

  async getAllLevels(active: string): Promise<Level[]> {
    return this.levelRepository.getAllLevels(active === 'true' ? true : false);
  }

  async getLevelById(id: string): Promise<Level> {
    return this.levelRepository.getLevelById(id);
  }
}
