// review.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';
import { Repository } from 'typeorm';
import { Client } from 'src/client/entities/client.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';
import { CreateReviewDto } from '../dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,

    @InjectRepository(Counselor)
    private readonly counselorRepo: Repository<Counselor>,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const client = await this.clientRepo.findOne({ where: { userId: dto.clientId } });
    if (!client) throw new NotFoundException('Client not found');

    const counselor = await this.counselorRepo.findOne({ where: { userId: dto.counselorId } });
    if (!counselor) throw new NotFoundException('Counselor not found');

    const review = this.reviewRepo.create({
      comment: dto.comment,
      rating: dto.rating,
      client,
      counselor,
    });

    return this.reviewRepo.save(review);
  }

  async getReviewsByClient(clientId: string): Promise<Review[]> {
  return this.reviewRepo.find({
    where: { client: { userId: clientId } },
    relations: ['counselor'],
    order: { createdAt: 'DESC' },
  });
}

// In review.service.ts
async getAllReviews(): Promise<Review[]> {
  return this.reviewRepo.find({
    relations: ['client','client.user'],
    order: { createdAt: 'DESC' },
  });
}

// review.service.ts
async getAverageRatingForAllCounselors() {
  try {
    const result = await this.reviewRepo
      .createQueryBuilder("review")
      .select("review.counselor_id", "counselorId")
      .addSelect("AVG(review.rating)", "averageRating")
      .groupBy("review.counselor_id")
      .getRawMany();

    return result.map(r => ({
      counselorId: r.counselorId,
      averageRating: parseFloat(r.averageRating),
    }));
  } catch (error) {
    console.error('Error in getAverageRatingForAllCounselors:', error);
    throw error; // rethrow to propagate 500
  }
}







  async getReviewsForCounselor(counselorId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { counselor: { userId: counselorId } },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }
}
