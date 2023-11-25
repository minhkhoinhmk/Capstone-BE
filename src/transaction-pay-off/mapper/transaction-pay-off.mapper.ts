import { Mapper, Mappings } from 'ts-mapstruct';
import { TransactionPayOff } from '../entity/transaction-pay-off.entity';
import { ViewTransactionPayOffResponse } from '../dto/response/view-transaction-pay-off-response.dto';

@Mapper()
export class TransactionPayOffMapper {
  @Mappings()
  filterViewTransactionPayOffResponseFromTransactionPayOff(
    transactionPayOff: TransactionPayOff,
  ): ViewTransactionPayOffResponse {
    return new ViewTransactionPayOffResponse();
  }
}
