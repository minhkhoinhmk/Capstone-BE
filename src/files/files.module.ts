import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import PublicFile from './publicFile.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [FilesService, ConfigService],
  imports: [TypeOrmModule.forFeature([PublicFile]), ConfigModule],
  exports: [FilesService],
})
export class FilesModule {}
