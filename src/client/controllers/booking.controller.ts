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
import { RebookDto } from '../dto/rebook.dto';

@Controller('api')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('bookings')
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }
  @Post('rebook')
  async rebook(@Body() rebookDto: RebookDto) {
    const { oldBookingId, newScheduleId, clientId } = rebookDto;
    return this.bookingService.rebook(oldBookingId, newScheduleId, clientId);
  }

  @Get('slots')
  getAvailableSlots(
    @Query('date') date: string,
    @Query('counselorId', ParseIntPipe) counselorId: string,
  ): Promise<TimeSlot[]> {
    return this.bookingService.getAvailableSlots(date, counselorId);
  }

  @Get('clientbooking/:clientId')
  async getBookingsByClient(@Param('clientId') clientId: string) {
    return this.bookingService.getBookingsByClient(clientId);
  }

  @Get('bookings/:id')
  getBooking(@Param('id', ParseIntPipe) id: string) {
    return this.bookingService.getBookingById(id);
  }
}
