import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false, unique: true })
  ksuid: string;

  @Column({ type: 'text', name: 'file_name', nullable: false, unique: true })
  fileName: string;

  //TODO: Need to add enum values for fileType
  @Column({ type: 'text', name: 'file_type', nullable: false, unique: true })
  fileType: string;

  @Column({ type: 'bigint', name: 'created_at' })
  createdAt: number;

  @Column({ type: 'bigint', name: 'updated_at' })
  updatedAt: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @BeforeInsert()
  updateTimestampsOnInsert() {
    const currentTime = Math.floor(Date.now() / 1000);
    this.createdAt = currentTime;
    this.updatedAt = currentTime;
  }
  @BeforeUpdate()
  updateTimestampsOnUpdate() {
    this.updatedAt = Math.floor(Date.now() / 1000);
  }
}
