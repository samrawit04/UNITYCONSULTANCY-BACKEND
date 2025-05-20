import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Gender, MaritalStatus } from 'src/shared/enums';

export class CompleteClientProfileDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  addres?: string;

  @IsOptional()
  @IsUrl({}, { message: 'profilePicture must be a valid URL' })
  profilePicture?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;
}