import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/user/entity/user.entity';
import { RoleModule } from 'src/role/role.module';
import { Role } from 'src/role/entity/role.entity';
import { CustomerModule } from 'src/customer/customer.module';
import { JwtStore } from 'src/user/entity/jwt-store.entity';
import { Learner } from 'src/learner/entity/learner.entity';

@Module({
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  imports: [
    RoleModule,
    CustomerModule,
    TypeOrmModule.forFeature([User,Role, JwtStore, Learner]),
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 60 * 60,
        },
      }),
    }),
  ],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule {}
