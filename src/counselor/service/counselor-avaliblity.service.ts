import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Availability } from '../entities/availability.entity';
import { Between, Repository } from 'typeorm';
import { Counselor } from '../entities/counselor.entity';
import { CreateAvailabilityDto } from '../dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(Counselor)
    private readonly counselorRepo: Repository<Counselor>,
  ) {}

  async create(
    counselorId: string,
    createAvailabilityDto: CreateAvailabilityDto,
  ) {
    const counselor = await this.counselorRepo.findOne({
      where: { userId: counselorId },
    });

    if (!counselor) throw new NotFoundException('Counselor not found');

    const date = new Date(createAvailabilityDto.date);
    const startTime = new Date(
      `${createAvailabilityDto.date}T${createAvailabilityDto.startTime}`,
    );
    const endTime = new Date(
      `${createAvailabilityDto.date}T${createAvailabilityDto.endTime}`,
    );

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check for overlapping availabilities
    const overlappingAvailability = await this.availabilityRepository.findOne({
      where: {
        counselor: { userId: counselorId },
        date: date,
        startTime: Between(startTime, endTime),
      },
    });

    if (overlappingAvailability) {
      throw new BadRequestException('Overlapping availability exists');
    }

    const availability = this.availabilityRepository.create({
      date,
      startTime,
      endTime,
      counselor,
      isAvailable: true,
    });

    return this.availabilityRepository.save(availability);
  }

}
