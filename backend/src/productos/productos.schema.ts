import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductoDocument = Producto & Document;

@Schema({ timestamps: true })
export class Producto {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  vendedorId: Types.ObjectId;

  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion: string;

  @Prop({ type: [String], default: [] })
  imagenes: string[];

  // NUEVO: Array de variantes (Color, Talla, Cantidad)
  @Prop({ type: Array, default: [] })
  variantes: { color: string; talla: string; cantidad: number }[];

  @Prop({ required: true, enum: ['minorista', 'mayorista'] })
  tipoVenta: string;

  @Prop()
  precio: number;

  @Prop()
  precioMayorista: number;

  @Prop({ type: Types.ObjectId, ref: 'Categoria', required: true })
  categoriaId: Types.ObjectId;

  @Prop({ default: false })
  tieneDomicilio: boolean;

  @Prop({ default: 'activo', enum: ['activo', 'oculto', 'eliminado'] })
  estado: string;

  @Prop({ default: false })
  seed: boolean;

  @Prop({ type: [String], default: [] })
etiquetas: string[];
}

export const ProductoSchema = SchemaFactory.createForClass(Producto);