import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { UserModule } from 'src/shared/user.module';
import { ClientController } from './controllers/client.controller';
import { ClientService } from './services/client.serivice';
import { Booking } from './entities/booking.entity';
import { BookingController } from './controllers/booking.controller';
import { BookingService } from './services/booking.serivce';
import { CounselorModule } from 'src/counselor/counselor.module';
import { Availability } from 'src/counselor/entities/availability.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Booking, Availability]),
    UserModule,
    CounselorModule,
  ],
  controllers: [ClientController, BookingController],
  providers: [ClientService, BookingService],
  exports: [TypeOrmModule],
})
export class ClientModule {}
