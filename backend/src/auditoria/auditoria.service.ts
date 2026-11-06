import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auditoria, AuditoriaDocument } from './auditoria.schema';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectModel(Auditoria.name)
    private auditoriaModel: Model<AuditoriaDocument>,
  ) {}

  async registrar(dto: {
    adminId: string;
    accion: string;
    entidad: string;
    entidadId?: string;
    detalle?: Record<string, any>;
  }) {
    return this.auditoriaModel.create({
      adminId: dto.adminId,
      accion: dto.accion,
      entidad: dto.entidad,
      entidadId: dto.entidadId ?? null,
      detalle: dto.detalle ?? {},
    });
  }
}
