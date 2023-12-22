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
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateCatDto } from './dto/update-cat.dto';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
  }

  @Patch('upload/:ksuid')
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
  removePhoto(@Param('ksuid') ksuid: string) {
    return this.catsService.removePhoto(ksuid);
  }

  @Get()
  findAll() {
    return this.catsService.findAll();
  }

  @Get(':ksuid')
  findOne(@Param('ksuid') ksuid: string) {
    return this.catsService.findOne(ksuid);
  }

  @Patch(':ksuid')
  update(@Param('ksuid') ksuid: string, @Body() updateCatDto: UpdateCatDto) {
    return this.catsService.update(ksuid, updateCatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catsService.remove(+id);
  }
}
