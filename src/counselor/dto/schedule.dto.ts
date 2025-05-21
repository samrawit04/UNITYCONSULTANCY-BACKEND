import {
  IsDate,
  IsString,
  IsBoolean,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateScheduleDto {
  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsBoolean()
  isAvailable: boolean;

  @IsString()
  counselorId:string;
}

export class UpdateScheduleDto {
  @IsBoolean()
  isAvailable: boolean;
}
