import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { CreateScheduleDto, UpdateScheduleDto } from '../dto/schedule.dto';
import { Schedule } from '../entities/schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const schedule = this.scheduleRepository.create(createScheduleDto);
    return await this.scheduleRepository.save(schedule);
  }

  async findAvailableSlots(
    startDate: Date,
    endDate: Date,
    counselorId: string,
  ): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: {
        date: Between(startDate, endDate),
        counselorId,
        isAvailable: true,
      },
      order: {
        date: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async updateAvailability(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    Object.assign(schedule, updateScheduleDto);
    return await this.scheduleRepository.save(schedule);
  }

  async deleteSchedule(id: number): Promise<void> {
    const result = await this.scheduleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
  }
}
