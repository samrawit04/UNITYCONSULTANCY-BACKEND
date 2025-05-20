import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  counselorId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @IsString()
  feedback: string;
}
