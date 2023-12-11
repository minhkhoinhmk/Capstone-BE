import { Mapper, Mappings } from 'ts-mapstruct';
import { CustomerDrawing } from '../entity/customer-drawing.entity';
import { ViewCustomerDrawingResponse } from '../dto/response/view-customer-drawing-response.dto';

@Mapper()
export class CustomerDrawingMapper {
  @Mappings(
    { target: 'customerName', source: 'customerName' },
    { target: 'totalVotes', source: 'totalVotes' },
    { target: 'contestName', source: 'customerDrawing.contest.title' },
    { target: 'isVoted', source: 'isVoted' },
    { target: 'isOwned', source: 'isOwned' },
  )
  filterViewCustomerDrawingResponseFromCustomerDrawingV2(
    customerDrawing: CustomerDrawing,
    customerName: string,
    totalVotes: number,
    isVoted: boolean,
    isOwned: boolean,
  ): ViewCustomerDrawingResponse {
    return new ViewCustomerDrawingResponse();
  }

  @Mappings(
    { target: 'customerName', source: 'customerName' },
    { target: 'totalVotes', source: 'totalVotes' },
    { target: 'contestName', source: 'customerDrawing.contest.title' },
  )
  filterViewCustomerDrawingResponseFromCustomerDrawingV1(
    customerDrawing: CustomerDrawing,
    customerName: string,
    totalVotes: number,
  ): ViewCustomerDrawingResponse {
    return new ViewCustomerDrawingResponse();
  }
}
