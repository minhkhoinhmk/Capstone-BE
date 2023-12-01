import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { ApiTags } from '@nestjs/swagger';
import { Achievement } from './entity/achievement.entity';
import { ViewAchievementReponse } from './dto/response/view-achievement-response.dto';

@Controller('achievement')
@ApiTags('Achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  async getAchievementCertificate(
    @Res() res,
    @Query('path') path: string,
  ): Promise<void> {
    const achievement = await this.achievementService.getAchievementCertificate(
      path,
    );

    res.set({
      'Content-Type': 'application/pdf',
    });

    res.send(achievement.Body);
  }

  @Get('/download')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  async download(@Res() res, @Query('path') path: string): Promise<void> {
    const achievement = await this.achievementService.getAchievementCertificate(
      path,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=example.pdf',
      'Content-Length': achievement.ContentLength,
    });

    res.send(achievement.Body);
  }

  @Post('/generate')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  async generate(
    @Req() request: Request,
    @Query('courseId') courseId: string,
  ): Promise<void> {
    await this.achievementService.generatePdf(request['user']['id'], courseId);
  }

  @Get('/user')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  async getListAchievements(
    @Req() request: Request,
  ): Promise<ViewAchievementReponse[]> {
    return await this.achievementService.getListAchievements(
      request['user']['id'],
    );
  }
}
