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
import { ProductosService } from './productos.service';
import { Producto } from './productos.schema';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  create(@Body() createProductoDto: any): Promise<Producto> {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  findAll(@Query('vendedorId') vendedorId?: string): Promise<Producto[]> {
    // Le pasamos el vendedorId al servicio
    return this.productosService.findAll(vendedorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Producto> {
    return this.productosService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductoDto: any,
  ): Promise<Producto> {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.productosService.remove(id);
  }
}