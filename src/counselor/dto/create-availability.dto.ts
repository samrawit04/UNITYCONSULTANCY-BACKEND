import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateAvailabilityDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class UpdateAvailabilityDto {
  @IsDateString()
  date?: string;

  @IsString()
  startTime?: string;

  @IsString()
  endTime?: string;
}
