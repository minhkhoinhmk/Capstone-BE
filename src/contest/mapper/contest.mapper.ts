import { Mapper, Mappings } from 'ts-mapstruct';
import { Contest } from '../entity/contest.entity';
import { ViewContestResponse } from '../dto/response/view-contest-reponse.dto';

@Mapper()
export class ContestMapper {
  @Mappings(
    { target: 'staffName', source: 'staffName' },
    { target: 'totalCustomerDrawing', source: 'totalCustomerDrawing' },
  )
  filterViewContestResponseFromContest(
    contest: Contest,
    staffName: string,
    totalCustomerDrawing: number,
  ): ViewContestResponse {
    return new ViewContestResponse();
  }
}
