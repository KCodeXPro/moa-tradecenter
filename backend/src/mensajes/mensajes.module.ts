import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MensajesController } from './mensajes.controller';
import { MensajesService } from './mensajes.service';
import { Mensaje, MensajeSchema } from './mensajes.schema';
import { Usuario, UsuarioSchema } from '../usuarios/usuarios.schema';
import { Producto, ProductoSchema } from '../productos/productos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mensaje.name, schema: MensajeSchema },
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Producto.name, schema: ProductoSchema },
    ]),
  ],
  controllers: [MensajesController],
  providers: [MensajesService],
  exports: [MensajesService],
})
export class MensajesModule {}
