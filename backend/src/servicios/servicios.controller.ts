import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { Servicio } from './servicios.schema';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  create(@Body() createServicioDto: any): Promise<Servicio> {
    return this.serviciosService.create(createServicioDto);
  }

  @Get()
  findAll(@Query('vendedorId') vendedorId?: string): Promise<Servicio[]> {
    // 🔥 SI VIENE VENDEDORID (PANEL), MOSTRAMOS TODO. SI NO (CATÁLOGO), EXCLUIMOS DIVISAS.
    if (vendedorId) {
      return this.serviciosService.findAllByVendedor(vendedorId);
    }
    return this.serviciosService.findAll();
  }

  @Get('divisas')
  async getDivisas() {
    return this.serviciosService.findDivisas();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Servicio> {
    return this.serviciosService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateServicioDto: any,
  ): Promise<Servicio> {
    return this.serviciosService.update(id, updateServicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.serviciosService.remove(id);
  }
}