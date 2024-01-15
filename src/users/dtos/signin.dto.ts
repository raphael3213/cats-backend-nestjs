import { Expose, Type } from 'class-transformer';
import { UserDto } from './user.dto';

export class SignInDto {
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  accessToken: string;

  @Expose()
  expiresIn: number;
}
