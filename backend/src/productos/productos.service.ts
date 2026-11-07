import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Producto, ProductoDocument } from './productos.schema';

@Injectable()
export class ProductosService {
  constructor(
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
  ) {}

  async create(createProductoDto: any): Promise<Producto> {
    const producto = new this.productoModel(createProductoDto);
    return producto.save();
  }

  // 🔥 MODIFICADO: Paginación, filtro de 30 días y vendedorId opcional
  async findAll(vendedorId?: string, page: number = 1, limit: number = 10): Promise<any> {
    // Si hay vendedorId, es el panel del vendedor: le mostramos TODO su catálogo
    if (vendedorId) {
      const data = await this.productoModel.find({ vendedorId }).sort({ createdAt: -1 }).exec();
      return data; 
    }

    // Si no, es la página pública: Paginación + filtro de 30 días
    const skip = (page - 1) * limit;
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const filter = { 
      updatedAt: { $gte: hace30Dias },
      estado: 'activo' 
    };

    const total = await this.productoModel.countDocuments(filter);
    const data = await this.productoModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<Producto> {
    const producto = await this.productoModel.findById(id).exec();
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async update(id: string, updateProductoDto: any): Promise<Producto> {
    const producto = await this.productoModel
      .findByIdAndUpdate(id, updateProductoDto, { new: true })
      .exec();
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productoModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
  }
}