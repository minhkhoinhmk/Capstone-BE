import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Level from './entity/level.entity';

@Injectable()
export class LevelRepository {
  private logger = new Logger('LevelRepository', { timestamp: true });

  constructor(
    @InjectRepository(Level)
    private levelRepository: Repository<Level>,
  ) {}

  async getAllLevels() {
    return this.levelRepository.find({});
  }

  async getLevelById(id: string) {
    return this.levelRepository.findOne({
      where: { id },
    });
  }
}
