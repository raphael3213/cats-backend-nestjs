import { Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from './entities/cat.entity';
import { UploadsModule } from 'src/uploads/uploads.module';
import { Upload } from 'src/uploads/entities/upload.entity';

@Module({
  imports: [
    MulterModule.register(),
    TypeOrmModule.forFeature([Cat, Upload]),
    UploadsModule,
  ],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
