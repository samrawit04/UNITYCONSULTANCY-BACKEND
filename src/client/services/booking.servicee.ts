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
import { Payment } from '../entities/payment.entity';
import { ZoomService } from 'src/counselor/service/zoom.service';

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
    private readonly zoomService: ZoomService,
    @InjectRepository(Payment) // <--- Inject paymentRepository here
    private paymentRepository: Repository<Payment>,
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

    const savedBooking = await this.bookingRepository.save(booking);

    // Get schedule info for Zoom meeting
    const schedule = await this.scheduleRepository.findOneOrFail({
      where: { id: createBookingDto.scheduleId },
    });

    // Create Zoom meeting
    const zoomMeeting = await this.zoomService.createMeeting({
      topic: 'Counseling Session',
      startTime: new Date(
        `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.startTime}`,
      ).toISOString(),
      duration: 60, // or adjust based on your logic
    });

    // Update booking with Zoom info
    savedBooking.zoomJoinUrl = zoomMeeting.join_url;
    savedBooking.zoomStartUrl = zoomMeeting.start_url;

    return this.bookingRepository.save(savedBooking);
  }

  async rebook(
    oldBookingId: string,
    newScheduleId: string,
    clientId: string,
  ): Promise<Booking> {
    // Find the old booking, including relations
    const oldBooking = await this.bookingRepository.findOne({
      where: { id: oldBookingId, clientId },
      relations: ['schedule'],
    });

    if (!oldBooking) {
      throw new NotFoundException('Old booking not found');
    }

    // Mark old schedule as available again
    if (oldBooking.schedule) {
      oldBooking.schedule.isAvailable = true;
      await this.scheduleRepository.save(oldBooking.schedule);
    }

    // Remove old booking
    await this.bookingRepository.remove(oldBooking);

    // Mark new schedule as unavailable (booked)
    const updateResult = await this.scheduleRepository.update(
      { id: newScheduleId, isAvailable: true },
      { isAvailable: false },
    );

    if (updateResult.affected === 0) {
      throw new BadRequestException(
        'The new schedule slot is already booked or unavailable',
      );
    }

    // Create new booking
    const newBooking = this.bookingRepository.create({
      scheduleId: newScheduleId,
      clientId,
    });

    const savedBooking = await this.bookingRepository.save(newBooking);

    // Fetch the new schedule for Zoom meeting details
    const schedule = await this.scheduleRepository.findOneOrFail({
      where: { id: newScheduleId },
    });

    // Create Zoom meeting
    const zoomMeeting = await this.zoomService.createMeeting({
      topic: 'Counseling Session',
      startTime: new Date(
        `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.startTime}`,
      ).toISOString(),
      duration: 60, // or adjust based on your logic
    });

    // Update booking with Zoom info
    savedBooking.zoomJoinUrl = zoomMeeting.join_url;
    savedBooking.zoomStartUrl = zoomMeeting.start_url;

    await this.bookingRepository.save(savedBooking);

    // Update payment's scheduleId for this client and old schedule
    const payment = await this.paymentRepository.findOne({
      where: {
        clientId,
        scheduleId: oldBooking.schedule.id,
        status: 'success', // or your business logic for completed payment
      },
    });

    if (payment) {
      payment.scheduleId = newScheduleId;
      await this.paymentRepository.save(payment);
    }

    return savedBooking;
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

  async getBookingsByClient(clientId: string) {
    const returnedData = await this.bookingRepository.find({
      where: { clientId },
      relations: {
        schedule: {
          counselor: true,
        },
      },
    });
    return returnedData;
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

  async createBookingFromPayment(payment: Payment): Promise<Booking> {
    const existing = await this.bookingRepository.findOne({
      where: {
        scheduleId: payment.scheduleId,
        clientId: payment.clientId,
      },
    });

    if (existing) return existing;

    const updateResult = await this.scheduleRepository.update(
      { id: payment.scheduleId, isAvailable: true },
      { isAvailable: false },
    );

    if (updateResult.affected === 0) {
      throw new BadRequestException(
        'This schedule is already booked or unavailable',
      );
    }

    const booking = this.bookingRepository.create({
      scheduleId: payment.scheduleId,
      clientId: payment.clientId,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    const schedule = await this.scheduleRepository.findOneOrFail({
      where: { id: payment.scheduleId },
    });

    const zoomMeeting = await this.zoomService.createMeeting({
      topic: 'Counseling Session',
      startTime: new Date(
        `${new Date(schedule.date).toISOString().split('T')[0]}T${schedule.startTime}`,
      ).toISOString(),
      duration: 60,
    });

    savedBooking.zoomJoinUrl = zoomMeeting.join_url;
    savedBooking.zoomStartUrl = zoomMeeting.start_url;

    return this.bookingRepository.save(savedBooking);
  }
}
