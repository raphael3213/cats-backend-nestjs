import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { CatDto } from './dto/cat.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('cats')
@Serialize(CatDto)
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
  }

  @Patch('upload/:ksuid')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadPhoto(
    @Param('ksuid') ksuid: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'image/png' }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.catsService.uploadPhoto(ksuid, image);
  }

  @Delete('upload/:ksuid')
  @UseGuards(AuthGuard)
  removePhoto(@Param('ksuid') ksuid: string) {
    return this.catsService.removePhoto(ksuid);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.catsService.findAll();
  }

  @Get(':ksuid')
  @UseGuards(AuthGuard)
  findOne(@Param('ksuid') ksuid: string) {
    return this.catsService.findOne(ksuid);
  }

  @Patch(':ksuid')
  @UseGuards(AuthGuard)
  update(@Param('ksuid') ksuid: string, @Body() updateCatDto: UpdateCatDto) {
    return this.catsService.update(ksuid, updateCatDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.catsService.remove(+id);
  }
}
