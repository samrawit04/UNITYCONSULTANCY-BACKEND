import { Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Counselor } from '../entities/counselor.entity';
import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';

export class ArticleService {
  constructor(
    @InjectRepository(Counselor)
    private readonly counselorRepository: Repository<Counselor>,

    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async create(dto: CreateArticleDto, counselorId: string): Promise<Article> {
    const counselor = await this.counselorRepository.findOne({
      where: {
        userId: counselorId,
      },
    });
    if (!counselor) {
      throw new NotFoundException('Counselor not found');
    }

    const article = this.articleRepository.create({
      ...dto,
      counselor,
    });
    return this.articleRepository.save(article);
  }

  // async findAll(): Promise<Article[]> {
  //   return await this.articleRepository.find();
  // }
  
  async findAll(): Promise<Article[]> {
  return await this.articleRepository.find({
    relations: ['counselor', 'counselor.user'], // Includes counselor info and their user profile
  });
}

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: {
        id: id,
      },
      relations: ['counselor'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async update(dto: UpdateArticleDto, id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    Object.assign(article, dto);
    return await this.articleRepository.save(article);
  }

  async remove(id: string): Promise<String> {
    const article = await this.articleRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    await this.articleRepository.remove(article);
    return ' article removed ';
  }
}
