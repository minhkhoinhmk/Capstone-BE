import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Level from './entity/level.entity';
import { CreateLevelRequest } from './dto/request/create-level-request.dto';

@Injectable()
export class LevelRepository {
  private logger = new Logger('LevelRepository', { timestamp: true });

  constructor(
    @InjectRepository(Level)
    private levelRepository: Repository<Level>,
  ) {}

  async getAllLevelsByActive(active: boolean) {
    return this.levelRepository.find({ where: { active } });
  }

  async getAllLevels() {
    return this.levelRepository.find();
  }

  async getLevelById(id: string) {
    return this.levelRepository.findOne({
      where: { id },
      relations: { courses: true },
    });
  }
  async createLevel(body: CreateLevelRequest): Promise<Level> {
    return this.levelRepository.create({
      name: body.name,
      active: true,
    });
  }

  async saveLevel(level: Level): Promise<void> {
    await this.levelRepository.save(level);
  }

  async removeLevel(level: Level): Promise<void> {
    await this.levelRepository.remove(level);
  }
}
