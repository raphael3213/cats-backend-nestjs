import { Expose, Type } from 'class-transformer';
import { UploadDto } from 'src/uploads/dto/upload.dto';

export class CatDto {
  @Expose()
  name: string;

  @Expose()
  ksuid: string;

  @Expose({})
  @Type(() => UploadDto)
  upload: UploadDto;
}
