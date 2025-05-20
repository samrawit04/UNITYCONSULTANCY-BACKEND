import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { AvailabilityService } from '../service/counselor-avaliblity.service';
import { CreateAvailabilityDto } from '../dto/create-availability.dto';

@Controller('availability')
export class AvailabilityCounselor {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post(':counselorId')
  async createAvailability(
    @Param('counselorId') counselorId: string,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.create(counselorId, dto);
  }


}
