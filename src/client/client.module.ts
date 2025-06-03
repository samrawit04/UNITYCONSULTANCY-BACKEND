import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { UserModule } from 'src/shared/user.module';
import { ClientController } from './controllers/client.controller';
import { ClientService } from './services/client.serivice';
import { CounselorModule } from 'src/counselor/counselor.module';
import { Booking } from './entities/booking.entity';
import { BookingController } from './controllers/booking.controller';
import { BookingService } from './services/booking.servicee';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { HttpModule } from '@nestjs/axios';
import { Payment } from './entities/payment.entity';
import passport from 'passport';
import { PassportModule } from '@nestjs/passport';
import { ZoomService } from 'src/counselor/service/zoom.service';
import { NotificationModule } from 'src/Notification/notification.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Booking, Payment]),
    UserModule,
    CounselorModule,
    HttpModule,
    PassportModule,
    NotificationModule
  ],
  controllers: [ClientController, BookingController, PaymentController],
  providers: [ClientService, BookingService, PaymentService,ZoomService],
  exports: [TypeOrmModule],
})
export class ClientModule {}
