import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditoriaDocument = Auditoria & Document;

@Schema({ timestamps: true })
export class Auditoria {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  adminId: Types.ObjectId;

  @Prop({ required: true })
  accion: string;

  @Prop({ required: true })
  entidad: string;

  @Prop({ type: Types.ObjectId })
  entidadId?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  detalle: Record<string, any>;

  @Prop()
  createdAt: Date;
}

export const AuditoriaSchema = SchemaFactory.createForClass(Auditoria);
