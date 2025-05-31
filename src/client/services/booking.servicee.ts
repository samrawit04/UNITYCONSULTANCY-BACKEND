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
  id: string;
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
    const updateResult = await this.scheduleRepository.update(
      {
        id: createBookingDto.scheduleId,
        isAvailable: true,
      },
      { isAvailable: false },
    );
    if (updateResult.affected === 0) {
      throw new BadRequestException(
        'This slot is already booked or unavailable',
      );
    }
    const booking = this.bookingRepository.create({
      scheduleId: createBookingDto.scheduleId,
      clientId: createBookingDto.clientId,
    });

    return this.bookingRepository.save(booking);
  }

  async getAvailableSlots(
    date: string,
    counselorId: string,
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

  async getBookingsByClient(clientId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { clientId },
      relations: ['schedule', 'counselor'],
    });
  }

  async getBookingById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['schedule', 'counselor'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancelBooking(id: string): Promise<void> {
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
