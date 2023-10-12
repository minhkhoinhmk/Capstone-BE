import { Body, Controller, Post } from '@nestjs/common';
import { CourseService } from './course.service';
import { SearchCourseReponse } from './dto/reponse/search-course-response.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { SearchCourseRequest } from './dto/request/search-course-request.dto';

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
}
