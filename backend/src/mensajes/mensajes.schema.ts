import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MensajeDocument = Mensaje & Document;

@Schema({ timestamps: true })
export class Mensaje {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  vendedorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Producto' })
  productoId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Servicio' })
  servicioId?: Types.ObjectId;

  @Prop({ required: true })
  compradorWhatsapp: string;

  @Prop({ default: '' })
  texto: string;

  @Prop({ required: true, enum: ['producto', 'servicio'] })
  tipo: string;

  @Prop({ default: false })
  leido: boolean;
}

export const MensajeSchema = SchemaFactory.createForClass(Mensaje);

// TTL index: los mensajes NO leídos se borran físicamente a los 5 días.
// Los mensajes leídos se conservan (su WhatsApp se anonimiza a los 30 días
// con un job programado, fuera del alcance del MVP).
MensajeSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 5 * 24 * 60 * 60,
    partialFilterExpression: { leido: false },
  },
);
