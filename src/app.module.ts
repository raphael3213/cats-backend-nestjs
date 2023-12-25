import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from './cats/entities/cat.entity';
import { UploadsModule } from './uploads/uploads.module';
import { UtilityModule } from './utility/utility.module';
import { UsersModule } from './users/users.module';
import { Upload } from './uploads/entities/upload.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    CatsModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/db/db.sqlite',
      entities: [Cat, Upload, User],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UploadsModule,
    UtilityModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
