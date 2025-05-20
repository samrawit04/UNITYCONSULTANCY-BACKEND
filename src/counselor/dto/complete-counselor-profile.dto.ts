import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PreferredPaymentMethod } from 'src/shared/enums';

export class CompleteCounselorProfileDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  addres?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsArray()
  @IsOptional()
  cerificate?: string[];

  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  @IsOptional()
  languagesSpoken?: string[];

  @IsOptional()
  @IsEnum(PreferredPaymentMethod)
  preferredPaymentMethod?: PreferredPaymentMethod;

  @IsString()
  @IsOptional()
  bankAccountOrPhone?: string;
}
