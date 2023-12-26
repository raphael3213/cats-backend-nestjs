import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('uploads')
@UseGuards(AuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get('/:ksuid')
  async fetchImage(@Param('ksuid') ksuid: string, @Res() res: Response) {
    const fileStream = await this.uploadsService.getImage(ksuid);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(fileStream);
  }
}
