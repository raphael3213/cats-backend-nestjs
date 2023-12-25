import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { Upload } from './entities/upload.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsController } from './uploads.controller';
import { UtilityModule } from 'src/utility/utility.module';
import { StorageService } from '../utility/storage/storage.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, StorageService],
  exports: [UploadsService],
  imports: [TypeOrmModule.forFeature([Upload]), UtilityModule],
})
export class UploadsModule {}
