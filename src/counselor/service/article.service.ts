import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Counselor } from '../entities/counselor.entity';
import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';
import { NotificationService } from '../../Notification/service/notification.service';
import { User } from 'src/auth/entity/user.entity';
import { Role } from 'src/auth/enum/role.enum'; 

export class ArticleService {
  constructor(
    @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        
    @InjectRepository(Counselor)
    private readonly counselorRepository: Repository<Counselor>,

    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

private readonly notificationService: NotificationService,

  ) {}

  async create(dto: CreateArticleDto, counselorId: string): Promise<Article> {
  const counselor = await this.counselorRepository.findOne({
    where: { userId: counselorId },
    relations: ['user'], // 👈 Needed to access counselor.user.firstName etc.
  });

  if (!counselor) {
    throw new NotFoundException('Counselor not found');
  }

  const article = this.articleRepository.create({
    ...dto,
    counselor,
  });

  // ✅ Fetch users by Role enum if defined
  const clients = await this.userRepository.find({ where: { role: Role.CLIENT } });
  const admins = await this.userRepository.find({ where: { role: Role.ADMIN } });

  const counselorName = `${counselor.user.firstName} ${counselor.user.lastName}`;

  for (const client of clients) {
    await this.notificationService.sendNotification({
      recipientId: client.id,
      role: 'CLIENT',
      message: 'New article posted by a counselor. Check it out!',
      type: 'SYSTEM',
    });
  }

  for (const admin of admins) {
    await this.notificationService.sendNotification({
      recipientId: admin.id,
      role: 'ADMIN',
      message: `A new post has been created by ${counselorName}.`,
      type: 'SYSTEM',
    });
  }

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
async findByCounselorId(counselorUserId: string): Promise<Article[]> {
  const counselor = await this.counselorRepository.findOne({
    where: { userId: counselorUserId },
  });

  if (!counselor) {
    throw new NotFoundException('Counselor not found');
  }

  return this.articleRepository.find({
    where: { counselor }, // ✅ This is correct
    relations: ['counselor', 'counselor.user'],
    
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
