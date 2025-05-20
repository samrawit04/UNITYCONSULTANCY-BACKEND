import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseInterceptors,
  UploadedFile,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ClientService } from '../services/client.serivice';
import { CompleteClientProfileDto } from '../dto/complete-client-profile.dto';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Patch('complete-profile')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './uploads/profile-pictures',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `profilePicture-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed for profilePicture'), false);
        }
        cb(null, true);
      },
    }),
  )
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async completeProfile(
    @UploadedFile() profilePicture: Express.Multer.File,
    @Body() dto: CompleteClientProfileDto,
  ) {
    if (profilePicture) {
      dto.profilePicture = profilePicture.filename;
    }
    return this.clientService.completeProfile(dto);
  }

  // Get client by userId
  @Get('profile/:userId')
  async getClientProfile(@Param('userId') userId: string) {
    return this.clientService.getClientById(userId);
  }

  // Get all clients
  @Get()
  async getAllClients() {
    return this.clientService.getAllClients();
  }
}
