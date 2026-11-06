import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Usuario, UsuarioSchema } from '../usuarios/usuarios.schema';
import { Producto, ProductoSchema } from '../productos/productos.schema';
import { Servicio, ServicioSchema } from '../servicios/servicios.schema';
import { SolicitudDomicilio, SolicitudDomicilioSchema } from '../domicilio/domicilio.schema';
import { Auditoria, AuditoriaSchema } from '../auditoria/auditoria.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Producto.name, schema: ProductoSchema },
      { name: Servicio.name, schema: ServicioSchema },
      { name: SolicitudDomicilio.name, schema: SolicitudDomicilioSchema },
      { name: Auditoria.name, schema: AuditoriaSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}