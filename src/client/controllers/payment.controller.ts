import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from '../services/payment.service';
import { GetUser } from '../get-user.decorators';
import { CreatePaymentDto } from '../dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('initialize')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @GetUser() user: any,
  ) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get('verify/:txRef')
  async verifyPayment(@Param('txRef') txRef: string) {
    return this.paymentService.verifyPayment(txRef);
  }

  @Get(':txRef')
  async getPayment(@Param('txRef') txRef: string) {
    return this.paymentService.getPaymentByTxRef(txRef);
  }
}
