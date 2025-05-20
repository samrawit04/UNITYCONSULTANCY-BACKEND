import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [],
  exports: [TypeOrmModule],
})
export class UserModule {}
