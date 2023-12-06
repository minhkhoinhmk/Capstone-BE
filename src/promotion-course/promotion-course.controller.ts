import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PromotionCourseService } from './promotion-course.service';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { CreatePromotionCourseRequest } from './request/create-promotion-course-request.dto';
import { Request } from 'express';
import { User } from 'src/user/entity/user.entity';
import { UpdateIsViewOfStaffRequest } from './request/update-is-view-of-staff.request.dto';
import { PromotionCourse } from './entity/promotion-course.entity';

@Controller('promotion-course')
@ApiTags('Promotion Course')
export class PromotionCourseController {
  constructor(private promotionCourseService: PromotionCourseService) {}

  @Post('/apply/view')
  checkPromotionCourseCanApplyById(
    @Query('promotionCourseId') promotionCourseId: string,
  ) {
    return this.promotionCourseService.checkPromotionCourseCanApplyById(
      promotionCourseId,
    );
  }

  @Post('/apply/not-view')
  checkPromotionCourseCanApplyByCode(
    @Query('courseId') courseId: string,
    @Query('code') code: string,
  ) {
    return this.promotionCourseService.checkPromotionCourseCanApplyByCode(
      code,
      courseId,
    );
  }

  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff, NameRole.Instructor)
  @ApiCreatedResponse({ description: `Create Promotion course` })
  @ApiBody({ type: CreatePromotionCourseRequest })
  createPromotionCourse(
    @Body() body: CreatePromotionCourseRequest,
    @Req() request: Request,
  ): Promise<void> {
    return this.promotionCourseService.createPromotionCourse(
      body,
      request['user'] as User,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff, NameRole.Instructor)
  deletePromotionCourse(@Param('id') id: string): Promise<void> {
    return this.promotionCourseService.removePromotionCourse(id);
  }

  @Patch('/view')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Instructor)
  @ApiBody({ type: UpdateIsViewOfStaffRequest })
  updateIsViewOfInstructor(
    @Body() body: UpdateIsViewOfStaffRequest,
  ): Promise<void> {
    return this.promotionCourseService.updateIsViewOfInstructor(body);
  }

  @Get(':id')
  findPromotionCourseById(@Param('id') id: string): Promise<PromotionCourse> {
    return this.promotionCourseService.getPromotionCourseById(id);
  }

  @Get('/promotion/:promotionId')
  findPromotionCoursesByPromotionId(
    @Param('promotionId') id: string,
  ): Promise<PromotionCourse[]> {
    return this.promotionCourseService.getPromotionCoursesByPromotionId(id);
  }

  @Get('/view/:courseId')
  findPromotionCoursesCanViewByCourseId(
    @Param('courseId') courseId: string,
  ): Promise<PromotionCourse[]> {
    return this.promotionCourseService.getPromotionCoursesCanViewByCourseId(
      courseId,
    );
  }
}
