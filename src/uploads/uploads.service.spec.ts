import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { StorageService } from '../utility/storage/storage.service';
import { Upload } from './entities/upload.entity';

import { NotFoundException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Readable } from 'stream';
import { TestModule } from 'src/test/test.module';

describe('UploadsService', () => {
  let service: UploadsService;
  let mockStorageService: Partial<StorageService>;

  type Storage = { fileName: string; buffer: Buffer };
  let storage: Storage[] = [];
  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test.png',
    encoding: '8bit',
    mimetype: 'image/png',
    destination: './uploads/',
    filename: 'test.png', // Timestamp or unique filename
    path: './uploads/example-1634152865000.txt',
    size: 1234,
    stream: new Readable(),
    buffer: Buffer.from('abc'),
  };
  const resetStorage = () => {
    storage = [];
  };

  beforeEach(async () => {
    mockStorageService = {
      writeFile: jest.fn((fileName: string, buffer: Buffer) => {
        storage.push({ fileName, buffer });
        return Promise.resolve();
      }),
      readFile: jest.fn((fileName) => {
        const file = storage.filter(
          (storageFile) => storageFile.fileName === fileName,
        );
        if (file.length === 0) {
          throw new NotFoundException();
        }
        return Promise.resolve(file[0].buffer);
      }),
      deleteFile: jest.fn((fileName) => {
        storage.splice(
          storage.findIndex((storageFile) => storageFile.fileName === fileName),
          1,
        );
        return Promise.resolve();
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, TypeOrmModule.forFeature([Upload])],
      providers: [
        UploadsService,
        { provide: StorageService, useValue: mockStorageService },
        // { provide: getRepositoryToken(Upload), useValue: TestModule },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a file and and uploads record on create', async () => {
    const upload = await service.create(mockFile);
    expect(upload).toBeDefined();
    expect(upload.fileType).toEqual(mockFile.mimetype.split('/')[1]);
    expect(await service.findAll()).toContainEqual(upload);
    expect(storage).toContainEqual({
      fileName: upload.fileName,
      buffer: mockFile.buffer,
    });
    resetStorage();
  });

  it('should delete a file and mark record as deleted on delete', async () => {
    const upload = await service.create(mockFile);
    await service.delete(upload);
    expect(storage).not.toContainEqual({
      fileName: upload.fileName,
      buffer: mockFile.buffer,
    });
    const deletedUpload = await service.findOne(upload.ksuid);
    expect(deletedUpload).toBeFalsy();
  });
  it('should return a buffer on read', async () => {
    const upload = { ...(await service.create(mockFile)) };

    const buffer = await service.getImage(upload.ksuid);
    expect(buffer).toBeTruthy();
    expect(buffer).toEqual(mockFile.buffer);
    resetStorage();
  });
  it('should return a NotFoundException on not finding the file to read', async () => {
    await expect(service.getImage('wrong-ksuid')).rejects.toThrow(
      NotFoundException,
    );
  });
});
