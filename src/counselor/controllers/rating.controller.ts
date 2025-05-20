import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RatingService } from '../service/rating.service';
import { CreateRatingDto } from '../dto/rating.dto';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  create(@Body() dto: CreateRatingDto) {
    return this.ratingService.create(dto);
  }

  @Get('average/:counselorId')
  getAverageScore(@Param('counselorId') counselorId: string) {
    return this.ratingService.getAverageScore(counselorId);
  }
}
