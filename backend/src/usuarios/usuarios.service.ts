import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Usuario, UsuarioDocument } from './usuarios.schema';
import { Servicio, ServicioDocument } from '../servicios/servicios.schema';
import { Producto, ProductoDocument } from '../productos/productos.schema';
import { Direccion, DireccionDocument } from '../direcciones/direcciones.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    @InjectModel(Servicio.name) private servicioModel: Model<ServicioDocument>,
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
    @InjectModel(Direccion.name) private direccionModel: Model<DireccionDocument>,
  ) {}

  async create(createUsuarioDto: any): Promise<Usuario> {
    const usuario = new this.usuarioModel(createUsuarioDto);
    return usuario.save();
  }

  async register(dto: { nick: string; password: string; whatsapp?: string; esPrestador?: boolean }): Promise<any> {
    const { nick, password, whatsapp, esPrestador } = dto;
    if (!nick || !password) {
      throw new BadRequestException('El nick y la contraseña son obligatorios.');
    }
    const existe = await this.usuarioModel.findOne({ nick }).exec();
    if (existe) {
      throw new BadRequestException('El usuario ya existe con ese nick.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new this.usuarioModel({
      nick,
      password: hashedPassword,
      whatsapp: whatsapp || '',
      esPrestador: !!esPrestador,
      rol: 'vendedor',
      tipoVenta: 'ambos',
      estado: 'activo',
    });
    const guardado = await nuevoUsuario.save();
    const usuarioObj = guardado.toObject();
    delete usuarioObj.password;
    const response = {
      _id: usuarioObj._id,
      nick: usuarioObj.nick,
      rol: usuarioObj.rol,
      whatsapp: usuarioObj.whatsapp,
      esPrestador: usuarioObj.esPrestador,
      disponible: usuarioObj.disponible,
      estado: usuarioObj.estado,
      tipoVenta: usuarioObj.tipoVenta,
      createdAt: usuarioObj.createdAt,
      updatedAt: usuarioObj.updatedAt,
    };
    return response;
  }

  async login(dto: { nick: string; password: string }): Promise<any> {
    const { nick, password } = dto;
    if (!nick || !password) {
      throw new BadRequestException('El nick y la contraseña son obligatorios.');
    }

    const usuario = await this.usuarioModel.findOne({ nick }).exec();
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    if (!usuario.password) {
      throw new BadRequestException('Este usuario se registró con Google. Inicia sesión con Google.');
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const usuarioObj = usuario.toObject();
    delete usuarioObj.password;
    return usuarioObj;
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioModel.find().exec();
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findById(id).exec();
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async findByNick(nick: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findOne({ nick }).exec();
    if (!usuario) {
      throw new NotFoundException(`Usuario con nick ${nick} no encontrado`);
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioModel.findOne({ email }).exec();
  }

  async createFromGoogle(dto: {
    nick: string;
    email: string;
    oauthProvider: string;
    oauthId: string;
    rol: string;
    password: string | null;
    tipoVenta?: string;
    estado?: string;
    whatsapp?: string;
    esPrestador?: boolean;
  }): Promise<Usuario> {
    const existe = await this.usuarioModel.findOne({ nick: dto.nick }).exec();
    if (existe) {
      throw new BadRequestException(`El usuario ya existe con ese nick.`);
    }

    const nuevoUsuario = new this.usuarioModel({
      nick: dto.nick,
      email: dto.email,
      oauthProvider: dto.oauthProvider,
      oauthId: dto.oauthId,
      password: null,
      rol: dto.rol,
      tipoVenta: dto.tipoVenta || 'ambos',
      estado: dto.estado || 'activo',
      whatsapp: dto.whatsapp || '',
      esPrestador: dto.esPrestador ?? false,
    });
    return nuevoUsuario.save();
  }

  async update(id: string, updateUsuarioDto: any): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, updateUsuarioDto, { new: true })
      .exec();
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async updatePerfil(id: string, data: { whatsapp: string; esPrestador?: boolean; tarifaDomicilio?: number }): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(
        id,
        { 
          whatsapp: data.whatsapp, 
          esPrestador: data.esPrestador,
          tarifaDomicilio: data.tarifaDomicilio
        },
        { new: true },
      )
      .exec();
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    const usuarioObj = usuario.toObject();
    delete usuarioObj.password;
    return usuarioObj;
  }

  async updateUbicacion(id: string, data: { calle?: string; numero?: string; edificio?: string; reparto?: string; lat?: number; lon?: number; esPublica?: boolean }): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(
        id,
        { ubicacion: data },
        { new: true },
      )
      .exec();
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const direccionExistente = await this.direccionModel.findOne({ vendedorId: id }).exec();
    
    if (direccionExistente) {
      await this.direccionModel.findByIdAndUpdate(
        direccionExistente._id,
        { ...data, vendedorId: id },
        { new: true },
      ).exec();
    } else {
      await this.direccionModel.create({ ...data, vendedorId: id });
    }

    const usuarioObj = usuario.toObject();
    delete usuarioObj.password;
    return usuarioObj;
  }

  async getUbicacionPublicaPorNick(nick: string): Promise<{ nick: string; ubicacion: any }> {
    const usuario = await this.usuarioModel.findOne({ nick }).select('nick ubicacion').exec();
    if (!usuario) {
      throw new NotFoundException(`Usuario con nick ${nick} no encontrado`);
    }
    if (!usuario.ubicacion) {
      throw new NotFoundException('Este vendedor no ha registrado su ubicación.');
    }
    return {
      nick: usuario.nick,
      ubicacion: usuario.ubicacion,
    };
  }

  async remove(id: string): Promise<void> {
    await this.direccionModel.deleteMany({ vendedorId: id }).exec();
    await this.servicioModel.deleteMany({ vendedorId: id }).exec();
    await this.productoModel.deleteMany({ vendedorId: id }).exec();
    
    const result = await this.usuarioModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  async findPrestadores() {
    return this.usuarioModel
      .find({ esPrestador: true, estado: 'activo', disponible: true })
      .select('nick whatsapp tarifaDomicilio disponible createdAt')
      .sort({ createdAt: -1 })
      .exec();
  }

  // CORREGIDO: Consulta defensiva que filtra en memoria
  async findNegociosPublicos(): Promise<any[]> {
    try {
      const usuarios = await this.usuarioModel
        .find({ rol: 'vendedor', estado: 'activo' })
        .select('nick ubicacion')
        .exec();

      // Filtramos en memoria los que tienen esPublica: true y coordenadas
      return usuarios.filter(u => 
        u.ubicacion && 
        u.ubicacion.esPublica === true &&
        u.ubicacion.lat && 
        u.ubicacion.lon
      );
    } catch (error) {
      console.error('Error en findNegociosPublicos:', error);
      return [];
    }
  }
}