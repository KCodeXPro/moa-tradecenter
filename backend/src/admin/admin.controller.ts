import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('vendedores')
  async listarVendedores() {
    return this.adminService.listarVendedores();
  }

  @Patch('vendedores/:id/suspender')
  async suspender(@Param('id') id: string) {
    return this.adminService.suspenderVendedor(id);
  }

  @Patch('vendedores/:id/reactivar')
  async reactivar(@Param('id') id: string) {
    return this.adminService.reactivarVendedor(id);
  }

  @Get('domicilios')
  async listarSolicitudesDomicilio() {
    return this.adminService.listarSolicitudesDomicilio();
  }
}