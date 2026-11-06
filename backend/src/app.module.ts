import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProductosModule } from './productos/productos.module';
import { ServiciosModule } from './servicios/servicios.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { DomicilioModule } from './domicilio/domicilio.module';
import { ReportesModule } from './reportes/reportes.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AdminModule } from './admin/admin.module';
import { EventosModule } from './eventos/eventos.module';
import { DireccionesModule } from './direcciones/direcciones.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://localhost:27017/moa-tradecenter'), // Ajusta si usas Atlas
    AuthModule,
    UsuariosModule,
    CategoriasModule,
    ProductosModule,
    ServiciosModule,
    MensajesModule,
    DomicilioModule,
    ReportesModule,
    AuditoriaModule,
    AdminModule,
    EventosModule,
    DireccionesModule,
  ],
})
export class AppModule {}