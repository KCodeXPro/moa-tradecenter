import {
  Controller,
  Post,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DomicilioService } from './domicilio.service';
import { SolicitudDomicilio } from './domicilio.schema';

@Controller('solicitudes-domicilio')
export class DomicilioController {
  constructor(private readonly domicilioService: DomicilioService) {}

  @Post()
  async create(
    @Body()
    dto: {
      prestadorId: string;
      productoId: string;
      whatsappComprador: string;
    },
  ): Promise<SolicitudDomicilio> {
    try {
      return await this.domicilioService.create(dto);
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException('No se pudo crear la solicitud de domicilio.');
    }
  }
}
