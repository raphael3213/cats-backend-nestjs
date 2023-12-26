import { Expose } from 'class-transformer';

export class UploadDto {
  @Expose()
  ksuid: string;
}
