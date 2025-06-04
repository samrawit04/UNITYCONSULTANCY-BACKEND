import { IsString, IsNumber, IsEmail } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNumber()
  amount: number;

  @IsString()
  clientId: string;

  @IsString()
  counselorId: string;

  @IsString()
  scheduleId: string;

  @IsString()
  transactionReference: string;
}