import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { Direccion } from './direcciones.schema';

@Controller('direcciones')
export class DireccionesController {
  constructor(private readonly direccionesService: DireccionesService) {}

  @Post()
  async create(@Body() body: any): Promise<Direccion> {
    return this.direccionesService.create(body);
  }

  @Get()
  async findAll(): Promise<Direccion[]> {
    return this.direccionesService.findAll();
  }

  @Get('buscar')
  async search(@Query() query: any): Promise<Direccion[]> {
    // 🔥 CAMBIO AQUÍ: buscar en lugar de search
    return this.direccionesService.buscar(query);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.direccionesService.remove(id);
  }
}