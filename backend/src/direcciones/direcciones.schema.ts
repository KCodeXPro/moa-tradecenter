import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DireccionDocument = Direccion & Document;

@Schema()
export class Direccion {
  @Prop({ required: true })
  calle: string;

  @Prop({ default: '' })
  numero: string;

  @Prop()
  entre: string;

  @Prop()
  edificio: string;

  @Prop()
  reparto: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lon: number;

  @Prop({ default: '' })
  nick: string;

  // 🔥 NUEVOS CAMPOS: Categoría e ícono
  @Prop()
  categoriaId: string;

  @Prop({ default: '🏪' }) // Por defecto una tienda
  icono: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', default: null })
  vendedorId: Types.ObjectId;
}

export const DireccionSchema = SchemaFactory.createForClass(Direccion);