import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  vendedorId: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsArray()
  @IsOptional()
  imagenes?: string[];

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  talla?: string;

  @IsString()
  @IsOptional()
  tamaño?: string;

  @IsEnum(['minorista', 'mayorista'])
  tipoVenta: string;

  @IsNumber()
  @IsOptional()
  precio?: number;

  @IsNumber()
  @IsOptional()
  precioMayorista?: number;

  @IsString()
  categoriaId: string;

  @IsBoolean()
  @IsOptional()
  tieneDomicilio?: boolean;

  @IsArray()
  @IsOptional()
  etiquetas?: string[];
}