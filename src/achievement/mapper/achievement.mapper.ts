import { Mapper, Mappings } from 'ts-mapstruct';
import { Achievement } from '../entity/achievement.entity';
import { ViewAchievementReponse } from '../dto/response/view-achievement-response.dto';
import { Learner } from 'src/learner/entity/learner.entity';
import { User } from 'src/user/entity/user.entity';

@Mapper()
export class AchievementMapper {
  @Mappings(
    { target: 'customerName', expression: 'getCustomerName(achievement.user)' },
    { target: 'learnerName', expression: 'getLeanerName(achievement.learner)' },
    { target: 'courseName', source: 'achievement.course.title' },
  )
  filterViewAchievementResponseFromAchievement(
    achievement: Achievement,
  ): ViewAchievementReponse {
    return new ViewAchievementReponse();
  }

  getLeanerName(learner: Learner): string {
    if (learner) {
      return learner.firstName;
    }
    return null;
  }

  getCustomerName(customer: User): string {
    if (customer) {
      return customer.firstName;
    }
    return null;
  }
}
