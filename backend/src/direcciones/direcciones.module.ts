import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DireccionesController } from './direcciones.controller';
import { DireccionesService } from './direcciones.service';
import { Direccion, DireccionSchema } from './direcciones.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Direccion.name, schema: DireccionSchema }]),
  ],
  controllers: [DireccionesController],
  providers: [DireccionesService],
  exports: [DireccionesService],
})
export class DireccionesModule {}

