import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario, UsuarioSchema } from './usuarios.schema';
import { Servicio, ServicioSchema } from '../servicios/servicios.schema';
import { Producto, ProductoSchema } from '../productos/productos.schema';
import { Direccion, DireccionSchema } from '../direcciones/direcciones.schema'; // <-- AÑADIDO

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Servicio.name, schema: ServicioSchema },
      { name: Producto.name, schema: ProductoSchema },
      { name: Direccion.name, schema: DireccionSchema }, // <-- AÑADIDO
    ]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}