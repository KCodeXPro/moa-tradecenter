import { Module } from '@nestjs/common';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [UsuariosModule],
  providers: [GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}