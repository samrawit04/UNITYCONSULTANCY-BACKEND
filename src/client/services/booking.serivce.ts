 import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { Client } from '../entities/client.entity';
import { CreateBookingDto } from '../dto/booking.dto';
import { Availability } from 'src/counselor/entities/availability.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
        @InjectRepository(Availability)
        private availabilityRepository: Repository<Availability>,
        @InjectRepository(Counselor)
        private counselorRepository: Repository<Counselor>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
    ) { }
 
 
 
 
 
    async create(clientId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
        const client = await this.clientRepository.findOne({ where: { userId: clientId } });
    
        if (!client) {
            throw new NotFoundException('Client not found');
        }

        const counselor = await this.counselorRepository.findOne({
            where: { userId: createBookingDto.counselorId }
        });
    
        if (!counselor) {
            throw new NotFoundException('Counselor not found');
        }

        const availability = await this.availabilityRepository.findOne({
            where: {
                id: createBookingDto.availabilityId,
                counselor: { userId: createBookingDto.counselorId },
                isAvailable: true
            },
            relations: ['bookings']
        });
    
        if (!availability) {
            throw new NotFoundException('Availability not found or not available');
        }

        const date = new Date(createBookingDto.date);
        const startTime = new Date(`${createBookingDto.date}T${createBookingDto.startTime}`);
        const endTime = new Date(`${createBookingDto.date}T${createBookingDto.endTime}`);

        // Validate booking time is within availability
        if (date.toDateString() !== availability.date.toDateString() ||
            startTime < availability.startTime ||
            endTime > availability.endTime) {
            throw new BadRequestException('Booking time must be within availability time');
        }

        // Check for existing bookings in the same time slot
        const existingBooking = await this.bookingRepository.findOne({
            where: {
                availability: { id: availability.id },
                status: BookingStatus.CONFIRMED,
                date: date,
                startTime: Between(startTime, endTime),
            },
        });

        if (existingBooking) {
            throw new BadRequestException('Time slot already booked');
        }

        const booking = this.bookingRepository.create({
            client,
            counselor,
            availability,
            date,
            startTime,
            endTime,
            status: BookingStatus.CONFIRMED,
        });

        const savedBooking = await this.bookingRepository.save(booking);

        // If the entire availability slot is booked, mark it as unavailable
        if (startTime.getTime() === availability.startTime.getTime() &&
            endTime.getTime() === availability.endTime.getTime()) {
            availability.isAvailable = false;
            await this.availabilityRepository.save(availability);
        }

        return savedBooking;
    }
}