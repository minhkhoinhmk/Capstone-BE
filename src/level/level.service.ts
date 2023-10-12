import { Injectable, Logger } from '@nestjs/common';
import { LevelRepository } from './level.repository';
import Level from './entity/level.entity';

@Injectable()
export class LevelService {
  private logger = new Logger('LevelService', { timestamp: true });

  constructor(private levelRepository: LevelRepository) {}

  async getAllLevels(): Promise<Level[]> {
    return this.levelRepository.getAllLevels();
  }

  async getLevelById(id: string): Promise<Level> {
    return this.levelRepository.getLevelById(id);
  }
}
