import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';
import { Servicio, ServicioSchema } from './servicios.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Servicio.name, schema: ServicioSchema }]),
  ],
  controllers: [ServiciosController],
  providers: [ServiciosService],
  exports: [ServiciosService],
})
export class ServiciosModule {}