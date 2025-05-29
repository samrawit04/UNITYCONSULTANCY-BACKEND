import { Module } from '@nestjs/common';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './service/admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Counselor])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
