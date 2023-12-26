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

@Module({
  imports: [
    CatsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_DATABASE', 'postgres'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
