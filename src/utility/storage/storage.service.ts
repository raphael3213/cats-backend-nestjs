import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { readFile, unlink, writeFile } from 'fs/promises';

@Injectable()
export class StorageService {
  writeFile(fileName: string, buffer: Buffer) {
    return writeFile(fileName, buffer);
  }

  deleteFile(fileName: string) {
    return unlink(fileName);
  }

  readFile(fileName: string) {
    try {
      return readFile(fileName);
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'ERR_INVALID_FILE_URL':
            throw new NotFoundException('File Not found');
            break;
          default:
            throw new ServiceUnavailableException();
        }
      }
    }
  }
}
