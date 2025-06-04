import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Payment } from '../entities/payment.entity';
import { User } from 'src/auth/entity/user.entity';
import { NotificationService } from 'src/Notification/service/notification.service';
import { BookingService } from './booking.servicee';
import { CreatePaymentDto } from '../dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private notificationService: NotificationService,
    private bookingService: BookingService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    const {
      firstName,
      lastName,
      email,
      amount,
      clientId,
      counselorId,
      scheduleId,
      transactionReference,
    } = createPaymentDto;

    console.log('Received DTO:', createPaymentDto);

    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(parsedAmount)) {
      throw new BadRequestException('Invalid amount');
    }

    try {
      const chapaResponse = await axios.post<any>(
        'https://api.chapa.co/v1/transaction/initialize',
        {
          amount: parsedAmount.toString(),
          currency: 'ETB',
          email,
          first_name: firstName,
          last_name: lastName,
          tx_ref: transactionReference,
          callback_url: `${process.env.FRONTEND_URL}/payment/success?txRef=${transactionReference}`,
          return_url: `${process.env.FRONTEND_URL}/payment/success?txRef=${transactionReference}`,
          webhook_url: `${process.env.BACKEND_URL}/payment/webhook`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          },
          timeout: 10000, // Increased timeout for initialization
        },
      );

      const payment = this.paymentRepository.create({
        transactionReference,
        amount: parsedAmount,
        email,
        firstName,
        lastName,
        clientId,
        counselorId,
        scheduleId,
        chapaCheckoutUrl: chapaResponse.data.data.checkout_url,
        status: 'pending',
      });

      await this.paymentRepository.save(payment);

      return {
        chapaRedirectUrl: chapaResponse.data.data.checkout_url,
        paymentId: payment.id,
        message: 'Payment initialized successfully',
      };
    } catch (error) {
      console.error('Chapa initialize error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to initialize payment with Chapa');
    }
  }

  async processWebhook(webhookData: any) {
    const { tx_ref, status, amount, payment_method } = webhookData;
    const payment = await this.paymentRepository.findOne({ where: { transactionReference: tx_ref } });
    if (!payment) throw new NotFoundException('Payment not found');

    if (status === 'success') {
      payment.status = 'success';
      payment.verifiedAt = new Date();
      payment.amountReceived = parseFloat(amount);
      payment.paymentChannel = payment_method;
      await this.paymentRepository.save(payment);

      const user = await this.userRepository.findOne({ where: { email: payment.email } });
      if (user) {
        await this.notificationService.sendNotification({
          recipientId: user.id,
          role: user.role,
          message: 'Payment is successful!',
          type: 'SYSTEM',
        });
      }
      await this.bookingService.createBookingFromPayment(payment);
    }
    return { status: 'ok' };
  }

  async verifyPayment(txRef: string): Promise<any> {
    const payment = await this.paymentRepository.findOne({ where: { transactionReference: txRef } });
    if (!payment) throw new NotFoundException('Transaction reference not found');

    if (payment.status === 'success' && payment.verifiedAt) {
      return {
        status: payment.status,
        transactionReference: payment.transactionReference,
        amount: payment.amount,
        verifiedAt: payment.verifiedAt.toISOString(),
        counselorId: payment.counselorId,
        scheduleId: payment.scheduleId,
        clientId: payment.clientId,
      };
    }

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.time('chapa-verify');
        const chapaResponse = await axios.get<any>(
          `https://api.chapa.co/v1/transaction/verify/${txRef}`,
          {
            headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
            timeout: 10000, // Increased to 10 seconds
          },
        );
        console.timeEnd('chapa-verify');

        const status = chapaResponse.data?.data?.status;
        if (status !== 'success') {
          throw new BadRequestException('Payment not successful yet');
        }

        payment.status = 'success';
        payment.verifiedAt = new Date();
        payment.chapaFees = parseFloat(chapaResponse.data.chapa_fee || '0');
        payment.amountReceived = parseFloat(chapaResponse.data.amount);
        payment.paymentChannel = chapaResponse.data.payment_method;
        await this.paymentRepository.save(payment);

        const user = await this.userRepository.findOne({ where: { email: payment.email } });
        if (user) {
          await this.notificationService.sendNotification({
            recipientId: user.id,
            role: user.role,
            message: `Payment of ${payment.amount} ETB was successful`,
            type: 'SYSTEM',
          });
        }
        await this.bookingService.createBookingFromPayment(payment);

        return {
          status: payment.status,
          transactionReference: payment.transactionReference,
          amount: payment.amount,
          clientId: payment.clientId,
          scheduleId: payment.scheduleId,
          counselorId: payment.counselorId,
          verifiedAt: payment.verifiedAt.toISOString(),
        };
      } catch (error) {
        attempt++;
        console.error(`Chapa verify attempt ${attempt} failed:`, error.response?.data || error.message);
        if (attempt === maxRetries) {
          throw new BadRequestException('Payment verification failed after retries');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    }
  }

  async getPaymentByTxRef(txRef: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { transactionReference: txRef } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}