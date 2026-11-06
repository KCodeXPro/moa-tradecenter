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

  // Ahora recibe el vendedorId opcional
  async findAll(vendedorId?: string): Promise<Producto[]> {
    const filter = vendedorId ? { vendedorId } : {};
    return this.productoModel.find(filter).sort({ createdAt: -1 }).exec();
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