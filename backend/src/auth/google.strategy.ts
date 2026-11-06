import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class GoogleStrategy {
  private client: OAuth2Client;

  constructor(private readonly usuariosService: UsuariosService) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // Lógica para INICIAR SESIÓN (la que ya teníamos)
  async verifyGoogleToken(idToken: string): Promise<any> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException('Token de Google inválido o sin email.');
      }

      const usuario = await this.usuariosService.findByEmail(payload.email);

      if (!usuario) {
        throw new UnauthorizedException('Esta cuenta de Google no está registrada. Por favor, regístrate primero.');
      }
      if (usuario.estado === 'suspendido') {
        throw new UnauthorizedException('Tu cuenta está suspendida. Contacta al administrador.');
      }

      return {
        _id: (usuario as any)._id,
        nick: usuario.nick,
        rol: usuario.rol,
        email: usuario.email,
        oauthProvider: usuario.oauthProvider,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Error verificando token de Google');
    }
  }

  // 🔥 NUEVO MÉTODO: Lógica para REGISTRARSE
  async registerWithGoogle(idToken: string): Promise<any> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException('Token de Google inválido o sin email.');
      }

      const email = payload.email;
      const name = payload.name || email.split('@')[0];
      const googleSub = payload.sub;

      // Verificamos si ya existe (por si acaso intenta registrarse dos veces)
      let usuario = await this.usuariosService.findByEmail(email);
      if (usuario) {
        throw new BadRequestException('Ya existe una cuenta con este email. Inicia sesión.');
      }

      // Generamos un nick base único
      const nickBase = name.replace(/\s+/g, '_').toLowerCase();
      let nick = nickBase;
      let contador = 1;
      while (true) {
        try {
          const existe = await this.usuariosService.findByNick(nick);
          if (!existe) break;
        } catch {
          break;
        }
        nick = `${nickBase}${contador}`;
        contador++;
      }

      // Creamos el usuario
      usuario = await this.usuariosService.createFromGoogle({
        nick,
        email,
        oauthProvider: 'google',
        oauthId: googleSub,
        rol: 'vendedor',
        password: null,
        tipoVenta: 'ambos',
        estado: 'activo',
        whatsapp: '',
        esPrestador: false,
      });

      return {
        _id: (usuario as any)._id,
        nick: usuario.nick,
        rol: usuario.rol,
        email: usuario.email,
        oauthProvider: usuario.oauthProvider,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error registrando con Google');
    }
  }
}