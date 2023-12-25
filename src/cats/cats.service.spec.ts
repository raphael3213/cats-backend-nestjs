import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { Cat } from './entities/cat.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UploadsService } from 'src/uploads/uploads.service';
import { Upload } from 'src/uploads/entities/upload.entity';
import ksuid from 'ksuid';
import { Readable } from 'typeorm/platform/PlatformTools';

describe('CatsService', () => {
  let service: CatsService;
  let mockCatRepository: any;
  let mockUploadService: Partial<UploadsService>;
  let cats: Partial<Cat>[] = [];
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
    cats = [];
  };

  beforeEach(async () => {
    mockCatRepository = {
      create: jest.fn((cat: Partial<Cat>) => {
        return {
          ksuid: cat.ksuid,
          name: cat.name,
        } as Cat;
      }),
      save: jest.fn((cat: Cat) => {
        const currentTime = new Date();
        cat.ksuid = ksuid.randomSync().toJSON();
        cat.id = Math.floor(Math.random() * 999999999);
        cat.createdAt = currentTime;
        cat.updatedAt = currentTime;

        cats.push(cat);
        return Promise.resolve(cat);
      }),
      find: jest.fn(() => Promise.resolve(cats)),
      findOne: jest.fn((whereClause) => {
        const upload = cats.filter(
          (upload) => upload.ksuid === whereClause.where.ksuid,
        );
        if (upload === undefined) {
          return Promise.resolve(null);
        }
        return Promise.resolve(upload[0]);
      }),
    };
    mockUploadService = {
      create: jest.fn((file: Express.Multer.File) => {
        const fileType = `${file.mimetype.split('/')[1]}`;
        const generatedKsuid = ksuid.randomSync().toJSON();
        const fileName = `data/uploads/${generatedKsuid}.${fileType}`;
        return Promise.resolve({
          ksuid: generatedKsuid,
          id: Math.floor(Math.random() * 999999999),
          fileName: fileName,
          fileType: fileType,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        } as Upload);
      }),
      delete: jest.fn(() => Promise.resolve(null)),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: getRepositoryToken(Cat),
          useValue: mockCatRepository,
        },
        {
          provide: UploadsService,
          useValue: mockUploadService,
        },
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
    expect(cats).toContainEqual(cat);
    resetStorage();
  });
  it('should create an upload object and return a cat with the nested upload object record on uploadPhoto', async () => {
    const cat = await service.create({ name: 'testing-cat' });
    const uploadedCat = await service.uploadPhoto(cat.ksuid, mockFile);
    expect(uploadedCat).toBeDefined();
    expect(uploadedCat.upload).toBeDefined();
    console.log(cat);
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
