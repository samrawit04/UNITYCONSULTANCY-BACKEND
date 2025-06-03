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
import { NotificationService } from '../../Notification/service/notification.service';
import { User } from '../../auth/entity/user.entity'; // Import User entity

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
@InjectRepository(User)
private userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

 async create(createBookingDto: CreateBookingDto): Promise<Booking> {
  if (!createBookingDto.scheduleId || !createBookingDto.clientId) {
    throw new BadRequestException('Schedule ID and Client ID are required');
  }

  return this.bookingRepository.manager.transaction(async (transactionalEntityManager) => {
    const schedule = await transactionalEntityManager.findOne(Schedule, {
      where: { id: createBookingDto.scheduleId, isAvailable: true },
    });
    if (!schedule) {
      throw new BadRequestException('Schedule not found or unavailable');
    }

    const updateResult = await transactionalEntityManager.update(
      Schedule,
      { id: createBookingDto.scheduleId, isAvailable: true },
      { isAvailable: false },
    );

    if (updateResult.affected === 0) {
      throw new BadRequestException('This slot is already booked or unavailable');
    }

    const booking = transactionalEntityManager.create(Booking, {
      scheduleId: createBookingDto.scheduleId,
      clientId: createBookingDto.clientId,
    });

    const savedBooking = await transactionalEntityManager.save(Booking, booking);

    if (!schedule.date || !schedule.startTime || !schedule.endTime) {
      throw new BadRequestException('Invalid schedule date or time');
    }

    const start = new Date(`${schedule.date}T${schedule.startTime}`);
    const end = new Date(`${schedule.date}T${schedule.endTime}`);
    const duration = (end.getTime() - start.getTime()) / 1000 / 60;

    const zoomMeeting = await this.zoomService.createMeeting({
      topic: 'Counseling Session',
      startTime: start.toISOString(),
      duration,
    });

    savedBooking.zoomJoinUrl = zoomMeeting.join_url;
    savedBooking.zoomStartUrl = zoomMeeting.start_url;

    const user = await transactionalEntityManager.findOne(User, {
      where: { id: createBookingDto.clientId },
    });

    if (user) {
      await this.notificationService.sendNotification({
        recipientId: user.id,
        role: user.role,
        message: 'You have booked your schedule successfully!! You can join your session by clicking the link on the dashboard',
        type: 'SYSTEM',
      });
    }

    return transactionalEntityManager.save(Booking, savedBooking);
  });
}

  async rebook(
    oldBookingId: string,
    newScheduleId: string,
    clientId: string,
  ): Promise<Booking> {
    if (!oldBookingId || !newScheduleId || !clientId) {
      throw new BadRequestException('Booking ID, Schedule ID, and Client ID are required');
    }

    return this.bookingRepository.manager.transaction(async (transactionalEntityManager) => {
      // Find the old booking, including relations
      const oldBooking = await transactionalEntityManager.findOne(Booking, {
        where: { id: oldBookingId, clientId },
        relations: { schedule: true },
      });

      if (!oldBooking) {
        throw new NotFoundException('Old booking not found');
      }

      // Mark old schedule as available again
      if (oldBooking.schedule) {
        await transactionalEntityManager.update(
          Schedule,
          { id: oldBooking.schedule.id },
          { isAvailable: true },
        );
      }

      // Remove old booking
      await transactionalEntityManager.remove(Booking, oldBooking);

      // Mark new schedule as unavailable (booked)
      const newSchedule = await transactionalEntityManager.findOne(Schedule, {
        where: { id: newScheduleId, isAvailable: true },
      });

      if (!newSchedule) {
        throw new BadRequestException('The new schedule slot is not found or unavailable');
      }

      const updateResult = await transactionalEntityManager.update(
        Schedule,
        { id: newScheduleId, isAvailable: true },
        { isAvailable: false },
      );

      if (updateResult.affected === 0) {
        throw new BadRequestException('The new schedule slot is already booked or unavailable');
      }

      // Create new booking
      const newBooking = transactionalEntityManager.create(Booking, {
        scheduleId: newScheduleId,
        clientId,
      });

      const savedBooking = await transactionalEntityManager.save(Booking, newBooking);

      // Validate schedule date and time
      if (!newSchedule.date || !newSchedule.startTime || !newSchedule.endTime) {
        throw new BadRequestException('Invalid schedule date or time');
      }

      // Create Zoom meeting
      const start = new Date(`${newSchedule.date}T${newSchedule.startTime}`);
      const end = new Date(`${newSchedule.date}T${newSchedule.endTime}`);
      const duration = (end.getTime() - start.getTime()) / 1000 / 60;

      const zoomMeeting = await this.zoomService.createMeeting({
        topic: 'Counseling Session',
        startTime: start.toISOString(),
        duration,
      });

      // Update booking with Zoom info
      savedBooking.zoomJoinUrl = zoomMeeting.join_url;
      savedBooking.zoomStartUrl = zoomMeeting.start_url;

      await transactionalEntityManager.save(Booking, savedBooking);

      // Update payment's scheduleId for this client and old schedule
      const payment = await transactionalEntityManager.findOne(Payment, {
        where: {
          clientId,
          scheduleId: oldBooking.schedule?.id,
          status: 'success',
        },
      });

      if (payment) {
        payment.scheduleId = newScheduleId;
        await transactionalEntityManager.save(Payment, payment);
      } else {
        throw new NotFoundException('No payment found for the old booking');
      }

      // Send notification to the user
      const user = await transactionalEntityManager.findOne(User, {
        where: { id: clientId },
      });

      if (user) {
        await this.notificationService.sendNotification({
          recipientId: user.id,
          role: user.role,
          message: 'Your booking has been successfully rebooked! You can join your session by clicking the link on the dashboard.',
          type: 'SYSTEM',
        });
      }

      return savedBooking;
    });
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

  // In BookingService (booking.service.ts)
async getBookingsByClient(clientId: string) {
  const bookings = await this.bookingRepository.find({
    where: { clientId },
    relations: {
      schedule: {
        counselor: {
          user: true, // Ensure user relation is loaded
        },
      },
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    date: booking.schedule?.date,
    startTime: booking.schedule?.startTime,
    endTime: booking.schedule?.endTime,
    zoomJoinUrl: booking.zoomJoinUrl,
    counselor: booking.schedule?.counselor
      ? {
          id: booking.schedule.counselor.userId,
          firstName: booking.schedule.counselor.user?.firstName || "Unknown",
          lastName: booking.schedule.counselor.user?.lastName || "",
          image: booking.schedule.counselor.profilePicture || null,
        }
      : null,
  }));
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
