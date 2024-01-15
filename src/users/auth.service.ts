import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { add, format } from 'date-fns';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string) {
    const users = await this.userService.find(email);
    if (users.length > 0) {
      throw new BadRequestException('Email in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    const user = await this.userService.create(email, result);

    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);

    if (!user) throw new NotFoundException('User not found');
    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // const result = salt + '.' + hash.toString('hex');

    if (storedHash != hash.toString('hex')) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const payload = {
      user: user,
      accessToken: await this.createAccessToken(user.ksuid),
      refreshToken: await this.createRefreshToken(user.ksuid),
      expiresIn: Number(format(add(new Date(), { seconds: 40 }), 't')),
    };

    return payload;
  }

  async validateUser(ksuid: string) {
    const user = await this.userService.findOne(ksuid);

    return user;
  }

  async createAccessToken(ksuid: string) {
    return this.jwtService.sign(
      {
        ksuid,
      },
      {
        expiresIn: '30m',
      },
    );
  }

  async createRefreshToken(ksuid: string) {
    const user = await this.userService.findOne(ksuid);

    if (!user) throw new NotFoundException('User not found');

    const refreshToken = this.jwtService.sign({ ksuid });

    this.cacheManager.set(refreshToken, ksuid, 864000);

    return refreshToken;
  }

  async refreshAsyncToken(refreshToken: string) {
    const ksuid = (await this.cacheManager.get(refreshToken)) as string;

    if (!ksuid) throw new UnauthorizedException('Unauthorized');

    const user = await this.userService.findOne(ksuid);

    if (!user) throw new NotFoundException('User not found');

    this.cacheManager.del(refreshToken);

    return {
      user,
      accessToken: await this.createAccessToken(ksuid),
      refreshToken: await this.createRefreshToken(ksuid),
      expiresIn: Number(format(add(new Date(), { minutes: 30 }), 't')),
    };
  }
}
