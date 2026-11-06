import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from '../usuarios/usuarios.schema';
import { Producto, ProductoDocument } from '../productos/productos.schema';
import { Servicio, ServicioDocument } from '../servicios/servicios.schema';
import { SolicitudDomicilio, SolicitudDomicilioDocument } from '../domicilio/domicilio.schema';
import { Auditoria, AuditoriaDocument } from '../auditoria/auditoria.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
    @InjectModel(Servicio.name) private servicioModel: Model<ServicioDocument>,
    @InjectModel(SolicitudDomicilio.name) private domicilioModel: Model<SolicitudDomicilioDocument>,
    @InjectModel(Auditoria.name) private auditoriaModel: Model<AuditoriaDocument>,
  ) {}

  async getDashboard() {
    const totalUsuarios = await this.usuarioModel.countDocuments();
    const totalProductos = await this.productoModel.countDocuments({ estado: 'activo' });
    const totalServicios = await this.servicioModel.countDocuments({ estado: 'activo' });
    const totalDomicilios = await this.domicilioModel.countDocuments();

    return { totalUsuarios, totalProductos, totalServicios, totalDomicilios };
  }

  async listarVendedores() {
    return this.usuarioModel.find({ rol: 'vendedor' }).select('-__v').exec();
  }

  async suspenderVendedor(id: string) {
    // 1. Cambiar estado del vendedor
    const usuario = await this.usuarioModel.findByIdAndUpdate(id, { estado: 'suspendido' }, { new: true });
    if (!usuario) return null;

    // 2. Ocultar sus productos y servicios
    await this.productoModel.updateMany({ vendedorId: id }, { estado: 'oculto' });
    await this.servicioModel.updateMany({ vendedorId: id }, { estado: 'oculto' });

    // 3. Registrar en auditoría (usando un admin por defecto, ya que es simulado)
    try {
      await this.auditoriaModel.create({
        adminId: '000000000000000000000000', // ID ficticio de admin
        accion: 'suspender',
        entidad: 'vendedor',
        entidadId: id,
      });
    } catch (e) {
      console.log('Error guardando auditoría', e);
    }

    return usuario;
  }

  async reactivarVendedor(id: string) {
    const usuario = await this.usuarioModel.findByIdAndUpdate(id, { estado: 'activo' }, { new: true });
    if (!usuario) return null;

    await this.productoModel.updateMany({ vendedorId: id }, { estado: 'activo' });
    await this.servicioModel.updateMany({ vendedorId: id }, { estado: 'activo' });

    try {
      await this.auditoriaModel.create({
        adminId: '000000000000000000000000',
        accion: 'reactivar',
        entidad: 'vendedor',
        entidadId: id,
      });
    } catch (e) {
      console.log('Error guardando auditoría', e);
    }

    return usuario;
  }

  async listarSolicitudesDomicilio() {
    return this.domicilioModel.find().sort({ createdAt: -1 }).exec();
  }
}