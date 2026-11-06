import {
  Controller,
  Post,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { Mensaje } from './mensajes.schema';

@Controller('mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @Post()
  async create(
    @Body()
    dto: {
      vendedorId: string;
      productoId?: string;
      whatsappComprador: string;
      texto?: string;
    },
  ): Promise<Mensaje> {
    try {
      return await this.mensajesService.create(dto);
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException('No se pudo enviar el mensaje.');
    }
  }
}
