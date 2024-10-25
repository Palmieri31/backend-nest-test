import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Film {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'int' })
  episode_id: number;

  @Column({ type: 'text' })
  opening_crawl: string;

  @Column({ type: 'varchar', length: 255 })
  director: string;

  @Column({ type: 'varchar', length: 255 })
  producer: string;

  @Column({ type: 'date' })
  release_date: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  edited: string;
}
