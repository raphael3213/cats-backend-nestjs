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

  // async update(upload: Upload, file: Express.Multer.File) {
  //   await this.delete(upload);
  //   const fileType = `${file.mimetype.split('/')[1]}`;
  //   const generatedKsuid = ksuid.randomSync().toJSON();
  //   const fileName = `data/uploads/${generatedKsuid}.${fileType}`;
  //   const newUpload = this.uploadRepository.create({
  //     ksuid: generatedKsuid,
  //     fileName,
  //     fileType,
  //   });
  //   const savedUpload = await this.uploadRepository.save(newUpload);
  //   await writeFile(fileName, Buffer.from(file.buffer));
  //   return savedUpload; // TODO : Check where the functions is returned, if await is used and remove it;
  // }

  async delete(upload: Upload) {
    await this.uploadRepository.softRemove(upload);
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
