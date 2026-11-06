import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomicilioController } from './domicilio.controller';
import { DomicilioService } from './domicilio.service';
import {
  SolicitudDomicilio,
  SolicitudDomicilioSchema,
} from './domicilio.schema';
import { Usuario, UsuarioSchema } from '../usuarios/usuarios.schema';
import { Producto, ProductoSchema } from '../productos/productos.schema';
import { Mensaje, MensajeSchema } from '../mensajes/mensajes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SolicitudDomicilio.name, schema: SolicitudDomicilioSchema },
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Producto.name, schema: ProductoSchema },
      { name: Mensaje.name, schema: MensajeSchema },
    ]),
  ],
  controllers: [DomicilioController],
  providers: [DomicilioService],
  exports: [DomicilioService],
})
export class DomicilioModule {}
