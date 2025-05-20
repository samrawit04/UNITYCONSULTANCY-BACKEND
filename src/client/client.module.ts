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

@Module({
  imports: [TypeOrmModule.forFeature([Client,Booking]), UserModule, CounselorModule],
  controllers: [ClientController,BookingController],
  providers: [ClientService,BookingService],
  exports: [TypeOrmModule],
})
export class ClientModule {}
