import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Obtenemos los modelos de Mongoose
  const UsuarioModel = app.get<Model<any>>(getModelToken('Usuario'));
  const CategoriaModel = app.get<Model<any>>(getModelToken('Categoria'));
  const ProductoModel = app.get<Model<any>>(getModelToken('Producto'));
  const ServicioModel = app.get<Model<any>>(getModelToken('Servicio'));

  console.log('🌱 Iniciando seeds...');

    // 1. Limpiar colecciones (solo para desarrollo)
  await UsuarioModel.deleteMany({ nick: { $in: ['perfumeria_estrella', 'ferreteria_central', 'bodega_progreso', 'barberia_elcubano', 'domicilios_rapidos', 'tecnico_frank', 'admin'] } });
  await CategoriaModel.deleteMany({});
  await ProductoModel.deleteMany({ seed: true });
  await ServicioModel.deleteMany({ seed: true });

  // 2. Crear Categorías de Productos
  const catProductos = await CategoriaModel.insertMany([
    { tipo: 'producto', nombre: 'Alimentos', icono: '🍎', orden: 1 },
    { tipo: 'producto', nombre: 'Ropa y Calzado', icono: '👕', orden: 2 },
    { tipo: 'producto', nombre: 'Joyería', icono: '💍', orden: 3 },
    { tipo: 'producto', nombre: 'Vehículos', icono: '🚗', orden: 4 },
    { tipo: 'producto', nombre: 'Viviendas', icono: '🏠', orden: 5 },
    { tipo: 'producto', nombre: 'Ferretería', icono: '🔧', orden: 6 },
    { tipo: 'producto', nombre: 'Electrodomésticos', icono: '📺', orden: 7 },
    { tipo: 'producto', nombre: 'Perfumería', icono: '💄', orden: 8 },
    { tipo: 'producto', nombre: 'Aseo', icono: '🧴', orden: 9 },
    { tipo: 'producto', nombre: 'Muebles', icono: '🛋️', orden: 10 },
    { tipo: 'producto', nombre: 'Materiales', icono: '🧱', orden: 11 },
    { tipo: 'producto', nombre: 'Sin categoría', icono: '❓', orden: 99, esSinCategoria: true },
  ]);

  // 3. Crear Categorías de Servicios
  const catServicios = await CategoriaModel.insertMany([
    { tipo: 'servicio', nombre: 'Paladares', icono: '🍽️', orden: 1 },
    { tipo: 'servicio', nombre: 'Cafeterías', icono: '☕', orden: 2 },
    { tipo: 'servicio', nombre: 'Manicuristas', icono: '💅', orden: 3 },
    { tipo: 'servicio', nombre: 'Peluqueras', icono: '💇', orden: 4 },
    { tipo: 'servicio', nombre: 'Relojeros', icono: '⌚', orden: 5 },
    { tipo: 'servicio', nombre: 'Barberías', icono: '✂️', orden: 6 },
    { tipo: 'servicio', nombre: 'Transporte Interno', icono: '🚌', orden: 7 },
    { tipo: 'servicio', nombre: 'Transporte Prov/Nac', icono: '🚐', orden: 8 },
    { tipo: 'servicio', nombre: 'Domicilio', icono: '🛵', orden: 9 },
    { tipo: 'servicio', nombre: 'Téc. Refrigeración', icono: '❄️', orden: 10 },
    { tipo: 'servicio', nombre: 'Téc. Lavadoras', icono: '🧺', orden: 11 },
    { tipo: 'servicio', nombre: 'Téc. Celulares', icono: '📱', orden: 12 },
    { tipo: 'servicio', nombre: 'Reparador Colchones', icono: '🛏️', orden: 13 },
    { tipo: 'servicio', nombre: 'Sin categoría', icono: '❓', orden: 99, esSinCategoria: true },
  ]);

  // 4. Crear Vendedores de Productos
  const vend1 = await UsuarioModel.create({ nick: 'perfumeria_estrella', email: 'estrella@moa.cu', oauthProvider: 'google', oauthId: 'seed-1', rol: 'vendedor', tipoVenta: 'productos', aceptaDomicilio: true, direccion: 'Calle Martí #45, Moa', seed: true });
  const vend2 = await UsuarioModel.create({ nick: 'ferreteria_central', email: 'central@moa.cu', oauthProvider: 'google', oauthId: 'seed-2', rol: 'vendedor', tipoVenta: 'productos', aceptaDomicilio: false, direccion: null, seed: true });
  const vend3 = await UsuarioModel.create({ nick: 'bodega_progreso', email: 'progreso@moa.cu', oauthProvider: 'google', oauthId: 'seed-3', rol: 'vendedor', tipoVenta: 'productos', aceptaDomicilio: true, direccion: 'Ave. 1ro de Mayo #120, Moa', seed: true });

  // 5. Crear Productos
  await ProductoModel.insertMany([
    { vendedorId: vend1._id, nombre: 'Perfume Floral 50ml', descripcion: 'Fragancia floral intensa, 50 ml.', precio: 1200, tipoVenta: 'minorista', categoriaId: catProductos[7]._id, tieneDomicilio: true, seed: true },
    { vendedorId: vend1._id, nombre: 'Crema corporal', descripcion: 'Crema 200 ml, aroma vainilla.', precio: 850, tipoVenta: 'minorista', categoriaId: catProductos[7]._id, tieneDomicilio: true, seed: true },
    { vendedorId: vend1._id, nombre: 'Set de maquillaje', descripcion: 'Incluye sombras, labial y rubor.', precio: 2500, tipoVenta: 'minorista', categoriaId: catProductos[7]._id, tieneDomicilio: true, seed: true },
    
    { vendedorId: vend2._id, nombre: 'Martillo profesional', descripcion: 'Mango de fibra, cabeza de acero.', precio: 1500, tipoVenta: 'minorista', categoriaId: catProductos[5]._id, tieneDomicilio: false, seed: true },
    { vendedorId: vend2._id, nombre: 'Cemento gris 50kg', descripcion: 'Saco de 50 kg, uso general.', precio: 900, precioMayorista: 8500, tipoVenta: 'mayorista', categoriaId: catProductos[10]._id, tieneDomicilio: false, seed: true },
    { vendedorId: vend2._id, nombre: 'Destornilladores', descripcion: 'Set de 6 piezas.', precio: 1800, tipoVenta: 'minorista', categoriaId: catProductos[5]._id, tieneDomicilio: false, seed: true },
    
    { vendedorId: vend3._id, nombre: 'Arroz 1kg', descripcion: 'Bolsa de 1 kg, calidad premium.', precio: 250, tipoVenta: 'minorista', categoriaId: catProductos[0]._id, tieneDomicilio: true, seed: true },
    { vendedorId: vend3._id, nombre: 'Aceite vegetal 1L', descripcion: 'Botella de 1 litro.', precio: 400, tipoVenta: 'minorista', categoriaId: catProductos[0]._id, tieneDomicilio: true, seed: true },
    { vendedorId: vend3._id, nombre: 'Lote de arroz x10', descripcion: '10 bolsas de 1 kg.', precio: 2200, precioMayorista: 2200, tipoVenta: 'mayorista', categoriaId: catProductos[0]._id, tieneDomicilio: true, seed: true },
  ]);

  // 6. Crear Vendedores de Servicios (y Prestador)
  const serv1 = await UsuarioModel.create({ nick: 'barberia_elcubano', email: 'barbero@moa.cu', oauthProvider: 'google', oauthId: 'seed-4', rol: 'vendedor', tipoVenta: 'servicios', seed: true });
  const prest1 = await UsuarioModel.create({ nick: 'domicilios_rapidos', email: 'domicilios@moa.cu', oauthProvider: 'google', oauthId: 'seed-5', rol: 'vendedor', esPrestador: true, tipoVenta: 'servicios', whatsapp: '+5355553333', whatsappEsPublico: true, tarifaDomicilio: 200, disponible: true, seed: true });
  const prest2 = await UsuarioModel.create({ nick: 'domicilios_express', email: 'express@moa.cu', oauthProvider: 'google', oauthId: 'seed-7', rol: 'vendedor', esPrestador: true, tipoVenta: 'servicios', whatsapp: '+5355554444', whatsappEsPublico: true, tarifaDomicilio: 350, disponible: true, seed: true });
  const serv3 = await UsuarioModel.create({ nick: 'tecnico_frank', email: 'frank@moa.cu', oauthProvider: 'google', oauthId: 'seed-6', rol: 'vendedor', tipoVenta: 'servicios', seed: true });

  // 7. Crear Servicios
  await ServicioModel.insertMany([
    { vendedorId: serv1._id, nombre: 'Corte de cabello', descripcion: 'Corte clásico o moderno. Incluye lavado.', precio: 300, categoriaId: catServicios[5]._id, esDomicilio: false, seed: true },
    { vendedorId: serv1._id, nombre: 'Afeitado con navaja', descripcion: 'Afeitado tradicional con toalla caliente.', precio: 250, categoriaId: catServicios[5]._id, esDomicilio: false, seed: true },
    
    { vendedorId: prest1._id, nombre: 'Domicilio dentro de Moa', descripcion: 'Entrega de productos en el municipio.', precio: 200, categoriaId: catServicios[8]._id, esDomicilio: true, seed: true },
    { vendedorId: prest1._id, nombre: 'Domicilio express', descripcion: 'Entrega prioritaria en menos de 30 min.', precio: 350, categoriaId: catServicios[8]._id, esDomicilio: true, seed: true },
    
    { vendedorId: serv3._id, nombre: 'Reparación de refrigerador', descripcion: 'Diagnóstico y reparación a domicilio.', precio: 1500, categoriaId: catServicios[9]._id, esDomicilio: false, seed: true },
    { vendedorId: serv3._id, nombre: 'Mantenimiento de lavadora', descripcion: 'Limpieza y revisión general.', precio: 1200, categoriaId: catServicios[10]._id, esDomicilio: false, seed: true },
  ]);

  // 8. Crear Admin
  await UsuarioModel.create({ nick: 'admin', email: 'admin@moatradecenter.cu', oauthProvider: 'google', oauthId: 'seed-admin', rol: 'admin', seed: true });

  console.log('✅ Seeds completados exitosamente.');
  await app.close();
  process.exit(0);
}

bootstrap();