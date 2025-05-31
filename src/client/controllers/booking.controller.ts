import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import { CreateBookingDto } from '../dto/booking.dto';
import { BookingService } from '../services/booking.servicee';
import { TimeSlot } from '../booking.types';

@Controller('api')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('bookings')
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Get('slots')
  getAvailableSlots(
    @Query('date') date: string,
    @Query('counselorId', ParseIntPipe) counselorId: string,
  ): Promise<TimeSlot[]> {
    return this.bookingService.getAvailableSlots(date, counselorId);
  }

  @Get('bookings/client')
  getClientBookings(@Query('email') email: string) {
    return this.bookingService.getBookingsByClient(email);
  }

  @Get('bookings/:id')
  getBooking(@Param('id', ParseIntPipe) id: string) {
    return this.bookingService.getBookingById(id);
  }
}
