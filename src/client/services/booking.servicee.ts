import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';

import { CreateBookingDto } from '../dto/booking.dto';
import { Schedule } from 'src/counselor/entities/schedule.entity';

interface TimeSlot {
  id: number;
  start: string;
  end: string;
  isAvailable: boolean;
}

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}
  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Atomically update schedule.isAvailable from true -> false
    const updateResult = await this.scheduleRepository.update(
      {
        id: createBookingDto.scheduleId,
        counselorId: createBookingDto.counselorId,
        isAvailable: true,
      },
      { isAvailable: false },
    );

    // If no rows updated, slot was already booked or doesn't exist
    if (updateResult.affected === 0) {
      throw new BadRequestException(
        'This slot is already booked or unavailable',
      );
    }

    // Create booking after successfully reserving the slot
    const booking = this.bookingRepository.create({
      scheduleId: createBookingDto.scheduleId,
      counselorId: createBookingDto.counselorId,
      clientName: createBookingDto.clientName,
      clientEmail: createBookingDto.clientEmail,
    });

    return this.bookingRepository.save(booking);
  }

  async getAvailableSlots(
    date: string,
    counselorId: number,
  ): Promise<TimeSlot[]> {
    const schedules = await this.scheduleRepository.find({
      where: {
        date: new Date(date),
        counselorId,
        isAvailable: true,
      },
      order: {
        startTime: 'ASC',
      },
    });

    return schedules.map((schedule) => ({
      id: schedule.id,
      start: schedule.startTime,
      end: schedule.endTime,
      isAvailable: schedule.isAvailable,
    }));
  }

  async getBookingsByClient(clientEmail: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { clientEmail },
      relations: ['schedule', 'counselor'],
    });
  }

  async getBookingById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['schedule', 'counselor'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancelBooking(id: number): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['schedule'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.schedule) {
      booking.schedule.isAvailable = true;
      await this.scheduleRepository.save(booking.schedule);
    }

    await this.bookingRepository.remove(booking);
  }
}
