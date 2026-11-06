import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Direccion, DireccionDocument } from './direcciones.schema';

@Injectable()
export class DireccionesService {
  constructor(
    @InjectModel(Direccion.name) private direccionModel: Model<DireccionDocument>,
  ) {}

  async create(dto: any): Promise<Direccion> {
    if (!dto.calle || !dto.reparto) {
      throw new BadRequestException('La Calle y el Reparto son obligatorios.');
    }
    if (!dto.numero && !dto.edificio) {
      throw new BadRequestException('Debes indicar el Número/Casa o el Edificio.');
    }

    const nuevaDireccion = new this.direccionModel({
      calle: dto.calle,
      numero: dto.numero || '',
      entre: dto.entre || '',
      edificio: dto.edificio || '',
      reparto: dto.reparto,
      lat: dto.lat,
      lon: dto.lon,
      nick: dto.nick || '',
    });

    return nuevaDireccion.save();
  }

  async buscar(query: any): Promise<Direccion[]> {
    // 🔥 AHORA RECIBIMOS "nick" COMO PARÁMETRO INDEPENDIENTE
    const { calle, numero, entre, edificio, reparto, nick } = query;
    const filtro: any = {};

    // 1. Búsqueda por Nombre de Negocio (si se envía el campo nick)
    if (nick) {
      filtro.nick = { $regex: nick, $options: 'i' };
    }

    // 2. Búsqueda por Dirección (si se envían los campos de dirección)
    if (calle) filtro.calle = { $regex: calle, $options: 'i' };
    if (reparto) filtro.reparto = { $regex: reparto, $options: 'i' };
    if (entre) filtro.entre = { $regex: entre, $options: 'i' };
    if (numero) filtro.numero = { $regex: numero, $options: 'i' };
    if (edificio) filtro.edificio = { $regex: edificio, $options: 'i' };

    // Si no hay ningún filtro, devolvemos vacío para no saturar el mapa
    if (Object.keys(filtro).length === 0) {
      return [];
    }

    return this.direccionModel.find(filtro).exec();
  }

  async findAll(): Promise<Direccion[]> {
    return this.direccionModel.find().exec();
  }

  async remove(id: string): Promise<void> {
    await this.direccionModel.findByIdAndDelete(id).exec();
  }
}