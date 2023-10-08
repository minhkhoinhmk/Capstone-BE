import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { SearchCourseReponse } from './dto/reponse/search-course-response.dto';
import { PageOptionsDto } from 'src/common/pagination/dto/pageOptionsDto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';

@Controller('course')
@ApiTags('Courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @Get('/search')
  @ApiOkResponse({
    description: 'Get Courses Successfully',
  })
  @ApiPaginatedResponse(SearchCourseReponse)
  async searchProducts(
    @Query() searchCriteria: any,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<SearchCourseReponse>> {
    return await this.courseService.searchAndFilter(
      searchCriteria,
      pageOptionsDto,
    );
  }
}
