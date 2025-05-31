import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Client } from './client.entity';


@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  tx_ref: string;

  @Column()
  payment_ref: string;

  @Column()
  channel: string;

  @Column('decimal', { precision: 10, scale: 2 })
  chapa_fees: number;

  @Column('decimal', { precision: 10, scale: 2 })
  received_amount: number;

  @Column()
  who_paid: string;

  @Column()
  settled: string;

  @Column()
  paid_at: string;

  @ManyToOne(() => Client, (client) => client.payments, { eager: true })
  client: Client;
}
