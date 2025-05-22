import 'dotenv/config'; // this loads .env variables globally
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './src/auth/entity/user.entity';
import { Client } from './src/client/entities/client.entity';
import { AccountVerification } from './src/auth/entity/account-verification.entity';
import { Counselor } from './src/counselor/entities/counselor.entity';
import { Article } from './src/counselor/entities/article.entity';
import { Schedule } from './src/counselor/entities/schedule.entity';
import { Booking } from './src/client/entities/booking.entity';
import { Review } from './src/counselor/entities/review.entity';


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
    User,Client,AccountVerification,Article,Booking,Counselor,Schedule,Review
  ],
  migrations: [
    'src/migrations/**/*.ts'
  ],
  subscribers: [],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
