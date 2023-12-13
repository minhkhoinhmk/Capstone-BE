import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { LevelRepository } from './level.repository';
import Level from './entity/level.entity';
import { CreateLevelRequest } from './dto/request/create-level-request.dto';

@Injectable()
export class LevelService {
  private logger = new Logger('LevelService', { timestamp: true });

  constructor(private levelRepository: LevelRepository) {}

  async getAllLevels(active: string): Promise<Level[]> {
    return this.levelRepository.getAllLevelsByActive(
      active === 'true' ? true : false,
    );
  }

  async getAllLevelsByAdmin(): Promise<Level[]> {
    return this.levelRepository.getAllLevels();
  }

  async getLevelById(id: string): Promise<Level> {
    return this.levelRepository.getLevelById(id);
  }

  async createLevel(body: CreateLevelRequest): Promise<void> {
    const level = await this.levelRepository.createLevel(body);

    await this.levelRepository.saveLevel(level);

    this.logger.log(`method=createLevel, Level created successfully`);
  }

  async updateLevel(id: string, body: CreateLevelRequest): Promise<void> {
    const level = await this.levelRepository.getLevelById(id);

    level.name = body.name;

    await this.levelRepository.saveLevel(level);

    this.logger.log(`Level with id=${id} updated successfully`);
  }

  async removeLevel(id: string): Promise<void> {
    const level = await this.levelRepository.getLevelById(id);

    if (level.courses.length <= 0) {
      await this.levelRepository.removeLevel(level);

      this.logger.log(`Level with id=${id} removed successfully`);
    } else {
      throw new NotAcceptableException(`Độ khó đã có khóa học`);
    }
  }
}
