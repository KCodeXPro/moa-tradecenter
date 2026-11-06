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

  // 🔥 MODIFICADO: Excluye las divisas por defecto
  async findAll(vendedorId?: string): Promise<Servicio[]> {
    const filter: any = vendedorId ? { vendedorId } : {};
    
    // Si no se pide específicamente, excluimos las divisas del catálogo general
    filter.esDivisa = { $ne: true };

    return this.servicioModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  // 🔥 NUEVO: Método solo para el panel del vendedor (para que vea TODO su catálogo)
  async findAllByVendedor(vendedorId: string): Promise<Servicio[]> {
    return this.servicioModel.find({ vendedorId }).sort({ createdAt: -1 }).exec();
  }

  async findDivisas(): Promise<Servicio[]> {
    return this.servicioModel.find({ esDivisa: true, estado: 'activo' }).sort({ createdAt: -1 }).exec();
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