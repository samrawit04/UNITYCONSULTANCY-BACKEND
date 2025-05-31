// payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { Client } from '../entities/client.entity';


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(
    paymentData: Partial<Payment>,
    clientId: string,
  ): Promise<Payment> {
    const client = await this.clientRepository.findOne({
      where: { userId: clientId },
    });
    if (!client) {
      throw new Error('Client not found');
    }

    const payment = this.paymentRepository.create({
      ...paymentData,
      client,
    });

    return this.paymentRepository.save(payment);
  }
}
