import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Categoria, CategoriaDocument } from './categorias.schema';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectModel(Categoria.name) private categoriaModel: Model<CategoriaDocument>,
  ) {}

  async create(createCategoriaDto: any): Promise<Categoria> {
    const categoria = new this.categoriaModel(createCategoriaDto);
    return categoria.save();
  }

  async findAll(): Promise<Categoria[]> {
    return this.categoriaModel.find().sort({ orden: 1 }).exec();
  }

  async findByTipo(tipo: string): Promise<Categoria[]> {
    return this.categoriaModel.find({ tipo }).sort({ orden: 1 }).exec();
  }

  async findOne(id: string): Promise<Categoria> {
    const categoria = await this.categoriaModel.findById(id).exec();
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return categoria;
  }

  async update(id: string, updateCategoriaDto: any): Promise<Categoria> {
    const categoria = await this.categoriaModel
      .findByIdAndUpdate(id, updateCategoriaDto, { new: true })
      .exec();
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return categoria;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoriaModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
  }
}