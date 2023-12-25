import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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
  @Column({ type: 'text', name: 'file_type', nullable: false })
  fileType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // @BeforeInsert()
  // updateTimestampsOnInsert() {
  //   const currentTime = Math.floor(Date.now() / 1000);
  //   this.createdAt = currentTime;
  //   this.updatedAt = currentTime;
  // }
  // @BeforeUpdate()
  // updateTimestampsOnUpdate() {
  //   this.updatedAt = Math.floor(Date.now() / 1000);
  // }

  // @BeforeRemove()
  // updateTimestampsonDelete() {
  //   this.deletedAt = Math.floor(Date.now() / 1000);
  // }
}
