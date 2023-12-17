import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderDetailRepository } from 'src/order-detail/order-detail.repository';
import { TransactionOrderDetailRepository } from 'src/transaction-order-detail/transaction-order-detail.repository';
import { TransactionPayOfflRepository } from './transaction-pay-off.repository';
import { UserRepository } from 'src/user/user.repository';
import { OrderDetail } from 'src/order-detail/entity/order-detail.entity';
import { TransactionPayOff } from './entity/transaction-pay-off.entity';
import { NameRole } from 'src/role/enum/name-role.enum';
import { RefundRepository } from 'src/refund/refund.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { ViewTransactionPayOffResponse } from './dto/response/view-transaction-pay-off-response.dto';
import { TransactionPayOffMapper } from './mapper/transaction-pay-off.mapper';
import { DeviceRepository } from 'src/device/device.repository';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class TransactionPayOffService {
  private logger = new Logger('TransactionPayOffService', {
    timestamp: true,
  });

  constructor(
    private readonly orderDetailRepository: OrderDetailRepository,
    private readonly transactionOrderDetailRepository: TransactionOrderDetailRepository,
    private readonly transactionPayOfflRepository: TransactionPayOfflRepository,
    private readonly userRepository: UserRepository,
    private readonly refundRepository: RefundRepository,
    private mailsService: MailerService,
    private readonly mapper: TransactionPayOffMapper,
    private readonly deviceRepository: DeviceRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async createTransactionPayOff(
    instructorId: string,
    adminId: string,
  ): Promise<void> {
    const orderDetailByInstructors =
      await this.orderDetailRepository.getOrderDetailByInstructor(instructorId);

    const refundInOrderDetailByInstructors =
      await this.orderDetailRepository.getRefundInOrderDetailByInstructor(
        instructorId,
      );

    const user = await this.userRepository.getUserById(instructorId);

    if (!user) {
      throw new NotFoundException(
        `Instructor with ID ${instructorId} not found`,
      );
    } else if (!(user.role.name === NameRole.Instructor)) {
      throw new NotFoundException(
        `Instructor with ID ${instructorId} not have correct role`,
      );
    } else if (
      orderDetailByInstructors.length <= 0 &&
      refundInOrderDetailByInstructors.length <= 0
    ) {
      throw new NotFoundException(`Do not have any orders for this instructor`);
    } else {
      const totalPaymentAmount: number = this.calculateTotalPaymentAmount(
        orderDetailByInstructors,
        refundInOrderDetailByInstructors,
      );

      if (totalPaymentAmount < 0) {
        throw new InternalServerErrorException(`Total payments are under 0`);
      } else {
        const transactionPayOff =
          await this.transactionPayOfflRepository.createTransactionPayOff(
            adminId,
            totalPaymentAmount,
            user,
          );

        await this.transactionPayOfflRepository.save(transactionPayOff);

        this.saveTransactionOrderDetail(
          transactionPayOff,
          orderDetailByInstructors,
          refundInOrderDetailByInstructors,
        );

        await this.sendEmailForPaymentSuccess(user.email, totalPaymentAmount);

        const tokens = await this.deviceRepository.getDeviceByUserId(user.id);

        const formatter = new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          minimumFractionDigits: 0, // Set the number of decimal places
          maximumFractionDigits: 0,
        });

        tokens.forEach((token) => {
          const payload = {
            token: token.deviceTokenId,
            title: 'Trả lương giáo viên',
            body: `Bạn đã nhận được ${formatter.format(
              totalPaymentAmount,
            )} từ tiền thanh toán các khóa học của chúng tôi`,
            data: {
              type: 'INSTRUCTOR-PAYMENT',
            },
            userId: token.user.id,
          };

          this.notificationService.sendingNotification(payload);
        });

        this.logger.log(
          `method=createTransactionPayOff, created transaction pay off successfully, totalPayment = ${totalPaymentAmount}`,
        );
      }
    }
  }

  calculateTotalPaymentAmount(
    orderDetailByInstructors: OrderDetail[],
    refundInOrderDetailByInstructors: OrderDetail[],
  ): number {
    let totalPaymentAmount = 0;

    orderDetailByInstructors.forEach((orderDetailByInstructor) => {
      totalPaymentAmount =
        totalPaymentAmount + orderDetailByInstructor.priceAfterPromotion * 0.8;
    });

    refundInOrderDetailByInstructors.forEach(
      (refundInOrderDetailByInstructor) => {
        totalPaymentAmount =
          totalPaymentAmount -
          refundInOrderDetailByInstructor.refund.refundPrice * 0.8;
      },
    );

    return totalPaymentAmount;
  }

  saveTransactionOrderDetail(
    transactionPayOff: TransactionPayOff,
    orderDetailByInstructors: OrderDetail[],
    refundInOrderDetailByInstructors: OrderDetail[],
  ) {
    orderDetailByInstructors.forEach(async (orderDetailByInstructor) => {
      const transactionOrderDetail =
        await this.transactionOrderDetailRepository.createTransactionOrderDetail(
          orderDetailByInstructor,
          transactionPayOff,
        );

      await this.transactionOrderDetailRepository.save(transactionOrderDetail);

      orderDetailByInstructor.isPaymentForInstructor = true;

      await this.orderDetailRepository.saveOrderDetail(orderDetailByInstructor);
    });

    refundInOrderDetailByInstructors.forEach(
      async (refundInOrderDetailByInstructor) => {
        const transactionOrderDetail =
          await this.transactionOrderDetailRepository.createTransactionOrderDetail(
            refundInOrderDetailByInstructor,
            transactionPayOff,
          );

        await this.transactionOrderDetailRepository.save(
          transactionOrderDetail,
        );

        refundInOrderDetailByInstructor.isPaymentForInstructor = true;

        await this.orderDetailRepository.saveOrderDetail(
          refundInOrderDetailByInstructor,
        );

        const refund = refundInOrderDetailByInstructor.refund;
        refund.isStaffRefund = true;

        await this.refundRepository.saveRefund(refund);
      },
    );
  }

  async sendEmailForPaymentSuccess(email: string, totalPaymentAmount: number) {
    await this.mailsService.sendMail({
      to: email,
      subject: 'Tiền lời từ khóa học',
      template: './transferPaymentSuccess',
      context: {
        SUBJECT: 'tiền nhận được từ các khóa học',
        CONTENT: `${totalPaymentAmount} VND`,
      },
    });
  }

  async getTransactionPayOffByReciever(
    instructorId: string,
  ): Promise<ViewTransactionPayOffResponse[]> {
    const response: ViewTransactionPayOffResponse[] = [];

    const transactionPayOffs =
      await this.transactionPayOfflRepository.getTransactionPayOffByReciever(
        instructorId,
      );

    transactionPayOffs.forEach((transactionPayOff) => {
      response.push(
        this.mapper.filterViewTransactionPayOffResponseFromTransactionPayOff(
          transactionPayOff,
        ),
      );
    });

    this.logger.log(
      `method=getTransactionPayOffByReciever, total items=${response.length}`,
    );

    return response;
  }

  async getTransactionPayOffBySender(
    senderId: string,
  ): Promise<ViewTransactionPayOffResponse[]> {
    let response: ViewTransactionPayOffResponse[] = [];

    const transactionPayOffs =
      await this.transactionPayOfflRepository.getTransactionPayOffBySender(
        senderId,
      );

    transactionPayOffs.forEach((transactionPayOff) => {
      response.push(
        this.mapper.filterViewTransactionPayOffResponseFromTransactionPayOff(
          transactionPayOff,
        ),
      );
    });

    this.logger.log(
      `method=getTransactionPayOffBySender, total items=${response.length}`,
    );

    return response;
  }

  async getTransactionPayOffById(
    id: string,
  ): Promise<ViewTransactionPayOffResponse> {
    const transactionPayOff =
      await this.transactionPayOfflRepository.getTransactionPayOffById(id);

    this.logger.log(
      `method=getTransactionPayOffById, transaction pay off id = ${id}`,
    );

    return this.mapper.filterViewTransactionPayOffResponseFromTransactionPayOff(
      transactionPayOff,
    );
  }
}
