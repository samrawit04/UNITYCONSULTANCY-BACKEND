import { IsNotEmpty, IsEmail, IsString, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsNumber()
  scheduleId: string;

  @IsNotEmpty()
  @IsNumber()
  counselorId: string;

  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsEmail()
  clientEmail: string;
}
