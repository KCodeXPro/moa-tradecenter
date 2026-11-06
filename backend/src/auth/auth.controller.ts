import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly googleStrategy: GoogleStrategy) {}

  @Post('google')
  async googleLogin(@Body() body: { token: string }) {
    const { token } = body;
    if (!token) throw new BadRequestException('Se requiere el token de Google');
    return this.googleStrategy.verifyGoogleToken(token);
  }

  // 🔥 NUEVO ENDPOINT PARA REGISTRO
  @Post('google/register')
  async googleRegister(@Body() body: { token: string }) {
    const { token } = body;
    if (!token) throw new BadRequestException('Se requiere el token de Google');
    return this.googleStrategy.registerWithGoogle(token);
  }
}