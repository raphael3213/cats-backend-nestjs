import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  ksuid: string;

  @Expose()
  email: string;
}
