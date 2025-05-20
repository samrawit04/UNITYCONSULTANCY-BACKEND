import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entity/user.entity';
import { Gender, MaritalStatus } from 'src/shared/enums';
import { Rating } from 'src/counselor/entities/rating.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  addres?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: 'enum', enum: MaritalStatus, nullable: true })
  maritalStatus?: MaritalStatus;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @OneToOne(() => User, (user) => user.client, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Rating, (rating) => rating.client)
  ratings: Rating;
}
