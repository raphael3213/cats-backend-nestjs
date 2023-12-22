import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { Upload } from './entities/upload.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsController } from './uploads.controller';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
  imports: [TypeOrmModule.forFeature([Upload])],
})
export class UploadsModule {}
