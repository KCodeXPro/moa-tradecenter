import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { EventosService } from './eventos.service';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  registrar(@Body() body: any) {
    return this.eventosService.registrarEvento(body);
  }

  @Get('mas-consultados')
  getMasConsultados() {
    return this.eventosService.obtenerMasConsultados();
  }
}
