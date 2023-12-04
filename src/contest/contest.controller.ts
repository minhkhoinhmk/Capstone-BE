import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ContestService } from './contest.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { HasRoles } from 'src/auth/roles.decorator';
import { NameRole } from 'src/role/enum/name-role.enum';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateContestRequest } from './dto/request/create-contest-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiPaginatedResponse } from 'src/common/decorator/api-pagination-response';
import { ViewContestResponse } from './dto/response/view-contest-reponse.dto';
import { PageDto } from 'src/common/pagination/dto/pageDto';
import { Contest } from './entity/contest.entity';
import { FilterContestRequest } from './dto/request/filter-contest-request.dto';

@Controller('contest')
@ApiTags('Contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Post('/create')
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  @ApiCreatedResponse({
    description: 'Created Contest Successfully',
  })
  createContest(
    @Body() createContestRequest: CreateContestRequest,
    @Req() request: Request,
  ): Promise<Contest> {
    return this.contestService.createContest(
      createContestRequest,
      request['user']['id'],
    );
  }

  @Put('/thumbnail')
  @ApiOkResponse({
    description: 'Uploaded Thumbnail Successfully',
  })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  async uploadThumbnail(
    @UploadedFile() file: Express.Multer.File,
    @Query('contestId') contestId: string,
  ): Promise<void> {
    const parts = file.originalname.split('.');

    if (parts.length > 1) {
      const substringAfterDot = parts[parts.length - 1];
      return await this.contestService.uploadThumbnail(
        file.buffer,
        file.mimetype,
        substringAfterDot,
        contestId,
      );
    }
  }

  @Post()
  @ApiOkResponse({
    description: 'Get Contests Successfully',
  })
  @ApiPaginatedResponse(ViewContestResponse)
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Customer)
  @HttpCode(200)
  async getContests(
    @Body() request: FilterContestRequest,
  ): Promise<PageDto<ViewContestResponse>> {
    return await this.contestService.getContests(request);
  }

  @Get('/staff')
  @ApiOkResponse({
    description: 'Get Contests By Staff Successfully',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff)
  async getContestsByStaff(
    @Req() request: Request,
    @Query('status') status: string,
  ): Promise<ViewContestResponse[]> {
    return await this.contestService.getContestByStaffId(
      request['user']['id'],
      status,
    );
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get Contests By Id Successfully',
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @HasRoles(NameRole.Staff, NameRole.Customer)
  async getContestsById(@Param('id') id: string): Promise<ViewContestResponse> {
    return await this.contestService.getContestById(id);
  }
}
