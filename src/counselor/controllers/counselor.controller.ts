import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CounselorService } from '../service/counselor.service';
import { CompleteCounselorProfileDto } from '../dto/complete-counselor-profile.dto';
import { Counselor } from '../entities/counselor.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';

@Controller('counselors')
export class CounselorController {
  constructor(private readonly counselorService: CounselorService) {}

  @Patch('complete-profile')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePicture', maxCount: 1 },
        { name: 'certificate', maxCount: 5 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'profilePicture') {
              cb(null, './uploads/profile-pictures');
            } else if (file.fieldname === 'certificate') {
              cb(null, './uploads/certificates');
            } else {
              cb(null, './uploads/others');
            }
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
        limits: {
          fileSize: 5 * 1024 * 1024, // Max 5MB per file
        },
        fileFilter: (req, file, cb) => {
          // Accept only images and PDFs for certificates
          if (
            file.fieldname === 'profilePicture' &&
            !file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)
          ) {
            return cb(new Error('Only image files are allowed for profilePicture'), false);
          }

          if (
            file.fieldname === 'certificate' &&
            !file.mimetype.match(/\/(pdf|jpg|jpeg|png)$/)
          ) {
            return cb(new Error('Only PDF or image files are allowed for certificates'), false);
          }

          cb(null, true);
        },
      },
    ),
  )
  async completeProfile(
    @UploadedFiles()
    files: {
      profilePicture?: Express.Multer.File[];
      certificate?: Express.Multer.File[];
    },
    @Body() dto: CompleteCounselorProfileDto,
  ) {
    if (files.profilePicture?.[0]) {
      dto.profilePicture = files.profilePicture[0].filename;
    }

    if (files.certificate?.length) {
      dto.cerificate = files.certificate.map((file) => file.filename);
    }

    return this.counselorService.completeProfile(dto);
  }

  @Get('profile/:userId')
  async getCounselorProfile(@Param('userId') userId: string) {
    return this.counselorService.getCounselorProfile(userId);
  }

  @Get()
  async getAllCounselors(): Promise<Counselor[]> {
    return this.counselorService.findAll();
  }

  @Patch(':userId/approve')
  async approveCounselor(@Param('userId') userId: string): Promise<Counselor> {
    return this.counselorService.approveCounselor(userId);
  }
}
