import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Promotion from './entity/promotion.entity';

@Injectable()
export class PromotionRepository {
  private logger = new Logger('PromotionRepository', { timestamp: true });

  constructor(
    @InjectRepository(Promotion)
    private PromotionRepository: Repository<Promotion>,
  ) {}

  async getAllPromotionsActiveByUserId(userId: string) {
    return this.PromotionRepository.find({
      where: {
        user: {
          id: userId,
        },
        active: true,
      },
      relations: {
        promotionCourses: true,
      },
    });
  }

  async getPromotionById(id: string) {
    return this.PromotionRepository.findOne({
      where: { id },
      relations: { promotionCourses: true, user: true },
    });
  }

  async getPromotionByCode(code: string) {
    return this.PromotionRepository.findOne({
      where: { code },
      relations: { promotionCourses: true, user: true },
    });
  }

  async savePromotion(promotion: Promotion): Promise<void> {
    await this.PromotionRepository.save(promotion);
  }

  async removePromotion(promotion: Promotion): Promise<void> {
    await this.PromotionRepository.remove(promotion);
  }
}
