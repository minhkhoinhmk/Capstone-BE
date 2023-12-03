import { Module } from '@nestjs/common';
import { CustomerDrawingService } from './customer-drawing.service';
import { CustomerDrawingController } from './customer-drawing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerDrawing } from './entity/customer-drawing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerDrawing])],
  providers: [CustomerDrawingService],
  controllers: [CustomerDrawingController],
})
export class CustomerDrawingModule {}
