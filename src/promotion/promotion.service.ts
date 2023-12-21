import {
  BadRequestException,
  ConflictException,
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
import { PromotionCourseRepository } from 'src/promotion-course/promotion-course.repository';

@Injectable()
export class PromotionService {
  private logger = new Logger('PromotionService', { timestamp: true });

  constructor(
    private promotionRepository: PromotionRepository,
    private promotionCourseRepository: PromotionCourseRepository,
  ) {}

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
    await this.checkPromotionBodyValid(body, 'createPromotion');

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

  async createPromotionByStaff(
    staff: User,
    title: string,
    discountPercent: number,
    effectiveDate: string,
    expiredDate: string,
    code: string,
  ) {
    const promotion = await this.promotionRepository.savePromotion(
      this.promotionRepository.createPromotionForStaff(
        staff,
        title,
        discountPercent,
        effectiveDate,
        expiredDate,
        code,
      ),
    );

    await this.promotionCourseRepository.savePromotionCourse(
      this.promotionCourseRepository.createPromotionCourseByStaff(promotion),
    );

    return promotion;
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

    await this.checkPromotionBodyValid(body, 'updatePromotion');

    if (promotion.code !== body.code) {
      promotion = {
        ...promotion,
        ...body,
        effectiveDate: new Date(body.effectiveDate),
        expiredDate: new Date(body.expiredDate),
      };
    } else {
      const { code, ...rest } = body;
      promotion = {
        ...promotion,
        ...rest,
        effectiveDate: new Date(body.effectiveDate),
        expiredDate: new Date(body.expiredDate),
      };
    }

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
        `method=${methodName}, effectiveDate=${body.effectiveDate}(${new Date(
          body.effectiveDate,
        ).getTime()}) and expiredDate=${body.expiredDate}(${new Date(
          body.effectiveDate,
        ).getTime()}) is not valid`,
      );
      // throw new BadRequestException(
      //   `effectiveDate=${body.effectiveDate} and expiredDate=${body.expiredDate} is not valid`,
      // );
      throw new BadRequestException(
        `Thời gian bắt đầu ${body.effectiveDate} nên nhỏ hơn ${body.expiredDate} thời gian kết thúc`,
      );
    }

    if (await this.promotionRepository.getPromotionByCode(body.code)) {
      this.logger.error(
        `method=${methodName}, code=${body.code} is already exists`,
      );
      // throw new ConflictException(`code=${body.code} is already exists`);
      throw new ConflictException(`code=${body.code} đã tồn tại`);
    }

    if (!this.checkAmountValid(body.amount)) {
      this.logger.error(
        `method=${methodName}, amount=${body.amount} is not valid`,
      );
      throw new BadRequestException(`amount=${body.amount} is not valid`);
    }
  }

  checkDiscountPercentValid(discountPercent: number) {
    return discountPercent >= 10 && discountPercent <= 50;
  }

  checkEffectiveAndExpireDateValid(effectiveDate: Date, expiredDate: Date) {
    return effectiveDate.getTime() < expiredDate.getTime();
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

    for (const promotionCourse of promotion.promotionCourses) {
      if (
        promotionCourse.cartItems.length > 0 ||
        promotionCourse.orderDetails.length > 0
      ) {
        this.logger.error(
          `method=removePromotion, PromotionCourse with id=${promotionCourse.id} has cartItems and orderDetails`,
        );
        throw new NotAcceptableException(
          `Trong số các khóa học được giảm giá đã có trong giỏ hàng hay đã có khách hàng sử dụng`,
        );
      }
    }

    for (const promotionCourse of promotion.promotionCourses) {
      await this.promotionCourseRepository.removePromotionCourse(
        promotionCourse,
      );
    }

    await this.promotionRepository.removePromotion(promotion);

    this.logger.log(`Promotion with id=${id} removed successfully`);
  }
}
