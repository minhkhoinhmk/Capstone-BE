import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './entity/vote.entity';
import { CustomerDrawingModule } from 'src/customer-drawing/customer-drawing.module';
import { VoteRepository } from './vote.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote]),
    CustomerDrawingModule,
    AuthModule,
  ],
  providers: [VoteService, VoteRepository],
  controllers: [VoteController],
  exports: [VoteService, VoteRepository],
})
export class VoteModule {}
