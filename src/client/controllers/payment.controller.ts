// payment.controller.ts
import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../entities/payment.entity';


@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':clientId')
  async createPayment(
    @Param('clientId') clientId: string,
    @Body() paymentData: Partial<Payment>,
  ): Promise<Payment> {
    return this.paymentService.create(paymentData, clientId);
  }
}
