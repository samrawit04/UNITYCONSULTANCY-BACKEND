import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { CreateScheduleDto, UpdateScheduleDto } from '../dto/schedule.dto';
import { ScheduleService } from '../service/schedule.service';
import { Between, Repository } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('schedule')
export class ScheduleController {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly scheduleService: ScheduleService,
  ) {}


  @Post()
  async createSchedule(@Body() createScheduleDto: CreateScheduleDto) {
    return await this.scheduleService.create(createScheduleDto);
  }

  @Get('available')
  async getAvailableInRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('counselorId') counselorId: number,
  ) {
    const schedules = await this.scheduleRepository.find({
      where: {
        date: Between(new Date(startDate), new Date(endDate)),
        counselorId,
        isAvailable: true,
      },
      order: { date: 'ASC', startTime: 'ASC' },
    });

    return schedules.map((s) => ({
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
    }));
  }

  @Put(':id')
  async updateAvailability(
    @Param('id') id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return await this.scheduleService.updateAvailability(id, updateScheduleDto);
  }

  @Delete(':id')
  async deleteSchedule(@Param('id') id: number) {
    return await this.scheduleService.deleteSchedule(id);
  }
}
