import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  image: string;
}
