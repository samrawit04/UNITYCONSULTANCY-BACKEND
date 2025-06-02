import 'dotenv/config'; // this loads .env variables globally
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './auth/entity/user.entity';
import { Client } from './client/entities/client.entity';
import { AccountVerification } from './auth/entity/account-verification.entity';
import { Counselor } from './counselor/entities/counselor.entity';
import { Article } from './counselor/entities/article.entity';
import { Schedule } from './counselor/entities/schedule.entity';
import { Booking } from './client/entities/booking.entity';
import { Review } from './counselor/entities/review.entity';

import { Payment } from './client/entities/payment.entity';

import { Notification } from './Notification/entities/notification.entity';


export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'unityCounsultancyy',
  synchronize: true,
  logging: true,
  entities: [

    User,
    Client,
    AccountVerification,
    Counselor,
    // Rating,
    Review,
    Payment,
    Article,
    Schedule,
    Booking,

    User,Client,AccountVerification,Article,Booking,Counselor,Schedule,Review,Notification
  ],
  migrations: [
    'src/migrations/**/*.ts'

  ],

  subscribers: [],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
