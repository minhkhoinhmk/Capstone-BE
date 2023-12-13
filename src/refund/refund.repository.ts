import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Refund } from './entity/refund.entity';
import { Repository } from 'typeorm';
import { CreateRefundRequest } from './dto/request/create-refund-request.dto';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';

@Injectable()
export class RefundRepository {
  constructor(
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
  ) {}

  async createRefund(
    request: CreateRefundRequest,
    refundPrice: number,
    orderDetail: OrderDetail,
  ): Promise<Refund> {
    return this.refundRepository.create({
      bank: request.bank,
      accountNumber: request.accountNumber,
      refundPrice: refundPrice,
      refundReason: request.refundReason,
      isApproved: false,
      accountName: request.accountName,
      orderDetail: orderDetail,
    });
  }

  async saveRefund(refund: Refund): Promise<Refund> {
    return this.refundRepository.save(refund);
  }

  async getRefunds(): Promise<{ count: number; entities: Refund[] }> {
    const entities = await this.refundRepository.find({
      relations: {
        orderDetail: {
          course: true,
          order: {
            user: true,
          },
        },
      },
      order: { insertedDate: 'DESC' },
    });

    const count = await this.refundRepository.count();

    return { count: count, entities: entities };
  }

  async getRefundById(id: string): Promise<Refund> {
    return await this.refundRepository.findOne({
      where: { id: id },
      relations: {
        orderDetail: {
          course: true,
          order: {
            user: true,
          },
        },
      },
    });
  }

  async getRefundByCustomerId(
    customerId: string,
  ): Promise<{ count: number; entities: Refund[] }> {
    const entities = await this.refundRepository.find({
      where: {
        orderDetail: {
          order: {
            user: { id: customerId },
          },
        },
      },
      relations: {
        orderDetail: {
          course: true,
          order: {
            user: true,
          },
        },
      },
    });

    const count = await this.refundRepository.count({
      where: {
        orderDetail: {
          order: {
            user: { id: customerId },
          },
        },
      },
    });

    return { count: count, entities: entities };
  }

  async getRefundByOrderDetail(orderDetailId: string): Promise<Refund> {
    return await this.refundRepository.findOne({
      where: { orderDetail: { id: orderDetailId } },
      relations: { orderDetail: true },
    });
  }
}
