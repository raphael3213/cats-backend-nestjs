import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { Cat } from './entities/cat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsService } from 'src/uploads/uploads.service';
import { Upload } from 'src/uploads/entities/upload.entity';
import { Readable } from 'typeorm/platform/PlatformTools';
import { TestModule } from 'src/test/test.module';
import { StorageService } from 'src/utility/storage/storage.service';

describe('CatsService', () => {
  let service: CatsService;
  let mockStorageService: Partial<StorageService>;
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
  const resetStorage = () => {};

  beforeEach(async () => {
    mockStorageService = {
      writeFile: jest.fn((fileName: string, buffer: Buffer) => {
        fileName;
        buffer;
        return Promise.resolve();
      }),
      deleteFile: jest.fn((fileName) => {
        fileName;
        return Promise.resolve();
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, TypeOrmModule.forFeature([Upload, Cat])],
      providers: [
        CatsService,
        UploadsService,
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should create and return a cat record on create', async () => {
    const cat = await service.create({ name: 'testing-cat' });
    expect(cat).toBeDefined();
    expect(await service.findAll()).toContainEqual({ ...cat, upload: null });
    resetStorage();
  });
  it('should create an upload object and return a cat with the nested upload object record on uploadPhoto', async () => {
    const cat = await service.create({ name: 'testing-cat' });
    const uploadedCat = await service.uploadPhoto(cat.ksuid, mockFile);
    expect(uploadedCat).toBeDefined();
    expect(uploadedCat.upload).toBeDefined();
    resetStorage();
  });
  it('should delete the upload record and remove it from the cat record on deletePhoto', async () => {
    const cat = await service.create({ name: 'testing-cat' });
    await service.uploadPhoto(cat.ksuid, mockFile);
    const updatedCat = await service.removePhoto(cat.ksuid);
    expect(updatedCat).toBeDefined();
    expect(updatedCat.upload).toBeFalsy();
  });
});
