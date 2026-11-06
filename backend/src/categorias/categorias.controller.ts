import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { Categoria } from './categorias.schema';
import { AdminGuard } from '../admin/admin.guard';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  // Público: cualquiera puede ver las categorías
  @Get()
  findAll(@Query('tipo') tipo?: string): Promise<Categoria[]> {
    if (tipo) {
      return this.categoriasService.findByTipo(tipo);
    }
    return this.categoriasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Categoria> {
    return this.categoriasService.findOne(id);
  }

  // Protegido: Solo el admin puede crear, editar o eliminar
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createCategoriaDto: any): Promise<Categoria> {
    return this.categoriasService.create(createCategoriaDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateCategoriaDto: any,
  ): Promise<Categoria> {
    return this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriasService.remove(id);
  }
}