import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import axios from 'axios';
import { Payment } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dto/payment.dto';
import { BookingService } from './booking.servicee';


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private bookingService: BookingService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      status: 'pending',
      createdAt: new Date(),
    });

    try {
      // Initialize payment with Chapa
      const chapaResponse = await axios.post(
        'https://api.chapa.co/v1/transaction/initialize',
        {
          amount: Number(payment.amount),
          currency: 'ETB',
          email: payment.email,
          first_name: payment.firstName,
          last_name: payment.lastName,
          tx_ref: payment.transactionReference,
          callback_url: `${process.env.FRONTEND_URL}/payment/success?txRef=${payment.transactionReference}`,
          return_url: `${process.env.FRONTEND_URL}/payment/success?txRef=${payment.transactionReference}`,
        },
        {
          headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
        },
      );

      payment.chapaRedirectUrl = `${chapaResponse.data.data.checkout_url}?txRef=${payment.transactionReference}`;
      await this.paymentRepository.save(payment);
      return payment;
    } catch (error) {
      console.error(
        'Chapa init error:',
        error?.response?.data || error.message,
      );
      throw new BadRequestException('Failed to initialize payment with Chapa');
    }
  }

  async verifyPayment(txRef: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionReference: txRef },
    });

    if (!payment) {
      throw new NotFoundException('Transaction reference not found');
    }

    try {
      const chapaResponse = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${txRef}`,
        {
          headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
        },
      );

      const status = chapaResponse.data?.data?.status;
      if (status !== 'success') {
        throw new BadRequestException('Payment not successful yet');
      }

      payment.status = chapaResponse.data.status;
      payment.verifiedAt = new Date();
      payment.chapaFees = chapaResponse.data.chapa_fee;
      payment.amountReceived = chapaResponse.data.amount;
      payment.paymentChannel = chapaResponse.data.payment_method;

      await this.paymentRepository.save(payment);

      await this.bookingService.createBookingFromPayment(payment);

      return payment;
    } catch (error) {
      throw new BadRequestException('Payment verification failed');
    }
  }

  async getPaymentByTxRef(txRef: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionReference: txRef },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
