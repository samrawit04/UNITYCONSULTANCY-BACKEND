import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { ArticleService } from '../service/article.service';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post(':counselorId')
  async create(
    @Param('counselorId') counselorId: string,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.articleService.create(createArticleDto, counselorId);
  }

  @Get()
  async findAll() {
    return this.articleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }

  // Update an article
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.update(updateArticleDto, id);
  }

  // Delete an article
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.articleService.remove(id);
  }
}
