import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServicioDocument = Servicio & Document;

@Schema({ timestamps: true })
export class Servicio {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  vendedorId: Types.ObjectId;

  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion: string;

  @Prop()
  imagen: string;

  @Prop({ required: true, min: 1 })
  precio: number;

  @Prop({ type: Types.ObjectId, ref: 'Categoria', required: true })
  categoriaId: Types.ObjectId;

  @Prop({ default: false })
  esDomicilio: boolean;

  // 🔥 NUEVO CAMPO: Identifica si es una venta de divisa
  @Prop({ default: false })
  esDivisa: boolean;

  @Prop({ default: 'activo' })
  estado: string;

  @Prop({ default: false })
  seed: boolean;

  @Prop({ default: '' })
  whatsapp: string;

  @Prop({ default: '' })
  telefono: string;

  @Prop({ default: '' })
  direccion: string;

  @Prop({ default: '' })
  horario: string;

  @Prop({ type: [{ item: String, precio: Number }], default: [] })
  menu: { item: string; precio: number }[];
}

export const ServicioSchema = SchemaFactory.createForClass(Servicio);