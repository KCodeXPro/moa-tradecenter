import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Agregamos ConfigService
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 🔥 CAMBIO CLAVE: Usar forRootAsync para leer la variable de entorno
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/moa-tradecenter',
      }),
    }),
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