import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from 'src/cats/entities/cat.entity';
import { Upload } from 'src/uploads/entities/upload.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Cat, Upload, User],
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
})
export class TestModule {}
