import { Controller, Get, Post, Body, Param, Put, Patch, Delete } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './usuarios.schema';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: any): Promise<Usuario> {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Post('register')
  register(@Body() dto: { nick: string; password: string; whatsapp?: string; esPrestador?: boolean }) {
    return this.usuariosService.register(dto);
  }

  @Post('login')
  login(@Body() dto: { nick: string; password: string }) {
    return this.usuariosService.login(dto);
  }

  @Get()
  findAll(): Promise<Usuario[]> {
    return this.usuariosService.findAll();
  }

  @Get('prestadores')
  findPrestadores() {
    return this.usuariosService.findPrestadores();
  }

  // RUTA ESPECÍFICA: Negocios públicos (antes de @Get(':id'))
  @Get('negocios-publicos')
  findNegociosPublicos() {
    return this.usuariosService.findNegociosPublicos();
  }

  @Get('ubicacion-publica/:nick')
  getUbicacionPublicaPorNick(@Param('nick') nick: string) {
    return this.usuariosService.getUbicacionPublicaPorNick(nick);
  }

  @Get('nick/:nick')
  findByNick(@Param('nick') nick: string): Promise<Usuario> {
    return this.usuariosService.findByNick(nick);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Usuario> {
    return this.usuariosService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: any): Promise<Usuario> {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Patch(':id/perfil')
  updatePerfil(@Param('id') id: string, @Body() data: { whatsapp: string; esPrestador?: boolean }) {
    return this.usuariosService.updatePerfil(id, data);
  }

  @Patch(':id/ubicacion')
  updateUbicacion(@Param('id') id: string, @Body() data: { calle?: string; numero?: string; edificio?: string; reparto?: string; lat?: number; lon?: number }) {
    return this.usuariosService.updateUbicacion(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usuariosService.remove(id);
  }
}