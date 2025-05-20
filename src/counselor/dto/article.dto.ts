import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}
export class UpdateArticleDto extends CreateArticleDto {}
