import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entity/user.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './service/user.service';
import { AccountVerification } from './entity/account-verification.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './service/auth.service';
import { GoogleStrategy } from 'src/google.strategy';
import { EmailService } from './service/email.service';
import { AuthHelper } from './helper/auth.helper';
import { Audit } from 'src/shared/entities/audit.entity';
import { JwtModule } from '@nestjs/jwt';
import { ClientModule } from 'src/client/client.module';
import { Counselor } from 'src/counselor/entities/counselor.entity';
import { CounselorModule } from 'src/counselor/counselor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Audit, AccountVerification, Counselor]), // TypeORM entities
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET, // JWT secret
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES, // JWT expiration time
      },
    }),
    PassportModule.register({ session: true }),
    ClientModule,
    CounselorModule,
  ],
  controllers: [UserController, AuthController],
  providers: [
    UserService,
    AuthService,
    GoogleStrategy,
    EmailService,
    AuthHelper,
  ],
  exports: [UserService, AuthService, AuthHelper],
})
export class AuthModule {}
