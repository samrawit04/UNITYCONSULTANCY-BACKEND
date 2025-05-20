import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  counselorId: string;

  @IsNumber()
  @IsNotEmpty()
  availabilityId: string;

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
