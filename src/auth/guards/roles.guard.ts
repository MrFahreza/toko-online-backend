import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'; 
import { Reflector } from '@nestjs/core'; 
import { Role } from '@prisma/client'; 
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Mendapatkan roles yang di-set di decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika tidak ada @Roles(), izinkan akses (bergantung pada JwtAuthGuard)
    if (!requiredRoles) {
      return true;
    }

    // Mendapatkan data user yang telah divalidasi oleh JwtAuthGuard
    const { user } = context.switchToHttp().getRequest();

    // Cek role user ada di dalam daftar requiredRoles
    return requiredRoles.some((role) => user.role === role);
  }
}