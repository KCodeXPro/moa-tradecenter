import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventoDocument = Evento & Document;

@Schema({ timestamps: true })
export class Evento {
  @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
  productoId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario' }) // El vendedor que recibe
  vendedorId: Types.ObjectId; 

  @Prop({ required: true })
  tipo: string; // 'mensaje', 'domicilio', 'whatsapp'
}

export const EventoSchema = SchemaFactory.createForClass(Evento);