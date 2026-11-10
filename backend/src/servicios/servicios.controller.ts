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

  // 🔥 MODIFICADO: Ahora recibe page y limit
  @Get()
  async findAll(
    @Query('vendedorId') vendedorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.serviciosService.findAll(
      vendedorId, 
      page ? parseInt(page) : 1, 
      limit ? parseInt(limit) : 10
    );
  }

  // 🔥 MODIFICADO: Ahora recibe page y limit
  @Get('divisas')
  async getDivisas(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.serviciosService.findDivisas(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
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