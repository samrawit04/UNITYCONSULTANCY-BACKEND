import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/shared/user.module';

import { Counselor } from './entities/counselor.entity';
import { CounselorController } from './controllers/counselor.controller';
import { CounselorService } from './service/counselor.service';
import { RatingService } from './service/rating.service';
import { RatingController } from './controllers/rating.controller';
import { Rating } from './entities/rating.entity';
import { Client } from 'src/client/entities/client.entity';
import { Article } from './entities/article.entity';
import { ArticleService } from './service/article.service';
import { ArticleController } from './controllers/article.controller';
import { Availability } from './entities/availability.entity';
import { AvailabilityService } from './service/counselor-avaliblity.service';
import { AvailabilityCounselor } from './controllers/counselor-availability.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Counselor,
      Rating,
      Client,
      Article,
      Availability,
    ]),
    UserModule,
  ],
  controllers: [
    CounselorController,
    RatingController,
    ArticleController,
    AvailabilityCounselor,
  ],
  providers: [
    CounselorService,
    RatingService,
    ArticleService,
    AvailabilityService,
  ],
  exports: [TypeOrmModule],
})
export class CounselorModule {}
