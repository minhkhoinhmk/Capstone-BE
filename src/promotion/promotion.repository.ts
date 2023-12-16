import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Promotion from './entity/promotion.entity';
import { User } from 'src/user/entity/user.entity';
import { dateInVietnam } from 'src/utils/date-vietnam.util';

@Injectable()
export class PromotionRepository {
  private logger = new Logger('PromotionRepository', { timestamp: true });

  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  async getAllPromotionsActiveByUserId(userId: string) {
    return this.promotionRepository.find({
      where: {
        user: {
          id: userId,
        },
        active: true,
      },
      relations: {
        promotionCourses: { course: true },
      },
    });
  }

  createPromotionForStaff(
    staff: User,
    title: string,
    discountPercent: number,
    effectiveDate: string,
    expiredDate: string,
    code: string,
  ) {
    return this.promotionRepository.create({
      discountPercent,
      effectiveDate: new Date(effectiveDate),
      expiredDate: new Date(expiredDate),
      active: true,
      user: staff,
      title,
      code,
      amount: 1,
      insertedDate: dateInVietnam(),
      updatedDate: dateInVietnam(),
    });
  }

  async getPromotionById(id: string) {
    return this.promotionRepository.findOne({
      where: { id },
      relations: {
        promotionCourses: { cartItems: true, orderDetails: true, course: true },
        user: true,
      },
    });
  }

  async getPromotionByCode(code: string) {
    return this.promotionRepository.findOne({
      where: { code },
      relations: { promotionCourses: true, user: true },
    });
  }

  async savePromotion(promotion: Promotion): Promise<Promotion> {
    return await this.promotionRepository.save(promotion);
  }

  async removePromotion(promotion: Promotion): Promise<void> {
    await this.promotionRepository.remove(promotion);
  }

  // getPromotio;
}
