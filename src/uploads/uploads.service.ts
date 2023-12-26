import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './entities/upload.entity';
import ksuid from 'ksuid';
import { StorageService } from '../utility/storage/storage.service';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
    private readonly storageService: StorageService,
  ) {}
  async create(file: Express.Multer.File) {
    const fileType = `${file.mimetype.split('/')[1]}`;
    const generatedKsuid = ksuid.randomSync().toJSON();
    const fileName = `data/uploads/${generatedKsuid}.${fileType}`;

    const upload = this.uploadRepository.create({
      ksuid: generatedKsuid,
      fileName,
      fileType,
    });

    const savedUpload = await this.uploadRepository.save(upload);

    await this.storageService.writeFile(fileName, Buffer.from(file.buffer));

    return savedUpload;
  }

  async findAll() {
    return this.uploadRepository.find();
  }

  async findOne(ksuid: string) {
    return this.uploadRepository.findOne({ where: { ksuid } });
  }

  async delete(upload: Upload) {
    await this.uploadRepository.softDelete(upload.id);
    await this.storageService.deleteFile(upload.fileName);
  }

  async getImage(ksuid: string) {
    const upload = await this.uploadRepository.findOne({ where: { ksuid } });
    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    return this.storageService.readFile(upload.fileName);
  }
}
