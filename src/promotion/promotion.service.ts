import {
  BadRequestException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PromotionRepository } from './promotion.repository';
import { CreatePromotionRequest } from './dto/request/create-promtion-request.dto';
import Promotion from './entity/promotion.entity';
import { UpdatePromotionRequest } from './dto/request/update-promtion-request.dto';
import { User } from 'src/user/entity/user.entity';
import { dateInVietnam } from 'src/utils/date-vietnam.util';

@Injectable()
export class PromotionService {
  private logger = new Logger('PromotionService', { timestamp: true });

  constructor(private promotionRepository: PromotionRepository) {}

  async getAllPromotionsByUserId(userId: string): Promise<Promotion[]> {
    return this.promotionRepository.getAllPromotionsActiveByUserId(userId);
  }

  async getPromotionById(id: string): Promise<Promotion> {
    return this.promotionRepository.getPromotionById(id);
  }

  async createPromotion(
    body: CreatePromotionRequest,
    user: User,
  ): Promise<void> {
    this.checkPromotionBodyValid(body, 'createPromotion');

    let promotion = new Promotion();
    const { effectiveDate, expiredDate, ...restBody } = body;
    promotion = {
      ...promotion,
      user,
      ...restBody,
      effectiveDate: new Date(effectiveDate),
      expiredDate: new Date(expiredDate),
      insertedDate: dateInVietnam(),
      updatedDate: dateInVietnam(),
      active: true,
    };

    await this.promotionRepository.savePromotion(promotion);

    this.logger.log(`method=createPromotion, Promotion created successfully`);
  }

  async updatePromotion(
    body: UpdatePromotionRequest,
    promotionId: string,
  ): Promise<void> {
    let promotion = await this.getPromotionById(promotionId);

    if (!promotion) {
      this.logger.error(
        `method=updatePromotion, promotionId=${promotionId} is not found`,
      );
      throw new NotFoundException(`promotionId=${promotionId} is not found`);
    }

    this.checkPromotionBodyValid(body, 'updatePromotion');

    promotion = {
      ...promotion,
      ...body,
      effectiveDate: new Date(body.effectiveDate),
      expiredDate: new Date(body.expiredDate),
    };

    await this.promotionRepository.savePromotion(promotion);

    this.logger.log(`method=createPromotion, Promotion updated successfully`);
  }

  async checkPromotionBodyValid(
    body: CreatePromotionRequest | UpdatePromotionRequest,
    methodName: 'createPromotion' | 'updatePromotion',
  ) {
    if (!this.checkDiscountPercentValid(body.discountPercent)) {
      this.logger.error(
        `method=${methodName}, discountPercent=${body.discountPercent} is not valid`,
      );
      throw new BadRequestException(
        `discountPercent=${body.discountPercent} is not valid`,
      );
    }

    if (
      !this.checkEffectiveAndExpireDateValid(
        new Date(body.effectiveDate),
        new Date(body.expiredDate),
      )
    ) {
      this.logger.error(
        `method=${methodName}, effectiveDate=${body.effectiveDate} and expiredDate=${body.expiredDate} is not valid`,
      );
      throw new BadRequestException(
        `effectiveDate=${body.effectiveDate} and expiredDate=${body.expiredDate} is not valid`,
      );
    }

    if (!this.promotionRepository.getPromotionByCode(body.code)) {
      this.logger.error(
        `method=${methodName}, code=${body.code} is already exists`,
      );
      throw new BadRequestException(`code=${body.code} is already exists`);
    }

    if (!this.checkAmountValid(body.amount)) {
      this.logger.error(
        `method=${methodName}, amount=${body.amount} is not valid`,
      );
      throw new BadRequestException(`amount=${body.amount} is already exists`);
    }
  }

  checkDiscountPercentValid(discountPercent: number) {
    return discountPercent >= 10 && discountPercent <= 50;
  }

  checkEffectiveAndExpireDateValid(effectiveDate: Date, expiredDate: Date) {
    return effectiveDate < expiredDate;
  }

  checkAmountValid(amount: number) {
    return amount > 0;
  }

  async removePromotion(id: string): Promise<void> {
    const promotion = await this.promotionRepository.getPromotionById(id);

    if (!promotion) {
      this.logger.error(
        `method=removePromotion, promotionId=${id} is not found`,
      );
      throw new NotFoundException(`promotionId=${id} is not found`);
    }

    if (promotion.promotionCourses.length <= 0) {
      await this.promotionRepository.removePromotion(promotion);

      this.logger.log(`Promotion with id=${id} removed successfully`);
    } else {
      this.logger.error(
        `method=removePromotion, Promotion with id=${id} has promotionCourses`,
      );
      throw new NotAcceptableException(
        `Promotion with id=${id} has promotionCourses`,
      );
    }
  }
}
