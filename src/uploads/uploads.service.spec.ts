import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { StorageService } from '../utility/storage/storage.service';
import { Upload } from './entities/upload.entity';

import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Readable } from 'stream';

describe('UploadsService', () => {
  let service: UploadsService;
  let mockStorageService: Partial<StorageService>;
  let mockUploadRepository;
  let uploads: Upload[] = [];
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
    uploads = [];
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
    mockUploadRepository = {
      create: jest.fn((upload: Partial<Upload>) => {
        const currentTime = new Date();
        return {
          ksuid: upload.ksuid,
          fileName: upload.fileName,
          fileType: upload.fileType,
          createdAt: currentTime,
          updatedAt: currentTime,
          deletedAt: null,
        } as Upload;
      }),
      save: jest.fn((upload: Upload) => {
        upload.id = Math.floor(Math.random() * 999999999);
        uploads.push(upload);
        return Promise.resolve(upload);
      }),
      softRemove: jest.fn((removeUpload) => {
        uploads.forEach((upload) => {
          if (upload.ksuid === removeUpload.ksuid) {
            upload.deletedAt = new Date();
          }
        });
      }),
      findOne: jest.fn((whereClause) => {
        const upload = uploads.filter(
          (upload) => upload.ksuid === whereClause.where.ksuid,
        );
        if (upload === undefined) {
          return Promise.resolve(null);
        }
        return Promise.resolve(upload[0]);
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: StorageService, useValue: mockStorageService },
        { provide: getRepositoryToken(Upload), useValue: mockUploadRepository },
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
    expect(uploads).toContain(upload);
    expect(storage).toContainEqual({
      fileName: upload.fileName,
      buffer: mockFile.buffer,
    });
    resetStorage();
  });

  it('should delete a file and mark record as deleted on delete', async () => {
    const upload = { ...(await service.create(mockFile)) };

    await service.delete(upload);
    expect(uploads).not.toContain(upload);
    expect(storage).not.toContainEqual({
      fileName: upload.fileName,
      buffer: mockFile.buffer,
    });
    expect(uploads[0].deletedAt).toBeTruthy();
    resetStorage();
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
