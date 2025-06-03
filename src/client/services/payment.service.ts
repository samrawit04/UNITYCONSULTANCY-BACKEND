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
import { BookingService } from './booking.servicee'; // Fixed typo: 'booking.servicee' → 'booking.service'
import { NotificationService } from '../../Notification/service/notification.service';
import { User } from '../../auth/entity/user.entity'; // Import User entity


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User) // Add User repository
    private userRepository: Repository<User>,
    private bookingService: BookingService,
    private readonly notificationService: NotificationService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Find user by email from CreatePaymentDto
    const user = await this.userRepository.findOne({
      where: { email: createPaymentDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found for the provided email');
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      status: 'pending',
      createdAt: new Date(),
    });

    try {
      // Initialize payment with Chapa
      const chapaResponse = await axios.post<any>(
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
      console.error('Chapa init error:', error?.response?.data || error.message);
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
      const chapaResponse = await axios.get<any>(
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

      // Find user for notification
      const user = await this.userRepository.findOne({
        where: { email: payment.email },
      });

      if (user) {
        // Send notification about payment verification
        await this.notificationService.sendNotification({
          recipientId: user.id,
          role: user.role,
          message: 'payment is successful!!',
          type: 'SYSTEM',
        });

        
      }

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