import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Servicio, ServicioDocument } from './servicios.schema';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectModel(Servicio.name) private servicioModel: Model<ServicioDocument>,
  ) {}

  async create(createServicioDto: any): Promise<Servicio> {
    const servicio = new this.servicioModel(createServicioDto);
    return servicio.save();
  }

  // 🔥 MODIFICADO: Paginación, filtro de 30 días y vendedorId opcional
  async findAll(vendedorId?: string, page: number = 1, limit: number = 10): Promise<any> {
    // Si hay vendedorId, es el panel del vendedor: le mostramos TODO su catálogo
    if (vendedorId) {
      const data = await this.servicioModel.find({ vendedorId }).sort({ createdAt: -1 }).exec();
      return data; 
    }

    // Si no, es la página pública: Paginación + filtro de 30 días
    const skip = (page - 1) * limit;
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const filter = { 
      updatedAt: { $gte: hace30Dias },
      estado: 'activo',
      esDivisa: { $ne: true } 
    };

    const total = await this.servicioModel.countDocuments(filter);
    const data = await this.servicioModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  // 🔥 NUEVO: Método solo para el panel del vendedor (para que vea TODO su catálogo)
  async findAllByVendedor(vendedorId: string): Promise<Servicio[]> {
    return this.servicioModel.find({ vendedorId }).sort({ createdAt: -1 }).exec();
  }

  // 🔥 MODIFICADO: Paginación para divisas
  async findDivisas(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const filter = { esDivisa: true, estado: 'activo' };

    const total = await this.servicioModel.countDocuments(filter);
    const data = await this.servicioModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Servicio> {
    const servicio = await this.servicioModel.findById(id).exec();
    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
    return servicio;
  }

  async update(id: string, updateServicioDto: any): Promise<Servicio> {
    const servicio = await this.servicioModel
      .findByIdAndUpdate(id, updateServicioDto, { new: true })
      .exec();
    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
    return servicio;
  }

  async remove(id: string): Promise<void> {
    const result = await this.servicioModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
  }
}