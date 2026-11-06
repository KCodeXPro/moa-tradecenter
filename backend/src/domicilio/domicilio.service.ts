import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SolicitudDomicilio, SolicitudDomicilioDocument } from './domicilio.schema';
import { Usuario, UsuarioDocument } from '../usuarios/usuarios.schema';
import { Producto, ProductoDocument } from '../productos/productos.schema';
import { Mensaje, MensajeDocument } from '../mensajes/mensajes.schema';

const WHATSAPP_REGEX = /^\+53\s?5\d{7}$/;

@Injectable()
export class DomicilioService {
  constructor(
    @InjectModel(SolicitudDomicilio.name)
    private solicitudModel: Model<SolicitudDomicilioDocument>,
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
    @InjectModel(Mensaje.name) private mensajeModel: Model<MensajeDocument>,
  ) {}

  private validarWhatsapp(whatsapp: string): void {
    if (!WHATSAPP_REGEX.test(whatsapp)) {
      throw new BadRequestException(
        'El WhatsApp debe tener formato cubano válido (+53 5XXXXXXX).',
      );
    }
  }

  async create(dto: {
    prestadorId: string;
    productoId: string;
    whatsappComprador: string;
  }): Promise<SolicitudDomicilio> {
    this.validarWhatsapp(dto.whatsappComprador);

    const prestador = await this.usuarioModel.findById(dto.prestadorId).exec();
    if (!prestador) {
      throw new NotFoundException('Prestador de domicilio no encontrado.');
    }
    if (!prestador.esPrestador) {
      throw new BadRequestException('El usuario seleccionado no es un prestador de domicilio.');
    }
    if (prestador.estado !== 'activo') {
      throw new BadRequestException('Este prestador no está disponible en este momento.');
    }
    if (prestador.disponible !== true) {
      throw new BadRequestException('Este prestador no está recibiendo solicitudes ahora.');
    }

    const producto = await this.productoModel.findById(dto.productoId).exec();
    if (!producto) {
      throw new NotFoundException('Producto no encontrado.');
    }
    if (producto.estado !== 'activo') {
      throw new BadRequestException('Este producto ya no está disponible.');
    }

    const vendedor = await this.usuarioModel.findById(producto.vendedorId).exec();
    if (!vendedor || !vendedor.ubicacion) {
      throw new BadRequestException(
        'El vendedor de este producto no tiene dirección registrada para domicilio.',
      );
    }

    // Adaptamos el objeto ubicacion a un string legible para el snapshot y el mensaje
    const direccionLegible = [
      vendedor.ubicacion.calle,
      vendedor.ubicacion.numero ? `#${vendedor.ubicacion.numero}` : '',
      vendedor.ubicacion.edificio ? `Edificio ${vendedor.ubicacion.edificio}` : '',
      vendedor.ubicacion.reparto ? `Reparto ${vendedor.ubicacion.reparto}` : '',
    ].filter(Boolean).join(', ');

    const productoSnapshot = {
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagenes?.[0] ?? undefined,
      vendedorNombre: vendedor.nick,
      vendedorDireccion: direccionLegible,
    };

    const solicitud = new this.solicitudModel({
      prestadorId: dto.prestadorId,
      productoId: dto.productoId,
      compradorWhatsapp: dto.whatsappComprador,
      productoSnapshot,
      direccionVendedor: direccionLegible,
      estado: 'pendiente',
    });

    const saved = await solicitud.save();

    const textoNotificacion =
      `Nueva solicitud de domicilio.\n` +
      `Producto: ${producto.nombre}\n` +
      `Precio: ${(producto.precio / 100).toFixed(2)} CUP\n` +
      `Dirección del vendedor: ${direccionLegible}\n` +
      `WhatsApp del comprador: ${dto.whatsappComprador}`;

    await this.mensajeModel.create({
      vendedorId: dto.prestadorId,
      productoId: dto.productoId,
      servicioId: null,
      compradorWhatsapp: dto.whatsappComprador,
      texto: textoNotificacion,
      tipo: 'producto',
    });

    return saved;
  }

  async findByPrestador(prestadorId: string): Promise<SolicitudDomicilio[]> {
    return this.solicitudModel
      .find({ prestadorId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<SolicitudDomicilio[]> {
    return this.solicitudModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }
}