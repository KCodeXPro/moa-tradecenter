import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Evento, EventoDocument } from './eventos.schema';

@Injectable()
export class EventosService {
  constructor(
    @InjectModel(Evento.name) private eventoModel: Model<EventoDocument>,
  ) {}

  async registrarEvento(data: any) {
    try {
      console.log("➡️ Recibiendo evento:", data);
      const nuevoEvento = new this.eventoModel({
        productoId: new Types.ObjectId(data.productoId),
        vendedorId: new Types.ObjectId(data.vendedorId),
        tipo: data.tipo,
      });
      const guardado = await nuevoEvento.save();
      console.log("✅ Evento guardado:", guardado);
      return guardado;
    } catch (error) {
      console.error("❌ ERROR GUARDANDO EVENTO:", error);
      throw error;
    }
  }

  async obtenerMasConsultados(limite: number = 5) {
    return this.eventoModel.aggregate([
      { $group: { _id: '$productoId', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: limite },
      {
        $lookup: {
          from: 'productos',
          localField: '_id',
          foreignField: '_id',
          as: 'productoInfo',
        },
      },
      { $unwind: { path: '$productoInfo', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'productoInfo.nombre': { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          _id: 0,
          nombre: '$productoInfo.nombre',
          total: 1,
        },
      },
    ]);
  }
}