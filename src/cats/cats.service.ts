import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cat } from './entities/cat.entity';
import { Repository } from 'typeorm';
import { UploadsService } from 'src/uploads/uploads.service';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Upload } from 'src/uploads/entities/upload.entity';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat) private catRepository: Repository<Cat>,
    private uploadsService: UploadsService,
  ) {}

  async create(createCatDto: CreateCatDto) {
    const cat = this.catRepository.create(createCatDto);

    return this.catRepository.save(cat);
  }

  async uploadPhoto(ksuid: string, file: Express.Multer.File) {
    const cat = await this.catRepository.findOne({
      where: { ksuid },
      relations: ['upload'],
    });
    if (!cat) {
      throw new NotFoundException('Cat not found');
    }
    let uploadedPhoto: Upload;

    if (cat.upload) {
      uploadedPhoto = await this.uploadsService.update(cat.upload, file);
    } else {
      uploadedPhoto = await this.uploadsService.create(file);
    }

    cat.upload = uploadedPhoto;
    return this.catRepository.save(cat);
  }

  async removePhoto(ksuid: string) {
    const cat = await this.catRepository.findOne({
      where: { ksuid: ksuid },
      relations: ['upload'],
    });
    if (!cat) {
      throw new NotFoundException('Cat not found');
    }
    if (!cat.upload) {
      throw new NotFoundException('Upload not found');
    }
    await this.uploadsService.delete(cat.upload);
    return this.catRepository.save({ ...cat, upload: null });
  }

  findAll() {
    return this.catRepository.find({ relations: ['upload'] });
  }

  async findOne(ksuid: string) {
    const cat = await this.catRepository.findOne({
      where: { ksuid },
      relations: ['upload'],
    });
    if (!cat) {
      throw new NotFoundException('Cat not found');
    }
    return cat;
  }

  async update(ksuid: string, updateCatDto: UpdateCatDto) {
    const cat = await this.catRepository.findOne({ where: { ksuid } });
    if (!cat) throw new NotFoundException('Cat not found');
    Object.assign(cat, updateCatDto);
    return this.catRepository.save(cat);
  }

  remove(id: number) {
    return `This action removes a #${id} cat`;
  }
}
