// review.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Client } from 'src/client/entities/client.entity';
import { Counselor } from 'src/counselor/entities/counselor.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'float' })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Client, (client) => client.reviews, { eager: true })
  client: Client;

  // @ManyToOne(() => Counselor, (counselor) => counselor.reviews)
  // counselor: Counselor;

  @ManyToOne(() => Counselor, (counselor) => counselor.reviews)
@JoinColumn({ name: 'counselor_id' })  // Explicitly specify the column name
counselor: Counselor;

  
}
