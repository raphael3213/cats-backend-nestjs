import ksuid from 'ksuid';
import { Upload } from 'src/uploads/entities/upload.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false, unique: true })
  ksuid: string = ksuid.randomSync().toJSON();

  @Column({ type: 'text', nullable: false })
  name: string;

  @OneToOne(() => Upload)
  @JoinColumn()
  upload: Upload;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
