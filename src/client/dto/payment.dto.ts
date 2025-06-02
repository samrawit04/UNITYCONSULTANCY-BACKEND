// create-payment.dto.ts
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  amount: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  clientId: string;

  @IsNotEmpty()
  scheduleId: string;

  @IsNotEmpty()
  counselorId: string;

  @IsNotEmpty()
  transactionReference: string;
}
