import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { Learner } from 'src/learner/entity/learner.entity';
import { NameRole } from 'src/role/enum/name-role.enum';
import { User } from 'src/user/entity/user.entity';
import { VoteRepository } from './vote.repository';
import { CustomerDrawingRepository } from 'src/customer-drawing/customer-drawing.repository';
import { CustomerDrawing } from 'src/customer-drawing/entity/customer-drawing.entity';
import { Contest } from 'src/contest/entity/contest.entity';

@Injectable()
export class VoteService {
  private logger = new Logger('VoteService', { timestamp: true });

  constructor(
    private readonly customerDrawingRepository: CustomerDrawingRepository,
    private readonly voteRepository: VoteRepository,
  ) {}

  async voteCustomerDrawing(
    customerDrawingId: string,
    user: User | Learner,
  ): Promise<void> {
    const customerDrawing =
      await this.customerDrawingRepository.getCustomerDrawingById(
        customerDrawingId,
      );

    const currCustomer =
      user.role !== NameRole.Learner ? (user as User) : (user as Learner).user;

    if (
      !(
        await this.customerDrawingRepository.getListCustomerDrawingByCustomerId(
          currCustomer.id,
        )
      ).every((customerDrawing) => customerDrawing.id !== customerDrawingId)
    ) {
      this.logger.error(
        `method=voteCustomerDrawing, customerDrawing with id ${customerDrawingId} was create by customer ${currCustomer.id}`,
      );
      throw new NotAcceptableException(
        `Bạn không được vote cho bài thi của chính mình`,
      );
    }

    //   check đã vote 4 lượt chưa + vote customerDrawing này chưa

    if (await this.checkIsVoteCustomerDrawing(currCustomer, customerDrawing)) {
      this.logger.error(
        `method=voteCustomerDrawing, user with id ${currCustomer.id} has been voted`,
      );
      throw new NotAcceptableException(`Bạn đã vote bài vẽ này`);
    }

    if (
      (await this.getNumsVoteOfUserInContest(
        currCustomer,
        customerDrawing.contest,
      )) >= 4
    ) {
      this.logger.error(
        `method=voteCustomerDrawing, user with id ${currCustomer.id} has been voted 4 times`,
      );
      throw new NotAcceptableException(`Bạn đã vote 4 lần`);
    }

    const vote =
      user.role !== NameRole.Learner
        ? this.voteRepository.createVote(user as User, null, customerDrawing)
        : this.voteRepository.createVote(
            null,
            user as Learner,
            customerDrawing,
          );

    await this.voteRepository.saveVote(vote);
    this.logger.log(
      `method=voteCustomerDrawing, user with id ${user.id} voted customerDrawing with id ${customerDrawingId} successfully`,
    );
  }

  async checkIsVoteCustomerDrawing(
    customer: User,
    customerDrawing: CustomerDrawing,
  ): Promise<boolean> {
    let isVoted = false;

    if (
      await this.voteRepository.getVoteCustomerDrawing(
        customer,
        null,
        customerDrawing,
      )
    )
      isVoted = true;

    for (const learner of customer.learners) {
      if (
        await this.voteRepository.getVoteCustomerDrawing(
          null,
          learner,
          customerDrawing,
        )
      )
        isVoted = true;
    }

    return isVoted;
  }

  async getNumsVoteOfUserInContest(customer: User, contest: Contest) {
    const learnerIds: string[] = [];

    customer.learners.forEach((learner) => learnerIds.push(learner.id));

    return (
      await this.voteRepository.getListVoteCustomerDrawing(
        customer,
        learnerIds,
        contest.id,
      )
    ).length;
  }
}
