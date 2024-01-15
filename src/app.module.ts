import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsModule } from './uploads/uploads.module';
import { UtilityModule } from './utility/utility.module';
import { UsersModule } from './users/users.module';
import { TestModule } from './test/test.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggerInterceptor } from './interceptors/http-logger.interceptor';
import { UsersService } from './users/users.service';
import { User } from './users/entities/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import * as redisStore from 'cache-manager-redis-store';
import { Upload } from './uploads/entities/upload.entity';
import { Cat } from './cats/entities/cat.entity';

@Module({
  imports: [
    CatsModule,
    CacheModule.register({
      isGlobal: true,
      store: redisStore,

      // Store-specific configuration:
      host: 'localhost',
      port: 6379,
    }),
    JwtModule.register({ global: true, secret: 'abcd' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        type: 'sqlite',
        database: ':memory:',
        entities: [Cat, Upload, User],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    UploadsModule,
    UtilityModule,
    UsersModule,
    TestModule,
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UsersService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggerInterceptor,
    },
  ],
})
export class AppModule {}
