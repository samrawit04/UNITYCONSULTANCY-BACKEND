// review.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ReviewService } from '../service/review.service';
import { CreateReviewDto } from '../dto/review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }
  
  @Get('averages')
getAverages() {
  return this.reviewService.getAverageRatingForAllCounselors();
}

@Get()
getAllReviews() {
  return this.reviewService.getAllReviews();
}

  
@Get('client/:clientId')
async getClientReviews(@Param('clientId') clientId: string) {
  return this.reviewService.getReviewsByClient(clientId);
}


  @Get('counselor/:counselorId')
  async getCounselorReviews(@Param('counselorId') counselorId: string) {
    return this.reviewService.getReviewsForCounselor(counselorId);
  }
}

