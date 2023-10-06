import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Combo } from './entity/combo.entity';

@Module({ imports: [TypeOrmModule.forFeature([Combo])] })
export class ComboModule {}
