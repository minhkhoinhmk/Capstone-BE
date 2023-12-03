import { Module } from '@nestjs/common';
import { WinnerService } from './winner.service';
import { WinnerController } from './winner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Winner } from './entity/winner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Winner])],
  providers: [WinnerService],
  controllers: [WinnerController],
})
export class WinnerModule {}
