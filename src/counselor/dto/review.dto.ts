// create-review.dto.ts
import { IsUUID, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  counselorId: string;

  @IsNotEmpty()
  comment: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
