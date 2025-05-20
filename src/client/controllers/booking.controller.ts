import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { BookingService } from '../services/booking.serivce';
import { CreateBookingDto } from '../dto/booking.dto';


@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post(':clientId')
  async create(
    @Param('clientId') clientId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.create(clientId, dto);
  }
}
