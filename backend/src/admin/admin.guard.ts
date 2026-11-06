import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    const rol = request.headers['x-admin-role'] as string | undefined;
    const token = request.headers['x-admin-token'] as string | undefined;
    const secret = process.env.ADMIN_SECRET_TOKEN;

    // Verificar que el rol sea admin Y que el token coincida con el secreto
    if (rol !== 'admin' || token !== secret) {
      throw new UnauthorizedException(
        'Acceso restringido al panel de administrador.',
      );
    }
    return true;
  }
}