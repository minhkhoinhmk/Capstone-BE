import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CompletedUserLectureRequest } from './dto/request/completed-user-lecture-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { UserLectureService } from './user-lecture.service';
import { Request } from 'express';

@Controller('user-lecture')
@ApiTags('User Lecture')
export class UserLectureController {
  constructor(private readonly userLectureService: UserLectureService) {}

  @Post('/save')
  @ApiCreatedResponse({
    description: 'Create user lecture',
  })
  @ApiBody({ type: CompletedUserLectureRequest })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer, NameRole.Learner)
  saveUserLecture(
    @Body() completedUserLectureRequest: CompletedUserLectureRequest,
    @Req() request: Request,
  ): Promise<void> {
    return this.userLectureService.saveCompletedUserLecture(
      completedUserLectureRequest,
      request['user']['id'],
    );
  }
}
