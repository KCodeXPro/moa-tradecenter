import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SolicitudDomicilioDocument = SolicitudDomicilio & Document;

interface ProductoSnapshot {
  nombre: string;
  precio: number;
  imagen?: string;
  vendedorNombre: string;
  vendedorDireccion: string;
}

@Schema({ timestamps: true })
export class SolicitudDomicilio {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  prestadorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
  productoId: Types.ObjectId;

  @Prop({ required: true })
  compradorWhatsapp: string;

  // Snapshot del producto y del vendedor. Prevalece sobre las referencias
  // si el producto o el vendedor se eliminan después.
  @Prop({ type: Object, required: true })
  productoSnapshot: ProductoSnapshot;

  @Prop({ required: true })
  direccionVendedor: string;

  @Prop({
    required: true,
    enum: ['pendiente', 'contactado', 'entregado', 'cancelado'],
    default: 'pendiente',
  })
  estado: string;
}

export const SolicitudDomicilioSchema =
  SchemaFactory.createForClass(SolicitudDomicilio);
