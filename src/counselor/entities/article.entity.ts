import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Counselor } from './counselor.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => Counselor, (counselor) => counselor.articles, {
    onDelete: 'CASCADE',
  })
  counselor: Counselor;
}
