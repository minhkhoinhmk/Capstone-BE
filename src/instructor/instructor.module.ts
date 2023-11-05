import { Module } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { S3Module } from 'src/s3/s3.module';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [InstructorService],
  controllers: [InstructorController],
  imports: [S3Module, UserModule],
})
export class InstructorModule {}
