import { Mapper, Mappings } from 'ts-mapstruct';
import { Winner } from '../entity/winner.entity';
import { ViewWinnerReponse } from '../dto/response/view-winner-reponse.entity';

@Mapper()
export class WinnerMapper {
  @Mappings(
    { target: 'winnerName', source: 'fullName' },
    { target: 'insertedDate', source: 'winner.customerDrawing.insertedDate' },
    { target: 'imageUrl', source: 'winner.customerDrawing.imageUrl' },
    { target: 'title', source: 'winner.customerDrawing.title' },
    { target: 'description', source: 'winner.customerDrawing.description' },
  )
  filterViewWinnerResponseFromWinner(
    winner: Winner,
    fullName: string,
  ): ViewWinnerReponse {
    return new ViewWinnerReponse();
  }
}
