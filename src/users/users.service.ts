import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import ksuid from 'ksuid';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, password: string) {
    const user = this.repo.create({
      ksuid: ksuid.randomSync().toJSON(),
      email,
      password,
    });
    return this.repo.save(user);
  }

  findOne(ksuid: string) {
    if (!ksuid) return null;
    return this.repo.findOne({ where: { ksuid } });
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }
}
