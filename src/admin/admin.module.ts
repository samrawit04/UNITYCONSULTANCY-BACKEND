import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';
import { AdminService } from './service/admin.service';
import { AdminController } from './controller/admin.controller';
import { NotificationModule } from '../Notification/notification.module'; // ✅ correct path

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Counselor]),
    NotificationModule, // ✅ ADD THIS
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
