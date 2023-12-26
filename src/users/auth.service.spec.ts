import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestModule } from 'src/test/test.module';

describe('AuthService', () => {
  let service: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, TypeOrmModule.forFeature([User])],
      providers: [AuthService, UsersService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('asdfa@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });
  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdfgwgra@agergsdf.com', 'asdf');
    await expect(
      service.signup('asdfgwgra@agergsdf.com', 'asdf'),
    ).rejects.toThrow(BadRequestException);
  });
  it('throws an error if user signs in with wrong email', async () => {
    await expect(
      service.signin('asdfasd@asasdasddf.com', 'asdfabc'),
    ).rejects.toThrow(NotFoundException);
    // users = [];
  });
  it('Allows user to sign in if user signs in with correct password', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    const user = await expect(service.signin('asdf@asdf.com', 'asdf'));

    expect(user).toBeTruthy();
    // users = [];
  });
  it('Disallows user to sign in if user signs in with wrong password', async () => {
    await service.signup('ajhkjhsdf@asdf.com', 'asdfed');
    await expect(service.signin('ajhkjhsdf@asdf.com', 'asdf')).rejects.toThrow(
      UnauthorizedException,
    );
    // users = [];
  });
});
