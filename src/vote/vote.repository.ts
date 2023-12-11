import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Learner } from 'src/learner/entity/learner.entity';
import { Vote } from './entity/vote.entity';
import { CustomerDrawing } from 'src/customer-drawing/entity/customer-drawing.entity';

@Injectable()
export class VoteRepository {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  createVote(
    user: User,
    learner: Learner,
    customerDrawing: CustomerDrawing,
  ): Vote {
    return this.voteRepository.create({
      user,
      learner,
      customerDrawing,
    });
  }

  async saveVote(vote: Vote): Promise<Vote> {
    return await this.voteRepository.save(vote);
  }

  async getVoteCustomerDrawing(
    user: User | null,
    learner: Learner | null,
    customerDrawing: CustomerDrawing,
  ): Promise<Vote> {
    if (user)
      return this.voteRepository.findOne({
        where: {
          customerDrawing: {
            id: customerDrawing.id,
          },
          user: {
            id: user.id,
          },
        },
      });

    return this.voteRepository.findOne({
      where: {
        customerDrawing: {
          id: customerDrawing.id,
        },
        learner: {
          id: learner.id,
        },
      },
    });
  }

  async getListVoteCustomerDrawing(
    user: User,
    learnerIds: string[],
    contestId: string,
  ): Promise<Vote[]> {
    return this.voteRepository.find({
      where: [
        {
          customerDrawing: {
            contest: {
              id: contestId,
            },
          },
          user: {
            id: user.id,
          },
        },
        {
          customerDrawing: {
            contest: {
              id: contestId,
            },
          },
          learner: {
            id: In(learnerIds),
          },
        },
      ],
    });
  }
}
