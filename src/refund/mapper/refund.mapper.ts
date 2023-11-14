import { Mapper, Mappings } from 'ts-mapstruct';
import { RefundResponse } from '../dto/response/refund-response.dto';
import { Refund } from '../entity/refund.entity';

@Mapper()
export class RefundMapper {
  @Mappings(
    {
      target: 'firstName',
      source: 'refund.orderDetail.order.user.firstName',
    },
    {
      target: 'middleName',
      source: 'refund.orderDetail.order.user.middleName',
    },
    {
      target: 'lastName',
      source: 'refund.orderDetail.order.user.lastName',
    },
    {
      target: 'courseTitle',
      source: 'refund.orderDetail.course.title',
    },
  )
  filterRefundResponseFromRefund(refund: Refund): RefundResponse {
    return new RefundResponse();
  }
}
