import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, unique: true })
  nick: string;

  @Prop()
  password?: string;

  @Prop()
  email: string;

  @Prop()
  oauthProvider: string;

  @Prop()
  oauthId: string;

  @Prop({ default: 'vendedor', enum: ['vendedor', 'admin'] })
  rol: string;

  @Prop({ default: false })
  esPrestador: boolean;

  @Prop({ enum: ['productos', 'servicios', 'ambos'] })
  tipoVenta: string;

  @Prop({ default: false })
  aceptaDomicilio: boolean;

  @Prop({
    type: {
      calle: String,
      numero: String,
      edificio: String,
      reparto: String,
      lat: Number,
      lon: Number,
      esPublica: { type: Boolean, default: false },
      categoriaId: String, // 🔥 NUEVO CAMPO AÑADIDO
    },
    default: null,
  })
  ubicacion: {
    calle?: string;
    numero?: string;
    edificio?: string;
    reparto?: string;
    lat?: number;
    lon?: number;
    esPublica?: boolean;
    categoriaId?: string; // 🔥 NUEVO CAMPO AÑADIDO
  } | null;

  @Prop()
  whatsapp: string;

  @Prop({ default: false })
  whatsappEsPublico: boolean;

  @Prop()
  tarifaDomicilio: number;

  @Prop({ default: true })
  disponible: boolean;

  @Prop({ default: 'activo', enum: ['activo', 'suspendido', 'eliminado'] })
  estado: string;

  @Prop({ default: false })
  seed: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);