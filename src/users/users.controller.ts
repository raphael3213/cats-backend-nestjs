import { Body, Controller, Post, Put, Session } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptors';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/signin.dto';

@Controller('auth')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/signup')
  @Serialize(UserDto)
  async signup(@Body() body: CreateUserDto) {
    const user = await this.authService.signup(body.email, body.password);
    // session.userId = user.ksuid;
    return user;
  }

  @Post('/signin')
  @Serialize(SignInDto)
  async signin(@Body() body: CreateUserDto, @Session() session) {
    const user = await this.authService.signin(body.email, body.password);
    session.refreshToken = user.refreshToken;
    return user;
  }

  @Post('/signout')
  @Serialize(UserDto)
  async signout(@Session() session) {
    session.userId = null;
    return 'Logged Out Successfully';
  }

  @Put('/refresh')
  @Serialize(SignInDto)
  async refreshToken(@Session() session) {
    const user = await this.authService.refreshAsyncToken(session.refreshToken);
    session.refreshToken = user.refreshToken;
    return user;
  }
}
