import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { SearchCourseReponse } from './dto/reponse/search-course-response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { SearchCourseRequest } from './dto/request/search-course-request.dto';
import { CourseDetailResponse } from './dto/reponse/course-detail-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { FilterCourseByCustomerResponse } from './dto/reponse/filter-by-customer.dto';
import { User } from 'src/user/entity/user.entity';
import { Request } from 'express';

@Controller('course')
@ApiTags('Courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Post('/search')
  @ApiOkResponse({
    description: 'Get Courses Successfully',
  })
  @ApiPaginatedResponse(SearchCourseReponse)
  async searchProducts(
    @Body() searchCourseRequest: SearchCourseRequest,
  ): Promise<PageDto<SearchCourseReponse>> {
    return await this.courseService.searchAndFilter(searchCourseRequest);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get Detail Course Successfully',
  })
  async getCourseDetail(
    @Param('id') id: string,
  ): Promise<CourseDetailResponse> {
    return await this.courseService.getDetail(id);
  }

  @Get('/order/user')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  async getCoursesByUserId(
    @Req() request: Request,
  ): Promise<FilterCourseByCustomerResponse[]> {
    return await this.courseService.getCoursesByUserId(request['user']['id']);
  }

  @Get('/order/check-owned/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  async checkCourseIsOwnedByCourseId(
    @Param('id') courseId: string,
    @Req() request: Request,
  ): Promise<{ status: boolean }> {
    return await this.courseService.checkCourseIsOwnedByCourseId(
      courseId,
      request['user'] as User,
    );
  }

  // @Patch(':id')
  // @ApiOkResponse({
  //   description: 'course successfully updated',
  // })
  // async updateCourse(
  //   @Body() searchCourseRequest: SearchCourseRequest,
  // ): Promise<PageDto<SearchCourseReponse>> {
  //   return await this.courseService.searchAndFilter(searchCourseRequest);
  // }
}
