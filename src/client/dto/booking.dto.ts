import { IsNotEmpty, IsEmail, IsString, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsNumber()
  scheduleId: string;

  @IsNotEmpty()
  @IsString()
  clientId: string;
}
