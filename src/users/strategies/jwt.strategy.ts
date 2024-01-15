import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';

import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'abcd',
    });
  }

  async validate(token: any): Promise<any> {
    const user = await this.authService.validateUser(token.ksuid);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
