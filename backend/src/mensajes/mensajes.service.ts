import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mensaje, MensajeDocument } from './mensajes.schema';
import { Usuario, UsuarioDocument } from '../usuarios/usuarios.schema';
import { Producto, ProductoDocument } from '../productos/productos.schema';

const WHATSAPP_REGEX = /^\+53\s?5\d{7}$/;

// Límite de mensajes por comprador (WhatsApp) y día, según reglas de negocio.
const LIMITE_MENSAJES_DIA = 20;

@Injectable()
export class MensajesService {
  constructor(
    @InjectModel(Mensaje.name) private mensajeModel: Model<MensajeDocument>,
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
  ) {}

  private validarWhatsapp(whatsapp: string): void {
    if (!WHATSAPP_REGEX.test(whatsapp)) {
      throw new BadRequestException(
        'El WhatsApp debe tener formato cubano válido (+53 5XXXXXXX).',
      );
    }
  }

  async create(dto: {
    vendedorId: string;
    productoId?: string;
    whatsappComprador: string;
    texto?: string;
  }): Promise<Mensaje> {
    this.validarWhatsapp(dto.whatsappComprador);

    const vendedor = await this.usuarioModel.findById(dto.vendedorId).exec();
    if (!vendedor) {
      throw new NotFoundException('Vendedor no encontrado.');
    }
    if (vendedor.estado !== 'activo') {
      throw new BadRequestException(
        'Este vendedor no está disponible en este momento.',
      );
    }

    if (dto.productoId) {
      const producto = await this.productoModel
        .findById(dto.productoId)
        .exec();
      if (!producto) {
        throw new NotFoundException('Producto no encontrado.');
      }
    }

    // Límite: máximo 20 mensajes por comprador (WhatsApp) y día.
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const mensajesHoy = await this.mensajeModel
      .countDocuments({
        compradorWhatsapp: dto.whatsappComprador,
        createdAt: { $gte: inicioDia },
      })
      .exec();
    if (mensajesHoy >= LIMITE_MENSAJES_DIA) {
      throw new BadRequestException(
        'Has alcanzado el límite de mensajes por hoy. Inténtalo mañana.',
      );
    }

    const tipo = dto.productoId ? 'producto' : 'servicio';

    const mensaje = new this.mensajeModel({
      vendedorId: dto.vendedorId,
      productoId: dto.productoId ?? null,
      servicioId: null,
      compradorWhatsapp: dto.whatsappComprador,
      texto: dto.texto ?? '',
      tipo,
    });

    return mensaje.save();
  }

  async findByVendedor(vendedorId: string): Promise<Mensaje[]> {
    return this.mensajeModel
      .find({ vendedorId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(id: string): Promise<Mensaje> {
    const mensaje = await this.mensajeModel
      .findByIdAndUpdate(id, { leido: true }, { new: true })
      .exec();
    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado.');
    }
    return mensaje;
  }
}
