import { Module } from '@nestjs/common';
import { StorageService } from './storage/storage.service';

@Module({
  imports: [],
  exports: [StorageService],
  providers: [StorageService],
})
export class UtilityModule {}
