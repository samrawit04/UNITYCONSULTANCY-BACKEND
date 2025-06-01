import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/shared/user.module';

import { Counselor } from './entities/counselor.entity';
import { CounselorController } from './controllers/counselor.controller';
import { CounselorService } from './service/counselor.service';
import { ReviewService } from './service/review.service';
import { ReviewController } from './controllers/review.controller';
import { Client } from 'src/client/entities/client.entity';
import { Article } from './entities/article.entity';
import { ArticleService } from './service/article.service';
import { ArticleController } from './controllers/article.controller';
import { Schedule } from './entities/schedule.entity';
import { ScheduleController } from './controllers/schedule.controller';
import { ScheduleService } from './service/schedule.service';
import { Review } from './entities/review.entity';
import { NotificationModule } from '../Notification/notification.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Counselor, Client, Article, Schedule, Review]),
    NotificationModule,

    UserModule,
  ],
  controllers: [
    CounselorController,
    ReviewController,
    ArticleController,
    ScheduleController,
  ],
  providers: [CounselorService, ReviewService, ArticleService, ScheduleService],
  exports: [TypeOrmModule],
})
export class CounselorModule {}
