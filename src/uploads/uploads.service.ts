import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink, writeFile, readFile } from 'fs/promises';
import { Repository } from 'typeorm';
import { Upload } from './entities/upload.entity';
import ksuid from 'ksuid';
import { createReadStream } from 'fs';

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
      ksuid: generatedKsuid,
      fileName,
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
    const newUpload = this.uploadRepository.create({
      ksuid: generatedKsuid,
      fileName,
      fileType,
    });
    return this.uploadRepository.save(newUpload);
  }

  async delete(upload: Upload) {
    await unlink(upload.fileName);
    this.uploadRepository.softDelete(upload.id);
  }

  async getImage(ksuid: string) {
    const upload = await this.uploadRepository.findOne({ where: { ksuid } });
    if (!upload) {
      throw new NotFoundException('Upload not found');
    }
    const imageStream = await readFile(upload.fileName);

    return imageStream;
  }
}
