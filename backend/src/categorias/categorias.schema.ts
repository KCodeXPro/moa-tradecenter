import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CategoriaDocument = Categoria & Document;

@Schema()
export class Categoria {
  @Prop({ required: true, enum: ['producto', 'servicio'] })
  tipo: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  icono: string;

  @Prop({ required: true })
  orden: number;

  @Prop({ default: false })
  esSinCategoria: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);