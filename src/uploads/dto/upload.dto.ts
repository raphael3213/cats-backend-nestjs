import { Expose } from 'class-transformer';
import { Upload } from 'src/uploads/entities/upload.entity';

export class UploadDto {
  @Expose()
  fileName: string;

  @Expose()
  ksuid: string;

  @Expose()
  fileType: Upload;
}
