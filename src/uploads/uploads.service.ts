import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink, writeFile } from 'fs/promises';
import { Repository } from 'typeorm';
import { Upload } from './entities/upload.entity';
import ksuid from 'ksuid';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
  ) {}
  async create(file: Express.Multer.File) {
    const fileType = `${file.mimetype.split('/')[1]}`;
    const generatedKsuid = ksuid.randomSync().toJSON();
    const fileName = `data/uploads/${generatedKsuid}.${fileType}`;

    await writeFile(fileName, Buffer.from(file.buffer));

    const upload = this.uploadRepository.create({
      ksuid: fileName,
      fileType,
    });

    return this.uploadRepository.save(upload);
  }

  async update(upload: Upload, file: Express.Multer.File) {
    await unlink(upload.fileName);
    this.uploadRepository.softDelete(upload.id);

    const fileType = `${file.mimetype.split('/')[1]}`;
    const generatedKsuid = ksuid.randomSync().toJSON();
    const fileName = `data/uploads/${generatedKsuid}.${fileType}`;
    await writeFile(fileName, Buffer.from(file.buffer));

    return this.uploadRepository.save({
      ...upload,
      updatedAt: Math.floor(Date.now() / 1000),
    });
  }

  async delete(upload: Upload) {
    await unlink(upload.fileName);
    this.uploadRepository.softDelete(upload.id);
  }
}
// 1703274785
