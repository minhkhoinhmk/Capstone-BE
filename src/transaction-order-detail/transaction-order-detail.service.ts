import { Injectable, Logger } from '@nestjs/common';
import { OrderDetailRepository } from 'src/order-detail/order-detail.repository';
import { ViewTransactionOrderDetailResponse } from './dto/response/view-transaction-order-detail-response.dto';
import { TransactionOrderDetailRepository } from './transaction-order-detail.repository';
import { dateInVietnam } from 'src/utils/date-vietnam.util';

@Injectable()
export class TransactionOrderDetailService {
  private logger = new Logger('TransactionOrderDetailService', {
    timestamp: true,
  });

  constructor(
    private readonly orderDetailRepository: OrderDetailRepository,
    private readonly transactionOrderDetailRepository: TransactionOrderDetailRepository,
  ) {}

  async viewTransactionOrderDetail(
    instructorId: string,
  ): Promise<ViewTransactionOrderDetailResponse[]> {
    const response: ViewTransactionOrderDetailResponse[] = [];

    const orderDetailByInstructors =
      await this.orderDetailRepository.getOrderDetailByInstructor(instructorId);

    const refundInOrderDetailByInstructors =
      await this.orderDetailRepository.getRefundInOrderDetailByInstructor(
        instructorId,
      );

    orderDetailByInstructors.forEach((orderDetailByInstructor) => {
      response.push({
        refundId: null,
        paymentAmount: orderDetailByInstructor.priceAfterPromotion * 0.8,
        systemPaymentAmount: orderDetailByInstructor.priceAfterPromotion * 0.2,
        refundAmount: null,
        systemRefundAmount: null,
        insertedDate: dateInVietnam(),
        active: true,
        courseName: orderDetailByInstructor.course.title,
        author: `${orderDetailByInstructor.course.user.firstName} ${orderDetailByInstructor.course.user.middleName} ${orderDetailByInstructor.course.user.lastName}`,
        buyer: `${orderDetailByInstructor.order.user.firstName} ${orderDetailByInstructor.order.user.middleName} ${orderDetailByInstructor.order.user.lastName}`,
      });
    });

    refundInOrderDetailByInstructors.forEach(
      (refundInOrderDetailByInstructor) => {
        response.push({
          refundId: refundInOrderDetailByInstructor.refund.id,
          paymentAmount: null,
          systemPaymentAmount: null,
          refundAmount:
            refundInOrderDetailByInstructor.refund.refundPrice * 0.8,
          systemRefundAmount:
            refundInOrderDetailByInstructor.refund.refundPrice * 0.2,
          insertedDate: dateInVietnam(),
          active: true,
          courseName: refundInOrderDetailByInstructor.course.title,
          author: `${refundInOrderDetailByInstructor.course.user.firstName} ${refundInOrderDetailByInstructor.course.user.middleName} ${refundInOrderDetailByInstructor.course.user.lastName}`,
          buyer: `${refundInOrderDetailByInstructor.order.user.firstName} ${refundInOrderDetailByInstructor.order.user.middleName} ${refundInOrderDetailByInstructor.order.user.lastName}`,
        });
      },
    );

    this.logger.log(
      `method=viewTransactionOrderDetail, total items = ${response.length}`,
    );

    return response;
  }

  async getTransactionOrderDetailByTransactionPayOff(
    transactionPayOffId: string,
  ): Promise<ViewTransactionOrderDetailResponse[]> {
    const response: ViewTransactionOrderDetailResponse[] = [];

    const transactionOrderDetails =
      await this.transactionOrderDetailRepository.getTransactionOrderDetailsByTransactionPayOff(
        transactionPayOffId,
      );

    transactionOrderDetails.forEach((transactionOrderDetail) => {
      response.push({
        refundId: transactionOrderDetail.refundId,
        paymentAmount: transactionOrderDetail.paymentAmount,
        systemPaymentAmount: transactionOrderDetail.paymentAmount
          ? transactionOrderDetail.orderDetail.priceAfterPromotion * 0.2
          : null,
        refundAmount: transactionOrderDetail.refundAmount,
        systemRefundAmount: transactionOrderDetail.refundAmount
          ? transactionOrderDetail.refundAmount * 0.2
          : null,
        insertedDate: transactionOrderDetail.insertedDate,
        active: transactionOrderDetail.active,
        courseName: transactionOrderDetail.orderDetail.course.title,
        author: `${transactionOrderDetail.orderDetail.course.user.firstName} ${transactionOrderDetail.orderDetail.course.user.middleName} ${transactionOrderDetail.orderDetail.course.user.lastName}`,
        buyer: `${transactionOrderDetail.orderDetail.order.user.firstName} ${transactionOrderDetail.orderDetail.order.user.middleName} ${transactionOrderDetail.orderDetail.order.user.lastName}`,
      });
    });

    this.logger.log(
      `method=getTransactionOrderDetailByTransactionPayOff, total items = ${response.length}`,
    );

    return response;
  }
}
